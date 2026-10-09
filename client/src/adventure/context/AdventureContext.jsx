/**
 * TENALI ADVENTURE GAME - REACT CONTEXT
 * ══════════════════════════════════════════════════════════════════════
 * Provides centralized adventure game state and dispatcher functions.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { adventureReducer, initialState } from './adventureReducer';
import { adventureApi } from '../services/adventureApi';
import { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';

const AdventureContext = createContext();

export function AdventureProvider({ children }) {
  const [state, dispatch] = useReducer(adventureReducer, initialState);

  const loadGameConfig = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // 1. Version-check: wipes stale progress if data structure changed
      LocalStorageAdapter.checkVersion();
      // 2. Migrate any remaining stale world IDs in localStorage
      LocalStorageAdapter.getProgress();

      const data = await adventureApi.fetchConfig();
      dispatch({ type: 'SET_CONFIG', payload: data });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  useEffect(() => {
    loadGameConfig();
  }, []);

  const value = {
    state,
    dispatch,
    loadGameConfig,
    
    // Actions
    setView: (view) => dispatch({ type: 'SET_VIEW', payload: view }),
    selectWorld: (worldId) => dispatch({ type: 'SELECT_WORLD', payload: worldId }),
    
    continueAdventure: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const cont = await adventureApi.fetchContinue();
        if (cont && cont.levelId) {
          const sessionData = await adventureApi.startLevel(cont.levelId);
          dispatch({ type: 'START_SESSION', payload: sessionData });
        } else {
          dispatch({ type: 'SET_VIEW', payload: 'KINGDOM_SELECT' });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    startLevel: async (levelId) => {
      console.log('[DEBUG Step 2] startLevel called with levelId:', levelId);
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        console.log('[DEBUG Step 3] Calling API: POST /api/adventure/start', { levelId });
        const sessionData = await adventureApi.startLevel(levelId);
        console.log('[DEBUG Step 4] API response received:', JSON.stringify(sessionData));
        console.log('[DEBUG Step 5] firstClue value:', sessionData && sessionData.firstClue);
        dispatch({ type: 'START_SESSION', payload: sessionData });
        console.log('[DEBUG Step 6] START_SESSION dispatched');
      } catch (err) {
        console.error('[DEBUG ERROR] startLevel failed:', err.message);
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    nextClue: async () => {
      if (!state.session) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const clueData = await adventureApi.fetchNextClue(state.session.sessionId);
        dispatch({ type: 'UPDATE_CLUE', payload: clueData });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    getHint: async () => {
      if (!state.session) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const hintData = await adventureApi.fetchHint(state.session.sessionId);
        dispatch({ type: 'SET_HINT', payload: hintData.hint });
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    },

    submitGuess: async (guessConceptId) => {
      if (!state.session) return;
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const res = await adventureApi.submitGuess(state.session.sessionId, guessConceptId);
        if (res.correct) {
          dispatch({ type: 'HANDLE_GUESS_WIN', payload: res });
        } else if (res.ended) {
          dispatch({ type: 'HANDLE_GUESS_LOSS', payload: res });
        } else {
          dispatch({ type: 'SET_GUESS_MODAL', payload: false });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: err.message });
      }
    }
  };

  return (
    <AdventureContext.Provider value={value}>
      {children}
    </AdventureContext.Provider>
  );
}

export function useAdventure() {
  const context = useContext(AdventureContext);
  if (!context) {
    throw new Error('useAdventure must be used within an AdventureProvider');
  }
  return context;
}
