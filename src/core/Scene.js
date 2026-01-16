import { WebGLRenderer, PerspectiveCamera, Scene, Color } from 'three';
import { CONFIG } from '../config.js';

export class SceneManager {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.scene = new Scene();
    this.camera = null;
    this.renderer = null;
    
    this.init();
    this.bindEvents();
  }
  
  init() {
    // Set up camera
    this.camera = new PerspectiveCamera(
      75, // FOV
      window.innerWidth / window.innerHeight, // aspect
      0.1, // near
      10000 // far
    );
    this.camera.position.set(0, 0, 0);
    
    // Set up renderer
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.performance.maxPixelRatio));
    this.renderer.setClearColor(new Color('#000005'), 1);
    
    // Enable gamma correction
    this.renderer.outputColorSpace = 'srgb';
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.handleResize());
  }
  
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  
  add(object) {
    this.scene.add(object);
  }
  
  remove(object) {
    this.scene.remove(object);
  }
}