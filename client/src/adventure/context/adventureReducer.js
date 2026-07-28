/**
 * TENALI ADVENTURE GAME - STATE REDUCER
 * ══════════════════════════════════════════════════════════════════════
 * Central reducer handling view transitions and gameplay state machine.
 */

/** Legacy world IDs → current world ID mapping. */
const WORLD_ID_MIGRATION = {
  'world_1':            'number_kingdom',
  'arithmetic_kingdom': 'number_kingdom',
};

function migrateWorldIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return ['number_kingdom'];
  const migrated = ids.map(id => WORLD_ID_MIGRATION[id] || id);
  return [...new Set(migrated)];
}

export const initialState = {
  view: 'HOME', // 'HOME' | 'KINGDOM_SELECT' | 'LEVEL_SELECT' | 'GAMEPLAY' | 'RESULT' | 'REVIEW'
  currentWorldId: 'number_kingdom',
  currentLevelId: null,
  worlds: [],
  levels: [],
  concepts: [],
  progress: {
    xp: 0,
    totalStars: 0,
    completedLevels: [],
    unlockedWorlds: ['number_kingdom'],
    levelStars: {},
    highestScore: 0
  },
  session: null,       // { sessionId, levelId, firstClue, currentClue, clueNumber, totalClues, isBoss, hasMoreClues }
  hintText: null,
  guessModalOpen: false,
  resultData: null,    // { correct, stars, xpGained, nextLevelId }
  reviewData: null,    // Educational review object
  loading: false,
  error: null
};

export function adventureReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_CONFIG': {
      const rawProgress = action.payload.progress || state.progress;
      // Migrate stale world IDs that may have been saved in localStorage
      const migratedProgress = {
        ...rawProgress,
        unlockedWorlds: migrateWorldIds(rawProgress.unlockedWorlds)
      };
      return {
        ...state,
        worlds:   action.payload.worlds   || [],
        levels:   action.payload.levels   || [],
        concepts: action.payload.concepts || [],
        progress: migratedProgress,
        loading:  false
      };
    }

    case 'SET_VIEW':
      return { ...state, view: action.payload, error: null };

    case 'SELECT_WORLD':
      return { ...state, currentWorldId: action.payload, view: 'LEVEL_SELECT', error: null };

    case 'START_SESSION': {
      console.log('[DEBUG Step 7] START_SESSION reducer - payload:', JSON.stringify(action.payload));
      console.log('[DEBUG Step 7b] firstClue from payload:', action.payload.firstClue);
      const newSession = {
        sessionId:   action.payload.sessionId,
        levelId:     action.payload.levelId,
        worldId:     action.payload.worldId,
        levelNumber: action.payload.levelNumber,
        isBoss:      action.payload.isBoss,
        currentClue: action.payload.firstClue,
        clueNumber:  action.payload.clueNumber || 1,
        totalClues:  action.payload.totalClues || 5,
        hasMoreClues: (action.payload.totalClues || 5) > 1,
        // true  → show "Tenali's Thought N / 5" label (child-friendly voice)
        // false → show "Knowledge Clue N / 5" label (older students)
        useThoughts: action.payload.useThoughts || false
      };
      console.log('[DEBUG Step 8] New session.currentClue:', newSession.currentClue);
      return {
        ...state,
        session: newSession,
        hintText:     null,
        guessModalOpen: false,
        resultData:   null,
        reviewData:   null,
        view:         'GAMEPLAY',
        loading:      false,
        error:        null
      };
    }

    case 'UPDATE_CLUE':
      return {
        ...state,
        session: {
          ...state.session,
          currentClue: action.payload.clue,
          clueNumber: action.payload.clueNumber,
          hasMoreClues: action.payload.hasMoreClues !== false
        },
        loading: false
      };

    case 'SET_HINT':
      return { ...state, hintText: action.payload, loading: false };

    case 'SET_GUESS_MODAL':
      return { ...state, guessModalOpen: action.payload };

    case 'HANDLE_GUESS_WIN':
      return {
        ...state,
        resultData: {
          correct: true,
          stars: action.payload.stars,
          xpGained: action.payload.xpGained,
          nextLevelId: action.payload.nextLevelId
        },
        reviewData: action.payload.review,
        progress: action.payload.progress || state.progress,
        guessModalOpen: false,
        view: 'RESULT',
        loading: false
      };

    case 'HANDLE_GUESS_LOSS':
      return {
        ...state,
        resultData: {
          correct: false,
          stars: 0,
          xpGained: 0,
          nextLevelId: null
        },
        reviewData: action.payload.review,
        progress: action.payload.progress || state.progress,
        guessModalOpen: false,
        view: 'RESULT',
        loading: false
      };

    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };

    default:
      return state;
  }
}
