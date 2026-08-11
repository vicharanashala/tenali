import React, { useState, useMemo } from 'react';
import { useAdventure } from '../context/AdventureContext';

export default function GuessModal() {
  const { state, submitGuess, dispatch } = useAdventure();
  const { concepts, levels, session, guessModalOpen, loading } = state;

  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedConceptId, setSelected]    = useState('');

  // Build the concept list scoped to the current world's levels.
  // This stops a 7-year-old from being confronted with 100 options.
  // Falls back to all concepts if world can't be determined.
  const worldConcepts = useMemo(() => {
    if (!session || !levels || levels.length === 0) return concepts;

    const worldId = session.worldId;
    if (!worldId) return concepts;

    // Get conceptIds used in this world
    const worldConceptIds = new Set(
      levels.filter(l => l.worldId === worldId).map(l => l.conceptId)
    );

    const scoped = concepts.filter(c => worldConceptIds.has(c.id));
    return scoped.length > 0 ? scoped : concepts;
  }, [concepts, levels, session]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return worldConcepts;
    return worldConcepts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.subject && c.subject.toLowerCase().includes(q))
    );
  }, [worldConcepts, searchTerm]);

  if (!guessModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedConceptId) submitGuess(selectedConceptId);
  };

  const close = () => {
    dispatch({ type: 'SET_GUESS_MODAL', payload: false });
    setSearchTerm('');
    setSelected('');
  };

  return (
    <div
      className="adv-modal-overlay"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guess-modal-title"
    >
      <div
        className="adv-card adv-guess-modal-card"
        onClick={e => e.stopPropagation()}
      >
        <h3 id="guess-modal-title" className="adv-modal-title">
          What is Tenali thinking of?
        </h3>

        <form onSubmit={handleSubmit} className="adv-guess-form">
          {/* Search box — only useful when there are many options */}
          {worldConcepts.length > 6 && (
            <div className="adv-search-box-wrapper">
              <input
                type="text"
                className="adv-input adv-search-input"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setSelected(''); }}
                autoFocus
                aria-label="Search concept name"
              />
            </div>
          )}

          <div className="adv-concept-results-list" role="listbox">
            {filtered.map(concept => (
              <div
                key={concept.id}
                className={`adv-concept-option ${selectedConceptId === concept.id ? 'selected' : ''}`}
                onClick={() => setSelected(concept.id)}
                role="option"
                aria-selected={selectedConceptId === concept.id}
              >
                <span className="adv-concept-option-name">{concept.name}</span>
                {concept.subject && (
                  <span className="adv-concept-option-sub">{concept.subject}</span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="adv-no-results">No concepts match your search.</div>
            )}
          </div>

          <div className="adv-modal-actions">
            <button type="button" className="adv-btn adv-btn-ghost" onClick={close}>
              Cancel
            </button>
            <button
              type="submit"
              className="adv-btn adv-btn-primary"
              disabled={!selectedConceptId || loading}
            >
              {loading ? 'Checking...' : 'Guess! →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
