// server/routes/ai.js
// Complete AI Backend Routes for Voice Assistant
// Features: Speech-to-Text, Text-to-Speech, Chat with multilingual support

const express = require('express');
const router = express.Router();
const multer = require('multer');
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const { OpenAI } = require('openai');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize Google Cloud clients
const speechClient = new speech.SpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   POST /api/ai/speech-to-text
// @desc    Transcribe audio to text with multilingual support
// @access  Public
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }

    const language = req.body.language || 'en-IN';
    const audio = {
      content: req.file.buffer.toString('base64'),
    };
    
    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: language,
      alternativeLanguageCodes: ['en-US', 'hi-IN', 'mr-IN'],
      model: 'latest_long'
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ 
      success: true,
      transcription: transcription.trim()
    });

  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing audio',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/ai/text-to-speech
// @desc    Convert text to audio with multilingual support
// @access  Public
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text, language = 'en-IN' } = req.body;

    if (!text) {
      return res.status(400).json({ 
        success: false,
        message: 'No text provided'
      });
    }

    const request = {
      input: { text },
      voice: {
        languageCode: language, 
        ssmlGender: 'NEUTRAL',
        name: language.startsWith('hi') ? 'hi-IN-Wavenet-A' : 
              language.startsWith('mr') ? 'mr-IN-Wavenet-A' :
              'en-IN-Wavenet-A'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0
      },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.audioContent.length
    });
    
    res.send(response.audioContent);

  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating speech',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/ai/chat
// @desc    Chat with the AI assistant
// @access  Public
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for an artisan marketplace. You can help with product recommendations, artisan information, marketplace navigation, and general questions about crafts and handmade products. Keep responses helpful and concise.'
        },
        ...history,
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    res.json({ 
      success: true,
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI chat request',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/ai/product-description
// @desc    Generate product description using AI
// @access  Public
router.post('/product-description', async (req, res) => {
  try {
    const { productName, category, materials, artisanInfo } = req.body;

    if (!productName || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Product name and category are required'
      });
    }

    const prompt = `Generate a compelling product description for a handmade ${category} called "${productName}". 
    ${materials ? `Materials used: ${materials}.` : ''}
    ${artisanInfo ? `Artisan background: ${artisanInfo}.` : ''}
    
    Make it engaging, highlight the craftsmanship, and appeal to potential buyers. Keep it under 200 words.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    res.json({
      success: true,
      description: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('AI product description error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating product description',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/ai/artisan-bio
// @desc    Generate artisan bio using AI
// @access  Public
router.post('/artisan-bio', async (req, res) => {
  try {
    const { name, specialty, experience, location, culturalBackground } = req.body;

    if (!name || !specialty) {
      return res.status(400).json({
        success: false,
        message: 'Name and specialty are required'
      });
    }

    const prompt = `Generate a compelling artisan bio for ${name}, a ${specialty} specialist.
    ${experience ? `Experience: ${experience} years.` : ''}
    ${location ? `Location: ${location}.` : ''}
    ${culturalBackground ? `Cultural background: ${culturalBackground}.` : ''}
    
    Make it personal, highlight their passion for craftsmanship, and appeal to potential customers. Keep it under 150 words.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.8
    });

    res.json({ 
      success: true,
      bio: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('AI artisan bio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating artisan bio',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;