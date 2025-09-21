import React from 'react';

const languages = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-IN', label: 'English (India)', flag: '🇮🇳' },
  { code: 'hi-IN', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', flag: '🇮🇳' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)', flag: '🇮🇳' },
  { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' },
  { code: 'es-ES', label: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français (French)', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'it-IT', label: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'pt-BR', label: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'ar-SA', label: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'zh-CN', label: '中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ja-JP', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'ko-KR', label: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'ru-RU', label: 'Русский (Russian)', flag: '🇷🇺' }
];

export default function LanguageSelector({ language, onLanguageChange }) {
  const selectedLanguage = languages.find(lang => lang.code === language);
  
  return (
    <div className="flex flex-col items-center gap-4 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-800">Choose Your Language</h3>
          <p className="text-sm text-gray-600">भाषा चुनें • ভাষা নির্বাচন • தமிழ் தேर्வ</p>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <select 
          value={language} 
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full p-4 text-lg border-2 border-orange-200 rounded-2xl bg-white focus:border-orange-400 focus:outline-none shadow-lg max-h-60 overflow-y-auto"
          size="8"
        >
          <optgroup label="🇮🇳 Indian Languages">
            {languages.filter(lang => lang.code.includes('-IN')).map((lang) => (
              <option key={lang.code} value={lang.code} className="p-2 text-base">
                {lang.flag} {lang.label}
              </option>
            ))}
          </optgroup>
          
          <optgroup label="🌍 International Languages">
            {languages.filter(lang => !lang.code.includes('-IN')).map((lang) => (
              <option key={lang.code} value={lang.code} className="p-2 text-base">
                {lang.flag} {lang.label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {selectedLanguage && (
        <div className="text-center bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-200">
          <p className="text-sm text-gray-600 mb-1">Selected Language:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{selectedLanguage.flag}</span>
            <span className="font-bold text-orange-700">{selectedLanguage.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}