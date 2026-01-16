import { SceneManager } from './core/Scene.js';
import { PostProcessingManager } from './core/PostProcessing.js';
import { ClockManager } from './core/Clock.js';
import { DriftController } from './controls/DriftController.js';
import { DevPanel } from './controls/DevPanel.js';
import { StarField } from './world/StarField.js';
import { BackgroundGalaxies } from './world/BackgroundGalaxies.js';
import { ChunkManager } from './world/ChunkManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { CONFIG } from './config.js';

class EndlessScrollApp {
  constructor() {
    this.scene = null;
    this.postProcessing = null;
    this.clock = null;
    this.driftController = null;
    this.devPanel = null;
    this.audioManager = null;
    
    // World objects
    this.starField = null;
    this.backgroundGalaxies = null;
    this.chunkManager = null;
    
    // State
    this.isRunning = false;
    this.hasStarted = false;
    
    this.init();
  }
  
  async init() {
    console.log('Initializing Endless Scroll experience...');
    
    try {
      // Initialize core systems
      this.scene = new SceneManager();
      this.postProcessing = new PostProcessingManager(
        this.scene.renderer, 
        this.scene.scene, 
        this.scene.camera
      );
      this.clock = new ClockManager();
      
      // Initialize controls
      this.driftController = new DriftController(this.scene.camera);
      
      // Initialize audio (will wait for user interaction)
      this.audioManager = new AudioManager();
      
      // Initialize world
      await this.initWorld();
      
      // Initialize dev panel
      this.devPanel = new DevPanel(
        this.driftController, 
        this.postProcessing, 
        this.audioManager
      );
      
      // Set up entry experience
      this.setupEntry();
      
      // Start render loop
      this.start();
      
      console.log('Endless Scroll initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Endless Scroll:', error);
    }
  }
  
  async initWorld() {
    // Create starfield
    this.starField = new StarField();
    this.scene.add(this.starField.getMesh());
    
    // Create background galaxies
    this.backgroundGalaxies = new BackgroundGalaxies();
    await this.backgroundGalaxies.init();
    this.scene.add(this.backgroundGalaxies.getGroup());
    
    // Initialize chunk manager
    this.chunkManager = new ChunkManager();
    
    console.log('World objects created');
  }
  
  setupEntry() {
    const overlay = document.getElementById('overlay');
    
    // Wait for first user interaction
    const startExperience = async () => {
      if (this.hasStarted) return;
      this.hasStarted = true;
      
      console.log('Starting experience...');
      
      // Initialize and start audio
      await this.audioManager.init();
      this.audioManager.startAmbient();
      
      // Activate controls
      this.driftController.activate();
      
      // Fade out overlay
      overlay.classList.add('fade-out');
      
      // Remove overlay after fade
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, CONFIG.entry.fadeDuration);
      
      // Remove event listeners
      document.removeEventListener('click', startExperience);
      document.removeEventListener('wheel', startExperience);
      document.removeEventListener('keydown', startExperience);
      
      console.log('Experience started');
    };
    
    // Listen for user interaction
    document.addEventListener('click', startExperience);
    document.addEventListener('wheel', startExperience);
    document.addEventListener('keydown', startExperience);
  }
  
  start() {
    this.isRunning = true;
    this.animate();
  }
  
  stop() {
    this.isRunning = false;
  }
  
  animate() {
    if (!this.isRunning) return;
    
    requestAnimationFrame(() => this.animate());
    
    // Update clock
    this.clock.update();
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update controls
    if (this.driftController) {
      this.driftController.update(deltaTime);
    }
    
    // Update world
    this.updateWorld(deltaTime);
    
    // Update audio based on movement
    if (this.audioManager && this.driftController) {
      const velocity = this.driftController.getVelocityMagnitude();
      this.audioManager.updateVelocity(velocity);
    }
    
    // Render
    this.render();
  }
  
  updateWorld(deltaTime) {
    const cameraPosition = this.scene.camera.position;
    
    // Update starfield
    if (this.starField) {
      this.starField.update(cameraPosition, deltaTime);
    }
    
    // Update background galaxies
    if (this.backgroundGalaxies) {
      this.backgroundGalaxies.update(deltaTime);
    }
    
    // Update chunk manager
    if (this.chunkManager) {
      this.chunkManager.update(cameraPosition);
    }
  }
  
  render() {
    // Use post-processing render instead of direct scene render
    this.postProcessing.render();
  }
  
  // Handle window resize
  handleResize() {
    if (this.postProcessing) {
      this.postProcessing.resize(window.innerWidth, window.innerHeight);
    }
  }
  
  dispose() {
    this.stop();
    
    // Dispose world objects
    if (this.starField) this.starField.dispose();
    if (this.backgroundGalaxies) this.backgroundGalaxies.dispose();
    
    // Dispose audio
    if (this.audioManager) this.audioManager.dispose();
    
    console.log('Endless Scroll disposed');
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EndlessScrollApp();
  });
} else {
  new EndlessScrollApp();
}

// Handle window resize
window.addEventListener('resize', () => {
  // The scene manager handles its own resize
});

// Prevent context menu on right click
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// Prevent default scroll behavior
window.addEventListener('wheel', (e) => {
  e.preventDefault();
}, { passive: false });