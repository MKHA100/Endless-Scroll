import { CONFIG } from '../config.js';
import { SeededRandom } from '../utils/SeededRandom.js';
import { hash } from '../utils/math.js';

export class ChunkManager {
  constructor() {
    this.chunks = new Map();
    this.chunkSize = CONFIG.chunks.size;
    this.renderDistance = CONFIG.chunks.renderDistance;
    
    this.lastCameraChunk = { x: 0, y: 0, z: 0 };
  }
  
  update(cameraPosition) {
    const currentChunkX = Math.floor(cameraPosition.x / this.chunkSize);
    const currentChunkY = Math.floor(cameraPosition.y / this.chunkSize);
    const currentChunkZ = Math.floor(cameraPosition.z / this.chunkSize);
    
    // Only update if camera moved to different chunk
    if (currentChunkX !== this.lastCameraChunk.x ||
        currentChunkY !== this.lastCameraChunk.y ||
        currentChunkZ !== this.lastCameraChunk.z) {
      
      this.lastCameraChunk = { x: currentChunkX, y: currentChunkY, z: currentChunkZ };
      
      // Generate nearby chunks
      for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
        for (let dy = -this.renderDistance; dy <= this.renderDistance; dy++) {
          for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
            const chunkX = currentChunkX + dx;
            const chunkY = currentChunkY + dy;
            const chunkZ = currentChunkZ + dz;
            const key = this.getChunkKey(chunkX, chunkY, chunkZ);
            
            if (!this.chunks.has(key)) {
              const chunkData = this.generateChunk(chunkX, chunkY, chunkZ);
              this.chunks.set(key, chunkData);
            }
          }
        }
      }
      
      // Remove distant chunks
      for (const [key, chunk] of this.chunks) {
        const [cx, cy, cz] = key.split(',').map(Number);
        const distance = Math.max(
          Math.abs(cx - currentChunkX),
          Math.abs(cy - currentChunkY),
          Math.abs(cz - currentChunkZ)
        );
        
        if (distance > this.renderDistance + 1) {
          this.disposeChunk(chunk);
          this.chunks.delete(key);
        }
      }
    }
  }
  
  getChunkKey(x, y, z) {
    return `${x},${y},${z}`;
  }
  
  generateChunk(chunkX, chunkY, chunkZ) {
    // Create seed from chunk coordinates
    const seed = hash(chunkX, chunkY, chunkZ) * 2147483647;
    const rng = new SeededRandom(seed);
    
    const chunkData = {
      x: chunkX,
      y: chunkY,
      z: chunkZ,
      seed: seed,
      features: []
    };
    
    // Determine chunk characteristics
    const density = rng.random();
    const nebulaNoise = this.simplex3d(chunkX * 0.1, chunkY * 0.1, chunkZ * 0.1);
    const voidNoise = this.simplex3d(chunkX * 0.05, chunkY * 0.05, chunkZ * 0.05);
    
    // Chunk types based on noise
    if (nebulaNoise > 0.6) {
      chunkData.type = 'nebula';
      chunkData.nebulaColor = rng.pick([
        { r: 0.4, g: 0.1, b: 0.8 }, // Purple
        { r: 0.8, g: 0.2, b: 0.4 }, // Pink
        { r: 0.2, g: 0.6, b: 0.9 }, // Blue
        { r: 0.9, g: 0.4, b: 0.1 }  // Orange
      ]);
    } else if (voidNoise < -0.7) {
      chunkData.type = 'void';
      chunkData.starDensity = 0.1; // Very few stars
    } else if (density > 0.8) {
      chunkData.type = 'dense';
      chunkData.starDensity = 2.0; // Many stars
    } else {
      chunkData.type = 'normal';
      chunkData.starDensity = 1.0;
    }
    
    // Generate potential encounters
    if (rng.chance(CONFIG.encounters.blackHoleChance)) {
      chunkData.features.push({
        type: 'blackhole',
        position: {
          x: chunkX * this.chunkSize + rng.range(-this.chunkSize/2, this.chunkSize/2),
          y: chunkY * this.chunkSize + rng.range(-this.chunkSize/2, this.chunkSize/2),
          z: chunkZ * this.chunkSize + rng.range(-this.chunkSize/2, this.chunkSize/2)
        },
        mass: rng.range(0.5, 2.0)
      });
    }
    
    if (rng.chance(CONFIG.encounters.asteroidChance)) {
      chunkData.features.push({
        type: 'asteroid_field',
        position: {
          x: chunkX * this.chunkSize + rng.range(-this.chunkSize/2, this.chunkSize/2),
          y: chunkY * this.chunkSize + rng.range(-this.chunkSize/2, this.chunkSize/2),
          z: chunkZ * this.chunkSize + rng.range(-this.chunkSize/2, this.chunkSize/2)
        },
        count: rng.int(30, 80),
        spread: rng.range(50, 150)
      });
    }
    
    if (rng.chance(CONFIG.encounters.shipChance)) {
      chunkData.features.push({
        type: 'ship',
        startPosition: {
          x: chunkX * this.chunkSize + rng.range(-this.chunkSize, this.chunkSize),
          y: chunkY * this.chunkSize + rng.range(-this.chunkSize, this.chunkSize),
          z: chunkZ * this.chunkSize + rng.range(-this.chunkSize/2, this.chunkSize/2)
        },
        velocity: {
          x: rng.range(-20, 20),
          y: rng.range(-10, 10),
          z: rng.range(-5, 5)
        }
      });
    }
    
    return chunkData;
  }
  
  // Simple 3D noise function
  simplex3d(x, y, z) {
    // Simplified noise - in production you'd use a proper simplex noise library
    return Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453 % 1;
  }
  
  getChunkAt(x, y, z) {
    const chunkX = Math.floor(x / this.chunkSize);
    const chunkY = Math.floor(y / this.chunkSize);
    const chunkZ = Math.floor(z / this.chunkSize);
    const key = this.getChunkKey(chunkX, chunkY, chunkZ);
    
    return this.chunks.get(key);
  }
  
  getAllActiveChunks() {
    return Array.from(this.chunks.values());
  }
  
  disposeChunk(chunk) {
    // Clean up any Three.js objects in the chunk
    if (chunk.meshes) {
      chunk.meshes.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    }
  }
  
  getChunkInfo() {
    return {
      totalChunks: this.chunks.size,
      chunkSize: this.chunkSize,
      renderDistance: this.renderDistance
    };
  }
}