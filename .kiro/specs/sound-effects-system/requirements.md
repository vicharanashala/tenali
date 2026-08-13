# Requirements Document

## Introduction

Tenali is an educational quiz platform with 69+ puzzle types spanning arithmetic, algebra, geometry, and vocabulary. Currently, sound effects are implemented inconsistently and only in some components. This spec defines a unified, lightweight, performant audio system that maintains consistency across all quiz types while preventing latency.

### Problem Statement
- Sound effects are called directly from AudioManager in multiple components, causing:
  - Inconsistent triggering patterns (some components have sounds, others don't)
  - All sounds preloaded at app startup (potential performance bottleneck)
  - No centralized control or standardization
  - Difficult to debug or extend sound features
- Optimization needed: audio files need compression to reduce initial load

### Vision
Create a **reusable, performant sound effects infrastructure** that provides consistent audio feedback across all quiz interactions while maintaining performance through lazy loading.

---

## Requirements

### US-1: Quiz Answer Submission Sound
**As a** student taking a quiz  
**I want to** hear a sound when I submit my answer  
**So that** I get immediate auditory feedback that my action was registered

#### Acceptance Criteria
- Sound plays immediately (within 50ms) after clicking submit button
- Sound plays ONLY for answer submission, not for navigation or menu clicks
- Sound is muted when user has disabled sound effects in settings
- Sound file is optimized (compressed, under 50KB)
- No console errors if sound file fails to load

---

### US-2: Correct Answer Sound
**As a** student  
**I want to** hear a celebratory sound when I answer correctly  
**So that** I feel encouraged and motivated to continue

#### Acceptance Criteria
- Celebratory sound plays immediately after server validates correct answer
- Sound file is optimized and loads quickly
- Sound plays at consistent volume across all browsers
- On streaks (3+ correct answers), pitch increases slightly (1.1x to 2.0x speed) to build excitement
- Sound respects mute setting
- Works consistently across all 15+ quiz component types (GKApp, VocabApp, VisualMathLabRedux, etc.)

---

### US-3: Wrong Answer Sound
**As a** student  
**I want to** hear a different sound when I answer incorrectly  
**So that** I know the answer was wrong and can try again

#### Acceptance Criteria
- "Wrong" sound plays immediately after server validates incorrect answer
- Sound is distinctly different from correct sound (different tone, lower pitch preferred)
- Sound file is optimized (under 50KB)
- Streak counter resets when wrong sound plays
- Sound respects mute setting
- Works consistently across all quiz component types

---

### US-4: Button Click Sound (Quiz-Only)
**As a** student  
**I want to** hear a subtle click sound when I interact with quiz elements  
**So that** I get tactile-like feedback for my interactions

#### Acceptance Criteria
- Click sound plays when selecting multiple choice options
- Click sound plays when clicking numpad keys in numeric input quizzes
- Click sound does NOT play for:
  - Navigation buttons (home, back, menu items)
  - Header/UI controls
  - Settings toggles
- Click sound is subtle (not loud, not disruptive)
- File size under 30KB
- Respects mute setting

---

### US-5: Sound Mute Toggle Persistence
**As a** student  
**I want to** toggle sound effects on/off and have it remembered  
**So that** my preference is preserved across sessions

#### Acceptance Criteria
- Mute state persists in localStorage (key: `tenali-sound-effects`)
- Toggling mute immediately affects all sound calls
- Default state: sound ON (false = not muted)
- Works across page reloads and different quiz types

---

### US-6: No Latency from Audio Loading
**As a** platform maintainer  
**I want to** lazy-load sounds by quiz category  
**So that** app startup is fast and users don't experience delays

#### Acceptance Criteria
- Only essential sounds (click, basic correct/wrong) preload at app startup
- Sounds for specific quiz types load only when entering that quiz
- Category preload completes in <500ms
- No perceptible lag when switching between quiz types
- App remains responsive during sound loading
- If sound load fails, quiz still works normally (graceful fallback)

---

### US-7: Consistent Audio System Across All Components
**As a** developer  
**I want to** have a centralized, reusable sound API  
**So that** adding sounds to new quiz components is simple and consistent

#### Acceptance Criteria
- Single React Context provides all sound methods (useQuizSound())
- All existing quiz components use the same Context, not direct AudioManager calls
- Adding sounds to a new component takes <5 minutes and requires <10 lines of code
- Sound methods have consistent names: playCorrect(), playWrong(), playSubmit()
- All components handle audio errors gracefully (no crashes)

---

### US-8: Audio File Optimization
**As a** platform maintainer  
**I want to** minimize audio file sizes  
**So that** downloads are fast and bandwidth usage is minimized

#### Acceptance Criteria
- All audio files compressed to under 50KB (target: 30-50KB per file)
- Compression uses efficient codec (MP3 128kbps or WebM)
- Audio quality remains clear (no distortion, no excessive artifacts)
- Compression saves at least 30% compared to original files
- File format documented with compression settings used

---

### US-9: Milestone/Streak Sounds (Optional)
**As a** student  
**I want to** hear special sounds when I reach milestones (3-in-a-row, 5-in-a-row)  
**So that** major achievements feel more rewarding

#### Acceptance Criteria
- Special sound (or musical flourish) plays at 3-correct streak
- Different special sound plays at 5-correct streak
- Milestone sounds don't interfere with regular correct sounds
- Streak counter displays with milestone sounds (visual + audio)
- Can be toggled on/off separately from general sound effects
- Works across all quiz types that track streaks

---

### US-10: Sound System Error Resilience
**As a** platform maintainer  
**I want to** handle audio failures gracefully  
**So that** missing audio never breaks the quiz experience

#### Acceptance Criteria
- If audio file fails to load, console warns but quiz continues normally
- If Howler.js is unavailable, quiz works without audio (no errors)
- Try-catch blocks around all sound calls
- Sound failures logged to console (for debugging) but not shown to user
- Quiz UX unaffected by audio issues

---

### US-11: Quiz Completion Sound
**As a** student  
**I want to** hear a sound when I complete a quiz session  
**So that** I get auditory feedback that the quiz is done

#### Acceptance Criteria
- Completion sound plays after the final question is answered
- Sound is distinct from correct/wrong sounds (celebratory flourish)
- Sound file (`quiz-complete.mp3`) optimized and under 50KB
- Sound respects mute setting
- No console errors if file fails to load

---

### US-12: Settings UI Mute Toggle
**As a** student  
**I want to** see a visible mute/unmute toggle in the quiz interface  
**So that** I can easily control sound effects without searching through menus

#### Acceptance Criteria
- Mute toggle button visible in quiz header or settings menu
- Toggle shows current state clearly (🔊 on / 🔇 off)
- Clicking toggles immediately mutes/unmutes all quiz sounds
- Toggle syncs with `localStorage` key `tenali-sound-effects`
- Toggle is accessible (keyboard navigable, screen reader friendly)
- Toggle state persists across page reloads

---

### US-13: Legacy Audio System Migration
**As a** developer  
**I want to** migrate all components from the legacy `audioContext.js` (Web Audio API) to `QuizSoundContext`  
**So that** the codebase has a single, consistent sound system

#### Acceptance Criteria
- All components currently importing from `audioContext.js` migrated to `useQuizSound()`
- Components with inline sound functions (e.g., `detective-app.jsx`) migrated
- `audioContext.js` deprecated with a deprecation notice
- No component uses direct `playSound()` from `audioContext.js` after migration
- All migrated components tested for correct/wrong sound playback

---

### Acceptance Criteria Summary

### Functional Requirements
| Requirement | Status | Acceptance Test |
|-------------|--------|-----------------|
| Submit sound plays on answer submission | Required | Click submit → sound within 50ms |
| Correct sound plays on correct answer | Required | Answer correct → celebratory sound plays |
| Wrong sound plays on wrong answer | Required | Answer wrong → discouraging sound plays |
| Click sounds on quiz interactions | Required | Click option → subtle click sound |
| Quiz completion sound | Required | Complete quiz → completion flourish plays |
| Mute toggle persists | Required | Toggle mute → reload page → mute state preserved |
| Mute toggle visible in UI | Required | Toggle button visible in quiz header/settings |
| Lazy-load by category | Required | Enter quiz → category sounds load <500ms |
| Consistent Context API | Required | All components use useQuizSound() |
| Audio file sizes <50KB | Required | Check file sizes in /public/sounds/ |
| Graceful error handling | Required | Disable audio → quiz works fine |
| Legacy audioContext.js migrated | Required | No imports of audioContext.js remain |
| Milestone sounds | Optional | 3+ correct → special sound plays |

### Performance Requirements
| Metric | Target |
|--------|--------|
| Initial sound load | <50ms per sound file |
| Category preload | <500ms |
| Sound play latency | <50ms from button click |
| Audio file size | <50KB per file |
| App startup time impact | No increase (sounds lazy-loaded) |

### Compatibility Requirements
| Aspect | Requirement |
|--------|------------|
| Browsers | Chrome, Firefox, Safari, Edge (all modern versions) |
| Audio formats | MP3 (primary), WebM (fallback) |
| Mobile | Works on iOS and Android |
| Accessibility | Mute toggle in settings; works with screen readers |

---

## Out of Scope

- [ ] Real-time voice synthesis or AI-generated sounds
- [ ] Sound visualization (waveforms, spectrum)
- [ ] Sound effects for every single button (only quiz-related)
- [ ] Custom user sound uploads
- [ ] Multi-language audio localization
- [ ] Spatial/3D audio
- [ ] Sound mixing or EQ adjustments by user

---

## Constraints & Assumptions

### Constraints
- Audio files must be served from /public/sounds/ directory (no CDN in current setup)
- Project already uses Howler.js (v2.2.4) — cannot change audio library
- React context-based (cannot use global state management outside React)
- Must maintain backward compatibility with existing sound calls during transition

### Assumptions
- Users have audio enabled in their browser by default
- Users have speaker/audio output available (fallback for muted is graceful)
- Existing AudioManager.js is functional and can be extended (not replaced entirely)
- Quiz components follow consistent patterns for answer submission and evaluation

---

## Glossary

| Term | Definition |
|------|-----------|
| **SFX** | Sound Effects |
| **Lazy Loading** | Loading resources only when needed, not at app startup |
| **Category** | Grouping of sounds by quiz type (standard, visual-lab, specialized) |
| **Streak** | Consecutive correct answers |
| **Milestone** | Significant achievement (e.g., 5-correct streak) |
| **Preload** | Loading audio into memory before playing |
| **Mute** | Silencing all sound effects (toggle setting) |
| **Howler.js** | JavaScript audio library used by Tenali |
| **Context** | React Context API for sharing state across components |

---

## Success Metrics

- [ ] All 15+ quiz components have consistent sound effects
- [ ] Sound play latency <50ms (measured with performance API)
- [ ] Audio file sizes reduced by ≥30% compared to originals
- [ ] Zero console errors related to audio in any quiz session
- [ ] Lazy-load time <500ms per category
- [ ] Mute state persists correctly (verified across 3 sessions)
- [ ] New developer can add sounds to a quiz component in <5 minutes

---

## Dependencies & Integration Points

### Internal Dependencies
- QuizSoundContext.jsx (centralized sound context — `client/src/context/QuizSoundContext.jsx`)
- audioContext.js (legacy Web Audio API wrapper — **to be deprecated**)
- Howler.js (v2.2.4, already in package.json)
- React Context API (built-in, no new dependencies)

### External Integration
- /public/sounds/ directory (audio file storage, organized by category)
- localStorage (mute state persistence, key: `tenali-sound-effects`)
- Server API (validation of correct/wrong answers determines when sounds play)

### Components Affected

#### Core Quiz Components
- App.jsx (main quiz wrapper — currently uses legacy `playSound` from `audioContext.js`)
- VisualMathLabRedux.jsx (factory-based quizzes — ✅ migrated to `useQuizSound()`)

#### Specialized Lab Components
- PythagLabApp.jsx (Pythagoras lab — ❌ no sound integration)
- ProbLabApp.jsx (Probability lab — ❌ no sound integration)
- BearingsLabApp.jsx (Bearings lab — ❌ no sound integration)
- LcmHcfApp.jsx (LCM/HCF — ❌ no sound integration)
- CoordGeomDiscoveryApp.jsx (Coordinate Geometry — ❌ no sound integration)

#### Other Quiz Components
- BattleApp.jsx (multiplayer battle — ❌ no sound integration)
- GeometryApp.jsx (geometry quizzes — ❌ no sound integration)
- LinearAlgebraApp.jsx (linear algebra — ❌ no sound integration)
- PercentExplanationApp.jsx (percentages — uses legacy `audioContext.js`)
- detective-app.jsx (detective stories — has inline sound functions)
- Curiosity.jsx (curiosity quizzes — ❌ no sound integration)
- ContrastChallengeApp.jsx (contrast challenges — ❌ no sound integration)
- IdliVadaSambharApp.jsx (idli-vada-sambhar puzzle — ❌ no sound integration)
- SudokuApp.jsx (sudoku — ❌ no sound integration)
- PlaygroundApp.jsx (playground — ❌ no sound integration)
- ScribbleGuessApp.jsx (drawing recognition — ❌ no sound integration)
- LocalCompilerApp.jsx (code compiler — ❌ no sound integration)
- CrossSectionApp.jsx (cross sections — ❌ no sound integration)
- NetBuilderApp.jsx (net builder — ❌ no sound integration)
- ShapeSlicer3D.jsx (3D shapes — ❌ no sound integration)
- ShapeTranslatorApp.jsx (shape translation — ❌ no sound integration)
- SpatialReasoningMCQ.jsx (spatial reasoning — ❌ no sound integration)

---

## Non-Functional Requirements

### Security
- Audio files served over HTTPS in production (no unencrypted audio streams)
- No sensitive data embedded in audio

### Usability
- Sound effects enhance (not distract from) quiz experience
- Mute toggle easily accessible in settings
- Sound effects are intuitive (celebratory = correct, discouraging = wrong)

### Maintainability
- Sound system documented clearly
- Easy to add new sounds or change existing ones
- All sound calls centralized in one place (QuizSoundContext)

### Testability
- Each sound category loadable independently
- Sound methods can be mocked for unit testing
- Error cases can be simulated (missing audio file, etc.)

---

## Correctness Properties (Property-Based Testing)

These are formal properties that the sound system must satisfy:

### Property 1: Sound Mute Consistency
**Property**: If mute is enabled, no sound should ever play, regardless of user action
```
Given: Mute toggle is ON (true)
When: User performs any quiz action (submit, correct, wrong)
Then: No audio output occurs
And: localStorage['tenali-sound-effects'] === 'true'
```

### Property 2: Correct/Wrong Sound Exclusivity
**Property**: On any answer evaluation, exactly one of {correct sound, wrong sound, no sound} plays
```
Given: User submits an answer
When: Server validates the answer
Then: 
  - If correct: playCorrect() called (and not playWrong())
  - If wrong: playWrong() called (and not playCorrect())
  - If error: neither called, console warning issued
```

### Property 3: Click Sound Selectivity
**Property**: Click sounds should play only for quiz-related buttons, never for navigation
```
Given: User clicks a button
When: Button is quiz-action (submit, option, numpad)
Then: playClick() is called
When: Button is navigation (home, back, menu)
Then: No sound plays
```

### Property 4: Lazy Load Completeness
**Property**: When entering a quiz category, all required sounds for that category must be loaded before quiz can start
```
Given: User opens a quiz type
When: Category load initiated
Then: All sounds for category loaded within 500ms
And: isLoaded(soundName) returns true for all sounds in category
```

### Property 5: Error Resilience
**Property**: Missing or failed audio should never prevent quiz from functioning
```
Given: Audio file fails to load OR Howler.js unavailable
When: User plays quiz
Then: Quiz loads and functions normally
And: Console has warning about audio issue
And: Mute toggle still works
```

### Property 6: Streak Consistency
**Property**: Streak counter should be in sync with audio playback
```
Given: User answers questions in sequence
When: Answers are all correct
Then: streakCount increments by 1 per correct answer
When: Answer is wrong
Then: streakCount resets to 0
And: playCorrect() rate parameter reflects current streak
```

