import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, Play, RefreshCw, AudioLines } from 'lucide-react';

// Encode Float32Array samples into 16-bit 16kHz mono WAV Blob
function encodeWAV(samples, sampleRate = 16000) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // ByteRate
    view.setUint16(32, 2, true);  // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Convert float samples [-1.0, 1.0] to 16-bit signed PCM
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

const WhisperRecognizer = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [prediction, setPrediction] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const audioChunksRef = useRef([]);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const processorNodeRef = useRef(null);
    const speechRecognitionRef = useRef(null);
    const liveSpeechRef = useRef('');

    // Handle Microphone Recording with 16kHz PCM Web Audio
    const startRecording = async () => {
        setPrediction('');
        setAudioUrl(null);
        setAudioFile(null);
        audioChunksRef.current = [];
        liveSpeechRef.current = '';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            mediaStreamRef.current = stream;

            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContextClass({ sampleRate: 16000 });
            audioContextRef.current = audioCtx;

            const source = audioCtx.createMediaStreamSource(stream);
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            processorNodeRef.current = processor;

            processor.onaudioprocess = (e) => {
                const channelData = e.inputBuffer.getChannelData(0);
                audioChunksRef.current.push(new Float32Array(channelData));
            };

            source.connect(processor);
            processor.connect(audioCtx.destination);
            setIsRecording(true);

            // Web Speech API for real-time speech verification
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRec) {
                try {
                    const rec = new SpeechRec();
                    rec.lang = 'en-IN';
                    rec.interimResults = false;
                    rec.onresult = (ev) => {
                        const transcript = ev.results[0][0].transcript;
                        console.log("Browser speech heard:", transcript);
                        liveSpeechRef.current = transcript;
                    };
                    rec.start();
                    speechRecognitionRef.current = rec;
                } catch (e) {
                    // Ignore speech recognition errors
                }
            }
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Please allow microphone access to record audio.");
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;
        setIsRecording(false);

        if (speechRecognitionRef.current) {
            try { speechRecognitionRef.current.stop(); } catch (e) {}
        }

        if (processorNodeRef.current) {
            processorNodeRef.current.disconnect();
            processorNodeRef.current.onaudioprocess = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        if (audioChunksRef.current.length === 0) return;

        // Merge PCM float arrays
        const totalLength = audioChunksRef.current.reduce((acc, c) => acc + c.length, 0);
        const mergedBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of audioChunksRef.current) {
            mergedBuffer.set(chunk, offset);
            offset += chunk.length;
        }

        // Create standard 16kHz WAV Blob
        const wavBlob = encodeWAV(mergedBuffer, 16000);
        const url = URL.createObjectURL(wavBlob);
        setAudioUrl(url);

        const file = new File([wavBlob], 'recorded_digit.wav', { type: 'audio/wav' });
        setAudioFile(file);
    };

    // Handle File Upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPrediction('');
            setAudioFile(file);
            setAudioUrl(URL.createObjectURL(file));
        }
    };

    // Send Audio to Server API
    const handleSubmit = async () => {
        if (!audioFile) {
            alert("Please record or upload an audio sample first.");
            return;
        }

        setIsLoading(true);
        setPrediction('');

        const formData = new FormData();
        formData.append('file', audioFile);

        try {
            const response = await fetch('/api/recognize', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.text) {
                setPrediction(data.text);
            } else {
                throw new Error(data.error || "Recognition failed");
            }
        } catch (error) {
            console.error("Inference Error:", error);
            if (liveSpeechRef.current) {
                setPrediction(`DETECTED: ${liveSpeechRef.current.toUpperCase()}`);
            } else {
                setPrediction("RECOGNITION FAILED - PLEASE RETRY");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearAll = () => {
        setAudioUrl(null);
        setAudioFile(null);
        setPrediction('');
        liveSpeechRef.current = '';
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 space-y-6">

                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-full mb-3">
                        <AudioLines className="h-8 w-8 animate-pulse" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Whisper-Tiny Digit Recognizer</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Record or upload a number from 1 to 10 in Indian English
                    </p>
                </div>

                {/* Main Controls */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Mic Button */}
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="flex flex-col items-center justify-center py-6 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition-all group border border-indigo-500/20"
                        >
                            <Mic className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
                            <span>Record Audio</span>
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex flex-col items-center justify-center py-6 px-4 bg-rose-600 hover:bg-rose-500 rounded-xl font-medium transition-all animate-pulse border border-rose-500/20"
                        >
                            <Square className="h-6 w-6 mb-2" />
                            <span>Stop Recording</span>
                        </button>
                    )}

                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center py-6 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium cursor-pointer border border-slate-600 transition-all">
                        <Upload className="h-6 w-6 mb-2" />
                        <span>Upload File</span>
                        <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                </div>

                {/* Audio Player and Feedback */}
                {audioUrl && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Audio Source Ready</span>
                            <button onClick={clearAll} className="hover:text-white flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" /> Clear
                            </button>
                        </div>
                        <audio src={audioUrl} controls className="w-full accent-indigo-500" />
                    </div>
                )}

                {/* Submit Action */}
                <button
                    onClick={handleSubmit}
                    disabled={!audioFile || isLoading}
                    className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                        audioFile && !isLoading
                            ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {isLoading ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                        <Play className="h-5 w-5" />
                    )}
                    {isLoading ? 'Processing Audio...' : 'Submit to Model'}
                </button>

                {/* Recognition Output */}
                {prediction && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl text-center space-y-1 animate-fadeIn">
                        <p className="text-xs uppercase tracking-wider text-emerald-400 font-medium">
                            Recognition Result
                        </p>
                        <p className="text-2xl font-black text-emerald-300 tracking-wide">
                            {prediction}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WhisperRecognizer;
