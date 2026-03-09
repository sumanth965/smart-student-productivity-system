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

const GEMINI_MODELS = [
  'gemini-2.0-flash',
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

// Routes
app.use('/api/users', userRoutes);
app.use('/api', studentRoutes);

// ============================================================================
// GEMINI AI CHAT ENDPOINT
// ============================================================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, tasks } = req.body;

    console.log('\n🔵 Chat Request Received');
    console.log('Message:', message);
    console.log('Tasks Count:', tasks?.length || 0);

    // Validate input
    if (!message || message.trim().length === 0) {
      console.warn('⚠️  Empty message received');
      return res.status(400).json({ error: 'Message cannot be empty' });
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

    // Build prompt with task context
    const prompt = `
You are an AI productivity assistant for students managing their academic tasks.

Student's Current Tasks:
${tasks && tasks.length > 0 ? JSON.stringify(tasks, null, 2) : 'No active tasks'}

Student Question/Request:
${message}

Provide helpful, concise, and actionable advice. If referring to specific tasks, use their actual names. Keep response under 300 words.
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
      }
    }

    if (!result) {
      throw lastError || new Error('All Gemini models failed to generate content.');
    }

    // Check if response exists
    if (!result || !result.response) {
      throw new Error('Invalid response from Gemini AI - no response object. Check if API key is valid.');
    }

    const reply = result.response.text();

    if (!reply || reply.trim().length === 0) {
      throw new Error('Gemini returned empty response - API may not be responding correctly');
    }

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

    if (error.message.includes('API key')) {
      detailMessage = 'Invalid or expired Gemini API key. Please check your .env file.';
    } else if (error.message.includes('403')) {
      detailMessage = 'Access denied - API key may be invalid or not activated.';
    } else if (error.message.includes('404')) {
      detailMessage = 'Model not found - check model name.';
    } else if (error.message.includes('429')) {
      detailMessage = 'Rate limited - too many requests. Please try again later.';
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate AI response',
      details: detailMessage,
      hint: 'Verify GEMINI_API_KEY in .env. Get new key from https://ai.google.dev/'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', status: 'OK' });
});

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
