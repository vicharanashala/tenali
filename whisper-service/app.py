import os
import sys
import json
import torch
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import gradio as gr

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from whisper_voice_recognizer import WhisperVoiceRecognizer

# Detect Hugging Face ZeroGPU
try:
    import spaces
except ImportError:
    spaces = None

# Initialize recognizer with 'small' model
model_id = os.environ.get("WHISPER_MODEL", "small")
print(f"[*] Initializing WhisperVoiceRecognizer ({model_id})...")
recognizer = WhisperVoiceRecognizer(model_id=model_id)

# Define core inference function
def run_transcribe(audio_input):
    """
    Transcribes audio (either filepath from Gradio or raw bytes from REST API).
    """
    if torch.cuda.is_available() and recognizer.whisper_model.device != torch.device("cuda"):
        try:
            recognizer.whisper_model = recognizer.whisper_model.to("cuda")
            recognizer.device = "cuda"
        except Exception as e:
            print(f"[!] Warning: moving to cuda failed: {e}")

    result = recognizer.transcribe(audio_input, sensitivity="ultra_high")
    return {
        "success": True,
        "text": result.get("text", ""),
        "raw_text": result.get("raw_text", ""),
        "number": result.get("number"),
        "number_name": result.get("number_name"),
        "language": result.get("language", "en"),
        "backend": result.get("backend", "openai-whisper"),
        "device": str(recognizer.whisper_model.device)
    }

# Wrap with ZeroGPU if running on Hugging Face ZeroGPU Space
if spaces is not None:
    print("[+] ZeroGPU detected! Applying @spaces.GPU acceleration...")
    run_transcribe = spaces.GPU(duration=15)(run_transcribe)
else:
    print("[*] Running in standard CPU/CUDA mode.")

# Build Gradio UI for manual testing & space readiness
with gr.Blocks(title="Tenali Whisper Voice Recognizer") as demo:
    gr.Markdown("# 🎙️ Tenali Whisper Voice Recognizer Service")
    gr.Markdown(
        "**ZeroGPU Accelerated** • OpenAI Whisper `small` (244M) • "
        "REST API active on `/health` and `/transcribe`"
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
        "backend": "openai-whisper",
        "sensitivity": "ultra_high",
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
        return JSONResponse(status_code=200, content=res)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print(f"[+] Launching Gradio + REST API server on 0.0.0.0:{port}...")
    demo.launch(server_name="0.0.0.0", server_port=port)
