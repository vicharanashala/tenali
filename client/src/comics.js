/**
 * Comic Character Word Problems & Cliffhanger Content
 * 
 * Defines the recurring cast and their comic panels for each topic.
 * Topics use the same keys as modeMap in App.jsx.
 */

// Define our recurring cast
export const COMIC_CAST = {
  nira: {
    name: 'Detective Nira',
    avatar: '🕵️‍♀️',
    theme: 'mystery',
    tagline: 'Solving the unsolvable, one equation at a time.'
  },
  cosmos: {
    name: 'Captain Cosmos',
    avatar: '👨‍🚀',
    theme: 'space',
    tagline: 'Exploring the mathematical limits of the universe.'
  },
  dino: {
    name: 'Professor Rex',
    avatar: '🦖',
    theme: 'jungle',
    tagline: 'Unearthed ancient equations from the Jurassic era.'
  }
}

// Map of topics to their comic panels
const COMICS_BY_TOPIC = {
  pythag: {
    character: 'nira',
    lessonPanel: {
      dialogue: "We've got a tricky case. To find the shortcut across this rectangular park, we need the Pythagorean Theorem!",
      action: "Nira sketches a triangle over a map of the city."
    },
    cliffhangerPanel: {
      dialogue: "Wait... the hypotenuse points directly to the old clock tower. But the tower is missing! We need to follow this trail...",
      action: "Nira shines her flashlight on a piece of paper shaped like a triangle."
    }
  },
  ratios: {
    character: 'cosmos',
    lessonPanel: {
      dialogue: "To jump to lightspeed, the fuel-to-oxygen ratio must be perfectly balanced, or we'll spin out of orbit!",
      action: "Cosmos adjusts dials on the spaceship console."
    },
    cliffhangerPanel: {
      dialogue: "The hyperdrive is locked! The only way to unlock it is to decode the proportional frequency in the next sector...",
      action: "An alarm blares red as Cosmos stares at a flashing screen."
    }
  },
  proportions: {
    character: 'cosmos',
    lessonPanel: {
      dialogue: "We made it! Now we must scale up our shielding proportionally before the meteor shower hits.",
      action: "Cosmos expands a holographic shield diagram."
    },
    cliffhangerPanel: {
      dialogue: "Shields held, but we've drifted into an unknown nebula. The navigation coordinates are scrambled!",
      action: "Cosmos looks out the window at swirling purple gas."
    }
  }
}

/**
 * Returns the comic panels for a given topic key, if they exist.
 */
export function getComicsForTopic(topicKey) {
  return COMICS_BY_TOPIC[topicKey] || null
}

/**
 * Returns the character details for a given character ID.
 */
export function getCharacter(charId) {
  return COMIC_CAST[charId] || null
}
