import React from 'react';
import { FileText, Volume2, Waves, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TranscriptDisplay({ transcript, isListening }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/30 to-transparent rounded-full -translate-y-8 translate-x-8" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="font-bold text-gray-800 text-lg">Live Transcript</h3>
          
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 ml-auto"
              >
                <Waves className="w-4 h-4 text-green-600" />
                <motion.div
                  className="flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-4 bg-green-500 rounded-full"
                      animate={{ 
                        height: [16, 8, 16],
                        backgroundColor: ['#10b981', '#22c55e', '#10b981'] 
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity, 
                        delay: i * 0.15,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>
                <span className="text-sm font-medium text-green-700">Recording</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="min-h-[100px] bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl p-5 border border-orange-100">
          <AnimatePresence mode="wait">
            {transcript ? (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-start gap-2">
                  <Volume2 className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-800 text-lg leading-relaxed font-medium">
                    "{transcript}"
                  </p>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                />
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-4"
              >
                {isListening ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-3"
                    >
                      <Mic className="w-8 h-8 text-orange-500" />
                    </motion.div>
                    <p className="text-gray-600 text-lg font-medium mb-1">
                      Listening for your voice...
                    </p>
                    <p className="text-gray-400 text-sm">
                      Speak clearly and I'll capture your words
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-3 p-3 bg-orange-100 rounded-full">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-gray-600 text-lg font-medium mb-1">
                      Ready to listen
                    </p>
                    <p className="text-gray-400 text-sm">
                      Click 'Start Recording' to begin
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 text-center"
          >
            <span className="text-xs text-gray-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              ✓ Captured successfully
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
