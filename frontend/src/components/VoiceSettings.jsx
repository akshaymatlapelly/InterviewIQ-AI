import React, { useState, useEffect } from 'react';
import { Slider } from './ui/Slider';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Volume2, VolumeX } from 'lucide-react';

export function loadVoiceConfig() {
  const defaults = {
    voiceURI: '',
    rate: 1.0,
    pitch: 1.0,
    lang: 'en-US'
  };
  try {
    const saved = localStorage.getItem('iq_voice_config');
    return saved ? JSON.parse(saved) : defaults;
  } catch (e) {
    return defaults;
  }
}

export function saveVoiceConfig(config) {
  try {
    localStorage.setItem('iq_voice_config', JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save voice config:", e);
  }
}

export default function VoiceSettings() {
  const [config, setConfig] = useState(loadVoiceConfig());
  const [availableVoices, setAvailableVoices] = useState([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };
    fetchVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = fetchVoices;
    }
  }, []);

  const handleSave = (updated) => {
    setConfig(updated);
    saveVoiceConfig(updated);
  };

  const handleTest = () => {
    if (!('speechSynthesis' in window)) return;
    setTesting(true);
    window.speechSynthesis.cancel();

    const sampleText = config.lang.startsWith('hi') 
      ? "नमस्ते, मैं आपका कृत्रिम बुद्धिमत्ता साक्षात्कारकर्ता हूँ।" 
      : config.lang.startsWith('te')
      ? "నమస్కారం, నేను మీ ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ ఇంటర్వ్యూయర్ ని."
      : config.lang.startsWith('ta')
      ? "வணக்கம், நான் உங்கள் செயற்கை நுண்ணறிவு நேர்காணல் செய்பவர்."
      : "Hello, I am your artificial intelligence interviewer. How are you preparing today?";

    const utterance = new SpeechSynthesisUtterance(sampleText);
    
    // Attempt matching voice by URI
    if (config.voiceURI) {
      const voice = availableVoices.find(v => v.voiceURI === config.voiceURI);
      if (voice) utterance.voice = voice;
    }
    
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.lang = config.lang;
    
    utterance.onend = () => setTesting(false);
    utterance.onerror = () => setTesting(false);

    window.speechSynthesis.speak(utterance);
  };

  // Preset languages based on request requirements
  const languages = [
    { code: 'en-US', label: 'English (United States)' },
    { code: 'hi-IN', label: 'Hindi (भारत)' },
    { code: 'te-IN', label: 'Telugu (భారతదేశం)' },
    { code: 'ta-IN', label: 'Tamil (இந்தியா)' }
  ];

  // Filter voices based on language selection
  const filteredVoices = availableVoices.filter(v => 
    v.lang.toLowerCase().startsWith(config.lang.split('-')[0].toLowerCase())
  );

  return (
    <div className="glass border border-white/5 p-6 rounded-xl space-y-6">
      <div className="flex items-center gap-3">
        <Volume2 className="text-violet-500 w-5 h-5" />
        <h3 className="text-lg font-bold text-white">Voice & Audio Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language selector */}
        <div className="space-y-2">
          <Label>Interview Language</Label>
          <Select
            value={config.lang}
            onChange={(e) => {
              const lang = e.target.value;
              const matchedVoice = availableVoices.find(v => v.lang.startsWith(lang.split('-')[0]));
              handleSave({ 
                ...config, 
                lang, 
                voiceURI: matchedVoice ? matchedVoice.voiceURI : '' 
              });
            }}
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} className="bg-[#0b0c16]">{l.label}</option>
            ))}
          </Select>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <Label>System TTS Voice</Label>
          <Select
            value={config.voiceURI}
            onChange={(e) => handleSave({ ...config, voiceURI: e.target.value })}
          >
            <option value="" className="bg-[#0b0c16]">System Default</option>
            {filteredVoices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI} className="bg-[#0b0c16]">
                {v.name} ({v.lang})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-6 pt-4 border-t border-white/5">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Speaking Speed (Rate): {config.rate}x</Label>
            <span className="text-xs text-slate-400">Default: 1.0x</span>
          </div>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={config.rate}
            onChange={(val) => handleSave({ ...config, rate: val })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Voice Pitch: {config.pitch}</Label>
            <span className="text-xs text-slate-400">Default: 1.0</span>
          </div>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={config.pitch}
            onChange={(val) => handleSave({ ...config, pitch: val })}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="text-xs text-slate-400">
          Preferences are automatically saved to your browser cache.
        </div>
        <Button onClick={handleTest} disabled={testing} variant="glass">
          {testing ? <VolumeX className="w-4 h-4 mr-2 animate-pulse" /> : <Volume2 className="w-4 h-4 mr-2" />}
          {testing ? 'Speaking...' : 'Test Speech'}
        </Button>
      </div>
    </div>
  );
}
export { VoiceSettings };
