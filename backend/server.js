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
  'gemini-2.0-flash',
  'gemini-3-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-pro',
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
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

    console.log('📤 Calling Gemini AI with fallback models...');

    // Try models in order because model availability varies by API version / account
    let result;
    let selectedModel;
    let lastError;

    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`↪️  Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        selectedModel = modelName;
        break;
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️  Model failed: ${modelName} -> ${modelError.message}`);

        // Check if it's a quota error
        if (modelError.status === 429 || modelError.message.includes('429')) {
          console.log('ℹ️  Quota exceeded - will use fallback response');
          break; // Stop trying other models if quota is exceeded
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

  // Basic response patterns
  if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
    return `Based on your request about time management: 

1. **Break tasks into smaller steps** - This makes them less overwhelming
2. **Use the Pomodoro technique** - 25 minutes focus, 5 minutes break
3. **Prioritize by deadline** - Start with tasks due soonest
4. **Track your progress** - Celebrate small wins to stay motivated

${tasks && tasks.length > 0 ? `You currently have ${tasks.length} active task(s). Try focusing on one at a time to avoid burnout.` : ''}

💡 Tip: A task is only difficult until you break it down!`;
  }

  if (lowerMessage.includes('difficult') || lowerMessage.includes('stuck') || lowerMessage.includes('help')) {
    return `I understand you're facing a challenge! Here's what you can do:

1. **Break it down** - Divide the big problem into smaller, manageable pieces
2. **Ask for help** - Don't hesitate to reach out to teachers, classmates, or online communities
3. **Take a break** - Sometimes stepping away helps you see things differently
4. **Review fundamentals** - Go back to basics if you're confused about concepts
5. **Practice regularly** - Consistent practice builds confidence over time

${tasks && tasks.length > 0 ? `With ${tasks.length} task(s) on your plate, focus on one challenge at a time.` : ''}

🎯 Remember: Every expert was once a beginner!`;
  }

  if (lowerMessage.includes('motivation') || lowerMessage.includes('lazy') || lowerMessage.includes('procrastin')) {
    return `Feeling unmotivated? Here are some powerful strategies:

1. **Start small** - Begin with just 5-10 minutes of work
2. **Set clear goals** - Know exactly what "done" looks like
3. **Remove distractions** - Put your phone away, close unnecessary tabs
4. **Track progress** - Seeing progress is motivating!
5. **Reward yourself** - Plan something fun after completing tasks
6. **Find your why** - Remember why this task matters to you

${tasks && tasks.length > 0 ? `You have ${tasks.length} pending task(s). Completing even one will boost your confidence!` : ''}

💪 Action beats motivation - just start, and motivation will follow!`;
  }

  // Default helpful response
  return `Thanks for reaching out! Here are some general productivity tips:

1. **Organize your tasks** - Use your dashboard to track everything
2. **Set realistic goals** - Break big goals into smaller milestones
3. **Create a schedule** - Plan when you'll work on each task
4. **Stay consistent** - Small daily efforts add up to big results
5. **Review and adjust** - Check what's working and what isn't

${tasks && tasks.length > 0 ? `You have ${tasks.length} task(s) currently tracked. Keep pushing forward!` : 'Once you add tasks to your dashboard, I can give more specific advice!'}

📱 Keep using this AI chat for personalized guidance on your academic journey!`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', status: 'OK' });
});

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
