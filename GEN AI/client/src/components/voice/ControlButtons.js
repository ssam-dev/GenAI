import React from 'react';
import { Button } from "../ui/button";
import { Mic, MicOff, Check, RotateCcw, Play, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ControlButtons({ 
  isListening, 
  onStartRecording, 
  onStopRecording,
  onConfirm,
  onRestart,
  showConfirmRestart,
  isProcessing,
  uiText = {
    startButton: "Start Voice Registration",
    stopButton: "Stop Recording", 
    confirmButton: "Confirm & Save Profile",
    restartButton: "Start Over"
  }
}) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <AnimatePresence mode="wait">
        {!showConfirmRestart ? (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative"
          >
            {/* Pulse effect when listening */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0.4)',
                    '0 0 0 20px rgba(239, 68, 68, 0)',
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            
            <Button
              size="lg"
              onClick={isListening ? onStopRecording : onStartRecording}
              className={`relative h-20 px-12 text-lg font-bold rounded-2xl transition-all duration-300 shadow-2xl transform hover:scale-105 active:scale-95 ${
                isListening 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30' 
                  : 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white shadow-orange-500/30'
              }`}
            >
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isListening ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <MicOff className="w-7 h-7" />
                    </motion.div>
                    {uiText.stopButton}
                  </>
                ) : (
                  <>
                    <Mic className="w-7 h-7" />
                    {uiText.startButton}
                  </>
                )}
              </motion.div>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex gap-6"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={onConfirm}
                disabled={isProcessing}
                className="h-16 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {isProcessing ? 'Saving Profile...' : uiText.confirmButton}
                </div>
              </Button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                onClick={onRestart}
                disabled={isProcessing}
                className="h-16 px-8 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 font-bold rounded-xl shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5" />
                  {uiText.restartButton}
                </div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {!showConfirmRestart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 mb-2">
            {isListening ? 'Listening for your response...' : 'Click to start or continue'}
          </p>
          {isListening && (
            <motion.div
              className="text-xs text-gray-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Recording will auto-stop after 15 seconds
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}