import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent } from '../ui/card';

import LanguageSelector from './LanguageSelector';
import ConversationDisplay from './ConversationDisplay';
import TranscriptDisplay from './TranscriptDisplay';
import CollectedDataCard from './CollectedDataCard';
import ControlButtons from './ControlButtons';

// Multilingual questions for different languages
const questionsByLanguage = {
  'en-US': {
    0: "What is your name?",
    1: "Where do you live?",
    2: "What do you make or create?",
    3: "Your phone number? You can skip this.",
    4: "What is your email address? For example, say 'john at gmail dot com'.",
    5: "Please create a secure password for your account.",
    6: "For security, please say your password again to confirm."
  },
  'en-IN': {
    0: "What is your name?",
    1: "Where do you live?",
    2: "What do you make or create?",
    3: "Your phone number? You can skip this.",
    4: "What is your email address? For example, say 'john at gmail dot com'.",
    5: "Please create a secure password for your account.",
    6: "For security, please say your password again to confirm."
  },
  'hi-IN': {
    0: "आपका नाम क्या है?",
    1: "आप कहाँ रहते हैं?",
    2: "आप क्या बनाते हैं?",
    3: "आपका फोन नंबर? आप इसे छोड़ सकते हैं।",
    4: "आपका ईमेल पता क्या है? उदाहरण के लिए कहें 'john at gmail dot com'।",
    5: "कृपया अपने खाते के लिए एक सुरक्षित पासवर्ड बनाएं।",
    6: "सुरक्षा के लिए, कृपया पुष्टि के लिए अपना पासवर्ड फिर से कहें।"
  },
  'mr-IN': {
    0: "तुमचे नाव काय आहे?",
    1: "तुम्ही कुठे राहता?",
    2: "तुम्ही काय बनवता?",
    3: "तुमचा फोन नंबर? तुम्ही हे वगळू शकता।",
    4: "तुमचा ईमेल पत्ता काय आहे? उदाहरणार्थ 'john at gmail dot com' म्हणा।",
    5: "कृपया तुमच्या खात्यासाठी एक सुरक्षित पासवर्ड तयार करा।",
    6: "सुरक्षिततेसाठी, कृपया पुष्टीसाठी तुमचा पासवर्ड पुन्हा सांगा।"
  },
  'es-ES': {
    0: "¿Cuál es tu nombre?",
    1: "¿Dónde vives?",
    2: "¿Qué haces o creas?",
    3: "¿Tu número de teléfono? Puedes omitir esto.",
    4: "¿Cuál es tu dirección de correo electrónico? Por ejemplo, di 'john arroba gmail punto com'.",
    5: "Por favor, crea una contraseña segura para tu cuenta.",
    6: "Por seguridad, repite tu contraseña para confirmar."
  },
  'fr-FR': {
    0: "Quel est votre nom?",
    1: "Où habitez-vous?",
    2: "Qu'est-ce que vous fabriquez ou créez?",
    3: "Votre numéro de téléphone? Vous pouvez l'ignorer.",
    4: "Quelle est votre adresse e-mail? Par exemple, dites 'john arobase gmail point com'.",
    5: "Veuillez créer un mot de passe sécurisé pour votre compte.",
    6: "Pour la sécurité, répétez votre mot de passe pour confirmer."
  }
};

// Get questions for current language, fallback to English
const getQuestions = (language) => {
  return questionsByLanguage[language] || questionsByLanguage['en-IN'];
};

// Multilingual UI text
const getUIText = (language) => {
  const uiText = {
    'en-US': {
      title: "AI Voice Assistant",
      subtitle: "Artisan Registration",
      description: "Speak naturally in your preferred language to create your beautiful artisan profile",
      startButton: "Start Voice Registration",
      stopButton: "Stop Recording",
      confirmButton: "Confirm & Save Profile",
      editButton: "Edit Answer",
      restartButton: "Start Over"
    },
    'en-IN': {
      title: "AI Voice Assistant",
      subtitle: "Artisan Registration", 
      description: "Speak naturally in your preferred language to create your beautiful artisan profile",
      startButton: "Start Voice Registration",
      stopButton: "Stop Recording",
      confirmButton: "Confirm & Save Profile",
      editButton: "Edit Answer",
      restartButton: "Start Over"
    },
    'hi-IN': {
      title: "एआई वॉयस असिस्टेंट",
      subtitle: "कारीगर पंजीकरण",
      description: "अपनी सुंदर कारीगर प्रोफ़ाइल बनाने के लिए अपनी पसंदीदा भाषा में स्वाभाविक रूप से बोलें",
      startButton: "वॉयस पंजीकरण शुरू करें",
      stopButton: "रिकॉर्डिंग बंद करें",
      confirmButton: "पुष्टि करें और प्रोफ़ाइल सेव करें",
      editButton: "उत्तर संपादित करें",
      restartButton: "फिर से शुरू करें"
    },
    'mr-IN': {
      title: "एआय व्हॉईस असिस्टंट",
      subtitle: "कारागीर नोंदणी",
      description: "तुमची सुंदर कारागीर प्रोफाइल तयार करण्यासाठी तुमच्या आवडत्या भाषेत नैसर्गिकपणे बोला",
      startButton: "व्हॉईस नोंदणी सुरू करा",
      stopButton: "रेकॉर्डिंग थांबवा",
      confirmButton: "पुष्टी करा आणि प्रोफाइल जतन करा",
      editButton: "उत्तर संपादित करा",
      restartButton: "पुन्हा सुरू करा"
    },
    'es-ES': {
      title: "Asistente de Voz IA",
      subtitle: "Registro de Artesano",
      description: "Habla naturalmente en tu idioma preferido para crear tu hermoso perfil de artesano",
      startButton: "Iniciar Registro por Voz",
      stopButton: "Detener Grabación",
      confirmButton: "Confirmar y Guardar Perfil",
      editButton: "Editar Respuesta",
      restartButton: "Empezar de Nuevo"
    },
    'fr-FR': {
      title: "Assistant Vocal IA",
      subtitle: "Inscription Artisan",
      description: "Parlez naturellement dans votre langue préférée pour créer votre beau profil d'artisan",
      startButton: "Commencer l'Inscription Vocale",
      stopButton: "Arrêter l'Enregistrement",
      confirmButton: "Confirmer et Sauvegarder le Profil",
      editButton: "Modifier la Réponse",
      restartButton: "Recommencer"
    }
  };
  
  return uiText[language] || uiText['en-IN'];
};

const fieldMapping = {
  0: 'name',
  1: 'location',
  2: 'category',
  3: 'phone',
  4: 'email',
  5: 'password'
  // Step 6 is for confirmation, not saving to a field directly
};

// Validation functions based on the Artisan schema
const validateField = (field, value) => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${field} is required` };
  }

  switch (field) {
    case 'name':
      if (value.trim().length < 2) {
        return { isValid: false, message: 'Name must be at least 2 characters long' };
      }
      break;
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return { isValid: false, message: 'Please enter a valid email address' };
      }
      break;
    case 'password':
      if (value.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
      }
      break;
    case 'phone':
      // Phone is optional, so if provided, basic validation
      if (value && value.trim() !== '' && value.length < 10) {
        return { isValid: false, message: 'Please enter a valid phone number' };
      }
      break;
    case 'location':
      if (value.trim().length < 2) {
        return { isValid: false, message: 'Location must be at least 2 characters long' };
      }
      break;
    case 'category':
      if (value.trim().length < 2) {
        return { isValid: false, message: 'Category must be at least 2 characters long' };
      }
      break;
  }

  return { isValid: true, message: '' };
};

const validateAllFields = (answers) => {
  const requiredFields = ['name', 'location', 'category', 'email', 'password'];
  const errors = [];

  for (const field of requiredFields) {
    const validation = validateField(field, answers[field]);
    if (!validation.isValid) {
      errors.push(validation.message);
    }
  }

  // Validate optional phone field if provided
  if (answers.phone && answers.phone.trim() !== '') {
    const phoneValidation = validateField('phone', answers.phone);
    if (!phoneValidation.isValid) {
      errors.push(phoneValidation.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Function to preprocess voice input for common speech-to-text issues
const preprocessVoiceInput = (text, field) => {
  if (!text || typeof text !== 'string') return text;
  
  let processed = text.trim();
  
  // Handle email field specifically
  if (field === 'email') {
    // Replace common @ symbol alternatives
    processed = processed
      .replace(/\b(at|@|AT)\b/gi, '@')  // Replace "at" with "@"
      .replace(/\s*@\s*/g, '@')         // Remove spaces around @
      .replace(/dot\s+/gi, '.')         // Replace "dot" with "."
      .replace(/\s+dot\s+/gi, '.')      // Replace " dot " with "."
      .replace(/\s+dot$/gi, '.')        // Replace " dot" at end with "."
      .replace(/gmail\s*com/gi, 'gmail.com')  // Fix "gmail com" to "gmail.com"
      .replace(/yahoo\s*com/gi, 'yahoo.com')  // Fix "yahoo com" to "yahoo.com"
      .replace(/hotmail\s*com/gi, 'hotmail.com')  // Fix "hotmail com" to "hotmail.com"
      .replace(/outlook\s*com/gi, 'outlook.com')  // Fix "outlook com" to "outlook.com"
      .replace(/\s+/g, '');             // Remove all remaining spaces in email
  }
  
  // Handle name field specifically
  if (field === 'name') {
    // Remove any unwanted characters that might be transcribed
    processed = processed
      .replace(/[^\w\s'-]/g, '')        // Keep only letters, spaces, apostrophes, and hyphens
      .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
      .trim();
    
    // Capitalize first letter of each word
    processed = processed
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // Handle phone field
  if (field === 'phone') {
    // Remove non-digit characters except + and spaces, then format
    processed = processed
      .replace(/[^\d\s+()-]/g, '')
      .trim();
  }
  
  // Handle other text fields (location, category)
  if (field === 'location' || field === 'category') {
    // Clean up and capitalize
    processed = processed
      .replace(/[^\w\s'-,]/g, '')       // Keep only letters, spaces, apostrophes, hyphens, and commas
      .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
      .trim();
    
    // Capitalize first letter
    if (processed.length > 0) {
      processed = processed.charAt(0).toUpperCase() + processed.slice(1).toLowerCase();
    }
  }
  
  return processed;
};

export default function VoiceAssistant() {
  const [language, setLanguage] = useState('en-IN');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ name: '', location: '', category: '', phone: '', email: '', password: '' });
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);

  // Handle language change and update current question
  const handleLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    
    // Update current question if we're in the middle of the process
    if (currentStep >= 0 && currentQuestion) {
      const newQuestions = getQuestions(newLanguage);
      const updatedQuestion = newQuestions[currentStep];
      if (updatedQuestion) {
        setCurrentQuestion(updatedQuestion);
        // Speak the updated question in the new language
        setTimeout(() => {
          speak(updatedQuestion);
        }, 500);
      }
    }
  }, [currentStep, currentQuestion]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const startRecognitionRef = useRef(null); // Ref to hold the memoized startRecognition function

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.');
    } else {
      setIsInitialized(true);
    }

    // Wait for voices to load
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window && voicesLoaded) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find the best voice for the language
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language.split('-')[0]) && voice.localService
      ) || voices.find(voice => 
        voice.lang.startsWith(language.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.lang = language;
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 0.9;
      
      window.speechSynthesis.speak(utterance);
    }
  }, [language, voicesLoaded]);

  const finishQuestionnaire = useCallback(() => {
    setShowConfirmRestart(true);
    const name = answers.name || 'not provided';
    const email = answers.email || 'not specified';
    
    const summary = `Perfect! Your profile for ${name} is ready to be created with the email ${email}. For your security, I will not read back your password. Does this look correct? Please confirm to save.`;
    
    speak(summary);
  }, [answers, speak]);

  const saveAnswer = useCallback((answer, stepAtTimeOfCapture) => {
    setError(''); // Clear any previous errors when a new answer is provided

    // Handle password confirmation step (Step 6)
    if (stepAtTimeOfCapture === 6) {
      if (answers.password && answer.trim() === answers.password.trim()) {
        speak("Passwords match. Finalizing your profile.");
        setTimeout(finishQuestionnaire, 1500);
      } else {
        setError("Passwords do not match. Please try again.");
        speak("The passwords do not match. Let's try confirming the password again. Please say your password one more time.");
        // We don't increment the step, just re-ask the same step for confirmation
        setTimeout(() => {
          if (speechSupported && isInitialized) {
            startRecognitionRef.current(stepAtTimeOfCapture); // Re-start recognition for step 6
          }
        }, 3000);
      }
      return; // Stop execution for this special step
    }

    const field = fieldMapping[stepAtTimeOfCapture];
    // This check ensures we only try to save if there's a mapped field.
    // Step 6 is handled above and is intentionally not mapped.
    if (!field) {
      console.warn(`No field mapping for step ${stepAtTimeOfCapture}. Answer not saved.`);
      // If no field, we still need to potentially move to the next question,
      // but given the question structure (0-5 mapped, 6 special), this should not be reached for valid steps.
    }

    const isSkipped = answer.toLowerCase().includes('skip') || 
                     answer.toLowerCase().includes('next') ||
                     answer.toLowerCase().includes('pass');
    
    // Preprocess the answer to handle common voice recognition issues
    let processedAnswer = isSkipped ? '' : preprocessVoiceInput(answer.trim(), field);
    
    // Debug logging to track what's happening
    console.log(`Original answer: "${answer}"`);
    console.log(`Field: "${field}"`);
    console.log(`Processed answer: "${processedAnswer}"`);
    console.log(`Is skipped: ${isSkipped}`);
    
    // Validate the answer before saving
    if (field && processedAnswer && !isSkipped) {
      const validation = validateField(field, processedAnswer);
      if (!validation.isValid) {
        setError(validation.message);
        speak(`I didn't catch that correctly. ${validation.message}. Please try again.`);
        // Re-ask the same question
        setTimeout(() => {
          if (speechSupported && isInitialized) {
            startRecognitionRef.current(stepAtTimeOfCapture);
          }
        }, 3000);
        return;
      }
    }
    
    console.log(`Saving answer "${processedAnswer}" to field "${field}" for step ${stepAtTimeOfCapture}`);
    
    setAnswers(prev => ({
      ...prev,
      [field]: processedAnswer
    }));

    // Move to next step
    setTimeout(() => {
      const nextStep = stepAtTimeOfCapture + 1;
      const currentQuestions = getQuestions(language);
      // Use Object.keys(currentQuestions).length to dynamically check the total number of steps
      if (nextStep < Object.keys(currentQuestions).length) {
        setCurrentStep(nextStep);
        const nextQuestion = currentQuestions[nextStep];
        setCurrentQuestion(nextQuestion);
        speak(nextQuestion);
        
        setTimeout(() => {
          if (speechSupported && isInitialized) {
            startRecognitionRef.current(nextStep); // Call startRecognition for the next question
          }
        }, 2500);
      }
      // The finishQuestionnaire is now exclusively called from the password confirmation step (step 6)
    }, 1000);
  }, [answers.password, speak, speechSupported, isInitialized, finishQuestionnaire, setCurrentStep, setCurrentQuestion, setError]);

  // Define the actual startRecognition function and assign it to the ref
  const actualStartRecognition = useCallback((stepToUseForSave) => {
    if (!speechSupported || !isInitialized) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
        
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = language;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
      
      // Auto-stop after 15 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 15000);
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        // Use the step that was passed as an argument
        saveAnswer(finalTranscript.trim(), stepToUseForSave);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      let errorMessage = 'Speech recognition error occurred.';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Unable to start speech recognition. Please check your microphone permissions and try again.');
      setIsListening(false);
    }
  }, [language, speechSupported, isInitialized, saveAnswer, setError]);

  // Assign the actual function to the ref
  useEffect(() => {
    startRecognitionRef.current = actualStartRecognition;
  }, [actualStartRecognition]);


  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsListening(false);
  }, []);

  const handleStartRecording = () => {
    if (currentStep === 0 && !showConfirmRestart) {
      const currentQuestions = getQuestions(language);
      const firstQuestion = currentQuestions[0];
      setCurrentQuestion(firstQuestion);
      speak(`Welcome! I'll help you create your artisan profile. ${firstQuestion}`);
      setTimeout(() => {
        if (speechSupported && isInitialized) {
          startRecognitionRef.current(0); // Pass step 0 to the recognition function
        }
      }, 3000);
    } else {
      startRecognitionRef.current(currentStep); // Pass currentStep to the recognition function
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    // Validate all fields before submitting
    const validation = validateAllFields(answers);
    if (!validation.isValid) {
      setError(`Please fix the following issues: ${validation.errors.join(', ')}`);
      speak('I found some issues with your information. Please check and correct them before saving.');
      setIsProcessing(false);
      return;
    }

    try {
      console.log('Saving artisan data:', answers);
      const response = await fetch('http://localhost:5000/api/artisans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: answers.name,
          location: answers.location,
          category: answers.category,
          phone: answers.phone,
          email: answers.email,
          password: answers.password,
          language,
          voiceRegistered: true // Flag to indicate this is a voice registration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('Profile saved successfully!');
        speak('Wonderful! Your artisan profile has been created successfully. Thank you for sharing your story with us!');
        
        // Reset after success
        setTimeout(() => {
          handleRestart();
          setSuccess('');
        }, 4000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save profile. Please try again.');
        speak('I apologize, but there was a problem saving your profile. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save profile. Please try again.');
      speak('I apologize, but there was a problem saving your profile. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({ name: '', location: '', category: '', phone: '', email: '', password: '' });
    setTranscript('');
    setCurrentQuestion('');
    setShowConfirmRestart(false);
    setError('');
    setSuccess('');
    setEditingField(null);
    stopRecognition();
    setTimeout(() => {
      speak('Let\'s start fresh! What is your name?');
    }, 500);
  };

  const updateAnswer = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!speechSupported || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">Browser Not Supported</h2>
            <p className="text-gray-600 mb-4">
              This voice assistant requires a modern browser with speech recognition support.
            </p>
            <p className="text-sm text-gray-500">
              Please use Chrome, Edge, or Safari for the best experience.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden"
      style={{ backgroundColor: '#FFF7ED' }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 bg-orange-200 rounded-full opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/2 -left-20 w-32 h-32 bg-amber-200 rounded-full opacity-20"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, 50, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-1/3 w-24 h-24 bg-red-200 rounded-full opacity-20"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, -180, -360] 
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-orange-500" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-orange-700 bg-clip-text text-transparent">
              {getUIText(language).title}
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-8 h-8 text-orange-500" />
            </motion.div>
          </div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl font-semibold text-gray-800 mb-3"
          >
            {getUIText(language).subtitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-700 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            {getUIText(language).description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 rounded-full border border-orange-200"
          >
            <Volume2 className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Voice-Powered Experience</span>
          </motion.div>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <LanguageSelector 
            language={language} 
            onLanguageChange={handleLanguageChange}
          />
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mb-6"
            >
              <Alert variant="destructive" className="shadow-lg border-red-200">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="text-base">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mb-6"
            >
              <Alert className="border-green-300 bg-green-50 shadow-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 text-base font-medium">{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <ConversationDisplay
                currentStep={currentStep}
                isListening={isListening}
                currentQuestion={currentQuestion}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <TranscriptDisplay
                transcript={transcript}
                isListening={isListening}
              />
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <CollectedDataCard
                answers={answers}
                onUpdateAnswer={updateAnswer}
                editingField={editingField}
                setEditingField={setEditingField}
              />
            </motion.div>
          </div>
        </div>

        {/* Enhanced Control Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10"
        >
          <ControlButtons
            isListening={isListening}
            onStartRecording={handleStartRecording}
            onStopRecording={stopRecognition}
            onConfirm={handleConfirm}
            onRestart={handleRestart}
            showConfirmRestart={showConfirmRestart}
            isProcessing={isProcessing}
            uiText={getUIText(language)}
          />
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="max-w-2xl mx-auto bg-white/70 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-3">💡 Tips for Best Experience</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <div>• Speak clearly and naturally</div>
                <div>• Ensure microphone access is allowed</div>
                <div>• Use a quiet environment</div>
                <div>• Say "skip" to skip optional questions</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
