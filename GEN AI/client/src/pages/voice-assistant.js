import React from 'react';
import Head from 'next/head';
import VoiceAssistant from '../components/voice/VoiceAssistant';

export default function VoiceAssistantPage() {
  return (
    <>
      <Head>
        <title>AI Voice Assistant - Artisan Registration</title>
        <meta name="description" content="Register as an artisan using our AI-powered voice assistant. Speak naturally in your preferred language to create your profile." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen">
        <VoiceAssistant />
      </main>
    </>
  );
}