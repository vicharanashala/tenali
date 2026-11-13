# RFC: Production Voice Recognition for Numbers 1–10 via Fine-Tuned Whisper-Tiny

**Author**: Vedhiga V.B  
**Target Modules**: `NumberTracingApp` & `SpaceMazeAdventure`  
**Model Checkpoint**: [gradient-queen/whisper-tiny-indian-digits-final](https://huggingface.co/gradient-queen/whisper-tiny-indian-digits-final)  
**Interactive Test Space**: [gradient-queen/whisper-indian-digits](https://huggingface.co/spaces/gradient-queen/whisper-indian-digits)  

---

## 1. Motivation: Why Not Native Web Speech (`webkitSpeechRecognition`)?

In the Tenali early-childhood mathematics curriculum (tracing, counting, and space navigation), spoken interaction reinforces phonetic and number association. 

During initial user testing with young children, the native browser Web Speech API (`webkitSpeechRecognition`) proved unreliable for our core demographic:
1. **Child Acoustic Profile**: Children have higher fundamental vocal frequencies ($F_0$), varied breath pacing, and irregular phoneme elongation that generic adult-trained speech recognizers frequently drop or misinterpret.
2. **Indian Accents & Regional Homophones**: Children learning English in India often pronounce numbers with distinct phonetic characteristics (e.g., *"tree"* or *"free"* for 3, *"won"* or *"van"* for 1, *"ait"* for 8). Many also count using bilingual/mother-tongue number terms (*ek, do, teen* / *ondru, rendu, moonu* / *okati, rendu, moodu*).
3. **Inconsistent Browser Availability**: `webkitSpeechRecognition` is proprietary to Google servers, unavailable in Firefox, and frequently blocked in embedded school/tablet webviews.

To solve this, I fine-tuned OpenAI's lightweight **Whisper-Tiny** architecture specifically on spoken Indian digits (1 to 10):
* **Model**: [`gradient-queen/whisper-tiny-indian-digits-final`](https://huggingface.co/gradient-queen/whisper-tiny-indian-digits-final)
* **Live Hugging Face Space**: [`gradient-queen/whisper-indian-digits`](https://huggingface.co/spaces/gradient-queen/whisper-indian-digits)

The team can test audio inputs and microphone capture on the live Hugging Face Space link above.

---

## 2. Technical Challenges: Server Constraints & Client-Side ONNX Latency

While the fine-tuned model delivers high digit recognition accuracy, deploying it to production introduces two distinct architectural challenges:

### A. The Backend Server Challenge (Vercel & Free Cloud Hosts)
* **Vercel Serverless Limits**: Tenali’s frontend is hosted on Vercel. Vercel functions are ephemeral serverless lambdas with a strict 250MB uncompressed bundle limit and 10–15s execution timeouts. Full PyTorch + TorchAudio + model weights require **~1.2 GB**, making it impossible to host `server.py` directly inside Vercel serverless.
* **Free Hugging Face Space Limits**:
  * Free Spaces sleep after 48 hours of inactivity, causing an unacceptable **25–40 second cold-start delay** when a child first taps the microphone.
  * Cross-origin POST form submissions from external frontends to Hugging Face Spaces are blocked by SvelteKit's CSRF protection (`403 Cross-site POST form submissions are forbidden`), requiring reverse-proxy infrastructure.

### B. The Client-Side ONNX / Transformers.js Latency Challenge
Running the neural model directly in the browser via **Transformers.js** (ONNX Runtime Web / WebAssembly) was considered to make the app 100% serverless on Vercel. However:
* **Initial Asset Overhead**: Even an INT8 quantized Whisper-tiny ONNX model is **~39 MB**. On 3G or constrained classroom networks, this creates significant initial load latency.
* **CPU Inference Latency on Mobile**: On entry-level Android devices and budget tablets (frequently used by children), CPU-bound WebAssembly execution takes **1.5s to 3.5s per utterance**. For a fast-paced counting game (1, 2, 3...), a multi-second delay between speaking and rocket propulsion disrupts the game loop and frustrates learners.

---

## 3. Alternative Solutions to Run the Model on `tenali.fun`

Since `tenali.fun` is hosted on a dedicated Linux VPS managed by **Nginx** and **systemd** (running Node.js on port 4000), we have several options to run our custom model with low latency:

### Option 1 (Recommended): Colocate `faster-whisper` via systemd on `tenali.fun`
Instead of heavy PyTorch, we can deploy a lightweight Python daemon using **`faster-whisper`** (CTranslate2) or ONNX Runtime CPU directly on the `tenali.fun` server:
* **Memory Footprint**: `faster-whisper` requires only **~150MB of RAM** (compared to >1GB for standard PyTorch).
* **Speed**: Inferences run in **under 120 ms** on standard CPU.
* **Architecture**:
  * Run as a background service: `systemd` daemon (`tenali-whisper.service`) on `127.0.0.1:8000`.
  * Nginx reverse proxy configuration:
    ```nginx
    location /api/recognize {
        proxy_pass http://127.0.0.1:8000/api/recognize;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    ```
* **Pros**: Zero additional cloud hosting fees, zero CORS/CSRF issues (same-origin `https://tenali.fun/api/recognize`), persistent warm memory (zero cold start), and sub-150ms response times.

---

### Option 2: Pre-Warmed Container on Render / Railway
If we prefer keeping AI computation isolated from the main `tenali.fun` web and database process:
* Deploy `server.py` in a lightweight Docker container on **Render** or **Railway** ($5–$7/month basic tier).
* Proxy requests via Vercel rewrites:
  ```json
  {
    "source": "/whisper-service/:match*",
    "destination": "https://tenali-whisper.onrender.com/:match*"
  }
  ```
* **Pros**: Isolated compute resources; no load on the main `tenali.fun` VM.
* **Cons**: Incurs monthly cloud infrastructure costs.

---

### Option 3: Progressive Client-Side ONNX with Background Caching (Zero-Backend)
If the project mandates zero backend AI servers:
* Convert `whisper-tiny-indian-digits-final` to an INT8 ONNX web bundle (~39 MB).
* Silently fetch and cache the model in `CacheStorage` during earlier non-voice exercises (e.g. while the child is drawing number strokes).
* Execute speech inference inside a dedicated **Web Worker** using WebGPU when available on modern hardware, falling back to WebAssembly.
* **Pros**: 100% serverless, zero server maintenance costs, works completely offline once cached.
* **Cons**: Higher battery consumption on mobile and variable inference latency depending on device hardware.

---

## 4. Discussion & Feedback Requested

1. **Host Capacity**: Does the production `tenali.fun` VM have ~200MB of available RAM and spare CPU headroom to run a `faster-whisper` daemon (Option 1)?
2. **User Experience Priority**: Should we prioritize **sub-150ms speed** (Option 1 backend) or **offline portability** (Option 3 client-side ONNX)?
3. **Phased Approach**: Would the team support deploying Option 1 for immediate production while exploring Option 3 as an offline fallback?

---
*Please share your thoughts, architectural feedback, and deployment preferences below.*

