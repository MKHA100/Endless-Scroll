import { SceneManager } from "./core/Scene.js";
import { PostProcessingManager } from "./core/PostProcessing.js";
import { ClockManager } from "./core/Clock.js";
import { DriftController } from "./controls/DriftController.js";
import { DevPanel } from "./controls/DevPanel.js";
import { StarLayers } from "./world/StarLayers.js";
import { PassingStar } from "./world/PassingStar.js";
import { ChunkManager } from "./world/ChunkManager.js";
import { AudioManager } from "./audio/AudioManager.js";
import { CONFIG } from "./config.js";

class EndlessScrollApp {
  constructor() {
    this.scene = null;
    this.postProcessing = null;
    this.clock = null;
    this.driftController = null;
    this.devPanel = null;
    this.audioManager = null;

    // World objects
    this.starLayers = null;
    this.passingStar = null;
    this.chunkManager = null;

    // State
    this.isRunning = false;
    this.hasStarted = false;

    this.init();
  }

  async init() {
    console.log("Initializing Endless Scroll experience...");

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
      this.driftController.activate(); // Auto-activate for testing

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

      // Set up fullscreen support
      this.setupFullscreen();

      // Set up entry experience
      this.setupEntry();

      // Start render loop
      this.start();

      console.log("Endless Scroll initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Endless Scroll:", error);
    }
  }

  async initWorld() {
    // Initialize star layer system
    this.starLayers = new StarLayers(this.scene.scene);
    await this.starLayers.init();
    console.log("StarLayers initialized with multi-layer system");

    // Initialize passing star events
    this.passingStar = new PassingStar(this.scene.scene);
    console.log("PassingStar events initialized");

    // Initialize chunk manager
    this.chunkManager = new ChunkManager();
    console.log("ChunkManager initialized");

    console.log("World objects created");
    console.log("Camera position:", this.scene.camera.position);
    console.log("Scene children:", this.scene.scene.children.length);
  }

  setupFullscreen() {
    // Fullscreen toggle with F key
    document.addEventListener("keydown", (event) => {
      if (event.key === "f" || event.key === "F") {
        this.toggleFullscreen();
      }
    });
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement
        .requestFullscreen()
        .then(() => {
          console.log("Entered fullscreen mode");
        })
        .catch((err) => {
          console.warn("Could not enter fullscreen:", err);
        });
    } else {
      // Exit fullscreen
      document
        .exitFullscreen()
        .then(() => {
          console.log("Exited fullscreen mode");
        })
        .catch((err) => {
          console.warn("Could not exit fullscreen:", err);
        });
    }
  }

  setupEntry() {
    const overlay = document.getElementById("overlay");

    // Wait for first user interaction
    const startExperience = async () => {
      if (this.hasStarted) return;
      this.hasStarted = true;

      console.log("Starting experience...");

      // Initialize and start audio
      await this.audioManager.init();
      this.audioManager.startAmbient();

      // Activate controls
      this.driftController.activate();

      // Fade out overlay
      overlay.classList.add("fade-out");

      // Remove overlay after fade
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, CONFIG.entry.fadeDuration);

      // Remove event listeners
      document.removeEventListener("click", startExperience);
      document.removeEventListener("wheel", startExperience);
      document.removeEventListener("keydown", startExperience);

      console.log("Experience started");
    };

    // Listen for user interaction
    document.addEventListener("click", startExperience);
    document.addEventListener("wheel", startExperience);
    document.addEventListener("keydown", startExperience);
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
    const velocity = this.driftController
      ? this.driftController.getVelocity()
      : { x: 0, y: 0, z: 0 };

    // Update star layers with parallax
    if (this.starLayers) {
      this.starLayers.update(cameraPosition, velocity, deltaTime);
    }

    // Update passing star events
    if (this.passingStar) {
      this.passingStar.update(deltaTime);
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
    if (this.starLayers) this.starLayers.dispose();
    if (this.passingStar) this.passingStar.dispose();

    // Dispose audio
    if (this.audioManager) this.audioManager.dispose();

    console.log("Endless Scroll disposed");
  }
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new EndlessScrollApp();
  });
} else {
  new EndlessScrollApp();
}

// Handle window resize
window.addEventListener("resize", () => {
  // The scene manager handles its own resize
});

// Prevent context menu on right click
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// Prevent default scroll behavior
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);
