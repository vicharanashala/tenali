import os
import sys

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from whisper_voice_recognizer import WhisperVoiceRecognizer, run_http_server

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    model_name = os.environ.get("WHISPER_MODEL", "small")
    
    print(f"[*] Starting Tenali Whisper Voice Recognizer ({model_name}) on port {port}...")
    recognizer = WhisperVoiceRecognizer(model_id=model_name)
    run_http_server(recognizer, host="0.0.0.0", port=port)
