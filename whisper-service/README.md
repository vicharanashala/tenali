---
title: Tenali Whisper Voice Recognizer
emoji: 🎙️
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
---

# Tenali Whisper Voice Recognizer Service

ZeroGPU-accelerated speech recognition service for the Tenali Mathematics Platform (Learn & Trace, Space Maze Adventure).

- **Model**: OpenAI Whisper `small` (244M parameters)
- **ZeroGPU Acceleration**: Runs with near-zero latency (<100ms) on Hugging Face's free Nvidia A100 GPU!
- **Features**: Ultra-high acoustic sensitivity (+38 dB AGC gain), bandpass rumble filtering, consonant pre-emphasis, and phonetic homophone number mapping (`1..10`).
- **REST Endpoints**:
  - `GET  /health` - Readiness check
  - `POST /transcribe` - Accepts 16kHz mono WAV audio and returns detected number & text.
