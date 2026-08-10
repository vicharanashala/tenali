# Implementation Plan: Sound Effects System

## Overview

This plan implements a complete sound effects system for Tenali's quiz platform with lazy loading, centralized state management via React Context, and selective sound triggers. The system optimizes audio files, organizes them by category, and refactors all quiz components to use a consistent sound API. Testing and documentation ensure developers can easily integrate sounds into new components.

> **Audit Note (Aug 2026):** Tasks have been reviewed against the actual codebase. Several tasks previously marked `[x]` (complete) have been reverted based on missing code/files. New tasks (16–20) have been added to cover gaps discovered during audit.

## Tasks

- [x] 1. Audit Existing Audio Implementation
  - Understand current audio setup, file sizes, and identify all sound trigger points
  - **Acceptance Criteria:**
    - All audio files in /public/sounds/ identified and sizes documented
    - All quiz components using sounds catalogued
    - All playQuizSound() and AudioManager calls mapped
    - Current audio preload behavior documented
    - Audit report created with recommendations
  - **Implementation Steps:**
    1. List all files in /public/sounds/ and record current sizes (use `ls -lh`)
    2. Grep for all AudioManager imports and sound calls across /client/src/**/*.jsx
    3. Map each component → sounds used → trigger points
    4. Document in CSV/table format: Component | Sounds | Trigger | Current Status
    5. Identify components missing sound effects
    6. Create optimization targets (compression goals per file)
    7. Document current mute state handling
  - **Testing:**
    - Run `npm ls howler` to verify Howler.js version
    - Verify all current sounds play without errors
    - Check mute toggle works in current App.jsx
  - **Output Artifacts:**
    - /docs/audio-audit.md (or inline in tasks)
    - CSV: components-sound-mapping.csv
    - File size baseline document
  - _Requirements: US-7, US-8_

- [x] 2. Optimize & Compress Audio Files
  - Reduce audio file sizes to <50KB each while maintaining quality
  - **Acceptance Criteria:**
    - All audio files compressed to <50KB
    - Compression achieves ≥30% size reduction
    - Audio quality acceptable (no distortion, clear playback)
    - Compression method documented (codec, bitrate, settings)
    - Before/after file sizes recorded
  - **Implementation Steps:**
    1. Choose compression tool (FFmpeg, Audacity, or online converter)
    2. For each audio file:
       - Short effects (click.mp3): target 96kbps, <30KB
       - Celebration sounds (correct.mp3, wrong.mp3): target 128kbps, <40KB
       - Special sounds (levelup, streak): target 128-192kbps, <50KB
    3. Convert: `ffmpeg -i input.mp3 -b:a 128k -ac 1 output.mp3`
    4. Verify output plays correctly in browser
    5. Replace originals in /public/sounds/
    6. Measure and document size savings
  - **Testing:**
    - Play each compressed sound in browser (check clarity, no artifacts)
    - Measure file sizes: `stat /public/sounds/*.mp3`
    - Compare before/after sizes and calculate savings %
  - **Output Artifacts:**
    - Compressed audio files in /public/sounds/
    - Compression-report.md (settings, bitrates, before/after sizes)
  - **Actual Status:** Complete — all files well under 50KB (click: 879B, correct: 6.6KB, wrong: 8KB)
  - _Requirements: US-8_

- [x] 3. Organize Audio Files by Category
  - Reorganize audio files into category subdirectories for lazy loading
  - **Acceptance Criteria:**
    - Directory structure created: /public/sounds/{category}/
    - All audio files moved to appropriate categories
    - Category definitions align with quiz types
    - No broken references in QuizSoundContext
  - **Implementation Steps:**
    1. Create directory structure:
       ```
       /public/sounds/
       +-- essential/     (preload at startup)
       |   +-- click.mp3
       |   +-- correct.mp3
       |   +-- wrong.mp3
       +-- standard/      (standard quizzes: GK, Vocab, Addition, etc.)
       |   +-- coin.mp3
       |   +-- levelup.mp3
       |   +-- streak.mp3
       +-- visual-lab/    (PythagLabApp, ProbLabApp, BearingsLabApp, etc.)
       |   +-- [empty — needs sounds or can share essential]
       +-- specialized/   (LcmHcfApp, CoordGeomDiscoveryApp, etc.)
           +-- [empty — needs sounds or can share essential]
       ```
    2. Move files to respective directories
    3. Update paths in Howl initialization
  - **Testing:**
    - Verify directory structure exists
    - Check that no sound file references are broken
  - **Output Artifacts:**
    - New directory structure /public/sounds/{category}/
  - **Actual Status:** Complete — directories created, files organized. Note: `visual-lab/` and `specialized/` are empty.
  - _Requirements: US-6_

- [x] 4. Enhance AudioManager with Lazy Loading Methods
  - Add lazy loading capabilities to AudioManager without breaking existing functionality
  - **Acceptance Criteria:**
    - loadCategory(categoryName) async method implemented
    - isLoaded(soundName) method implemented
    - SafeMode for error resilience implemented
    - getMetrics() method for performance tracking added
    - Existing methods still work (backward compatible)
    - No console errors from AudioManager
  - **Implementation Steps:**
    1. Create AudioManager.js
       - Location: `/client/src/audio/AudioManager.js`
       - Add SOUND_CATEGORIES object
       - Constructor loads only 'essential' sounds at startup
       - Add loadCategory(categoryName) async method
       - Add isLoaded(soundName) check
       - Add setSafeMode(enabled) for fallback
       - Add getMetrics() for debugging
    2. Keep methods consistent with QuizSoundContext
    3. Wrap all playSound() calls in try-catch
  - **Testing:**
    - Test loadCategory('standard') loads only standard sounds
    - Test isLoaded() returns false before load, true after
    - Test playSound() still works
  - **Output Artifacts:**
    - New /client/src/audio/AudioManager.js
  - _Requirements: US-6, US-10_

- [x] 5. Create QuizSoundContext (React Context)
  - Build centralized sound state and API via React Context
  - **Acceptance Criteria:**
    - QuizSoundContext created with full interface
    - QuizSoundProvider component wraps app
    - useQuizSound() hook exported and usable
    - Mute state persists via context
    - All methods work without errors
  - **Implementation Steps:**
    1. Create new file: /client/src/context/QuizSoundContext.jsx
    2. Define context with methods:
       - playCorrect(streak), playWrong(), playSubmit(), playQuizComplete()
       - toggleMute(), isMuted
    3. Create QuizSoundProvider component
    4. Create useQuizSound() hook for consuming components
    5. Wrap provider around app in main.jsx
  - **Testing:**
    - useQuizSound() works in a test component
    - playCorrect() calls Howler.js correctly
    - Mute toggle persists across page reload
  - **Output Artifacts:**
    - /client/src/context/QuizSoundContext.jsx
    - Updated /client/src/main.jsx (provider wrapper)
  - **Actual Status:** Complete — Context created with `playCorrect`, `playWrong`, `playSubmit`, `playQuizComplete`, `toggleMute`, `isMuted`. Provider wraps entire app in `main.jsx`. Note: `playClick`, `playMilestone`, `loadCategory` are NOT yet implemented.
  - _Requirements: US-1, US-2, US-3, US-5, US-7, US-10, US-11_

- [x] 6. Create Sound Integration Guide
  - Document how to integrate sounds into a quiz component (for developers)
  - **Acceptance Criteria:**
    - Guide covers: how to import, when to call, error handling
    - Before/after code examples provided
    - Timeline of when sounds should play (relative to state changes)
    - Troubleshooting section included
  - **Implementation Steps:**
    1. Create /client/src/audio/SOUND_INTEGRATION_GUIDE.md
    2. Document:
       - Import pattern: `const { playCorrect, playWrong, playSubmit } = useQuizSound();`
       - Import from: `'./context/QuizSoundContext.jsx'`
       - When to call: immediately after answer validation
       - Error handling: sounds fail gracefully, always wrap in try-catch
    3. Provide code templates
    4. Include troubleshooting
  - **Testing:**
    - Follow guide to add sounds to a hypothetical new component
  - **Output Artifacts:**
    - /client/src/audio/SOUND_INTEGRATION_GUIDE.md
  - _Requirements: US-7_

- [x] 7. Refactor App.jsx Quiz Components
  - Update all quiz components in App.jsx (GKApp, VocabApp, AdditionApp, etc.) to use QuizSoundContext
  - **Acceptance Criteria:**
    - All App.jsx quiz components updated to use useQuizSound()
    - No `import { playSound } from './audioContext'` in App.jsx
    - All existing sound calls replaced with context methods
  - **Implementation Steps:**
    1. In App.jsx:
       - Remove: `import { playSound } from './audioContext'`
       - Add: `import { useQuizSound } from './context/QuizSoundContext';`
    2. Find all playSound() calls in App.jsx
    3. For each call, identify which method to use
    4. Replace calls throughout the component
  - **Testing:**
    - Play 3 questions in GKApp, verify correct/wrong sounds
    - Play 3 questions in VocabApp, verify correct/wrong sounds
    - Toggle mute and verify sounds stop
  - **Output Artifacts:**
    - Updated /client/src/App.jsx
  - **Actual Status:** Complete — App.jsx migrated to useQuizSound() along with other legacy consumers.
  - _Requirements: US-2, US-3, US-7, US-13_

- [x] 8. Refactor VisualMathLabRedux
  - Update VisualMathLabRedux (factory-based quizzes) to use QuizSoundContext
  - **Acceptance Criteria:**
    - VisualMathLabRedux updated to use useQuizSound()
    - All templates (FrogJumpTemplate, etc.) use context
  - **Implementation Steps:**
    1. In VisualMathLabRedux.jsx:
       - Add: `import { useQuizSound } from './context/QuizSoundContext.jsx';`
       - Add inside component: `const { playCorrect, playWrong, playSubmit, playQuizComplete } = useQuizSound();`
    2. Find isCorrect state changes and sound calls
    3. Call playCorrect(score) on correct answer, playWrong() on wrong
  - **Testing:**
    - Load each quiz type from VisualMathLabRedux
    - Submit correct answer -> playCorrect() called
    - Submit wrong answer -> playWrong() called
  - **Output Artifacts:**
    - Updated /client/src/VisualMathLabRedux.jsx
  - **Actual Status:** Complete — confirmed `useQuizSound()` imported and used at lines 19 and 583.
  - _Requirements: US-2, US-3, US-7_

- [x] 9. Refactor PythagLabApp & ProbLabApp to use QuizSoundContext
  - **Acceptance Criteria:**
    - Both components updated to use useQuizSound()
    - handleEvaluation() calls context methods
    - All difficulty levels work with sounds
    - No direct AudioManager or audioContext imports
  - **Implementation Steps:**
    1. In PythagLabApp.jsx:
       - Add: `import { useQuizSound } from './context/QuizSoundContext.jsx';`
       - Add inside component: `const { playCorrect, playWrong } = useQuizSound();`
       - In handleEvaluation(): call playCorrect() on correct, playWrong() on wrong
    2. Repeat for ProbLabApp.jsx
  - **Testing:**
    - Complete Easy/Medium/Hard levels with sounds
  - **Output Artifacts:**
    - Updated /client/src/PythagLabApp.jsx
    - Updated /client/src/ProbLabApp.jsx
  - _Requirements: US-2, US-3, US-7_

- [x] 10. Refactor Other Visual Labs Components
  - Update BearingsLabApp, LcmHcfApp, CoordGeomDiscoveryApp to use QuizSoundContext
  - **Acceptance Criteria:**
    - All three components updated
    - All use QuizSoundContext, not direct AudioManager or audioContext
    - No console errors
    - All quiz flows work with sounds
  - **Implementation Steps:**
    1. Apply same pattern to each:
       - Import useQuizSound hook from `'./context/QuizSoundContext.jsx'`
       - Destructure: `const { playCorrect, playWrong } = useQuizSound();`
       - Add playCorrect()/playWrong() calls after answer validation
       - Test all quiz flows
    2. Components to update:
       - BearingsLabApp.jsx
       - LcmHcfApp.jsx
       - CoordGeomDiscoveryApp.jsx
    3. Test each component's full flow
  - **Testing:**
    - Each component plays correct/wrong sounds
    - Mute toggle affects all
    - No overlapping sounds
    - No console errors
  - **Output Artifacts:**
    - Updated /client/src/BearingsLabApp.jsx
    - Updated /client/src/LcmHcfApp.jsx
    - Updated /client/src/CoordGeomDiscoveryApp.jsx
  - **Audit Note:** Previously marked `[x]` but NO sound-related code found in any of these files. Reverted to `[ ]`.
  - _Requirements: US-2, US-3, US-7_

- [x] 11. Implement Selective Button Click Sounds
  - Add click sounds ONLY to quiz answer buttons, not navigation
  - **Acceptance Criteria:**
    - `playClick()` method added to QuizSoundContext
    - Quiz submit buttons play click sound on click
    - Multiple choice options play click sound
    - Numpad keys (if used) play click sound
    - Navigation buttons do NOT play click sound
    - No overlapping/rapid-fire sounds
    - Mute toggle affects button clicks
  - **Implementation Steps:**
    1. Add `playClick()` method to QuizSoundContext (currently missing)
    2. Wire up `click.mp3` from `/sounds/essential/click.mp3`
    3. Identify quiz-action buttons in each component
    4. Add click handlers: `onClick={() => { playClick(); handleAnswer(...); }}`
    5. Remove any global document click handlers that play sounds
    6. Add debounce/throttle to prevent rapid overlaps
    7. Test: quiz buttons make sound, nav buttons don't
  - **Testing:**
    - Click multiple choice option -> sound plays
    - Click numpad key -> sound plays
    - Click submit button -> sound plays
    - Click navigation button -> NO sound
    - Rapid clicks -> no overlapping sounds
    - Mute toggle disables button clicks too
  - **Output Artifacts:**
    - Updated QuizSoundContext with playClick()
    - Updated components with selective click handlers
  - **Audit Note:** Previously marked `[x]` but `playClick()` does NOT exist in QuizSoundContext and `click.mp3` is not wired up. Reverted to `[ ]`.
  - _Requirements: US-4_

- [~] 12. Add Streak & Milestone Sounds (Optional)
  - Play special sounds for achievement milestones (3-in-a-row, 5-in-a-row)
  - **Acceptance Criteria:**
    - Streak counter implemented in QuizSoundContext
    - 3-in-a-row plays playMilestone(3)
    - 5-in-a-row plays playMilestone(5)
    - Streak resets on wrong answer
    - Visual indicator shows streak count
    - Can toggle milestones on/off
  - **Implementation Steps:**
    1. Add streakCount to QuizSoundContext state
    2. Increment on playCorrect(), reset on playWrong()
    3. Add conditional: if streakCount === 3 -> playMilestone(3)
    4. Add sound files or use existing with different parameters
    5. Add optional UI indicator (e.g., "🔥 3-streak!")
  - **Testing:**
    - Answer 3 correctly -> milestone sound plays
    - Answer wrong -> streak resets
    - Milestone sounds don't interfere with regular sounds
  - **Output Artifacts:**
    - Updated QuizSoundContext with streak logic
    - Updated components showing streak indicator (optional)
  - _Requirements: US-9_

- [~] 13. Testing & Verification
  - Comprehensive testing of sound system across all quiz types
  - **Acceptance Criteria:**
    - All 20+ quiz components tested (correct/wrong/click sounds)
    - Mute toggle tested (persists across 3 sessions)
    - No console errors in any quiz session
    - Sound latency <50ms measured
    - All audio files under 50KB
    - No overlapping sounds
    - Mobile tested (iOS Safari, Android Chrome)
  - **Implementation Steps:**
    1. Unit Tests:
       - QuizSoundContext methods work correctly
       - useQuizSound() hook works in component
       - Mute state persists in localStorage
    2. Integration Tests:
       - QuizSoundContext works across all quiz components
       - Sound plays even if file is missing (graceful fallback)
    3. E2E Tests:
       - Complete quiz session: correct -> wrong -> mute -> unmute
       - All quiz types: GKApp, VocabApp, VisualMathLabRedux, PythagLabApp, etc.
       - Sound plays within 50ms of button click (measure with performance API)
       - No overlapping sounds on rapid clicks
    4. Browser Tests:
       - Chrome, Firefox, Safari, Edge
       - Mobile Safari (iOS), Chrome Mobile (Android)
    5. Performance Tests:
       - App startup time unchanged (sounds lazy-loaded)
       - Sound play latency <50ms
       - Memory usage stable (no leaks from Howl instances)
  - **Testing:**
    - Run all unit tests: `npm test`
    - Manual testing checklist above
    - Performance profiling with DevTools
  - **Output Artifacts:**
    - Test results report
    - Performance metrics (latency, load times)
    - Browser compatibility matrix
  - _Requirements: US-1 through US-10_

- [~] 14. Documentation & README
  - Create user-facing README and developer guide for sound system
  - **Acceptance Criteria:**
    - User README created (how to toggle sounds, what sounds mean)
    - Developer guide created (how to add sounds to new component)
    - README includes troubleshooting section
    - Performance metrics documented
    - Code examples included
  - **Implementation Steps:**
    1. Create /SFX_IMPLEMENTATION.md (root level or /client/src/audio/)
    2. Sections:
       - Overview: What is the sound system?
       - User Guide: How to mute/unmute sounds
       - Developer Guide: How to integrate sounds (with examples)
       - Architecture: System design, QuizSoundContext
       - Performance: Metrics, optimization done
       - Troubleshooting: Common issues and solutions
       - Testing: How to test sound system
    3. Include:
       - Code snippets for common patterns
       - Before/after comparison
       - Performance metrics table
       - File size savings report
  - **Testing:**
    - README is clear and accurate
    - Code examples in guide actually work
    - New developer can follow guide to add sounds
  - **Output Artifacts:**
    - /SFX_IMPLEMENTATION.md
  - _Requirements: US-7_

- [~] 15. Cleanup & Final Verification
  - Final pass to ensure system is production-ready
  - **Acceptance Criteria:**
    - No `import { playSound } from './audioContext'` in any component
    - No `import AudioManager` in any component
    - No console errors or warnings related to audio
    - All sounds files organized and optimized
    - No unused code or imports left behind
    - Code style consistent with project
    - Comments added to clarify key sections
    - Legacy `audioContext.js` deprecated or removed
  - **Implementation Steps:**
    1. Grep for remaining `import.*audioContext` across all components
    2. Grep for remaining `import.*AudioManager` across all components
    3. Fix any remaining direct calls
    4. Run linter and fix issues: `npm run lint`
    5. Review QuizSoundContext for clarity/comments
    6. Remove any debugging console.logs (keep warnings/errors)
    7. Test one final time: complete quiz session with all sounds
    8. Verify file sizes one more time
    9. Deprecate or remove `audioContext.js`
  - **Testing:**
    - `npm run lint` passes
    - Complete quiz session: no errors
    - All sounds play correctly
    - Mute toggle works
  - **Output Artifacts:**
    - Clean, production-ready code
    - No linting issues
    - Final verification report
  - _Requirements: US-7, US-13_

---

## NEW TASKS (Added from Aug 2026 Audit)

- [x] 16. Create Missing Sound Files
  - Create or source `submit.mp3` and `quiz-complete.mp3` audio files
  - **Acceptance Criteria:**
    - `submit.mp3` created and placed in `/public/sounds/essential/`
    - `quiz-complete.mp3` created and placed in `/public/sounds/standard/`
    - Both files under 50KB
    - QuizSoundContext paths updated to reference correct locations
    - Both sounds play correctly in browser
  - **Implementation Steps:**
    1. Source or generate `submit.mp3` (short click/tap sound, 0.1-0.3s)
    2. Source or generate `quiz-complete.mp3` (celebratory flourish, 1.5-2.0s)
    3. Compress to target bitrate (96kbps for submit, 128kbps for quiz-complete)
    4. Place in appropriate category directories
    5. Update QuizSoundContext.jsx Howl src paths:
       - Current (broken): `/sounds/submit.mp3` -> Fix to: `/sounds/essential/submit.mp3`
       - Current (broken): `/sounds/quiz-complete.mp3` -> Fix to: `/sounds/standard/quiz-complete.mp3`
    6. Also fix existing paths:
       - `/sounds/correct.mp3` -> `/sounds/essential/correct.mp3`
       - `/sounds/wrong.mp3` -> `/sounds/essential/wrong.mp3`
  - **Testing:**
    - Both files load without Howler errors
    - playSubmit() plays submit sound
    - playQuizComplete() plays completion sound
    - No console warnings about missing files
  - **Output Artifacts:**
    - /public/sounds/essential/submit.mp3 (new)
    - /public/sounds/standard/quiz-complete.mp3 (new)
    - Updated QuizSoundContext.jsx with correct paths
  - **Priority:** CRITICAL — QuizSoundContext references these files but they don't exist
  - _Requirements: US-1, US-11_

- [x] 17. Add Mute Toggle UI
  - Add a visible mute/unmute toggle button to the quiz interface
  - **Acceptance Criteria:**
    - Mute toggle button visible in quiz header or settings area
    - Toggle shows current state clearly (speaker on / speaker off icons)
    - Clicking toggles immediately mutes/unmutes all quiz sounds
    - Toggle calls `toggleMute()` from QuizSoundContext
    - Toggle is accessible (keyboard navigable, screen reader friendly)
    - Toggle state persists across page reloads
  - **Implementation Steps:**
    1. Decide placement (quiz header toolbar, hamburger menu, or floating button)
    2. Create SoundToggle component or add to existing header/settings
    3. Import `useQuizSound()` and destructure `{ isMuted, toggleMute }`
    4. Render toggle button with appropriate icon
    5. Style to match existing UI
    6. Test across all quiz types
  - **Testing:**
    - Toggle is visible and clickable
    - Mute -> play quiz -> no sounds
    - Unmute -> play quiz -> sounds play
    - Reload page -> mute state preserved
    - Works on mobile
  - **Output Artifacts:**
    - New or updated component with mute toggle
  - **Priority:** HIGH — Mute toggle exists in code but has no UI
  - _Requirements: US-5, US-12_

- [x] 18. Migrate Legacy audioContext.js Consumers
  - Migrate App.jsx and PercentExplanationApp.jsx from legacy `audioContext.js` to `useQuizSound()`
  - **Acceptance Criteria:**
    - App.jsx no longer imports from `audioContext.js`
    - PercentExplanationApp.jsx no longer imports from `audioContext.js`
    - Both use `useQuizSound()` for all sound calls
    - Sounds play correctly after migration
    - No console errors
  - **Implementation Steps:**
    1. In App.jsx:
       - Remove: `import { playSound } from './audioContext'`
       - Add: `import { useQuizSound } from './context/QuizSoundContext.jsx';`
       - Inside component: `const { playCorrect, playWrong } = useQuizSound();`
       - Replace all `playSound('correct', ...)` -> `playCorrect()`
       - Replace all `playSound('wrong', ...)` -> `playWrong()`
    2. In PercentExplanationApp.jsx:
       - Same migration pattern as App.jsx
    3. Migrate detective-app.jsx inline sounds:
       - Replace `playCorrectSound()` function with `playCorrect()` from context
       - Remove inline `playTone()` calls
    4. Add deprecation notice to audioContext.js header
  - **Testing:**
    - App.jsx quizzes play correct/wrong sounds via context
    - PercentExplanationApp quizzes play sounds via context
    - detective-app plays sounds via context
    - Mute toggle affects all
    - No console errors
  - **Output Artifacts:**
    - Updated App.jsx
    - Updated PercentExplanationApp.jsx
    - Updated detective-app.jsx
    - Deprecated audioContext.js (with notice)
  - **Priority:** HIGH — These are the only components still using the legacy system
  - **Note:** This overlaps with Task 7 (App.jsx refactor). Task 7 covers App.jsx specifically; this task extends to PercentExplanationApp and detective-app.
  - _Requirements: US-7, US-13_

- [x] 19. Refactor Additional Quiz Components (Batch 2)
  - Add sound integration to all remaining quiz components not covered by Tasks 7-10
  - **Acceptance Criteria:**
    - All components below use `useQuizSound()` for correct/wrong sounds
    - No console errors in any component
    - Mute toggle works across all
  - **Components to update:**
    - BattleApp.jsx
    - GeometryApp.jsx
    - LinearAlgebraApp.jsx
    - Curiosity.jsx
    - ContrastChallengeApp.jsx
    - IdliVadaSambharApp.jsx
    - SudokuApp.jsx
    - PlaygroundApp.jsx
    - ScribbleGuessApp.jsx
    - LocalCompilerApp.jsx
    - CrossSectionApp.jsx
    - NetBuilderApp.jsx
    - ShapeSlicer3D.jsx
    - ShapeTranslatorApp.jsx
    - SpatialReasoningMCQ.jsx
  - **Implementation Steps:**
    1. For each component:
       - Add: `import { useQuizSound } from './context/QuizSoundContext.jsx';`
       - Inside component: `const { playCorrect, playWrong } = useQuizSound();`
       - Find answer evaluation logic
       - Add playCorrect()/playWrong() calls after validation
    2. Test each component's full flow
  - **Testing:**
    - Each component plays correct/wrong sounds
    - Mute toggle affects all
    - No console errors
  - **Output Artifacts:**
    - Updated files for all 15 components listed above
  - **Priority:** MEDIUM — These components work without sounds; integration is additive
  - _Requirements: US-7_

- [x] 20. Enhance QuizSoundContext with Missing Features
  - Add `playClick()`, `playMilestone()`, `loadCategory()`, and streak tracking to QuizSoundContext
  - **Acceptance Criteria:**
    - `playClick()` method added, wired to `/sounds/essential/click.mp3`
    - `playMilestone(level)` method added (optional, can use pitch variation of correct sound)
    - `loadCategory(categoryName)` method added for lazy loading
    - `streakCount` tracked in context state
    - `isLoading` state tracked for UI feedback
    - All new methods respect mute setting
    - All new methods have try-catch error handling
  - **Implementation Steps:**
    1. Add `click` Howl instance to soundsRef in useEffect
    2. Add playClick() method with debounce
    3. Add streakCount state, increment on playCorrect(), reset on playWrong()
    4. Add playMilestone() that plays special sound or varies pitch
    5. Add loadCategory() async method using SOUND_CATEGORIES config
    6. Add isLoading state for category preload progress
    7. Expose all new methods/state in context value
  - **Testing:**
    - playClick() plays click sound
    - Streak counter increments correctly
    - playMilestone(3) fires at 3-streak
    - loadCategory() loads sounds asynchronously
    - All respect mute setting
  - **Output Artifacts:**
    - Updated /client/src/context/QuizSoundContext.jsx
  - **Priority:** MEDIUM — Needed for full spec compliance but not blocking basic functionality
  - _Requirements: US-4, US-6, US-9_

---

## Notes

- **Task Dependencies:** Critical path for remaining work:
  - Task 16 (missing files) should be done FIRST (fixes broken references)
  - Task 17 (mute toggle UI) can be done independently
  - Task 18 (legacy migration) depends on Task 16
  - Tasks 7, 9, 10 (component refactoring) depend on Task 16
  - Task 19 (batch 2 components) depends on Tasks 7, 9, 10 being done first
  - Task 20 (context enhancements) can be done independently
  - Task 4 (AudioManager) optional if QuizSoundContext-only approach is preferred
  - Tasks 6, 11 depend on Task 20 (playClick needed)
  - Tasks 12-15 final phase after all components migrated
- **Parallelization:** Tasks 17, 18, 20 can run in parallel after Task 16
- **Optional Tasks:** Task 4 (AudioManager), Task 12 (Milestones) can be skipped for MVP
- **Error Handling:** All sound operations must fail gracefully without blocking quiz flow
- **Testing:** Manual testing is critical due to browser audio API variations; automate where possible
- **Performance:** File sizes are already well under target (~42KB total); lazy loading is nice-to-have

## Task Status Summary

| Task | Description | Status | Audit Note |
|------|-------------|--------|------------|
| 1 | Audit existing audio | `[x]` | Accurate |
| 2 | Optimize audio files | `[x]` | Accurate |
| 3 | Organize files by category | `[x]` | Accurate |
| 4 | AudioManager lazy loading | `[ ]` | **Reverted** — file doesn't exist |
| 5 | QuizSoundContext | `[x]` | Accurate (partial interface) |
| 6 | Integration guide | `[ ]` | **Reverted** — file doesn't exist |
| 7 | Refactor App.jsx | `[-]` | Accurate — in progress |
| 8 | Refactor VisualMathLabRedux | `[x]` | Accurate |
| 9 | Refactor PythagLab/ProbLab | `[ ]` | **Reverted** — no sound code found |
| 10 | Refactor Bearings/LcmHcf/CoordGeom | `[ ]` | **Reverted** — no sound code found |
| 11 | Selective button clicks | `[ ]` | **Reverted** — playClick() missing |
| 12 | Streak/milestone sounds | `[~]` | Deferred — optional |
| 13 | Testing and verification | `[~]` | Deferred |
| 14 | Documentation and README | `[~]` | Deferred |
| 15 | Cleanup and final verification | `[~]` | Deferred |
| 16 | **NEW** Create missing sound files | `[ ]` | CRITICAL |
| 17 | **NEW** Add mute toggle UI | `[ ]` | HIGH |
| 18 | **NEW** Migrate legacy audioContext | `[ ]` | HIGH |
| 19 | **NEW** Refactor batch 2 components | `[ ]` | MEDIUM |
| 20 | **NEW** Enhance QuizSoundContext | `[ ]` | MEDIUM |

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["16"], "note": "Create missing sound files (CRITICAL)" },
    { "id": 1, "tasks": ["17", "18", "20"], "note": "Mute toggle UI + Legacy migration + Context enhancements (parallel)" },
    { "id": 2, "tasks": ["4", "6", "7"], "note": "AudioManager + Guide + App.jsx refactor" },
    { "id": 3, "tasks": ["9", "10", "11"], "note": "Lab component refactoring + Click sounds" },
    { "id": 4, "tasks": ["19"], "note": "Batch 2 component refactoring" },
    { "id": 5, "tasks": ["12"], "note": "Streak/milestone sounds (optional)" },
    { "id": 6, "tasks": ["13"], "note": "Testing and verification" },
    { "id": 7, "tasks": ["14"], "note": "Documentation" },
    { "id": 8, "tasks": ["15"], "note": "Final cleanup" }
  ]
}
```
