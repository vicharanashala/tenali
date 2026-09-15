/**
 * Time Capsule Feature Backend Router
 * Supports MongoDB with seamless in-memory fallback when MongoDB is offline.
 */

const express = require('express');
const mongoose = require('mongoose');
const { requireAuth } = require('./auth');

const router = express.Router();

// ─── MongoDB Schema Definition ───────────────────────────────────────────────

let TimeCapsule;
let ReflectionNote;

try {
  const TimeCapsuleSchema = new mongoose.Schema({
    studentId: { type: String, required: true, index: true }, // username
    title: { type: String, required: true },
    message: { type: String, required: true },
    category: {
      type: String,
      enum: ['Learning Goal', 'Exam Preparation', 'Motivation', 'Reflection', 'Achievement', 'Personal Note'],
      required: true
    },
    tags: [{ type: String }],
    createdDate: { type: Date, default: Date.now },
    rewardPoints: { type: Number, default: 10 },
    rewardHistory: [{
      event: { type: String, enum: ['created', 'opened', 'reflection'], required: true },
      points: { type: Number, required: true },
      label: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }],
    openDate: { type: Date, required: true },
    status: { type: String, enum: ['Locked', 'Opened'], default: 'Locked' },
    openedDate: { type: Date },
    sharedWithTeacher: { type: Boolean, default: false },
    sharedWithParent: { type: Boolean, default: false }
  });

  const ReflectionNoteSchema = new mongoose.Schema({
    capsuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeCapsule', required: true, index: true },
    studentId: { type: String, required: true },
    reflection: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
  });

  TimeCapsule = mongoose.models.TimeCapsule || mongoose.model('TimeCapsule', TimeCapsuleSchema);
  ReflectionNote = mongoose.models.ReflectionNote || mongoose.model('ReflectionNote', ReflectionNoteSchema);
} catch (e) {
  console.error('[timecapsule] Schema compilation failed, using schema-less fallback:', e.message);
}

// ─── In-Memory Fallback Storage ──────────────────────────────────────────────

let inMemoryCapsules = [];
let inMemoryReflections = [];

// Helper functions to abstract DB operations
async function getCapsules(filter = {}) {
  if (mongoose.connection.readyState === 1) {
    return await TimeCapsule.find(filter).sort({ createdDate: -1 });
  } else {
    return inMemoryCapsules.filter(c => {
      for (let k in filter) {
        if (k === 'studentId' && c.studentId !== filter[k]) return false;
        if (k === 'status' && c.status !== filter[k]) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  }
}

async function createCapsule(data) {
  const rewardEvent = {
    event: 'created',
    points: 10,
    label: 'Capsule created',
    date: new Date()
  };

  if (mongoose.connection.readyState === 1) {
    return await TimeCapsule.create({
      ...data,
      rewardPoints: 10,
      rewardHistory: [rewardEvent]
    });
  } else {
    const newItem = {
      _id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      ...data,
      createdDate: new Date(),
      status: 'Locked',
      rewardPoints: 10,
      rewardHistory: [rewardEvent]
    };
    inMemoryCapsules.push(newItem);
    return newItem;
  }
}

async function getCapsuleById(id) {
  if (mongoose.connection.readyState === 1) {
    try {
      return await TimeCapsule.findById(id);
    } catch (_) {
      return null;
    }
  } else {
    return inMemoryCapsules.find(c => c._id.toString() === id.toString()) || null;
  }
}

async function updateCapsule(id, updates) {
  if (mongoose.connection.readyState === 1) {
    return await TimeCapsule.findByIdAndUpdate(id, updates, { new: true });
  } else {
    const idx = inMemoryCapsules.findIndex(c => c._id.toString() === id.toString());
    if (idx === -1) return null;
    inMemoryCapsules[idx] = { ...inMemoryCapsules[idx], ...updates };
    return inMemoryCapsules[idx];
  }
}

async function saveReflection(capsuleId, studentId, reflectionText) {
  if (mongoose.connection.readyState === 1) {
    return await ReflectionNote.create({ capsuleId, studentId, reflection: reflectionText });
  } else {
    const newItem = {
      _id: 'ref-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      capsuleId: capsuleId.toString(),
      studentId,
      reflection: reflectionText,
      createdDate: new Date()
    };
    inMemoryReflections.push(newItem);
    return newItem;
  }
}

async function getReflectionByCapsuleId(capsuleId) {
  if (mongoose.connection.readyState === 1) {
    return await ReflectionNote.findOne({ capsuleId });
  } else {
    return inMemoryReflections.find(r => r.capsuleId.toString() === capsuleId.toString()) || null;
  }
}

// ─── Express Endpoints ───────────────────────────────────────────────────────

// Get all capsules for the current student
router.get('/timecapsules', requireAuth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only student accounts can browse their capsules' });
  }

  try {
    const capsules = await getCapsules({ studentId: req.user.username });
    
    // Apply client-side filter simulation if query params exist
    let filtered = capsules;
    const { title, category, status, tag, year } = req.query;

    if (title) {
      filtered = filtered.filter(c => c.title.toLowerCase().includes(title.toLowerCase()));
    }
    if (category) {
      filtered = filtered.filter(c => c.category === category);
    }
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (tag) {
      filtered = filtered.filter(c => c.tags && c.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    if (year) {
      filtered = filtered.filter(c => new Date(c.createdDate).getFullYear() === parseInt(year, 10));
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new time capsule
router.post('/timecapsules', requireAuth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can create time capsules' });
  }

  const { title, message, category, openDate, tags, sharedWithTeacher, sharedWithParent } = req.body;
  if (!title || !message || !category || !openDate) {
    return res.status(400).json({ error: 'Title, message, category, and openDate are required' });
  }

  const parsedOpenDate = new Date(openDate);
  if (isNaN(parsedOpenDate.getTime())) {
    return res.status(400).json({ error: 'Invalid openDate value' });
  }

  if (parsedOpenDate <= new Date()) {
    return res.status(400).json({ error: 'Open date must be in the future' });
  }

  try {
    const newCap = await createCapsule({
      studentId: req.user.username,
      title,
      message,
      category,
      tags: Array.isArray(tags) ? tags : [],
      openDate: parsedOpenDate,
      sharedWithTeacher: !!sharedWithTeacher,
      sharedWithParent: !!sharedWithParent
    });
    res.status(201).json(newCap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single time capsule (with security policies)
router.get('/timecapsules/:id', requireAuth, async (req, res) => {
  try {
    const capsule = await getCapsuleById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ error: 'Time capsule not found' });
    }

    const isOwner = capsule.studentId.toLowerCase() === req.user.username.toLowerCase();
    const isSharedTeacher = req.user.role === 'teacher' && capsule.sharedWithTeacher;
    const isSharedParent = req.user.role === 'parent' && capsule.sharedWithParent;

    if (!isOwner && !isSharedTeacher && !isSharedParent) {
      return res.status(403).json({ error: 'Access denied to this private time capsule' });
    }

    // Hide message/reflections for non-owners if capsule is locked (even if shared)
    if (!isOwner && capsule.status === 'Locked') {
      return res.json({
        _id: capsule._id,
        studentId: capsule.studentId,
        category: capsule.category,
        createdDate: capsule.createdDate,
        openDate: capsule.openDate,
        status: capsule.status,
        sharedWithTeacher: capsule.sharedWithTeacher,
        sharedWithParent: capsule.sharedWithParent,
        isLocked: true
      });
    }

    // Include reflection if opened
    let reflection = null;
    if (capsule.status === 'Opened') {
      reflection = await getReflectionByCapsuleId(capsule._id);
    }

    res.json({
      ...capsule.toObject ? capsule.toObject() : capsule,
      reflection: reflection ? (reflection.toObject ? reflection.toObject() : reflection) : null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a time capsule (only editable before scheduled open date)
router.put('/timecapsules/:id', requireAuth, async (req, res) => {
  try {
    const capsule = await getCapsuleById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ error: 'Time capsule not found' });
    }

    if (capsule.studentId.toLowerCase() !== req.user.username.toLowerCase()) {
      return res.status(403).json({ error: 'Only the capsule owner can edit it' });
    }

    if (capsule.status === 'Opened') {
      return res.status(400).json({ error: 'Opened capsules are read-only to preserve the past' });
    }

    if (new Date(capsule.openDate) <= new Date()) {
      return res.status(400).json({ error: 'Capsules cannot be edited after their open date' });
    }

    const { title, message, category, openDate, tags, sharedWithTeacher, sharedWithParent } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (message) updates.message = message;
    if (category) updates.category = category;
    if (tags) updates.tags = Array.isArray(tags) ? tags : [];
    if (sharedWithTeacher !== undefined) updates.sharedWithTeacher = !!sharedWithTeacher;
    if (sharedWithParent !== undefined) updates.sharedWithParent = !!sharedWithParent;

    if (openDate) {
      const parsedOpenDate = new Date(openDate);
      if (isNaN(parsedOpenDate.getTime())) {
        return res.status(400).json({ error: 'Invalid openDate value' });
      }
      if (parsedOpenDate <= new Date()) {
        return res.status(400).json({ error: 'Updated open date must be in the future' });
      }
      updates.openDate = parsedOpenDate;
    }

    const updated = await updateCapsule(req.params.id, updates);
    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlock/Open a time capsule
router.post('/timecapsules/:id/open', requireAuth, async (req, res) => {
  try {
    const capsule = await getCapsuleById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ error: 'Time capsule not found' });
    }

    if (capsule.studentId.toLowerCase() !== req.user.username.toLowerCase()) {
      return res.status(403).json({ error: 'Only the owner can open this capsule' });
    }

    if (capsule.status === 'Opened') {
      return res.json(capsule); // Already opened
    }

    const now = new Date();
    if (new Date(capsule.openDate) > now) {
      return res.status(400).json({ error: `This capsule is locked until ${new Date(capsule.openDate).toLocaleDateString()}` });
    }

    const existingHistory = Array.isArray(capsule.rewardHistory) ? capsule.rewardHistory : [];
    const rewardIncrement = 20;
    const updated = await updateCapsule(req.params.id, {
      status: 'Opened',
      openedDate: now,
      rewardPoints: (capsule.rewardPoints || 0) + rewardIncrement,
      rewardHistory: [...existingHistory, {
        event: 'opened',
        points: rewardIncrement,
        label: 'Opened capsule',
        date: now
      }]
    });

    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record a reflection note
router.post('/timecapsules/:id/reflection', requireAuth, async (req, res) => {
  try {
    const capsule = await getCapsuleById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ error: 'Time capsule not found' });
    }

    if (capsule.studentId.toLowerCase() !== req.user.username.toLowerCase()) {
      return res.status(403).json({ error: 'Only the owner can write a reflection' });
    }

    if (capsule.status !== 'Opened') {
      return res.status(400).json({ error: 'Reflections can only be written after opening the capsule' });
    }

    const { reflection } = req.body;
    if (!reflection || !reflection.trim()) {
      return res.status(400).json({ error: 'Reflection text is required' });
    }

    // Check if reflection already exists
    const existing = await getReflectionByCapsuleId(capsule._id);
    if (existing) {
      return res.status(400).json({ error: 'Reflection note has already been recorded' });
    }

    const note = await saveReflection(capsule._id, req.user.username, reflection.trim());
    const existingHistory = Array.isArray(capsule.rewardHistory) ? capsule.rewardHistory : [];
    const rewardIncrement = 15;
    await updateCapsule(req.params.id, {
      rewardPoints: (capsule.rewardPoints || 0) + rewardIncrement,
      rewardHistory: [...existingHistory, {
        event: 'reflection',
        points: rewardIncrement,
        label: 'Saved reflection',
        date: new Date()
      }]
    });

    res.status(201).json(note);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic Notifications Checker for current student
router.get('/timecapsules-notifications', requireAuth, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students receive time capsule notifications' });
  }

  try {
    const capsules = await getCapsules({ studentId: req.user.username });
    const notifications = [];
    const now = new Date();

    for (const cap of capsules) {
      if (cap.status === 'Locked') {
        const openDate = new Date(cap.openDate);
        const diffMs = now - openDate;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays >= 0) {
          if (diffDays >= 3) {
            notifications.push({
              id: `unopened-${cap._id}`,
              capsuleId: cap._id,
              title: `Unopened Capsule Reminder`,
              message: `Your time capsule "${cap.title}" has been ready to open for ${Math.floor(diffDays)} days.`,
              type: 'unopened',
              date: openDate
            });
          } else {
            notifications.push({
              id: `ready-${cap._id}`,
              capsuleId: cap._id,
              title: `Your Time Capsule is Ready!`,
              message: `🎉 Your time capsule "${cap.title}" is ready to open.`,
              type: 'ready',
              date: openDate
            });
          }
        } else {
          // reminder: 2 days or less
          const daysToOpen = -diffDays;
          if (daysToOpen <= 2) {
            notifications.push({
              id: `reminder-${cap._id}`,
              capsuleId: cap._id,
              title: `Capsule Opening Soon!`,
              message: `Your time capsule "${cap.title}" will open in ${daysToOpen < 1 ? 'less than a day' : Math.ceil(daysToOpen) + ' days'}.`,
              type: 'reminder',
              date: openDate
            });
          }
        }
      }
    }

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher Dashboard summary statistics
router.get('/teacher/dashboard', requireAuth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied: teachers only' });
  }

  try {
    let capsules = [];
    let totalStudentsCount = 0;
    let allUsernames = [];

    if (mongoose.connection.readyState === 1) {
      capsules = await TimeCapsule.find({});
      const User = mongoose.model('User');
      const students = await User.find({ role: 'student' });
      allUsernames = students.map(s => s.username);
      totalStudentsCount = students.length;
    } else {
      capsules = inMemoryCapsules;
      allUsernames = ['sudarshan', 'tatsavit'];
      totalStudentsCount = allUsernames.length;
    }

    const totalCapsules = capsules.length;

    // Participation rate Calculation
    const uniqueStudentsWithCapsules = new Set(capsules.map(c => c.studentId.toLowerCase()));
    const validStudentsWithCapsules = Array.from(uniqueStudentsWithCapsules).filter(uname => allUsernames.includes(uname));
    const participationRate = totalStudentsCount > 0 ? (validStudentsWithCapsules.length / totalStudentsCount) * 100 : 0;

    // Category distribution counts
    const categoriesUsed = {
      'Learning Goal': 0,
      'Exam Preparation': 0,
      'Motivation': 0,
      'Reflection': 0,
      'Achievement': 0,
      'Personal Note': 0
    };
    capsules.forEach(c => {
      if (categoriesUsed[c.category] !== undefined) {
        categoriesUsed[c.category]++;
      }
    });

    // Monthly Trends
    const monthlyTrends = {};
    capsules.forEach(c => {
      const date = new Date(c.createdDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      monthlyTrends[key] = (monthlyTrends[key] || 0) + 1;
    });

    // Student summary card list
    const studentSummaries = allUsernames.map(username => {
      const studentCapsules = capsules.filter(c => c.studentId.toLowerCase() === username.toLowerCase());
      const capsuleCount = studentCapsules.length;
      let lastCreated = null;
      if (capsuleCount > 0) {
        const sorted = studentCapsules.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        lastCreated = sorted[0].createdDate;
      }
      return {
        username,
        capsuleCount,
        lastCreated
      };
    });

    res.json({
      totalCapsules,
      participationRate,
      categoriesUsed,
      monthlyTrends,
      studentSummaries
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parent view of child progress
router.get('/parent/dashboard', requireAuth, async (req, res) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ error: 'Access denied: parents only' });
  }

  const studentUsername = String(req.query.student || '').trim().toLowerCase();
  if (!studentUsername) {
    return res.status(400).json({ error: 'Student username query parameter is required' });
  }

  try {
    let capsules = [];
    let reflections = [];

    if (mongoose.connection.readyState === 1) {
      capsules = await TimeCapsule.find({ studentId: studentUsername }).sort({ createdDate: -1 });
      const capIds = capsules.map(c => c._id);
      reflections = await ReflectionNote.find({ capsuleId: { $in: capIds } }).sort({ createdDate: -1 });
    } else {
      capsules = inMemoryCapsules.filter(c => c.studentId.toLowerCase() === studentUsername).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
      const capIds = capsules.map(c => c._id.toString());
      reflections = inMemoryReflections.filter(r => capIds.includes(r.capsuleId.toString())).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }

    const capsuleCount = capsules.length;

    // Filter goals for parent: hide message unless shared
    const formattedCapsules = capsules.map(c => {
      const isShared = c.sharedWithParent === true;
      return {
        _id: c._id,
        category: c.category,
        status: c.status,
        openDate: c.openDate,
        createdDate: c.createdDate,
        sharedWithParent: c.sharedWithParent,
        title: isShared ? c.title : 'Private Goals Capsule',
        message: isShared ? c.message : 'Private contents (hidden unless shared)'
      };
    });

    // Format reflections for parent: hide unless shared
    const formattedReflections = reflections.map(r => {
      const cap = capsules.find(c => c._id.toString() === r.capsuleId.toString());
      const isShared = cap && cap.sharedWithParent === true;
      return {
        _id: r._id,
        capsuleId: r.capsuleId,
        createdDate: r.createdDate,
        reflection: isShared ? r.reflection : 'Private reflection (hidden unless shared)',
        capsuleTitle: cap ? (isShared ? cap.title : 'Private Goal') : 'Unknown Goal'
      };
    });

    res.json({
      student: studentUsername,
      capsuleCount,
      capsules: formattedCapsules,
      reflections: formattedReflections
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher view of a specific student's shared capsules
router.get('/teacher/student', requireAuth, async (req, res) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied: teachers only' });
  }

  const studentUsername = String(req.query.student || '').trim().toLowerCase();
  if (!studentUsername) {
    return res.status(400).json({ error: 'Student username query parameter is required' });
  }

  try {
    let capsules = [];

    if (mongoose.connection.readyState === 1) {
      capsules = await TimeCapsule.find({ studentId: studentUsername, sharedWithTeacher: true }).sort({ createdDate: -1 });
    } else {
      capsules = inMemoryCapsules.filter(c => c.studentId.toLowerCase() === studentUsername && c.sharedWithTeacher === true).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }

    const formattedCapsules = capsules.map(c => ({
      _id: c._id,
      title: c.title,
      message: c.message,
      category: c.category,
      status: c.status,
      openDate: c.openDate,
      createdDate: c.createdDate,
      sharedWithTeacher: c.sharedWithTeacher
    }));

    res.json({ student: studentUsername, capsules: formattedCapsules });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router };

