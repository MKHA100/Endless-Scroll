import {
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Group,
  CanvasTexture,
  AdditiveBlending,
} from "three";
import { SeededRandom } from "../utils/SeededRandom.js";

export class BackgroundGalaxies {
  constructor() {
    this.group = new Group();
    this.galaxies = [];
    this.textureLoader = new TextureLoader();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Create simple galaxy texture procedurally
    const galaxyTexture = this.createGalaxyTexture();

    const rng = new SeededRandom(123);
    const galaxyCount = 8;

    for (let i = 0; i < galaxyCount; i++) {
      const material = new SpriteMaterial({
        map: galaxyTexture,
        transparent: true,
        opacity: 0.3 + rng.random() * 0.4,
        blending: AdditiveBlending,
      });

      const sprite = new Sprite(material);

      // Position at extreme distance (negative Z is forward)
      const distance = 4000 + rng.random() * 2000;
      const angle = rng.random() * Math.PI * 2;
      const elevation = (rng.random() - 0.5) * Math.PI * 0.5;

      sprite.position.x = Math.cos(angle) * Math.cos(elevation) * distance;
      sprite.position.y = Math.sin(elevation) * distance * 0.5;
      sprite.position.z = -Math.abs(
        Math.sin(angle) * Math.cos(elevation) * distance
      ); // Negative Z to be in front

      // Scale
      const scale = 200 + rng.random() * 300;
      sprite.scale.set(scale, scale * 0.6, 1); // Slightly flattened

      // Rotation - Sprites use material.rotation (a number in radians)
      sprite.material.rotation = rng.random() * Math.PI * 2;

      this.galaxies.push({
        sprite,
        rotationSpeed: (rng.random() - 0.5) * 0.001,
        originalPosition: sprite.position.clone(),
      });

      this.group.add(sprite);
    }
  }

  createGalaxyTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");

    // Create radial gradient
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(255, 200, 150, 0.8)");
    gradient.addColorStop(0.6, "rgba(100, 150, 255, 0.4)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    // Add some spiral arms (very simple)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    const centerX = 32;
    const centerY = 32;

    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      for (let i = 0; i < 100; i++) {
        const t = i / 100;
        const angle = arm * Math.PI + t * Math.PI * 4;
        const r = t * 25;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Convert to texture
    const texture = new CanvasTexture(canvas);
    return texture;
  }

  update(deltaTime) {
    // Slowly rotate galaxies
    this.galaxies.forEach((galaxy) => {
      galaxy.sprite.material.rotation += galaxy.rotationSpeed * deltaTime * 60;
    });
  }

  getGroup() {
    return this.group;
  }

  dispose() {
    this.galaxies.forEach((galaxy) => {
      if (galaxy.sprite.material.map) {
        galaxy.sprite.material.map.dispose();
      }
      galaxy.sprite.material.dispose();
    });
  }
}
