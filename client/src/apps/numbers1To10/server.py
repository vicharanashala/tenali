"""
server.py — FastAPI Backend & Static Server for Whisper Digit Recognizer

Uses fine-tuned gradient-queen/whisper-tiny-indian-digits-final model
to recognize digits 1 to 10 from 16kHz audio.
"""

import os
import sys
import io
import re
import mimetypes

# Ensure proper MIME types for JavaScript and JSX on Windows
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".jsx")
mimetypes.add_type("text/css", ".css")

# Prevent Keras/TensorFlow version conflicts with Transformers
os.environ["USE_TF"] = "0"
os.environ["TRANSFORMERS_NO_TF"] = "1"

import uvicorn
import numpy as np
import soundfile as sf
import torch
from fastapi import FastAPI, UploadFile, File, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

app = FastAPI(title="Whisper Digit Recognizer")

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_processor = None
_model = None

DIGIT_PATTERNS = {
    1: re.compile(r"\b(1|one|won|wan|van|when|run|first|ek|ondru|onnu|onru|okati|un|uno)\b", re.I),
    2: re.compile(r"\b(2|two|to|too|tu|do|doo|second|rendu|erandu|irandu|dos)\b", re.I),
    3: re.compile(r"\b(3|three|tree|free|thee|tri|third|teen|tin|moonu|moondru|moodu|tres)\b", re.I),
    4: re.compile(r"\b(4|four|for|fore|far|ford|fourth|char|chaar|naalu|naangu|cuatro)\b", re.I),
    5: re.compile(r"\b(5|five|faiv|fai|fiv|fifth|panch|paanch|anju|aindhu|ainthu|aidu|cinco|bye|buy)\b", re.I),
    6: re.compile(r"\b(6|six|siks|sex|sick|sixth|chhe|che|chha|aaru|seis)\b", re.I),
    7: re.compile(r"\b(7|seven|sevn|sevan|seventh|saat|sat|yezhu|ezhu|yedu|siete)\b", re.I),
    8: re.compile(r"\b(8|eight|ate|ait|eat|eighth|aath|ath|ettu|enimidi|ocho)\b", re.I),
    9: re.compile(r"\b(9|nine|nain|nin|night|ninth|nau|no|ombodhu|onpathu|onbathu|thommidi|nueve)\b", re.I),
    10: re.compile(r"\b(10|ten|tan|tin|den|tenth|das|dus|pathu|patthu|padi|diez)\b", re.I),
}

WORD_NAMES = {
    1: "ONE", 2: "TWO", 3: "THREE", 4: "FOUR", 5: "FIVE",
    6: "SIX", 7: "SEVEN", 8: "EIGHT", 9: "NINE", 10: "TEN"
}

def resolve_digit(text: str):
    if not text:
        return None
    clean = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower()).strip()
    digit_match = re.search(r"\b([1-9]|10)\b", clean)
    if digit_match:
        return int(digit_match.group(1))
    for num, pat in DIGIT_PATTERNS.items():
        if pat.search(clean):
            return num
    return None

def get_model():
    global _processor, _model
    if _processor is None or _model is None:
        from transformers import WhisperProcessor, WhisperForConditionalGeneration

        model_snapshot = r"C:\Users\Vedhiga V.B\.cache\huggingface\hub\models--gradient-queen--whisper-tiny-indian-digits-final\snapshots\ea3844ae42b83b864b0528ecb0017bcb98ed35fb"
        print(f"[server] Loading fine-tuned Whisper-Tiny from local cache...")
        _processor = WhisperProcessor.from_pretrained(model_snapshot, local_files_only=True)
        _model = WhisperForConditionalGeneration.from_pretrained(model_snapshot, local_files_only=True)
        _model.eval()
        print("[server] Whisper-Tiny successfully loaded in memory!")
    return _processor, _model

@app.on_event("startup")
def startup_event():
    print("[server] Pre-loading Whisper Indian Digits model into RAM...")
    try:
        get_model()
        print("[server] Whisper model ready for instantaneous zero-latency recognition!")
    except Exception as e:
        print(f"[server] Warning during model startup: {e}")

@app.get("/api/health")
def health():
    is_loaded = _model is not None and _processor is not None
    return {
        "status": "ok",
        "model_loaded": is_loaded,
        "model_name": "gradient-queen/whisper-tiny-indian-digits-final"
    }

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)

@app.post("/api/recognize")
def recognize(file: UploadFile = File(...)):
    try:
        content = file.file.read()
        print(f"[server] Received audio: {file.filename} ({len(content)} bytes)")

        try:
            audio_data, sample_rate = sf.read(io.BytesIO(content))
        except Exception as sf_err:
            print(f"[server] soundfile decode warning: {sf_err}")
            audio_data = np.frombuffer(content, dtype=np.int16).astype(np.float32) / 32768.0
            sample_rate = 16000

        if audio_data.ndim > 1:
            audio_data = audio_data.mean(axis=1)

        if sample_rate != 16000:
            import scipy.signal
            num_samples = int(len(audio_data) * 16000 / sample_rate)
            audio_data = scipy.signal.resample(audio_data, num_samples)

        # Pad with 0.1s silence if short
        if len(audio_data) < 8000:
            pad = np.zeros(8000 - len(audio_data), dtype=np.float32)
            audio_data = np.concatenate([audio_data, pad])

        processor, model = get_model()

        with torch.no_grad():
            input_features = processor(audio_data, sampling_rate=16000, return_tensors="pt").input_features
            predicted_ids = model.generate(
                input_features,
                language="en",
                task="transcribe",
                max_new_tokens=15,
                num_beams=1
            )
            raw_text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0].strip()

        print(f"[server] Raw Whisper output: '{raw_text}'")
        resolved_num = resolve_digit(raw_text)

        if resolved_num:
            display_text = f"{WORD_NAMES[resolved_num]} ({resolved_num})"
        else:
            display_text = raw_text.upper() if raw_text else "NO SPEECH DETECTED"

        print(f"[server] Final prediction: {display_text}")
        return {"text": display_text, "raw": raw_text, "digit": resolved_num, "status": "success"}

    except Exception as e:
        print(f"[server] Inference error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "text": "RECOGNITION FAILED"}
        )

# Mount current directory to serve static files
current_dir = os.path.dirname(os.path.abspath(__file__))
app.mount("/", StaticFiles(directory=current_dir, html=True), name="static")

if __name__ == "__main__":
    print("\n" + "=" * 65)
    print(" Whisper-Tiny Digit Recognizer UI & API")
    print(" Server running at: http://localhost:8000")
    print(" Press Ctrl+C to stop.")
    print("=" * 65 + "\n")
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=False)
