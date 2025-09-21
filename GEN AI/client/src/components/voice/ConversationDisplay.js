import React from 'react';
import { MessageCircle, Mic, MicOff, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "../ui/progress";

const questions = {
  0: "What is your name?",
  1: "Where do you live?", 
  2: "What do you make?",
  3: "Your phone number? (You can skip this)",
  4: "What is your email address?",
  5: "Please create a secure password for your account.",
  6: "For security, please say your password again to confirm."
};

export default function ConversationDisplay({ currentStep, isListening, currentQuestion }) {
  const totalSteps = Object.keys(questions).length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-orange-100 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <motion.div 
              className="w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg"
              animate={isListening ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 2, repeat: isListening ? Infinity : 0 }}
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
            
            {/* Status indicator */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Mic className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-bold text-gray-800 text-lg">AI Assistant</h3>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                isListening 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {isListening ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <Mic className="w-3 h-3" />
                    </motion.div>
                    Listening...
                  </>
                ) : (
                  <>
                    <MicOff className="w-3 h-3" />
                    Ready
                  </>
                )}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl p-5 border border-orange-100"
              >
                <p className="text-gray-800 text-lg leading-relaxed font-medium">
                  {currentQuestion || questions[currentStep] || "Let's get started! Click the record button to begin."}
                </p>
              </motion.div>
            </AnimatePresence>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  Progress: Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-orange-600 font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress 
                value={progress} 
                className="h-2 bg-gray-200" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
