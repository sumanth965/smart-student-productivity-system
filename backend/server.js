require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const connectDB = require('./Database/connection');
const userRoutes = require('./Routes/userRoutes');
const studentRoutes = require('./Routes/studentRoutes');

const app = express();

// Initialize Gemini AI (lazy validation happens in /api/chat)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple in-memory cache for responses (clear on server restart)
const responseCache = new Map();
const MAX_CACHE_SIZE = 100; // Limit cache size to prevent memory issues

const GEMINI_MODELS = [
  'gemini-pro',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
];

// Verify Gemini API Key
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY not found in .env file!');
} else {
  console.log('✓ Gemini AI API Key loaded successfully');
}

// Connect to MongoDB
connectDB();

// Middleware
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://smart-student-productivity-system.onrender.com',
];

const envAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests or tools that do not send an Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// GEMINI AI CHAT ENDPOINT (MUST BE BEFORE /api route)
// ============================================================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, tasks, history } = req.body;

    console.log('\n🔵 Chat Request Received');
    console.log('Message:', message);
    console.log('Tasks Count:', tasks?.length || 0);

    // Validate input
    if (!message || message.trim().length === 0) {
      console.warn('⚠️  Empty message received');
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Check cache first
    const cacheKey = message.toLowerCase().trim();
    if (responseCache.has(cacheKey)) {
      console.log('✅ Using cached response');
      const cachedResponse = responseCache.get(cacheKey);
      return res.status(200).json({
        success: true,
        reply: cachedResponse,
        timestamp: new Date(),
        cached: true,
      });
    }

    // Check API Key
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing or empty');
      return res.status(500).json({
        success: false,
        error: 'Gemini API Key not configured',
        details: 'GEMINI_API_KEY is missing or empty in .env file',
        hint: 'Get a new key from https://ai.google.dev/'
      });
    }

    console.log('✓ API Key found (length:', apiKey.length, ')');
    console.log('✓ API Key starts with:', apiKey.substring(0, 10) + '...');

    // Build prompt with task context and conversation history
    const conversationHistory = Array.isArray(history)
      ? history
        .filter((turn) => turn?.text && (turn?.role === 'user' || turn?.role === 'assistant'))
        .slice(-12)
      : [];

    const prompt = `
You are a virtual academic assistant in the Smart Student Productivity System.
Support students with studying, productivity, programming, assignments, and academic guidance.

Student's Current Tasks:
${tasks && tasks.length > 0 ? JSON.stringify(tasks, null, 2) : 'No active tasks'}

Recent Conversation (oldest to newest):
${conversationHistory.length > 0 ? conversationHistory.map((turn) => `${turn.role.toUpperCase()}: ${turn.text}`).join('\n') : 'No prior messages'}

Student Question/Request:
${message}

Instructions:
- Keep answers accurate, practical, and friendly.
- Use concise formatting with short bullets when useful.
- For coding help, include clear steps or a short example.
- If something is unclear, ask one concise follow-up question.
- Keep response under 300 words.
`;

    console.log('📤 Calling Gemini AI (Free Tier)...');

    // Use free tier models with fallbacks
    let result;
    let selectedModel;
    let lastError;

    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`↪️  Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        selectedModel = modelName;
        console.log(`✅ Success with model: ${modelName}`);
        break;
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️  Model failed: ${modelName} -> ${modelError.message}`);

        // Check if it's a quota error
        if (modelError.status === 429 || modelError.message.includes('429')) {
          console.log('ℹ️  Free tier quota exceeded - using fallback response');
          break;
        }
      }
    }

    // If API fails due to quota, use a smart fallback response
    if (!result) {
      console.log('⚠️  Using AI-generated fallback response');

      // Generate a helpful fallback response based on the message
      const fallbackReply = generateFallbackResponse(message, tasks);

      // Cache the fallback response
      if (responseCache.size >= MAX_CACHE_SIZE) {
        const firstKey = responseCache.keys().next().value;
        responseCache.delete(firstKey);
      }
      responseCache.set(cacheKey, fallbackReply);

      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        timestamp: new Date(),
        usingFallback: true,
        message: 'Using fallback response - API quota exceeded. Please try again later.'
      });
    }

    // Check if response exists
    if (!result || !result.response) {
      throw new Error('Invalid response from Gemini AI - no response object. Check if API key is valid.');
    }

    const reply = result.response.text();

    if (!reply || reply.trim().length === 0) {
      throw new Error('Gemini returned empty response - API may not be responding correctly');
    }

    // Cache the successful response
    if (responseCache.size >= MAX_CACHE_SIZE) {
      const firstKey = responseCache.keys().next().value;
      responseCache.delete(firstKey);
    }
    responseCache.set(cacheKey, reply);

    console.log(`✅ Response generated successfully using ${selectedModel}`);
    console.log('Reply length:', reply.length, 'characters\n');

    // Return response
    res.status(200).json({
      success: true,
      reply,
      timestamp: new Date(),
    });

  } catch (error) {
    console.error('\n❌ Chat Error Details:');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Status:', error.status);
    console.error('Full Error:', error);

    // Provide specific error messages
    let detailMessage = error.message;
    let statusCode = 500;

    if (error.message.includes('API key')) {
      detailMessage = 'Invalid or expired Gemini API key. Please check your .env file.';
    } else if (error.message.includes('403')) {
      detailMessage = 'Access denied - API key may be invalid or not activated.';
      statusCode = 403;
    } else if (error.message.includes('404')) {
      detailMessage = 'Model not found - check model name.';
      statusCode = 404;
    } else if (error.status === 429 || error.message.includes('429')) {
      detailMessage = 'API quota exceeded. Please try again in a few hours or upgrade your plan.';
      statusCode = 429;
    }

    res.status(statusCode).json({
      success: false,
      error: 'Failed to generate AI response',
      details: detailMessage,
      hint: 'Verify GEMINI_API_KEY in .env. Get new key from https://ai.google.dev/',
      cacheSize: responseCache.size
    });
  }
});

// ============================================================================
// FALLBACK RESPONSE GENERATOR (for when API quota is exceeded)
// ============================================================================
function generateFallbackResponse(message, tasks) {
  const lowerMessage = message.toLowerCase();

  // Task prioritization queries
  if (lowerMessage.includes('first') || lowerMessage.includes('priority') || lowerMessage.includes('which') || lowerMessage.includes('start')) {
    if (tasks && tasks.length > 0) {
      const taskNames = tasks.slice(0, 3).map(t => `**${t.title || t.name || 'Task'}**`).join(', ');
      return `To prioritize your tasks, consider:

1. **Deadlines** - Start with tasks due soonest
2. **Importance** - Focus on high-impact assignments first
3. **Difficulty** - Handle challenging tasks when you're fresh
4. **Dependencies** - Complete tasks that other work depends on

Your current tasks: ${taskNames}

📋 Try sorting by deadline to see what's urgent!`;
    } else {
      return `To decide which task to do first:

1. **Check deadlines** - What's due soonest?
2. **Consider difficulty** - Do harder tasks while fresh
3. **Look at importance** - Which impacts your grade most?
4. **Check dependencies** - Any tasks needed for other work?

💡 Add tasks to your dashboard to get personalized prioritization!`;
    }
  }

  // Time management and scheduling
  if (lowerMessage.includes('time') || lowerMessage.includes('schedule') || lowerMessage.includes('how long')) {
    return `For managing your study time effectively:

1. **Set specific durations** - Know how long each task takes
2. **Use Pomodoro** - 25 minutes focus + 5 minute break
3. **Block your calendar** - Schedule study blocks in advance
4. **Track actual time** - Compare estimates vs. real time
5. **Buffer time** - Add extra cushion for complex tasks

${tasks && tasks.length > 0 ? `You have ${tasks.length} task(s). Try scheduling them across the next few days.` : ''}

⏰ Realistic scheduling prevents last-minute stress!`;
  }

  // Difficulty/stuck/help
  if (lowerMessage.includes('difficult') || lowerMessage.includes('stuck') || lowerMessage.includes('help') || lowerMessage.includes('confused')) {
    return `When you're stuck on a task:

1. **Take a break** - 10-15 minutes away helps reset your brain
2. **Review basics** - Go back to fundamentals or examples
3. **Search online** - Look for similar problems/tutorials
4. **Ask for help** - Teachers, classmates, or online forums
5. **Break it down** - Divide the problem into smaller pieces

${tasks && tasks.length > 0 ? `You have ${tasks.length} other task(s) - sometimes switching helps!` : ''}

🎯 Every problem has a solution - be patient with yourself!`;
  }

  // Motivation/procrastination
  if (lowerMessage.includes('motivation') || lowerMessage.includes('lazy') || lowerMessage.includes('procrastin') || lowerMessage.includes('hard to start')) {
    return `Overcoming procrastination:

1. **Start tiny** - Just 5 minutes, not the whole task
2. **Remove obstacles** - Close distractions and prep materials
3. **Find accountability** - Study with someone or join a group
4. **Celebrate wins** - Acknowledge progress frequently
5. **Reward yourself** - Plan something fun after completing

${tasks && tasks.length > 0 ? `${tasks.length} task(s) waiting - conquering one now creates momentum!` : ''}

💪 Done is better than perfect - start imperfectly!`;
  }

  // General questions or greetings
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return `👋 Hey there! I'm your AI study buddy. I can help with:

- **Task prioritization** - Which task should I do first?
- **Time management** - How should I schedule my work?
- **Study strategies** - Tips for better learning
- **Motivation** - How to stay focused and avoid procrastination
- **Problem solving** - Help when you're stuck on assignments

${tasks && tasks.length > 0 ? `You have ${tasks.length} task(s) tracked. Ask me anything about managing them!` : 'Add some tasks to your dashboard and I can give personalized advice!'}

What would you like help with? 🎓`;
  }

  // Default helpful response
  return `I'm here to help with your academic goals! Tell me:

- **Which task to do first** - I'll help you prioritize
- **Time management** - How to schedule your work
- **Study strategies** - Tips for learning better
- **When you're stuck** - Guidance on problem-solving
- **Motivation tips** - How to stay focused

${tasks && tasks.length > 0 ? `You have ${tasks.length} task(s) tracked. Ask me anything about them!` : 'Start by adding tasks to your dashboard for better guidance!'}

📱 The more detail you provide, the better advice I can give! 🚀`;
}

// Register other routes (AFTER /api/chat)
app.use('/api/users', userRoutes);
app.use('/api', studentRoutes);

// 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI integrated - /api/chat endpoint ready`);
  console.log('='.repeat(60) + '\n');
});
