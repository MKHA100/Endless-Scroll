export const CONFIG = {
  // Space appearance
  space: {
    backgroundColor: "#000000",
  },

  // Multi-layer star system
  stars: {
    layers: {
      background: {
        count: 2000,  // Reduced from 4000
        sizeRange: [0.8, 2.5], // Increased from [0.3, 1.0]
        parallax: 0,
        updateFrequency: 0, // never updated
      },
      distant: {
        count: 800,   // Reduced from 1500 
        sizeRange: [1.5, 4.0], // Increased from [0.8, 1.8]
        parallax: 0.05,
        updateFrequency: 10,
      },
      midField: {
        count: 200,   // Reduced from 400
        sizeRange: [3.0, 8.0], // Increased from [1.5, 3.5]
        parallax: 0.25,
        updateFrequency: 2,
      },
      near: {
        count: 30,    // Reduced from 50
        sizeRange: [6.0, 15.0], // Increased from [3.0, 8.0]
        parallax: 1.0,
        updateFrequency: 1,
        glow: true,
      },
    },
    // Realistic stellar colors (Harvard spectral classification)
    colors: {
      O: "#9BB0FF", // Hot blue
      B: "#AAC8FF", // Blue-white
      A: "#CAD7FF", // White with blue tint
      F: "#F8F7FF", // Pure white
      G: "#FFF4EA", // Yellow-white (Sun-like)
      K: "#FFD2A1", // Warm orange
      M: "#FFCC6F", // Dim red-orange
    },
    // Color distribution (Harvard classification percentages)
    colorWeights: {
      O: 0.005, // Very rare
      B: 0.02, // Rare
      A: 0.05, // Uncommon
      F: 0.08, // Less common
      G: 0.15, // Common (Sun-like)
      K: 0.25, // Common
      M: 0.445, // Most common (but dim)
    },
    fieldSize: 3000,
  },

  // Movement physics
  movement: {
    baseSpeed: 0.8, // Slower, more meditative
    maxSpeed: 4.0, // Top speed when scrolling
    sensitivity: 0.4, // Reduced from 0.5
    driftDamping: 0.96, // Higher = more floaty
    inertia: 0.98, // Maintains momentum longer
    maxDriftAngle: 0.2, // Reduced banking
    // New acceleration physics
    acceleration: 2.5, // How fast to speed up
    deceleration: 0.85, // How fast to slow down (0.85 = loses 15% speed per second)
    minSpeed: 0.01, // Below this, movement stops completely
    autoStopDelay: 3.0, // Seconds without input before starting to slow down
  },

  // Passing star events
  events: {
    passingStarInterval: [45, 90], // seconds between events
    passingStarDuration: [3, 6], // how long event lasts
    enabled: true,
    // Massive stars that pass through center
    massiveStarInterval: [20, 30], // seconds between massive stars
    massiveStarChance: 0.3, // 30% chance when scrolling
  },

  // Atmospheric elements
  atmosphere: {
    milkyWay: {
      enabled: true,
      opacity: 0.06,
      width: 60, // degrees
    },
    nebulae: {
      enabled: false, // optional feature
    },
  },

  // Visual effects
  bloom: {
    strength: 0.3,
    radius: 0.4,
    threshold: 0.85,
  },

  // World generation
  chunks: {
    size: 1000, // Larger chunks
    renderDistance: 3,
    starDensityVariation: true,
  },

  // Encounter chances (per chunk)
  encounters: {
    blackHoleChance: 0.001, // Very rare
    asteroidChance: 0.01, // Rare
    shipChance: 0.005, // Very rare
  },

  // Audio
  audio: {
    masterVolume: 0.7,
    ambientVolume: 0.3,
    encounterVolume: 0.5,
  },

  // Entry animation
  entry: {
    fadeDuration: 3000,
    text: "Click to enter the cosmos",
  },

  // Performance
  performance: {
    maxPixelRatio: 2,
    targetFPS: 60,
  },

  // Legacy compatibility (for dev panel)
  scroll: {
    sensitivity: 0.4,
    driftDamping: 0.96,
    forwardSpeed: 0.8,
    maxDriftAngle: 0.2,
    boostMultiplier: 2.0,
  },
};
