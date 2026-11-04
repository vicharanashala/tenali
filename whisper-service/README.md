---
title: Tenali Whisper Voice Recognizer
emoji: 🎙️
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Tenali Whisper Voice Recognizer Service

Dedicated HTTP speech recognition service for the Tenali Mathematics Platform (Learn & Trace, Space Maze Adventure).

- **Model**: OpenAI Whisper `small` (244M parameters)
- **Features**: Ultra-high acoustic sensitivity (+38 dB AGC gain), bandpass rumble filtering, high-frequency consonant pre-emphasis, and phonetic homophone number mapping (`1..10`).
- **Endpoints**:
  - `GET  /health` - Readiness check
  - `POST /transcribe` - Accepts 16kHz mono WAV audio and returns recognized text and detected numbers.
