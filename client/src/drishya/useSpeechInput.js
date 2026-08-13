import { useState, useEffect, useRef } from 'react';

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export default function useSpeechInput() {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported] = useState(!!SpeechRecognition);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    if (!SpeechRecognition) return;
    setTranscript('');
    setIsRecording(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop automatically when user finishes speaking
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      const combined = (final + interim).trim().replace(/\s+/g, ' ');
      if (combined) {
        setTranscript(combined);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    transcript,
    setTranscript,
    isRecording,
    isSupported,
    startRecording,
    stopRecording
  };
}
