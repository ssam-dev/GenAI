const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
const router = express.Router();

// Configure multer for audio file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

// @route   POST /api/ai/speech-to-text
// @desc    Transcribe audio to text
// @access  Public
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file uploaded.' });
  }

  try {
    const language = req.body.language || 'en-IN';
    const audio = {
      content: req.file.buffer.toString('base64'),
    };
    const config = {
      encoding: 'WEBM_OPUS', // Adjust based on your recording format
      sampleRateHertz: 48000, // Adjust based on your recording format
      languageCode: language,
    };
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    
    res.json({ transcription });
  } catch (error) {
    console.error('Speech-to-text error:', error);
    res.status(500).json({ message: 'Error processing audio.' });
  }
});

// @route   POST /api/ai/text-to-speech
// @desc    Convert text to audio
// @access  Public
router.post('/text-to-speech', async (req, res) => {
  const { text, language } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'No text provided.' });
  }

  try {
    const languageCode = language || 'en-US';
    const request = {
      input: { text },
      voice: { languageCode, ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ message: 'Error generating speech.' });
  }
});

// @route   POST /api/ai/chat
// @desc    Chat with the AI assistant
// @access  Public
router.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for an artisan marketplace. You can help with product recommendations, artisan information, and general marketplace questions.' },
        ...history,
        { role: 'user', content: message },
      ],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Error with AI chat.' });
  }
});

module.exports = router;