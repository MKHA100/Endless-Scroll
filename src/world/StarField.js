import { Points, PointsMaterial, BufferGeometry, Float32BufferAttribute, Color } from 'three';
import { CONFIG } from '../config.js';
import { SeededRandom } from '../utils/SeededRandom.js';

export class StarField {
  constructor() {
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    
    this.positions = null;
    this.colors = null;
    this.sizes = null;
    this.brightness = null;
    
    this.init();
  }
  
  init() {
    const count = CONFIG.stars.count;
    const fieldSize = CONFIG.stars.fieldSize;
    
    // Create attribute arrays
    this.positions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.sizes = new Float32Array(count);
    this.brightness = new Float32Array(count);
    
    const rng = new SeededRandom(42);
    
    for (let i = 0; i < count; i++) {
      // Position in large cube
      this.positions[i * 3] = (rng.random() - 0.5) * fieldSize;
      this.positions[i * 3 + 1] = (rng.random() - 0.5) * fieldSize;
      this.positions[i * 3 + 2] = (rng.random() - 0.5) * fieldSize;
      
      // Star color variations (warm white to blue)
      const temperature = rng.random();
      if (temperature < 0.3) {
        // Blue stars (hot)
        this.colors[i * 3] = 0.7 + rng.random() * 0.2;
        this.colors[i * 3 + 1] = 0.8 + rng.random() * 0.2;
        this.colors[i * 3 + 2] = 1.0;
      } else if (temperature < 0.8) {
        // White/yellow stars
        this.colors[i * 3] = 0.9 + rng.random() * 0.1;
        this.colors[i * 3 + 1] = 0.9 + rng.random() * 0.1;
        this.colors[i * 3 + 2] = 0.8 + rng.random() * 0.2;
      } else {
        // Red stars (cool)
        this.colors[i * 3] = 1.0;
        this.colors[i * 3 + 1] = 0.6 + rng.random() * 0.3;
        this.colors[i * 3 + 2] = 0.4 + rng.random() * 0.3;
      }
      
      // Star size variation
      this.sizes[i] = 0.5 + rng.random() * 3.0;
      
      // Brightness for twinkling
      this.brightness[i] = 0.7 + rng.random() * 0.3;
    }
    
    // Create geometry
    this.geometry = new BufferGeometry();
    this.geometry.setAttribute('position', new Float32BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new Float32BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new Float32BufferAttribute(this.sizes, 1));
    
    // Create material
    this.material = new PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: 1 // AdditiveBlending for glow
    });
    
    // Create mesh
    this.mesh = new Points(this.geometry, this.material);
  }
  
  update(cameraPosition, deltaTime) {
    const fieldSize = CONFIG.stars.fieldSize;
    const halfField = fieldSize / 2;
    
    // Update star positions to maintain infinite field
    for (let i = 0; i < this.positions.length; i += 3) {
      // Check if star is behind camera
      if (this.positions[i + 2] > cameraPosition.z + halfField) {
        this.positions[i + 2] -= fieldSize;
      }
      // Check if star is too far ahead
      if (this.positions[i + 2] < cameraPosition.z - halfField) {
        this.positions[i + 2] += fieldSize;
      }
      
      // Same for X and Y axes
      if (this.positions[i] > cameraPosition.x + halfField) {
        this.positions[i] -= fieldSize;
      }
      if (this.positions[i] < cameraPosition.x - halfField) {
        this.positions[i] += fieldSize;
      }
      
      if (this.positions[i + 1] > cameraPosition.y + halfField) {
        this.positions[i + 1] -= fieldSize;
      }
      if (this.positions[i + 1] < cameraPosition.y - halfField) {
        this.positions[i + 1] += fieldSize;
      }
    }
    
    // Update twinkling effect
    if (CONFIG.stars.twinkleSpeed > 0) {
      const time = Date.now() * 0.001;
      for (let i = 0; i < this.brightness.length; i++) {
        const twinkle = Math.sin(time * CONFIG.stars.twinkleSpeed + i * 0.1) * 0.2 + 0.8;
        // Apply twinkle to alpha (would need custom shader for this)
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
  }
  
  getMesh() {
    return this.mesh;
  }
  
  dispose() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}