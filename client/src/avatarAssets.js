/**
 * Avatar image manifest
 * ═════════════════════
 * Bridges the hand-drawn SVG avatars and the generated illustration set.
 *
 * Drop a PNG into `assets/avatars/<character>/<face>.png` and it is picked up
 * automatically — the glob below is resolved at build time, so there is no list
 * to keep in sync and no code change when the remaining faces arrive. Any face
 * without an image keeps rendering its SVG, which is what makes a part-finished
 * set usable: the seven that exist today are illustrated, the rest degrade
 * quietly instead of showing a gap.
 *
 * Tenali may also be given per-skin art at `assets/avatars/tenali/<skin>/<face>.png`;
 * that wins over the skin-less file when present. Without it, one illustration
 * serves every skin, since a PNG cannot be recoloured the way the SVG is.
 */

const tenaliFiles = import.meta.glob('./assets/avatars/**/tenali/**/*.{png,webp}', {
  eager: true,
  import: 'default'
});
const studentFiles = import.meta.glob('./assets/avatars/**/student/**/*.{png,webp}', {
  eager: true,
  import: 'default'
});

function buildLookup(files, character) {
  const lookup = {};
  for (const [path, url] of Object.entries(files)) {
    const regex = new RegExp(`/${character}/(.+)\\.(png|webp)$`, 'i');
    const match = path.match(regex);
    if (match) {
      const key = match[1].toLowerCase();
      lookup[key] = url;
    }
  }
  return lookup;
}

const TENALI_IMAGES = buildLookup(tenaliFiles, 'tenali');
const STUDENT_IMAGES = buildLookup(studentFiles, 'student');

/** The 14 faces TenaliAvatar actually draws. */
export const TENALI_FACES = [
  'neutral', 'thinking', 'confident', 'gamble', 'victory', 'loss', 'cheated',
  'closed-eyes', 'writing', 'hinting', 'smirk', 'confused', 'shocked', 'proud'
];

/**
 * Every expression string the app passes in, mapped onto those 14. Anything
 * unlisted falls back to 'neutral' — which is also the safety net that used to
 * silently swallow typos like 'cheering'.
 */
const TENALI_ALIASES = {
  celebrating: 'victory',
  cheering: 'victory',
  happy: 'neutral',
  recalculating: 'smirk',
  talking: 'smirk',
  encouraging: 'confused',
  impressed: 'proud'
};

const TENALI_FACE_SET = new Set(TENALI_FACES);

/** Resolve any incoming Tenali expression name to one of the 14 faces. */
export function resolveTenaliFace(expression) {
  const key = String(expression || '').toLowerCase();
  if (TENALI_FACE_SET.has(key)) return key;
  return TENALI_ALIASES[key] || 'neutral';
}

/**
 * Nearest illustrated stand-in for a face that has no art of its own, tried in
 * order. Tenali and the student sit side by side in the same frame, so a drawn
 * portrait next to a flat SVG one reads as broken far more than a slightly
 * approximate expression does — better a close face in the right style than an
 * exact face in the wrong one.
 *
 * Every chain ends at the resting face, so once that one image exists the
 * character is never mixed-media. Delete an entry to send that face back to its
 * SVG instead.
 */
const TENALI_FALLBACKS = {
  smirk: ['confident', 'neutral'],        // the resting "talking" face
  writing: ['thinking', 'neutral'],
  confused: ['thinking', 'neutral'],
  cheated: ['thinking', 'confident', 'neutral'],
  gamble: ['confident', 'victory', 'neutral'],
  shocked: ['victory', 'neutral'],
  'closed-eyes': ['proud', 'neutral'],
  thinking: ['neutral'],
  confident: ['neutral'],
  victory: ['proud', 'neutral'],
  proud: ['victory', 'neutral'],
  loss: ['neutral'],
  hinting: ['confident', 'neutral']
};

const STUDENT_FALLBACKS = {
  confident: ['triumphant', 'attentive'],
  puzzled: ['pondering', 'attentive'],
  nervous: ['dejected', 'attentive'],
  suspicious: ['pondering', 'attentive'],
  delighted: ['triumphant', 'attentive'],
  determined: ['attentive'],
  blinking: ['attentive'],
  noting: ['attentive'],
  curious: ['amazed', 'attentive'],
  amazed: ['curious', 'attentive'],
  pondering: ['attentive'],
  triumphant: ['attentive'],
  dejected: ['attentive']
};

/** First available image for `face`, walking its fallback chain. */
function pickImage(images, face, fallbacks, skinPrefix) {
  for (const candidate of [face, ...(fallbacks[face] || [])]) {
    if (skinPrefix) {
      const skinned = images[`${skinPrefix}/${candidate}`];
      if (skinned) return skinned;
    }
    if (images[candidate]) return images[candidate];
  }
  return null;
}

/** Illustration URL for a Tenali face, or null when only the SVG exists. */
export function getTenaliImage(face, skin) {
  const normalisedSkin = String(skin || '').toLowerCase();
  const skinPrefix = normalisedSkin && normalisedSkin !== 'classic' ? normalisedSkin : null;
  return pickImage(TENALI_IMAGES, face, TENALI_FALLBACKS, skinPrefix);
}

/** Illustration URL for a student face, or null when only the SVG exists. */
export function getStudentImage(face) {
  return pickImage(STUDENT_IMAGES, face, STUDENT_FALLBACKS, null);
}
