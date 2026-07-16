import React, { useState, useEffect } from 'react';
import './VoiceAssistant.css';

export default function VoiceAssistant({ progressData, onNavigate, onStartTour }) {
  const [speaking, setSpeaking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [greetingPlayed, setGreetingPlayed] = useState(false);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = 
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.name.includes('Samantha')) ||
        voices.find(v => v.name.includes('Daniel')) ||
        voices.find(v => v.name.includes('Premium')) ||
        voices.find(v => v.lang.startsWith('en'));
      
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
    } else {
      setVoice();
    }
  };

  useEffect(() => {
    if (greetingPlayed) return;
    const timer = setTimeout(() => {
      const hasSeenTour = sessionStorage.getItem('tenali-tour');
      if (!hasSeenTour) {
        setExpanded(true);
        if (onStartTour) onStartTour();
        sessionStorage.setItem('tenali-tour', 'true');
      } else {
        const userStr = localStorage.getItem('tenali-user');
        const username = userStr ? JSON.parse(userStr).username : 'Student';
        speak('Welcome back, ' + username);
      }
      setGreetingPlayed(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [greetingPlayed, onStartTour]);

  const handleGuideMe = () => {
    const userStr = localStorage.getItem('tenali-user');
    const username = userStr ? JSON.parse(userStr).username : 'Student';
    let msg = 'Hello ' + username + '. ';
    
    if (progressData && progressData.length > 0) {
      const needsPractice = progressData.sort((a, b) => a.score - b.score)[0];
      msg += 'Your lowest score is in ' + needsPractice.topic.replace('-', ' ') + '. Shall we practice that?';
    } else {
      msg += 'I dont have enough data yet. Try the random mix quiz!';
    }
    speak(msg);
  };

  return (
    <div className={'voice-assistant ' + (expanded ? 'expanded ' : '') + (speaking ? 'speaking' : '')}>
      <div className="va-avatar" onClick={() => setExpanded(!expanded)}>
        <div className="va-icon">🤖</div>
        {speaking && <div className="va-pulse"></div>}
      </div>
      
      {expanded && (
        <div className="va-menu">
          <h4>Tenali Guide</h4>
          <button className="va-btn" onClick={() => { if (onStartTour) onStartTour(); setSpeaking(false); window.speechSynthesis.cancel(); }}>
            🗺️ Take a tour
          </button>
        </div>
      )}
    </div>
  );
}