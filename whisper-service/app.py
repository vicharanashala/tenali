# === Fix for Gradio 4.44.0 + Jinja2 "unhashable type: 'dict'" bug ===
import jinja2.utils
from jinja2.utils import LRUCache

_original_getitem = LRUCache.__getitem__
_original_setitem = LRUCache.__setitem__

def _make_hashable(obj):
    """Recursively convert dicts/lists into hashable tuples."""
    if isinstance(obj, dict):
        return tuple(sorted((k, _make_hashable(v)) for k, v in obj.items()))
    elif isinstance(obj, (list, tuple)):
        return tuple(_make_hashable(x) for x in obj)
    elif isinstance(obj, set):
        return tuple(sorted(_make_hashable(x) for x in obj))
    return obj

def _safe_getitem(self, key):
    try:
        return _original_getitem(self, key)
    except TypeError:
        hashable_key = _make_hashable(key)
        return _original_getitem(self, hashable_key)

def _safe_setitem(self, key, value):
    try:
        _original_setitem(self, key, value)
    except TypeError:
        hashable_key = _make_hashable(key)
        _original_setitem(self, hashable_key, value)

LRUCache.__getitem__ = _safe_getitem
LRUCache.__setitem__ = _safe_setitem
# === End of fix ===

import os
import sys
import io
import re
import json
import torch
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import gradio as gr
from faster_whisper import WhisperModel

# Detect Hugging Face ZeroGPU
try:
    import spaces
except ImportError:
    spaces = None

# Number names and phonetic regex patterns for numbers 1 to 10
NUMBER_NAMES = {
    1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
    6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten"
}

PHONETIC_PATTERNS = {
    1:  re.compile(r"\b(1|one|won|wan|van|when|run|bun|fun|done|first|ek|ondru|onnu|onru|un|uno)\b", re.I),
    2:  re.compile(r"\b(2|two|to|too|tu|do|doo|second|rendu|erandu|irandu|dos)\b", re.I),
    3:  re.compile(r"\b(3|three|tree|free|thee|tri|third|teen|tin|moonu|moondru|tres)\b", re.I),
    4:  re.compile(r"\b(4|four|for|fore|far|ford|fourth|char|chaar|naalu|naangu|cuatro)\b", re.I),
    5:  re.compile(r"\b(5|five|faiv|fai|fiv|fifth|panch|paanch|anju|aindhu|ainthu|cinco|bye|buy)\b", re.I),
    6:  re.compile(r"\b(6|six|siks|sex|sick|sixth|chhe|che|chha|aaru|seis)\b", re.I),
    7:  re.compile(r"\b(7|seven|sevn|sevan|seventh|saat|sat|yezhu|ezhu|siete)\b", re.I),
    8:  re.compile(r"\b(8|eight|ate|ait|eat|eighth|aath|ath|ettu|ocho)\b", re.I),
    9:  re.compile(r"\b(9|nine|nain|nin|night|ninth|nau|no|ombodhu|onpathu|onbathu|nueve)\b", re.I),
    10: re.compile(r"\b(10|ten|tan|tin|den|tenth|das|dus|pathu|patthu|diez|dead)\b", re.I)
}

def resolve_number(text: str):
    if not text:
        return None
    clean = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
    for num, pattern in PHONETIC_PATTERNS.items():
        if pattern.search(clean):
            return num
    return None

# Initialize faster-whisper model
model_id = os.environ.get("WHISPER_MODEL", "small")
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if device == "cuda" else "int8"
print(f"[*] Initializing faster-whisper ({model_id}) on {device} ({compute_type})...")
recognizer = WhisperModel(model_id, device=device, compute_type=compute_type)

def run_transcribe(audio_input):
    """
    Transcribes audio from either a filepath (Gradio UI) or raw bytes (REST API).
    """
    if not audio_input:
        return {"success": False, "error": "No audio input provided"}

    # Wrap raw bytes in BytesIO
    if isinstance(audio_input, bytes):
        audio_source = io.BytesIO(audio_input)
    else:
        audio_source = audio_input

    try:
        segments, info = recognizer.transcribe(
            audio_source,
            beam_size=1,
            best_of=1,
            temperature=0.0,
            vad_filter=True,
            initial_prompt="1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Counting numbers: one, two, three, four, five, six, seven, eight, nine, ten."
        )

        raw_text = " ".join([seg.text for seg in segments]).strip()
        detected_number = resolve_number(raw_text)
        canonical_name = NUMBER_NAMES.get(detected_number, raw_text)

        return {
            "success": True,
            "text": canonical_name,
            "raw_text": raw_text,
            "number": detected_number,
            "number_name": NUMBER_NAMES.get(detected_number),
            "language": getattr(info, "language", "en"),
            "backend": "faster-whisper",
            "device": device
        }
    except Exception as e:
        print(f"[!] Transcription error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# ZeroGPU acceleration wrapper if hosted on Hugging Face ZeroGPU Space
if spaces is not None:
    print("[+] ZeroGPU detected! Applying @spaces.GPU acceleration...")
    run_transcribe = spaces.GPU(duration=15)(run_transcribe)
else:
    print(f"[*] Running in standard {device.upper()} mode.")

# Build Gradio UI for manual testing & space readiness
with gr.Blocks(title="Tenali Whisper Voice Recognizer") as demo:
    gr.Markdown("# 🎙️ Tenali Whisper Voice Recognizer Service")
    gr.Markdown(
        f"**Engine**: `faster-whisper` (`{model_id}`) • "
        f"**Device**: `{device}` • "
        "REST API live on `/health` and `/transcribe`"
    )

    with gr.Row():
        audio_in = gr.Audio(sources=["microphone", "upload"], type="filepath", label="Mic Test (Whisper a number 1..10)")
        json_out = gr.JSON(label="Transcription & Number Detection Output")

    submit_btn = gr.Button("Transcribe & Detect Number 🚀", variant="primary")
    submit_btn.click(fn=run_transcribe, inputs=[audio_in], outputs=[json_out])

# Attach FastAPI REST API endpoints directly to demo.app
app = demo.app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {
        "status": "ready",
        "model": model_id,
        "backend": "faster-whisper",
        "device": device,
        "zerogpu": spaces is not None,
        "cuda_available": torch.cuda.is_available()
    }

@app.post("/transcribe")
async def transcribe(request: Request):
    try:
        body = await request.body()
        if not body or len(body) == 0:
            return JSONResponse(status_code=400, content={"error": "Empty audio body"})

        res = run_transcribe(body)
        status_code = 200 if res.get("success") else 500
        return JSONResponse(status_code=status_code, content=res)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print(f"[+] Launching Gradio + REST API server on 0.0.0.0:{port}...")
    demo.launch(server_name="0.0.0.0", server_port=port)
