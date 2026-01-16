export class ClockManager {
  constructor() {
    this.startTime = Date.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.delta = 0;
    this.running = true;
    
    // For FPS monitoring
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTime = 0;
  }
  
  update() {
    if (!this.running) return;
    
    const newTime = Date.now();
    this.delta = (newTime - this.oldTime) / 1000; // Convert to seconds
    this.oldTime = newTime;
    this.elapsedTime = (newTime - this.startTime) / 1000;
    
    // Calculate FPS
    this.frameCount++;
    if (newTime > this.fpsUpdateTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (newTime - this.fpsUpdateTime));
      this.frameCount = 0;
      this.fpsUpdateTime = newTime;
    }
  }
  
  start() {
    this.running = true;
    this.oldTime = Date.now();
  }
  
  stop() {
    this.running = false;
  }
  
  reset() {
    this.startTime = Date.now();
    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.delta = 0;
    this.frameCount = 0;
    this.fps = 0;
    this.fpsUpdateTime = 0;
  }
  
  getDelta() {
    return this.delta;
  }
  
  getElapsedTime() {
    return this.elapsedTime;
  }
  
  getFPS() {
    return this.fps;
  }
}