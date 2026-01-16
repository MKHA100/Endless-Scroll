# 🌌 Endless Scroll - Infinite Space Experience

An immersive, interactive space exploration experience built with Three.js. Drift through an infinite, scientifically accurate universe with realistic star colors, physics, and stunning visual effects.

![Endless Space Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Three.js](https://img.shields.io/badge/Three.js-v0.160.0-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## ✨ Features

### 🚀 **Bidirectional Movement**
- **Scroll forward**: Stars flow backward past you
- **Scroll backward**: Stars flow forward past you  
- **Acceleration/Deceleration**: Natural physics with auto-stop after 3 seconds
- **Smooth inertia**: Realistic momentum and drift

### 🌟 **Multi-Layer Star System**
- **4 depth layers** with realistic parallax effects
- **Harvard Spectral Classification** - scientifically accurate star colors
- **Circular star rendering** - beautiful glowing stars (no squares!)
- **Fewer but bigger stars** - optimized for performance and visual impact

### 💫 **Massive Star Events**
- **Random massive stars** pass through screen center every 20-30 seconds
- **Dramatic close-ups** - up to 25x normal star size
- **Center-crossing trajectories** - horizontal and vertical paths
- **True 3D immersion** - stars flow through the center of your screen

### 🎨 **Visual Effects**
- **Bloom post-processing** - stars glow realistically
- **True space black** background (#000000)
- **Fullscreen support** - press **F** to toggle
- **Responsive design** - works on all screen sizes

## 🎮 Controls

| Input | Action |
|-------|--------|
| **Mouse wheel** / **Trackpad** | Navigate through space |
| **Scroll down** | Move forward |
| **Scroll up** | Move backward |
| **F key** | Toggle fullscreen |
| **Stop scrolling** | Auto-decelerate and stop after 3 seconds |

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/endless-scroll.git

# Navigate to project directory
cd endless-scroll

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🔧 Technology Stack

- **Three.js** - 3D graphics and WebGL rendering
- **Vite** - Fast development server and build tool
- **Howler.js** - Spatial audio system
- **JavaScript ES6+** - Modern JavaScript features
- **CSS3** - Styling and animations

## 🌟 Star Classification

The project uses real astronomical data for star colors:

| Stellar Class | Color | Temperature | Rarity |
|---------------|-------|-------------|---------|
| **O-type** | Blue (#9BB0FF) | >30,000K | Very rare (0.5%) |
| **B-type** | Blue-white (#AAC8FF) | 10,000-30,000K | Rare (2%) |
| **A-type** | White (#CAD7FF) | 7,500-10,000K | Uncommon (5%) |
| **F-type** | White (#F8F7FF) | 6,000-7,500K | Less common (8%) |
| **G-type** | Yellow-white (#FFF4EA) | 5,200-6,000K | Common (15%) |
| **K-type** | Orange (#FFD2A1) | 3,700-5,200K | Common (25%) |
| **M-type** | Red (#FFCC6F) | <3,700K | Most common (44.5%) |

## ⚙️ Configuration

Customize the experience in `src/config.js`:

```javascript
// Star layers (count and sizes)
layers: {
  background: { count: 2000, sizeRange: [0.8, 2.5] },
  distant: { count: 800, sizeRange: [1.5, 4.0] },
  midField: { count: 200, sizeRange: [3.0, 8.0] },
  near: { count: 30, sizeRange: [6.0, 15.0] }
}

// Movement physics
movement: {
  acceleration: 2.5,      // Speed-up rate
  deceleration: 0.85,     // Slow-down rate
  autoStopDelay: 3.0,     // Seconds before auto-stop
  maxSpeed: 4.0           // Maximum speed
}

// Massive star events
events: {
  massiveStarInterval: [20, 30],  // Seconds between events
  massiveStarChance: 0.3          // 30% chance when scrolling
}
```

## 📁 Project Structure

```
src/
├── main.js              # Application entry point
├── config.js            # Configuration settings
├── core/                # Core systems
│   ├── Scene.js         # Three.js scene setup
│   ├── PostProcessing.js # Visual effects
│   └── Clock.js         # Time management
├── controls/            # User input
│   └── DriftController.js # Movement physics
├── world/               # 3D environment
│   ├── StarLayers.js    # Multi-layer star system
│   ├── PassingStar.js   # Massive star events
│   └── ChunkManager.js  # Infinite world generation
├── audio/               # Sound system
│   └── AudioManager.js  # Spatial audio
└── utils/               # Helper functions
    ├── math.js          # Mathematical utilities
    └── SeededRandom.js  # Deterministic randomization
```

## 🎯 Performance

Optimized for smooth 60fps experience:

- **~3,000 total stars** (reduced from 6,000)
- **Bigger individual stars** for visual impact
- **Efficient parallax calculations** with update frequency control
- **Background stars never update** (static backdrop)
- **Deterministic generation** prevents memory leaks

## 🚀 Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Visual Showcase

### Core Experience
- ✨ **Infinite scrolling** in any direction
- 🌟 **Scientifically accurate** star colors and distribution
- 🚀 **Smooth physics** with acceleration and deceleration
- 💫 **Dramatic star encounters** passing through screen center

### Technical Achievements
- 🎯 **Deterministic world generation** - same seed = same stars
- 🔄 **Infinite wrapping** - seamless boundary crossing
- 📐 **Multi-layer parallax** - convincing depth perception
- 🎮 **Responsive controls** - natural trackpad/mouse interaction

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **Harvard-Smithsonian Center for Astrophysics** - Stellar classification data
- **Three.js Community** - 3D graphics framework
- **Vite Team** - Lightning-fast development tools
- **WebGL Specification** - Hardware-accelerated graphics

---

**🌌 Experience the infinite cosmos - scroll to explore! 🌌**

[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue)](https://pages.github.com/)
[![Three.js](https://img.shields.io/badge/Built%20with-Three.js-black)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Powered%20by-Vite-646CFF)](https://vitejs.dev/)