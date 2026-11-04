#!/usr/bin/env python3
"""
=============================================================================
Whisper Voice Recognizer (Ultra-High Sensitivity & Counting Edition)
Model: openai/whisper-small (244M parameters)
Hugging Face URL: https://huggingface.co/openai/whisper-small

Optimizations for CPU & Whispers:
1. Multi-threaded CPU acceleration (utilizes all available CPU cores).
2. Direct Mel-Spectrogram decoding (2x faster than standard transcribe).
3. Clear Stage-by-Stage UI:
   - 🎙️  [RECORDING: Speak/Whisper Now!]
   - ⏳ [PROCESSING: Whisper Transcribing...]
   - 🗣️  [RESULT: Resolved Number & Phonetics]
4. Automatic Phonetic Mapping for Counting (1 to 10):
   "bun"  -> 1 (One)
   "bye"  -> 5 (Five)
   "dead" -> 10 (Ten)
5. Multi-stage Automatic Gain Control (AGC, up to +40 dB)

Usage:
    python whisper_voice_recognizer.py --mic
    python whisper_voice_recognizer.py --mic --model base   (For 5x faster CPU speed)
    python whisper_voice_recognizer.py --file audio.wav
    python whisper_voice_recognizer.py --serve --port 5001
=============================================================================
"""

import os
import sys
import argparse
import json
import io
import time
import re
import warnings
from typing import Union, Dict, Any, Optional

import numpy as np

# Suppress harmless SciPy/NumPy user warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Multithreaded CPU optimization
try:
    import torch
    num_cpus = os.cpu_count() or 4
    torch.set_num_threads(num_cpus)
except ImportError:
    torch = None

try:
    import soundfile as sf
except ImportError:
    sf = None

try:
    from scipy.signal import butter, lfilter
except ImportError:
    butter = None
    lfilter = None


# =============================================================================
# 1. PHONETIC NUMBER RESOLVER FOR COUNTING (1 TO 10)
# =============================================================================
NUMBER_NAMES = {
    1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
    6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten"
}

# Real-world acoustic homophones produced when whispering or speaking softly
PHONETIC_NUMBER_MAP = {
    1: [
        "1", "one", "won", "bun", "fun", "done", "run", "wan", "van",
        "first", "ek", "ondru", "onnu", "un", "uno"
    ],
    2: [
        "2", "two", "to", "too", "tu", "do", "doo", "shoe", "through",
        "second", "rendu", "erandu", "dos"
    ],
    3: [
        "3", "three", "tree", "free", "thee", "tri", "third", "teen",
        "tin", "moonu", "moondru", "tres"
    ],
    4: [
        "4", "four", "for", "fore", "far", "ford", "floor", "fourth",
        "char", "chaar", "naalu", "cuatro"
    ],
    5: [
        "5", "five", "bye", "buy", "fai", "fiv", "fine", "fire", "hive",
        "life", "fifth", "panch", "paanch", "anju", "cinco"
    ],
    6: [
        "6", "six", "siks", "sex", "sick", "sixth", "fix", "chhe",
        "che", "aaru", "seis"
    ],
    7: [
        "7", "seven", "sevn", "sevan", "heaven", "seventh", "saat",
        "sat", "yezhu", "ezhu", "siete"
    ],
    8: [
        "8", "eight", "ate", "ait", "eat", "hate", "late", "eighth",
        "aath", "ath", "ettu", "ocho"
    ],
    9: [
        "9", "nine", "nain", "nin", "mine", "line", "night", "ninth",
        "nau", "no", "ombodhu", "onpathu", "nueve"
    ],
    10: [
        "10", "ten", "dead", "den", "tin", "tan", "pen", "men", "hen",
        "then", "tenth", "das", "dus", "pathu", "diez"
    ]
}

def resolve_to_number(raw_text: str) -> Optional[int]:
    """
    Resolves raw Whisper transcripts into numbers 1 to 10,
    accurately mapping whispered homophones ('bun' -> 1, 'bye' -> 5, 'dead' -> 10).
    """
    if not raw_text:
        return None

    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', raw_text.lower()).strip()
    words = cleaned.split()

    # 1. Exact token match
    for word in words:
        for num, variants in PHONETIC_NUMBER_MAP.items():
            if word in variants:
                return num

    # 2. Substring / regex boundary match
    for num, variants in PHONETIC_NUMBER_MAP.items():
        for variant in variants:
            if re.search(r'\b' + re.escape(variant) + r'\b', cleaned):
                return num

    return None


# =============================================================================
# 2. FAINT VOICE AUDIO ENHANCER
# =============================================================================
class FaintVoiceEnhancer:
    """
    Boosts and conditions ultra-quiet, whispered audio signals so Whisper
    can attend to faint vocal formants without being masked by background noise.
    """

    @staticmethod
    def butter_bandpass(lowcut: float = 85.0, highcut: float = 7500.0, fs: int = 16000, order: int = 3):
        if butter is None or lfilter is None:
            return None, None
        nyq = 0.5 * fs
        low = max(lowcut / nyq, 0.001)
        high = min(highcut / nyq, 0.999)
        b, a = butter(order, [low, high], btype='band')
        return b, a

    @classmethod
    def remove_low_rumble(cls, audio: np.ndarray, fs: int = 16000) -> np.ndarray:
        """Removes <85Hz AC hum and breathing thumps that distort gain calculations."""
        b, a = cls.butter_bandpass(85.0, 7500.0, fs, order=3)
        if b is None or a is None:
            return audio
        try:
            return lfilter(b, a, audio).astype(np.float32)
        except Exception:
            return audio

    @classmethod
    def apply_preemphasis(cls, audio: np.ndarray, coeff: float = 0.92) -> np.ndarray:
        """
        Boosts high frequencies (consonants like 'f' in five, 't' in ten, 's' in six).
        Essential for whispered speech where unvoiced consonants are easily lost.
        """
        if len(audio) < 2:
            return audio
        emphasized = np.append(audio[0], audio[1:] - coeff * audio[:-1])
        return emphasized.astype(np.float32)

    @classmethod
    def boost_faint_audio(
        cls,
        audio: np.ndarray,
        sample_rate: int = 16000,
        target_peak: float = 0.92,
        target_rms_db: float = -18.0,
        max_gain_db: float = 38.0
    ) -> np.ndarray:
        """
        Applies multi-stage AGC, consonant sharpening, and peak limiting.
        """
        if len(audio) == 0:
            return audio

        if audio.dtype != np.float32:
            audio = audio.astype(np.float32)

        # 1. Filter low-frequency rumble (<85Hz)
        filtered = cls.remove_low_rumble(audio, fs=sample_rate)

        # 2. Apply gentle pre-emphasis to sharpen whispered consonants ('f', 't', 's')
        crisp = cls.apply_preemphasis(filtered, coeff=0.90)

        # 3. RMS calculation
        rms = np.sqrt(np.mean(crisp**2)) + 1e-9
        current_rms_db = 20 * np.log10(rms)

        # 4. Calculate gain needed to bring whisper up to standard speech level
        desired_gain_db = target_rms_db - current_rms_db
        applied_gain_db = np.clip(desired_gain_db, 0.0, max_gain_db)
        gain_multiplier = 10 ** (applied_gain_db / 20.0)

        boosted = crisp * gain_multiplier

        # 5. Soft knee / Peak Limiter to prevent clipping
        peak = np.max(np.abs(boosted)) + 1e-9
        if peak > target_peak:
            boosted = boosted * (target_peak / peak)

        return boosted.astype(np.float32)


# =============================================================================
# 3. ULTRA-SENSITIVE WHISPER RECOGNIZER
# =============================================================================
class WhisperVoiceRecognizer:
    """
    Loads Whisper tuned for maximum sensitivity on whispers,
    with automatic phonetic resolution for counting (1 to 10).
    """

    def __init__(
        self,
        model_id: str = "small",
        device: Optional[str] = None
    ):
        global torch
        if torch is None:
            try:
                import torch as _torch
                torch = _torch
            except ImportError:
                print("[-] PyTorch is required. Install via: pip install torch torchaudio")
                sys.exit(1)

        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        self.model_id = model_id
        self.enhancer = FaintVoiceEnhancer()
        self.backend = None
        self.whisper_model = None

        print(f"[*] Initializing Whisper '{model_id}' on device: {self.device} (CPU Cores: {num_cpus})...")
        self._load_model()

    def _load_model(self):
        """Loads model using official openai-whisper."""
        start_t = time.time()
        try:
            import importlib
            whisper_pkg = importlib.import_module("whisper")
            model_name = "small" if "small" in self.model_id else self.model_id
            print(f"[*] Loading via openai-whisper ('{model_name}')...")
            self.whisper_model = whisper_pkg.load_model(model_name, device=self.device)
            self.backend = "openai-whisper"
            print(f"[+] Loaded openai-whisper '{model_name}' in {time.time() - start_t:.2f}s successfully!")
            return
        except ImportError:
            pass
        except Exception as e:
            print(f"[!] openai-whisper load failed ({e})")

        print("\n[-] Error: Could not load Whisper.")
        print("👉 Run: pip install openai-whisper soundfile sounddevice\n")
        sys.exit(1)

    def transcribe(
        self,
        audio_input: Union[str, np.ndarray, bytes],
        language: str = "en",
        initial_prompt: Optional[str] = "1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Counting numbers: one, two, three, four, five, six, seven, eight, nine, ten.",
        sensitivity: str = "ultra_high",
        sample_rate: int = 16000
    ) -> Dict[str, Any]:
        """
        Transcribes audio with ultra-high acoustic sensitivity:
        - Boosts faint whispered audio by up to +38 dB.
        - Fast Mel-Spectrogram decoding on CPU.
        - Automatically resolves whispered homophones into canonical numbers 1..10.
        """
        import importlib
        whisper_mod = importlib.import_module("whisper")

        # 1. Normalize audio input into a 16kHz float32 NumPy array
        if isinstance(audio_input, str):
            audio = whisper_mod.load_audio(audio_input)
        elif isinstance(audio_input, bytes):
            if sf is None:
                raise RuntimeError("soundfile library is required. Install: pip install soundfile")
            data, sr = sf.read(io.BytesIO(audio_input), dtype="float32")
            if data.ndim > 1:
                data = data.mean(axis=1)
            if sr != sample_rate:
                num_samples = int(len(data) * sample_rate / sr)
                data = np.interp(
                    np.linspace(0, len(data), num_samples, endpoint=False),
                    np.arange(len(data)),
                    data
                ).astype(np.float32)
            audio = data
        elif isinstance(audio_input, np.ndarray):
            audio = audio_input.astype(np.float32)
        else:
            raise ValueError(f"Unsupported audio input type: {type(audio_input)}")

        # 2. Boost the lowest-volume speech signals (AGC + rumble filter + pre-emphasis)
        if sensitivity in ("high", "ultra_high"):
            audio = self.enhancer.boost_faint_audio(
                audio,
                sample_rate=sample_rate,
                target_peak=0.92,
                target_rms_db=-18.0,
                max_gain_db=38.0 if sensitivity == "ultra_high" else 22.0
            )

        # 3. Fast Mel-Spectrogram Direct Decode
        audio_tensor = whisper_mod.pad_or_trim(audio)
        mel = whisper_mod.log_mel_spectrogram(audio_tensor).to(self.whisper_model.device)

        options = whisper_mod.DecodingOptions(
            language=language,
            fp16=False if self.device == "cpu" else True,
            without_timestamps=True,
            prompt=initial_prompt
        )

        decode_res = whisper_mod.decode(self.whisper_model, mel, options)
        clean_text = decode_res.text.strip() if decode_res and decode_res.text else ""

        # 4. Resolve to number (1 to 10) if applicable
        detected_number = resolve_to_number(clean_text)
        canonical_text = NUMBER_NAMES.get(detected_number, clean_text) if detected_number else clean_text

        return {
            "text": canonical_text,
            "raw_text": clean_text,
            "number": detected_number,
            "number_name": NUMBER_NAMES.get(detected_number),
            "language": language,
            "backend": self.backend,
            "sensitivity": sensitivity
        }


# =============================================================================
# 4. LIVE MICROPHONE LISTENER WITH INTERACTIVE VISUAL TIMING
# =============================================================================
def run_live_microphone(recognizer: WhisperVoiceRecognizer, chunk_duration: float = 2.2):
    """
    Listens to default microphone with crystal-clear visual status:
    1. Shows when the mic is actively recording.
    2. Shows when Whisper is calculating on CPU.
    3. Prints result immediately.
    """
    try:
        import sounddevice as sd
    except ImportError:
        print("[-] sounddevice is required for mic listening. Install with: pip install sounddevice")
        return

    sample_rate = 16000
    chunk_samples = int(chunk_duration * sample_rate)

    print("\n" + "=" * 68)
    print(f"🎤 LIVE MICROPHONE LISTENER ({recognizer.model_id.upper()} | Sensitivity: ULTRA-HIGH)")
    print("👉 Watch the status below:")
    print("   🎙️  [RECORDING]  -> Speak or whisper now (e.g. 'one', 'five', 'ten')")
    print("   ⏳ [PROCESSING] -> Whisper is decoding on CPU")
    print("👉 Press Ctrl+C in your terminal to stop.")
    print("=" * 68 + "\n")

    try:
        round_idx = 1
        while True:
            # 1. RECORD PHASE
            sys.stdout.write(f"\r🎙️  [Round #{round_idx}: SPEAK / WHISPER NOW! ({chunk_duration}s)] ")
            sys.stdout.flush()

            audio_chunk = sd.rec(chunk_samples, samplerate=sample_rate, channels=1, dtype='float32')
            sd.wait()

            audio_chunk = audio_chunk.flatten()
            peak = float(np.max(np.abs(audio_chunk)))

            if peak < 0.0015:
                # Dead silence / no mic signal at all
                sys.stdout.write(f"\r⚪ [Round #{round_idx}: No sound detected (Peak: {peak:.4f})]      \n")
                sys.stdout.flush()
                round_idx += 1
                time.sleep(0.3)
                continue

            # 2. PROCESS PHASE
            tag = "🤫 (Whisper)" if peak < 0.045 else "🗣️ "
            sys.stdout.write(f"\r⏳ [Round #{round_idx}: Processing Audio (Peak: {peak:.3f})...]     ")
            sys.stdout.flush()

            t_start = time.time()
            result = recognizer.transcribe(audio_chunk, sensitivity="ultra_high")
            calc_time = time.time() - t_start

            clean_text = result["text"]
            raw_text = result.get("raw_text", clean_text)
            detected_number = result.get("number")

            sys.stdout.write("\r" + " " * 65 + "\r")
            if detected_number:
                if clean_text.lower() != raw_text.lower():
                    print(f"{tag} \033[1;32m[NUMBER {detected_number}] \"{clean_text}\"\033[0m <-- (Whisper heard: '{raw_text}') [{calc_time:.1f}s]")
                else:
                    print(f"{tag} \033[1;32m[NUMBER {detected_number}] \"{clean_text}\"\033[0m [{calc_time:.1f}s]")
            elif clean_text:
                print(f"{tag} Heard: \033[1;36m\"{clean_text}\"\033[0m [{calc_time:.1f}s]")
            else:
                print(f"⚪ [Round #{round_idx}: Unrecognized faint sound] [{calc_time:.1f}s]")

            sys.stdout.flush()
            round_idx += 1
            time.sleep(0.2)

    except KeyboardInterrupt:
        print("\n\n[*] Stopped microphone listener.")


# =============================================================================
# 5. LIGHTWEIGHT HTTP REST API SERVER
# =============================================================================
def run_http_server(recognizer: WhisperVoiceRecognizer, host: str = "0.0.0.0", port: int = 5001):
    """
    Runs an HTTP REST server using standard library http.server.
    """
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class VoiceRequestHandler(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def do_GET(self):
            if self.path == "/health":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                res = json.dumps({
                    "status": "ready",
                    "model": recognizer.model_id,
                    "backend": recognizer.backend,
                    "device": recognizer.device,
                    "sensitivity": "ultra_high"
                })
                self.wfile.write(res.encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()

        def do_POST(self):
            if self.path == "/transcribe":
                content_length = int(self.headers.get("Content-Length", 0))
                if content_length == 0:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"error": "Empty body"}')
                    return

                audio_bytes = self.rfile.read(content_length)

                try:
                    result = recognizer.transcribe(audio_bytes, sensitivity="ultra_high")
                    response_data = {
                        "success": True,
                        "text": result["text"],
                        "raw_text": result.get("raw_text", result["text"]),
                        "number": result.get("number"),
                        "number_name": result.get("number_name"),
                        "language": result["language"],
                        "backend": result["backend"]
                    }
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps(response_data).encode("utf-8"))
                except Exception as e:
                    self.send_response(500)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            else:
                self.send_response(404)
                self.end_headers()

    server_address = (host, port)
    httpd = HTTPServer(server_address, VoiceRequestHandler)
    print(f"\n[+] Whisper Voice Server running at http://{host}:{port}")
    print(f"[+] Health check: GET  http://{host}:{port}/health")
    print(f"[+] Transcribe:   POST http://{host}:{port}/transcribe (Send audio in body)")
    print(f"[+] Press Ctrl+C to terminate server.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Shutting down Whisper server...")
        httpd.server_close()


# =============================================================================
# 6. CLI ENTRYPOINT
# =============================================================================
def main():
    parser = argparse.ArgumentParser(
        description="Whisper Voice Recognizer (Ultra-High Sensitivity)"
    )
    parser.add_argument(
        "--file", "-f",
        type=str,
        help="Path to an audio file (WAV, MP3, M4A, etc.) to transcribe"
    )
    parser.add_argument(
        "--mic", "-m",
        action="store_true",
        help="Listen live to the microphone with automatic gain boost"
    )
    parser.add_argument(
        "--serve", "-s",
        action="store_true",
        help="Run as an HTTP API server on specified port"
    )
    parser.add_argument(
        "--port", "-p",
        type=int,
        default=int(os.environ.get("PORT", 5001)),
        help="Port for the HTTP server (default: 5001 or $PORT env)"
    )
    parser.add_argument(
        "--device", "-d",
        type=str,
        default=None,
        choices=["cuda", "cpu"],
        help="Force execution on 'cuda' (GPU) or 'cpu'"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="small",
        choices=["tiny", "base", "small"],
        help="Model size: 'small' (244M, most accurate), 'base' (74M, 4x faster on CPU), 'tiny' (39M, 8x faster)"
    )
    parser.add_argument(
        "--prompt",
        type=str,
        default="1, 2, 3, 4, 5, 6, 7, 8, 9, 10. Counting numbers: one, two, three, four, five, six, seven, eight, nine, ten.",
        help="Initial context prompt to condition recognition of quiet numbers"
    )

    args = parser.parse_args()

    # Initialize recognizer
    recognizer = WhisperVoiceRecognizer(model_id=args.model, device=args.device)

    if args.serve:
        run_http_server(recognizer, port=args.port)
    elif args.mic:
        run_live_microphone(recognizer)
    elif args.file:
        if not os.path.exists(args.file):
            print(f"[-] File not found: {args.file}")
            sys.exit(1)
        print(f"[*] Transcribing file: {args.file}...")
        res = recognizer.transcribe(args.file, initial_prompt=args.prompt, sensitivity="ultra_high")
        print("\n" + "=" * 50)
        print(f"Transcribed Text: {res['text']}")
        if res.get("number"):
            print(f"Resolved Number:  {res['number']} ({res['number_name']})")
        print(f"Raw Output:       {res.get('raw_text')}")
        print("=" * 50)
    else:
        print("\nNo mode specified. Please choose an option:")
        print("  python whisper_voice_recognizer.py --mic           (Listen to microphone with 'small')")
        print("  python whisper_voice_recognizer.py --mic --model base (Fast CPU mode)")
        print("  python whisper_voice_recognizer.py --file audio.wav (Transcribe file)")
        print("  python whisper_voice_recognizer.py --serve         (Run HTTP server on port 5001)")
        print("  python whisper_voice_recognizer.py --help          (Show full options)\n")


if __name__ == "__main__":
    main()
