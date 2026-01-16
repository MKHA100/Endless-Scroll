import { MathUtils, Vector3 } from 'three';
import { CONFIG } from '../config.js';
import { damp, clamp } from '../utils/math.js';

export class DriftController {
  constructor(camera) {
    this.camera = camera;
    
    // Velocity and movement state
    this.velocity = { x: 0, y: 0 };
    this.drift = { x: 0, y: 0 };
    this.forwardPosition = 0;
    this.targetRotation = { x: 0, y: 0, z: 0 };
    
    // Movement parameters
    this.sensitivity = CONFIG.scroll.sensitivity;
    this.driftDamping = CONFIG.scroll.driftDamping;
    this.forwardSpeed = CONFIG.scroll.forwardSpeed;
    this.maxDriftAngle = CONFIG.scroll.maxDriftAngle;
    this.boostMultiplier = CONFIG.scroll.boostMultiplier;
    
    // State tracking
    this.isActive = false;
    this.lastScrollTime = 0;
    
    this.bindEvents();
  }
  
  bindEvents() {
    // Wheel event for trackpad and mouse wheel
    window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    
    // Touch events for mobile (future use)
    let touchStartY = 0;
    let touchStartX = 0;
    
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      const deltaX = touchStartX - e.touches[0].clientX;
      
      this.velocity.y += deltaY * this.sensitivity * 0.02;
      this.velocity.x += deltaX * this.sensitivity * 0.02;
      
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
      
      this.lastScrollTime = Date.now();
    }, { passive: true });
  }
  
  handleWheel(e) {
    if (!this.isActive) return;
    
    e.preventDefault();
    
    // Normalize wheel delta across browsers
    let deltaX = e.deltaX;
    let deltaY = e.deltaY;
    
    // Handle different delta modes
    if (e.deltaMode === 1) { // DOM_DELTA_LINE
      deltaX *= 40;
      deltaY *= 40;
    } else if (e.deltaMode === 2) { // DOM_DELTA_PAGE
      deltaX *= 800;
      deltaY *= 800;
    }
    
    // Add to velocity
    this.velocity.x += deltaX * this.sensitivity * 0.01;
    this.velocity.y += deltaY * this.sensitivity * 0.01;
    
    this.lastScrollTime = Date.now();
  }
  
  update(deltaTime) {
    if (!this.isActive) return;
    
    // Apply damping to velocity
    this.velocity.x *= this.driftDamping;
    this.velocity.y *= this.driftDamping;
    
    // Update drift based on velocity
    this.drift.x += this.velocity.x * deltaTime * 10;
    this.drift.y += this.velocity.y * deltaTime * 10;
    
    // Clamp drift to reasonable bounds
    this.drift.x = clamp(this.drift.x, -200, 200);
    this.drift.y = clamp(this.drift.y, -200, 200);
    
    // Calculate forward speed with boost from vertical scrolling
    const verticalBoost = Math.abs(this.velocity.y) * this.boostMultiplier;
    const currentForwardSpeed = this.forwardSpeed + verticalBoost;
    
    // Update forward position
    this.forwardPosition += currentForwardSpeed * deltaTime * 60;
    
    // Calculate target rotation based on drift
    const driftIntensity = Math.sqrt(this.drift.x * this.drift.x + this.drift.y * this.drift.y) / 100;
    this.targetRotation.z = (this.drift.x / 200) * this.maxDriftAngle;
    this.targetRotation.x = (this.drift.y / 200) * this.maxDriftAngle * 0.5;
    this.targetRotation.y = (this.drift.x / 400) * this.maxDriftAngle * 0.3;
    
    // Apply smooth camera movement
    this.updateCamera(deltaTime);
  }
  
  updateCamera(deltaTime) {
    // Position
    const targetPosition = new Vector3(
      this.drift.x,
      this.drift.y,
      this.forwardPosition
    );
    
    this.camera.position.x = damp(this.camera.position.x, targetPosition.x, 5.0, deltaTime);
    this.camera.position.y = damp(this.camera.position.y, targetPosition.y, 5.0, deltaTime);
    this.camera.position.z = damp(this.camera.position.z, targetPosition.z, 8.0, deltaTime);
    
    // Rotation for drift feeling
    this.camera.rotation.x = damp(this.camera.rotation.x, this.targetRotation.x, 3.0, deltaTime);
    this.camera.rotation.y = damp(this.camera.rotation.y, this.targetRotation.y, 3.0, deltaTime);
    this.camera.rotation.z = damp(this.camera.rotation.z, this.targetRotation.z, 4.0, deltaTime);
  }
  
  activate() {
    this.isActive = true;
  }
  
  deactivate() {
    this.isActive = false;
  }
  
  // Update parameters from dev panel
  updateParameters(params) {
    if (params.sensitivity !== undefined) this.sensitivity = params.sensitivity;
    if (params.driftDamping !== undefined) this.driftDamping = params.driftDamping;
    if (params.forwardSpeed !== undefined) this.forwardSpeed = params.forwardSpeed;
    if (params.maxDriftAngle !== undefined) this.maxDriftAngle = params.maxDriftAngle;
  }
  
  getVelocityMagnitude() {
    return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
  }
  
  isScrolling() {
    return Date.now() - this.lastScrollTime < 100;
  }
}