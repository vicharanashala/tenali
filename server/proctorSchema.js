/**
 * Proctor Schemas — Mongoose models for quiz proctoring and emotion tracking.
 *
 * Provides:
 *   - ProctorSession: tracks a proctored quiz session (start/end, anomalies)
 *   - ProctorEvent:   individual anomaly events within a session
 *   - Emotion:        student self-reported emotions per quiz item
 */

const mongoose = require('mongoose');

// ─── Proctor Session ─────────────────────────────────────────────────────────

const ProctorSessionSchema = new mongoose.Schema({
  userId:     { type: String, required: true, index: true },
  username:   { type: String, required: true },
  quizType:   { type: String, required: true },
  startedAt:  { type: Date, default: Date.now },
  endedAt:    { type: Date },
  status:     { type: String, enum: ['active', 'completed', 'ejected'], default: 'active' },
  totalPenalty: { type: Number, default: 0 },
  consentGiven: { type: Boolean, default: false },
  settings: {
    webcam:           { type: Boolean, default: false },
    faceDetection:    { type: Boolean, default: false },
    blurDetection:    { type: Boolean, default: true },
    voiceDetection:   { type: Boolean, default: false },
    tabSwitch:        { type: Boolean, default: true },
    antiCheat:        { type: Boolean, default: true },
    virtualCamera:    { type: Boolean, default: false },
    securityChallenge:{ type: Boolean, default: false },
  },
}, { timestamps: true });

const ProctorSession = mongoose.model('ProctorSession', ProctorSessionSchema);

// ─── Proctor Event ───────────────────────────────────────────────────────────

const ProctorEventSchema = new mongoose.Schema({
  sessionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'ProctorSession', required: true, index: true },
  userId:     { type: String, required: true, index: true },
  type:       {
    type: String,
    required: true,
    enum: [
      'tab_switch', 'tab_blur', 'no_face', 'multiple_faces',
      'face_mismatch', 'blur_detected', 'voice_detected',
      'virtual_camera', 'security_challenge_failed',
      'right_click', 'copy_paste', 'devtools', 'ejected',
      'idle', 'motion_detected', 'camera_covered', 'camera_overexposed',
    ],
  },
  severity:   { type: Number, default: 1 }, // penalty points
  evidence:   { type: String }, // base64 screenshot or audio clip
  metadata:   { type: mongoose.Schema.Types.Mixed }, // extra context
  transcript: { type: String }, // speech-to-text transcript for voice events
  timestamp:  { type: Date, default: Date.now },
}, { timestamps: true });

const ProctorEvent = mongoose.model('ProctorEvent', ProctorEventSchema);

// ─── Emotion ─────────────────────────────────────────────────────────────────

const EmotionSchema = new mongoose.Schema({
  userId:     { type: String, required: true, index: true },
  username:   { type: String, required: true },
  quizType:   { type: String, required: true },
  emotion:    { type: String, required: true, enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'] },
  feedback:   { type: String, maxlength: 300 },
  timestamp:  { type: Date, default: Date.now },
}, { timestamps: true });

EmotionSchema.index({ quizType: 1, timestamp: -1 });

const Emotion = mongoose.model('Emotion', EmotionSchema);

module.exports = { ProctorSession, ProctorEvent, Emotion };
