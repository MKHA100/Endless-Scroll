import {
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
  Group,
  CanvasTexture,
} from "three";
import { CONFIG } from "../config.js";
import { SeededRandom } from "../utils/SeededRandom.js";

export class StarLayers {
  constructor(scene) {
    this.scene = scene;
    this.group = new Group();
    this.layers = {};
    this.frameCount = 0;
  }

  async init() {
    const layerConfigs = CONFIG.stars.layers;

    // Create each star layer
    Object.entries(layerConfigs).forEach(([layerName, config]) => {
      this.layers[layerName] = this.createStarLayer(layerName, config);
      this.group.add(this.layers[layerName].mesh);
    });

    console.log(
      `StarLayers created with ${Object.keys(this.layers).length} layers`
    );

    // Add the star group to the scene
    this.scene.add(this.group);

    return Promise.resolve();
  }

  createStarLayer(layerName, config) {
    const count = config.count;
    const fieldSize = CONFIG.stars.fieldSize;

    // Create attribute arrays
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const rng = new SeededRandom(this.getLayerSeed(layerName));

    for (let i = 0; i < count; i++) {
      // Position stars in 3D space
      positions[i * 3] = (rng.random() - 0.5) * fieldSize;
      positions[i * 3 + 1] = (rng.random() - 0.5) * fieldSize;

      // Z distribution - ensure stars pass through center (Z=0)
      if (layerName === "background") {
        // Background stars distributed all around, mostly far
        positions[i * 3 + 2] = (rng.random() - 0.5) * fieldSize;
      } else if (layerName === "distant") {
        // Distant stars around camera, some pass center
        positions[i * 3 + 2] = (rng.random() - 0.5) * fieldSize * 0.9;
      } else if (layerName === "midField") {
        // Mid-field stars - more likely to pass through center
        positions[i * 3 + 2] = (rng.random() - 0.5) * fieldSize * 0.7;
      } else if (layerName === "near") {
        // Near stars - guaranteed to pass close to center
        positions[i * 3 + 2] = (rng.random() - 0.5) * fieldSize * 0.3;
      }

      // Assign realistic star color
      const colorData = this.getRealisticStarColor(rng, layerName);
      colors[i * 3] = colorData.r;
      colors[i * 3 + 1] = colorData.g;
      colors[i * 3 + 2] = colorData.b;

      // Size based on layer and stellar class
      const sizeVariation = rng.random();
      const minSize = config.sizeRange[0];
      const maxSize = config.sizeRange[1];
      sizes[i] =
        minSize + (maxSize - minSize) * sizeVariation * colorData.brightness;
    }

    // Create geometry
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1));

    // Create material with circular texture
    const material = new PointsMaterial({
      size: layerName === "near" ? 6 : 3, // Increased sizes
      vertexColors: true,
      transparent: true,
      opacity: layerName === "background" ? 0.8 : 1.0,
      sizeAttenuation: true,
      blending: AdditiveBlending,
      map: this.createCircularTexture(), // Add circular texture
    });

    // Create mesh
    const mesh = new Points(geometry, material);

    return {
      mesh,
      positions,
      colors,
      sizes,
      config,
      lastUpdateFrame: 0,
    };
  }

  getLayerSeed(layerName) {
    const seeds = {
      background: 42,
      distant: 123,
      midField: 456,
      near: 789,
    };
    return seeds[layerName] || 42;
  }

  createCircularTexture() {
    // Create a circular star texture to replace square points
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Create radial gradient for circular glow
    const centerX = 16;
    const centerY = 16;
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 16
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new CanvasTexture(canvas);
    return texture;
  }

  getRealisticStarColor(rng, layerName) {
    const colors = CONFIG.stars.colors;
    const weights = CONFIG.stars.colorWeights;

    // Different color distributions per layer
    let adjustedWeights = { ...weights };

    if (layerName === "near") {
      // Near stars favor brighter, more dramatic colors
      adjustedWeights.O *= 10;
      adjustedWeights.B *= 5;
      adjustedWeights.A *= 3;
      adjustedWeights.M *= 0.5; // Fewer dim red stars visible close
    } else if (layerName === "background") {
      // Background stars favor common, stable colors
      adjustedWeights.G *= 2;
      adjustedWeights.K *= 2;
      adjustedWeights.O *= 0.1;
      adjustedWeights.B *= 0.5;
    }

    // Pick color class based on weighted probabilities
    const rand = rng.random();
    let cumulative = 0;
    let selectedClass = "G"; // fallback

    for (const [className, weight] of Object.entries(adjustedWeights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedClass = className;
        break;
      }
    }

    // Convert hex color to RGB
    const hex = colors[selectedClass];
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // Brightness factor based on stellar class
    const brightnessByClass = {
      O: 1.0, // Very bright
      B: 0.9, // Bright
      A: 0.8, // Moderately bright
      F: 0.7, // Average
      G: 0.6, // Average (Sun-like)
      K: 0.4, // Dim
      M: 0.2, // Very dim
    };

    return {
      r,
      g,
      b,
      brightness: brightnessByClass[selectedClass] || 0.5,
    };
  }

  update(cameraPosition, velocity, deltaTime) {
    this.frameCount++;
    const fieldSize = CONFIG.stars.fieldSize;

    // Update ALL layers - even background needs to follow camera
    Object.entries(this.layers).forEach(([layerName, layer]) => {
      // Background updates every 30 frames, others based on config
      const updateFreq =
        layer.config.updateFrequency === 0 ? 30 : layer.config.updateFrequency;

      if (this.frameCount % updateFreq === 0) {
        this.updateLayer(layer, cameraPosition, fieldSize, layerName);
      }
    });

    // Move the entire star group to follow camera (creates infinite effect)
    this.group.position.x = cameraPosition.x;
    this.group.position.y = cameraPosition.y;
    this.group.position.z = cameraPosition.z;
  }

  updateLayer(layer, cameraPosition, fieldSize, layerName) {
    const positions = layer.positions;
    const parallaxFactor = layer.config.parallax;
    const halfField = fieldSize / 2;

    // Get position attribute from geometry
    const positionAttribute = layer.mesh.geometry.attributes.position;

    for (let i = 0; i < positions.length; i += 3) {
      // Current star position (relative to group, which follows camera)
      let x = positions[i];
      let y = positions[i + 1];
      let z = positions[i + 2];

      // Apply parallax offset - stars with lower parallax move less with camera
      // This creates the depth effect
      const offsetX = -cameraPosition.x * (1 - parallaxFactor);
      const offsetY = -cameraPosition.y * (1 - parallaxFactor);
      const offsetZ = -cameraPosition.z * (1 - parallaxFactor);

      // Calculate apparent position
      const apparentX = x + offsetX;
      const apparentY = y + offsetY;
      const apparentZ = z + offsetZ;

      // Wrap stars that are outside the visible field
      // Use modulo-style wrapping for continuous infinite field
      let needsUpdate = false;

      // Wrap X
      if (apparentX > halfField) {
        positions[i] -= fieldSize;
        needsUpdate = true;
      } else if (apparentX < -halfField) {
        positions[i] += fieldSize;
        needsUpdate = true;
      }

      // Wrap Y
      if (apparentY > halfField) {
        positions[i + 1] -= fieldSize;
        needsUpdate = true;
      } else if (apparentY < -halfField) {
        positions[i + 1] += fieldSize;
        needsUpdate = true;
      }

      // Wrap Z
      if (apparentZ > halfField) {
        positions[i + 2] -= fieldSize;
        needsUpdate = true;
      } else if (apparentZ < -halfField) {
        positions[i + 2] += fieldSize;
        needsUpdate = true;
      }

      // When wrapping, also slightly randomize position for variety
      if (needsUpdate) {
        // Use deterministic seed based on star index and wrap count
        const wrapCount = Math.floor(Math.abs(cameraPosition.z) / fieldSize);
        const seed = (i * 73856093) ^ (wrapCount * 19349663);
        const rng = new SeededRandom(seed);

        // Add small random offset to prevent grid patterns
        positions[i] += (rng.random() - 0.5) * 50;
        positions[i + 1] += (rng.random() - 0.5) * 50;
      }

      // Update the actual geometry attribute
      positionAttribute.setXYZ(
        i / 3,
        positions[i] + offsetX,
        positions[i + 1] + offsetY,
        positions[i + 2] + offsetZ
      );
    }

    positionAttribute.needsUpdate = true;
  }

  getGroup() {
    return this.group;
  }

  dispose() {
    Object.values(this.layers).forEach((layer) => {
      if (layer.mesh.geometry) layer.mesh.geometry.dispose();
      if (layer.mesh.material) layer.mesh.material.dispose();
    });
  }
}
