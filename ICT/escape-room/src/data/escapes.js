import tiffinBoxEscape from './tiffin-box.js';
import scienceFairEscape from './science-fair.js';
import librarySecretEscape from './library-secret.js';

export const ESCAPES = [tiffinBoxEscape, scienceFairEscape, librarySecretEscape];

export function getEscapeById(escapeId) {
  return ESCAPES.find((story) => story.id === escapeId) || null;
}

export function getNextDifficultyEscape(currentEscapeId) {
  const index = ESCAPES.findIndex((story) => story.id === currentEscapeId);
  if (index === -1 || index >= ESCAPES.length - 1) return null;
  return ESCAPES[index + 1];
}

export default ESCAPES;