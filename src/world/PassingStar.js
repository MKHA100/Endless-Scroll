import {
  Sprite,
  SpriteMaterial,
  CanvasTexture,
  AdditiveBlending,
  Vector3,
} from "three";
import { CONFIG } from "../config.js";
import { SeededRandom } from "../utils/SeededRandom.js";

export class PassingStar {
  constructor(scene) {
    this.scene = scene;
    this.isActive = false;
    this.sprite = null;
    this.startTime = 0;
    this.duration = 0;

    // Initialize RNG first
    this.rng = new SeededRandom(Date.now());

    // Event timing
    this.lastEventTime = 0;
    this.nextEventIn = this.getRandomInterval();
    // Massive star timing
    this.lastMassiveStarTime = 0;
    this.nextMassiveStarIn = this.getMassiveStarInterval();

    // Animation properties
    this.startPosition = new Vector3();
    this.endPosition = new Vector3();
    this.startSize = 1;
    this.peakSize = 8;
    this.endSize = 0.5;
  }

  update(deltaTime) {
    const currentTime = Date.now() / 1000;

    // Check for regular passing star events
    if (!this.isActive && (currentTime - this.lastEventTime) > this.nextEventIn) {
      this.startEvent();
    }
    
    // Check for massive star events (when scrolling)
    if (!this.isActive && (currentTime - this.lastMassiveStarTime) > this.nextMassiveStarIn) {
      if (Math.random() < CONFIG.events.massiveStarChance) {
        this.startMassiveStarEvent();
      }
      this.lastMassiveStarTime = currentTime;
      this.nextMassiveStarIn = this.getMassiveStarInterval();
    }

    // Update active event
    if (this.isActive) {
      this.updateEvent(currentTime);

      // Check if event is complete
      if (currentTime - this.startTime > this.duration) {
        this.endEvent();
      }
    }
  }

  startEvent() {
    if (!CONFIG.events?.enabled) return;

    console.log("Starting passing star event");

    this.isActive = true;
    this.startTime = Date.now() / 1000;
    this.duration = this.rng.range(
      CONFIG.events.passingStarDuration[0],
      CONFIG.events.passingStarDuration[1]
    );

    // Create star sprite
    this.createStarSprite();

    // Set up trajectory
    this.setupTrajectory();

    // Add to scene
    this.scene.add(this.sprite);

    this.lastEventTime = this.startTime;
    this.nextEventIn = this.getRandomInterval();
  }

  createStarSprite() {
    // Create a glowing star texture
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    // Create radial gradient for glow effect
    const centerX = 32;
    const centerY = 32;
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      32
    );

    // Bright star colors (hot, dramatic stars)
    const starColors = [
      "#9BB0FF", // O type - Blue
      "#AABFFF", // B type - Blue-white
      "#CAD7FF", // A type - White
      "#F8F7FF", // F type - Bright white
    ];

    const selectedColor = this.rng.pick(starColors);

    gradient.addColorStop(0, selectedColor);
    gradient.addColorStop(0.3, selectedColor + "80");
    gradient.addColorStop(0.7, selectedColor + "20");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    // Add bright center point
    ctx.fillStyle = selectedColor;
    ctx.fillRect(30, 30, 4, 4);

    const texture = new CanvasTexture(canvas);

    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
    });

    this.sprite = new Sprite(material);
  }

  setupTrajectory() {
    const distance = 800;
    const sideOffset = this.rng.range(-200, 200);
    const verticalOffset = this.rng.range(-100, 100);

    // Start position (ahead and to the side)
    this.startPosition.set(sideOffset, verticalOffset, -distance);

    // End position (behind camera)
    this.endPosition.set(
      -sideOffset * 0.5,
      -verticalOffset * 0.3,
      distance * 0.5
    );

    // Set initial position and size
    this.sprite.position.copy(this.startPosition);
    this.sprite.scale.setScalar(this.startSize);
  }

  updateEvent(currentTime) {
    if (!this.sprite) return;

    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);

    // Ease-in-out progress for smooth animation
    const easeProgress = this.easeInOutCubic(progress);

    // Update position along trajectory
    this.sprite.position.lerpVectors(
      this.startPosition,
      this.endPosition,
      easeProgress
    );

    // Update size with dramatic curve
    let size;
    if (progress < 0.7) {
      // Growing phase
      const growProgress = progress / 0.7;
      size = this.startSize + (this.peakSize - this.startSize) * growProgress;
    } else {
      // Shrinking phase
      const shrinkProgress = (progress - 0.7) / 0.3;
      size = this.peakSize + (this.endSize - this.peakSize) * shrinkProgress;
    }

    this.sprite.scale.setScalar(size);

    // Update opacity
    let opacity;
    if (progress < 0.1) {
      opacity = progress / 0.1;
    } else if (progress > 0.9) {
      opacity = (1 - progress) / 0.1;
    } else {
      opacity = 1;
    }

    this.sprite.material.opacity = opacity;
  }

  endEvent() {
    console.log("Ending passing star event");

    if (this.sprite) {
      this.scene.remove(this.sprite);

      if (this.sprite.material.map) {
        this.sprite.material.map.dispose();
      }
      this.sprite.material.dispose();

      this.sprite = null;
    }

    this.isActive = false;
  }

  getRandomInterval() {
    return this.rng.range(
      CONFIG.events?.passingStarInterval?.[0] || 30,
      CONFIG.events?.passingStarInterval?.[1] || 60
    );
  }
  
  getMassiveStarInterval() {
    return this.rng.range(
      CONFIG.events?.massiveStarInterval?.[0] || 20,
      CONFIG.events?.massiveStarInterval?.[1] || 30
    );
  }
  
  startMassiveStarEvent() {
    console.log('Starting MASSIVE star event');
    
    this.isActive = true;
    this.startTime = Date.now() / 1000;
    this.duration = this.rng.range(4, 8); // Longer duration for massive stars
    
    // Create massive star sprite
    this.createMassiveStarSprite();
    
    // Set up center-passing trajectory
    this.setupCenterTrajectory();
    
    // Add to scene
    this.scene.add(this.sprite);
    
    this.lastEventTime = this.startTime;
    this.nextEventIn = this.getRandomInterval();
  }
  
  createMassiveStarSprite() {
    // Create an even larger glowing star texture
    const canvas = document.createElement('canvas');
    canvas.width = 128; // Bigger canvas
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    const centerX = 64;
    const centerY = 64;
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 64
    );
    
    // Bright hot star color
    const color = '#AABFFF'; // Bright blue-white
    
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.2, color + 'CC');
    gradient.addColorStop(0.5, color + '60');
    gradient.addColorStop(0.8, color + '20');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    
    // Add bright center
    ctx.fillStyle = color;
    ctx.fillRect(60, 60, 8, 8);
    
    const texture = new CanvasTexture(canvas);
    
    const material = new SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending
    });
    
    this.sprite = new Sprite(material);
    this.startSize = 2;
    this.peakSize = 25; // Much bigger!
    this.endSize = 1;
  }
  
  setupCenterTrajectory() {
    const distance = 1000;
    
    // Random approach - but always passes through or very close to center
    const side = this.rng.random() < 0.5 ? -1 : 1;
    const centerOffset = this.rng.range(-50, 50); // Small offset from exact center
    
    if (this.rng.random() < 0.5) {
      // Horizontal crossing
      this.startPosition.set(-distance * side, centerOffset, centerOffset * 0.3);
      this.endPosition.set(distance * side, -centerOffset * 0.5, -centerOffset * 0.2);
    } else {
      // Vertical crossing  
      this.startPosition.set(centerOffset, -distance * side, centerOffset * 0.3);
      this.endPosition.set(-centerOffset * 0.5, distance * side, -centerOffset * 0.2);
    }
    
    this.sprite.position.copy(this.startPosition);
    this.sprite.scale.setScalar(this.startSize);
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  dispose() {
    if (this.sprite && this.sprite.parent) {
      this.sprite.parent.remove(this.sprite);
    }

    if (this.sprite) {
      if (this.sprite.material.map) {
        this.sprite.material.map.dispose();
      }
      this.sprite.material.dispose();
      this.sprite = null;
    }

    this.isActive = false;
  }
}
