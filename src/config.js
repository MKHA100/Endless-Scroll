export const CONFIG = {
  // Scroll physics
  scroll: {
    sensitivity: 0.5,
    driftDamping: 0.92,
    forwardSpeed: 2.0,
    maxDriftAngle: 0.3,
    boostMultiplier: 3.0
  },
  
  // Visual
  stars: {
    count: 15000,
    fieldSize: 2000,
    twinkleSpeed: 1.0
  },
  
  bloom: {
    strength: 0.4,
    radius: 0.4,
    threshold: 0.85
  },
  
  // World generation
  chunks: {
    size: 500,
    renderDistance: 3
  },
  
  // Encounters
  encounters: {
    blackHoleChance: 0.0005,
    shipChance: 0.0002,
    asteroidChance: 0.001,
    nebulaChance: 0.001,
    maxActive: 3
  },
  
  // Audio
  audio: {
    masterVolume: 0.7,
    ambientVolume: 0.3,
    encounterVolume: 0.5
  },
  
  // Entry animation
  entry: {
    fadeDuration: 3000,
    initialDriftSpeed: 0.5
  },
  
  // Performance
  performance: {
    maxPixelRatio: 2,
    targetFPS: 60
  }
};