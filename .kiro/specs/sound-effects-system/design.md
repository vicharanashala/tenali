# Design: Sound Effects System for Tenali

## Overview

The Sound Effects System for Tenali provides a centralized, performant approach to managing audio playback across the quiz application. The system introduces a React Context-based API (QuizSoundContext) that wraps the existing AudioManager singleton, enabling lazy loading of sounds by category, automatic mute state persistence, and graceful error handling. This design minimizes startup overhead by loading only essential sounds initially, then preloading category-specific sounds on-demand as users navigate to different quiz types.

**Key Goals**:
- Centralize sound management via React Context (familiar pattern, no new dependencies)
- Lazy load sounds by category to reduce startup bloat and improve initial load time
- Maintain backward compatibility with existing AudioManager
- Provide consistent API across all quiz components
- Ensure resilient error handling without disrupting quiz flow
- Achieve <50ms play latency and <500ms category preload time

> **Note (Aug 2026 audit):** The current implementation uses `QuizSoundContext.jsx` directly with Howler.js, without a separate `AudioManager.js` singleton. The design below describes the intended architecture. Sections marked with ⚠️ indicate where the current implementation diverges from this design.

**High-Level Design Decisions**

| Decision | Rationale |
|----------|-----------|
| Use React Context instead of global state | Familiar to codebase, no new dependencies |
| Lazy load by category | Prevents startup bloat, faster initial load |
| Preserve AudioManager singleton | Leverage existing code, minimize changes |
| Keep localStorage for mute | Already established, simple persistence |
| Use Howler.js (no change) | Already integrated, stable library |
| Three sound categories | Balance between fine-grained control and simplicity |

---

## Architecture

### System Architecture Overview

```
+-----------------------------------------------------------------------------+
│                          React Application (main.jsx)                       │
+-----------------------------------------------------------------------------+
│                   QuizSoundProvider (wraps entire app)                       │
│                           React Context                                      │
+-----------------------------------------------------------------------------+
│               Howler.js (direct usage in QuizSoundContext)                    │
│    ⚠️ AudioManager singleton NOT yet implemented                             │
│    - Category-based preloading (NOT yet implemented)                         │
│    - Error resilience (✅ try-catch in all play calls)                       │
│    - Mute state management (✅ via localStorage)                             │
│    - Performance metrics (NOT yet implemented)                               │
+-----------------------------------------------------------------------------+
│                     Optimized Audio Files (.mp3 / .webm)                     │
│         /public/sounds/{category}/{soundname}                               │
│    ⚠️ Context references /sounds/correct.mp3 not /sounds/essential/correct  │
+-----------------------------------------------------------------------------+
```

### Data Flow

#### Sound Play Flow (Happy Path)

```
User clicks submit button
        ↓
Quiz component calls playSubmit() (via useQuizSound hook)
        ↓
QuizSoundContext.playSubmit() called
        ↓
Check: isMuted? → if yes, return early
        ↓
Check: sound loaded? → if no, try load, then play
        ↓
AudioManager.playSound('submit') called
        ↓
Howler.js plays sound immediately (<50ms)
        ↓
Event logged to console (for debugging)
        ↓
Quiz flow continues (no blocking)
```

#### Category Preload Flow

```
User navigates to quiz type (e.g., VocabApp)
        ↓
QuizSoundProvider detects category change
        ↓
loadCategory('standard') initiated asynchronously
        ↓
AudioManager.loadCategory('standard') creates Howl instances
        ↓
Sound files downloaded (lazy HTTP request)
        ↓
Howls preloaded into memory via Howler.js
        ↓
isLoaded checks return true for all sounds in category
        ↓
Quiz component can call playCorrect() etc. safely
```

#### Error Handling Flow

```
Sound play requested (playCorrect)
        ↓
Try-catch block entered
        ↓
Audio error occurs (file not found, Howler.js error, etc.)
        ↓
Catch block: console.warn() logged
        ↓
Quiz continues normally (no throw)
        ↓
Mute toggle still functional
        ↓
Next sound attempt uses fallback logic
```

### Integration Points with Existing Code

#### Changes to Quiz Components

**Pattern**: Replace direct AudioManager calls with useQuizSound hook

**Before**:
```javascript
import AudioManager from './audio/AudioManager';

function QuizComponent() {
  const handleCorrect = () => {
    setIsCorrect(true);
    AudioManager.playCorrect();
    // quiz logic
  };
}
```

**After**:
```javascript
import { useQuizSound } from './contexts/QuizSoundContext';

function QuizComponent() {
  const { playCorrect } = useQuizSound();
  
  const handleCorrect = () => {
    setIsCorrect(true);
    playCorrect();
    // quiz logic
  };
}
```

#### Changes to App.jsx

**Wrap quiz routes with QuizSoundProvider**:
```javascript
import { QuizSoundProvider } from './contexts/QuizSoundContext';

function App() {
  return (
    <QuizSoundProvider initialCategory="standard">
      {/* quiz routes here */}
      <Route path="/quiz/:type" component={QuizComponent} />
    </QuizSoundProvider>
  );
}
```

#### Mute Toggle Integration

**Existing**: Already in App.jsx, Settings menu  
**Change**: Call context method instead of AudioManager directly

**Before**:
```javascript
const toggleSoundEffects = () => {
  AudioManager.toggleMuted();
  setSoundEffects(!soundEffects);
};
```

**After**:
```javascript
const { toggleMute } = useQuizSound();

const toggleSoundEffects = () => {
  toggleMute();
  setSoundEffects(!soundEffects);
};
```

---

## Components and Interfaces

### QuizSoundContext (New)

**File**: client/src/context/QuizSoundContext.jsx

> ⚠️ **Note**: The design originally specified `client/src/contexts/` (plural) but the actual file is at `client/src/context/` (singular).

**Purpose**: Centralize sound state and provide uniform API to all quiz components

**Interface**:
```javascript
const QuizSoundContext = createContext({
  // State
  isMuted: boolean,
  currentCategory: string,
  
  // Methods
  playCorrect: (streak?: number) => void,
  playWrong: () => void,
  playSubmit: () => void,
  playClick: () => void,
  playQuizComplete: () => void,       // ✅ Implemented (not in original design)
  playMilestone: (milestoneLevel: number) => void,  // ❌ Not yet implemented
  toggleMute: () => void,
  loadCategory: (categoryName: string) => Promise<void>,  // ❌ Not yet implemented
});

// Custom hook for consuming components
export const useQuizSound = () => useContext(QuizSoundContext);
```

> ⚠️ **Current State**: Only `playCorrect`, `playWrong`, `playSubmit`, `playQuizComplete`, `isMuted`, and `toggleMute` are implemented. `playClick`, `playMilestone`, and `loadCategory` are not yet implemented.

**Provider Props**:
- initialCategory: string = 'standard' (default category to preload)
- autoLoadCategories: boolean = true (auto-load when quiz type changes)

**Implementation Details**:
- Wraps quiz-related routes only (not entire app to avoid unnecessary preload)
- Manages category preloading asynchronously
- Handles mute state from localStorage
- Catches and logs audio errors without throwing

### Enhanced AudioManager (Future — Not Yet Implemented)

> ⚠️ **Status**: The AudioManager singleton described below has NOT been implemented. The current system uses `QuizSoundContext.jsx` with Howler.js directly. The AudioManager is a planned future enhancement for category-based lazy loading.

**File**: client/src/audio/AudioManager.js (does not exist yet)

**Current Behavior** (preserved):
- Singleton instance
- Preload all sounds at initialization
- Mute state persistence via localStorage
- Streak tracking with pitch increase on correct

**New Enhancements**:

#### Category System
```javascript
const SOUND_CATEGORIES = {
  essential: {
    sounds: ['click', 'correct', 'wrong'],
    preloadAtStartup: true,
    loadTime: 'immediate'
  },
  standard: {
    sounds: ['correct', 'wrong', 'click', 'coin'],
    preloadAtStartup: false,
    loadTime: 'on-demand'
  },
  visualLab: {
    sounds: ['correct', 'wrong', 'streak', 'levelup'],
    preloadAtStartup: false,
    loadTime: 'on-demand'
  },
  specialized: {
    sounds: ['correct', 'wrong', 'click'],
    preloadAtStartup: false,
    loadTime: 'on-demand'
  }
};
```

#### New Methods
```javascript
class AudioManager {
  // Lazy loading
  async loadCategory(categoryName) {
    // Load only sounds in category, skip if already loaded
    // Return promise that resolves when category is ready
  }
  
  isLoaded(soundName) {
    // Check if a specific sound is preloaded
    return boolean;
  }
  
  getLoadingProgress(categoryName) {
    // Return { loaded: number, total: number } for UI feedback
  }
  
  // Error resilience
  setSafeMode(enabled) {
    // If enabled, all sound calls log but don't crash
  }
  
  // Performance tracking
  getMetrics() {
    return {
      totalLoadTime: ms,
      categoriesLoaded: [],
      lastPlayLatency: ms
    };
  }
}
```

### Component Dependency Map

**Components That Play Sounds** (to be updated):

| Component | Sounds Used | Category | Status |
|-----------|------------|----------|--------|
| App.jsx (GKApp) | correct, wrong, click, submit | standard | ⚠️ Uses legacy `audioContext.js` |
| App.jsx (VocabApp) | correct, wrong, click, submit | standard | ⚠️ Uses legacy `audioContext.js` |
| App.jsx (AdditionApp) | correct, wrong, click, submit | standard | ⚠️ Uses legacy `audioContext.js` |
| VisualMathLabRedux | correct, wrong, submit, quizComplete | standard | ✅ Uses `useQuizSound()` |
| PythagLabApp | correct, wrong, levelup | visual-lab | ❌ No sound integration |
| ProbLabApp | correct, wrong, levelup | visual-lab | ❌ No sound integration |
| BearingsLabApp | correct, wrong, levelup | visual-lab | ❌ No sound integration |
| LcmHcfApp | correct, wrong | specialized | ❌ No sound integration |
| CoordGeomDiscoveryApp | correct, wrong | specialized | ❌ No sound integration |
| BattleApp | correct, wrong, click | standard | ❌ No sound integration |
| GeometryApp | correct, wrong | standard | ❌ No sound integration |
| LinearAlgebraApp | correct, wrong | standard | ❌ No sound integration |
| PercentExplanationApp | correct, wrong | standard | ⚠️ Uses legacy `audioContext.js` |
| detective-app | correct (inline) | standard | ⚠️ Has inline sound functions |
| Curiosity | correct, wrong | standard | ❌ No sound integration |
| ContrastChallengeApp | correct, wrong | standard | ❌ No sound integration |
| IdliVadaSambharApp | correct, wrong | standard | ❌ No sound integration |
| SudokuApp | correct, wrong | standard | ❌ No sound integration |
| PlaygroundApp | correct, wrong | standard | ❌ No sound integration |
| ScribbleGuessApp | correct, wrong | standard | ❌ No sound integration |

---

## Data Models

### Audio File Organization

**Directory Structure**:
```
/public/sounds/
+-- essential/
│   +-- click.mp3 (click interaction)
│   +-- correct.mp3 (celebratory)
│   +-- wrong.mp3 (discouraging)
+-- standard/
│   +-- coin.mp3 (bonus/streak)
│   +-- levelup.mp3 (milestone)
+-- visual-lab/
    +-- [sounds specific to visual labs]
```

**File Specifications**:
| Sound | Format | Bitrate | Size Target | Duration | Actual Size | Status |
|-------|--------|---------|-------------|----------|-------------|--------|
| click.mp3 | MP3 | 96kbps | <30KB | 0.1-0.2s | 879B | ✅ Exists in `/essential/` |
| correct.mp3 | MP3 | 128kbps | <40KB | 0.5-1.0s | 6.6KB | ✅ Exists in `/essential/` |
| wrong.mp3 | MP3 | 128kbps | <40KB | 0.5-1.0s | 8KB | ✅ Exists in `/essential/` |
| coin.mp3 | MP3 | 128kbps | <40KB | 0.3-0.5s | 3.4KB | ✅ Exists in `/standard/` |
| levelup.mp3 | MP3 | 128kbps | <40KB | 1.0-1.5s | 13.8KB | ✅ Exists in `/standard/` |
| streak.mp3 | MP3 | 128kbps | <40KB | 0.5-1.0s | 9.2KB | ✅ Exists in `/standard/` |
| submit.mp3 | MP3 | 96kbps | <30KB | 0.1-0.3s | — | ❌ Missing (referenced by QuizSoundContext) |
| quiz-complete.mp3 | MP3 | 128kbps | <50KB | 1.5-2.0s | — | ❌ Missing (referenced by QuizSoundContext) |

### QuizSoundContext State
```javascript
{
  // Sound system state
  isMuted: boolean,
  currentCategory: string,       // ❌ Not yet tracked in context
  loadedCategories: Set<string>,  // ❌ Not yet tracked in context
  isLoading: boolean,             // ❌ Not yet tracked in context
  
  // Performance tracking
  lastPlayTime: timestamp,        // ❌ Not yet tracked in context
  playLatency: number,            // ❌ Not yet tracked in context
  
  // Streak tracking (optional)
  streakCount: number,            // ❌ Not yet tracked in context
  
  // Error tracking
  failedSounds: Set<string>,      // ❌ Not yet tracked in context
  errorLog: Array<{ sound, error, timestamp }>  // ❌ Not yet tracked in context
}
```

> ⚠️ **Current State**: Only `isMuted` is tracked in the context state. All other fields are planned enhancements.

### Persisted State (localStorage)
- tenali-sound-effects: 'true' | 'false' (mute state)

---

## Error Handling

### Missing Audio File
```javascript
try {
  const howl = new Howl({ src: '/sounds/correct.mp3' });
  howl.play();
} catch (err) {
  console.warn('Audio play failed:', err);
  // Quiz continues without audio
}
```

### Howler.js Unavailable
```javascript
if (!window.Howl) {
  console.warn('Howler.js not available, audio disabled');
  AudioManager.setSafeMode(true);
  // All play() calls become no-ops (safe)
}
```

### Category Load Timeout
```javascript
const loadCategory = async (categoryName) => {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Load timeout')), 5000)
  );
  
  try {
    await Promise.race([loadCategoryImpl(categoryName), timeout]);
  } catch (err) {
    console.warn('Category preload failed:', err);
    // Use fallback sounds or continue without
  }
};
```

---

## Performance Optimization Strategy

### Lazy Loading by Category
- App startup loads only essential sounds (click, basic correct/wrong)
- When quiz category changes, preload category sounds in background
- Quiz continues to work while sounds load asynchronously
- If sound not loaded yet, request is queued and played after load

### Memory Management
- Use Howler.js pooling to prevent sound overlap
- Set cache: true on Howl instances to reuse audio nodes
- Limit concurrent sound plays (debounce rapid clicks)

### File Size Optimization
- Compress audio files to <50KB each
- Use MP3 codec (96-128kbps)
- Trim silence from audio files
- Mono instead of stereo for short effects

### Network Optimization
- Use gzip compression (auto via server)
- Add Cache-Control headers for audio files (long TTL)
- Preload category sounds before quiz starts (using <link rel="preload">)

---

## State Management

The system uses React Context to manage sound state, supplemented by localStorage for persistence:

- **isMuted**: Current mute state (persisted to localStorage)
- **currentCategory**: Currently active sound category
- **loadedCategories**: Set of categories with preloaded sounds
- **isLoading**: Flag indicating category preload in progress
- **lastPlayTime**: Timestamp of most recent sound play
- **playLatency**: Measured latency for sound playback
- **streakCount**: Current streak count (for streak-based pitch changes)
- **failedSounds**: Set of sounds that failed to load
- **errorLog**: Array of errors with timestamps for debugging

---

## Testing Strategy

### Unit Tests
- AudioManager category loading
- Sound play with/without mute
- Streak counting logic
- Error handling
- State management and localStorage persistence

### Integration Tests
- useQuizSound hook works in component
- Category auto-loads on quiz change
- Mute state syncs across components
- Error recovery without breaking quiz flow

### E2E Tests
- Complete quiz flow with sounds
- Mute toggle persists across sessions
- No console errors during quiz
- Category preloading triggers correctly on quiz navigation
- Sound playback latency stays under 50ms

---

## Migration Path

1. **Phase 1**: Create QuizSoundContext and enhance AudioManager (no breaking changes)
2. **Phase 2**: Update core quiz components (App.jsx, VisualMathLabRedux) to use Context
3. **Phase 3**: Update specialized lab components (PythagLabApp, ProbLabApp, etc.)
4. **Phase 4**: Remove direct AudioManager calls (cleanup pass)
5. **Phase 5**: Optimize audio files and organize by category

---

## Acceptance Criteria by Design

| Requirement | Design Element |
|-------------|-----------------|
| Selective button clicks | Only quiz-action buttons call playSubmit() |
| Consistent sounds | All components use same Context methods |
| Lazy loading | Category system + loadCategory() async |
| Error resilience | Try-catch in every playSound() call |
| Mute persistence | localStorage sync in QuizSoundContext |
| Performance | <50ms play latency, <500ms category preload |
| Maintainability | Single Context API, centralized AudioManager |

## Correctness Properties

The sound system must satisfy these formal properties for correct operation:

### Property 1: Sound Mute Consistency
**Property**: If mute is enabled, no sound should ever play, regardless of user action

Given: Mute toggle is ON (true)  
When: User performs any quiz action (submit, correct, wrong)  
Then: No audio output occurs  
And: localStorage['tenali-sound-effects'] === 'false'  

### Property 2: Correct/Wrong Sound Exclusivity
**Property**: On any answer evaluation, exactly one of {correct sound, wrong sound, no sound} plays

Given: User submits an answer  
When: Server validates the answer  
Then:
- If correct: playCorrect() called (and not playWrong())
- If wrong: playWrong() called (and not playCorrect())
- If error: neither called, console warning issued

### Property 3: Click Sound Selectivity
**Property**: Click sounds should play only for quiz-related buttons, never for navigation

Given: User clicks a button  
When: Button is quiz-action (submit, option, numpad)  
Then: playClick() is called  
When: Button is navigation (home, back, menu)  
Then: No sound plays

### Property 4: Lazy Load Completeness
**Property**: When entering a quiz category, all required sounds must be loaded before quiz can start

Given: User opens a quiz type  
When: Category load initiated  
Then: All sounds for category loaded within 500ms  
And: isLoaded(soundName) returns true for all sounds in category

### Property 5: Error Resilience
**Property**: Missing or failed audio should never prevent quiz from functioning

Given: Audio file fails to load OR Howler.js unavailable  
When: User plays quiz  
Then: Quiz loads and functions normally  
And: Console has warning about audio issue  
And: Mute toggle still works

### Property 6: Streak Consistency
**Property**: Streak counter should be in sync with audio playback

Given: User answers questions in sequence  
When: Answers are all correct  
Then: streakCount increments by 1 per correct answer  
When: Answer is wrong  
Then: streakCount resets to 0  
And: playCorrect() rate parameter reflects current streak  

> ⚠️ **Not yet implemented**: Streak tracking is not part of the current QuizSoundContext state.

