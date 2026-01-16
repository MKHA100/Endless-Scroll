import { MathUtils, Vector3 } from "three";
import { CONFIG } from "../config.js";
import { damp, clamp } from "../utils/math.js";

export class DriftController {
  constructor(camera) {
    this.camera = camera;

    // Velocity and movement state
    this.velocity = { x: 0, y: 0 };
    this.drift = { x: 0, y: 0 };
    this.forwardPosition = 0;
    this.targetRotation = { x: 0, y: 0, z: 0 };
    
    // Forward/backward movement
    this.forwardVelocity = 0;  // Positive = forward, negative = backward
    this.currentDirection = 1; // 1 = forward, -1 = backward

    // Movement parameters from new config
    this.sensitivity = CONFIG.movement.sensitivity;
    this.driftDamping = CONFIG.movement.driftDamping;
    this.baseSpeed = CONFIG.movement.baseSpeed;
    this.maxSpeed = CONFIG.movement.maxSpeed;
    this.inertia = CONFIG.movement.inertia;
    this.maxDriftAngle = CONFIG.movement.maxDriftAngle;
    // New acceleration physics
    this.acceleration = CONFIG.movement.acceleration;
    this.deceleration = CONFIG.movement.deceleration;
    this.minSpeed = CONFIG.movement.minSpeed;
    this.autoStopDelay = CONFIG.movement.autoStopDelay;

    // State tracking
    this.isActive = false;
    this.lastScrollTime = 0;

    // Continuous forward movement
    this.currentSpeed = this.baseSpeed;

    this.bindEvents();
  }

  bindEvents() {
    // Wheel event for trackpad and mouse wheel
    window.addEventListener("wheel", (e) => this.handleWheel(e), {
      passive: false,
    });

    // Touch events for mobile (future use)
    let touchStartY = 0;
    let touchStartX = 0;

    window.addEventListener(
      "touchstart",
      (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        const deltaY = touchStartY - e.touches[0].clientY;
        const deltaX = touchStartX - e.touches[0].clientX;

        this.velocity.y += deltaY * this.sensitivity * 0.02;
        this.velocity.x += deltaX * this.sensitivity * 0.02;

        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;

        this.lastScrollTime = Date.now();
      },
      { passive: true }
    );
  }

  handleWheel(e) {
    if (!this.isActive) return;

    e.preventDefault();

    // Normalize wheel delta across browsers
    let deltaX = e.deltaX;
    let deltaY = e.deltaY;

    // Handle different delta modes
    if (e.deltaMode === 1) {
      // DOM_DELTA_LINE
      deltaX *= 40;
      deltaY *= 40;
    } else if (e.deltaMode === 2) {
      // DOM_DELTA_PAGE
      deltaX *= 800;
      deltaY *= 800;
    }

    // Add to velocity
    this.velocity.x += deltaX * this.sensitivity * 0.01;
    this.velocity.y += deltaY * this.sensitivity * 0.01;
    
    // Update forward velocity with direction (positive deltaY = scroll down = move forward)
    this.forwardVelocity += deltaY * this.sensitivity * 0.02;
    this.currentDirection = this.forwardVelocity >= 0 ? 1 : -1;

    this.lastScrollTime = Date.now();
  }

  update(deltaTime) {
    if (!this.isActive) return;

    // Apply inertia and damping to velocity
    this.velocity.x *= this.driftDamping;
    this.velocity.y *= this.driftDamping;

    // Update drift based on velocity
    this.drift.x += this.velocity.x * deltaTime * 8;
    this.drift.y += this.velocity.y * deltaTime * 8;

    // Clamp drift to reasonable bounds
    this.drift.x = clamp(this.drift.x, -300, 300);
    this.drift.y = clamp(this.drift.y, -300, 300);

    // Calculate time since last scroll input
    const timeSinceScroll = (Date.now() - this.lastScrollTime) / 1000;
    const isRecentlyScrolling = timeSinceScroll < this.autoStopDelay;

    // Calculate speed with direction (bidirectional movement)
    const scrollMagnitude = Math.abs(this.forwardVelocity);
    
    if (isRecentlyScrolling && scrollMagnitude > 0.001) {
      // Accelerate when scrolling (maintain direction)
      const targetSpeed = Math.min(scrollMagnitude * this.acceleration, this.maxSpeed);
      this.currentSpeed = Math.min(this.currentSpeed + this.acceleration * deltaTime, targetSpeed);
    } else {
      // Decelerate when not scrolling or after delay
      this.currentSpeed *= Math.pow(this.deceleration, deltaTime);
      
      // Stop completely if speed is very low
      if (this.currentSpeed < this.minSpeed) {
        this.currentSpeed = 0;
        this.forwardVelocity = 0;
      }
    }

    // Update forward position with direction (positive = forward, negative = backward)
    if (this.currentSpeed > 0) {
      this.forwardPosition += this.currentDirection * this.currentSpeed * deltaTime * 60;
    }
    
    // Apply damping to forward velocity for smoother direction changes
    this.forwardVelocity *= this.driftDamping;

    // Calculate target rotation based on drift (reduced for realism)
    this.targetRotation.z = (this.drift.x / 300) * this.maxDriftAngle;
    this.targetRotation.x = (this.drift.y / 600) * this.maxDriftAngle * 0.3;
    this.targetRotation.y = (this.drift.x / 800) * this.maxDriftAngle * 0.2;

    // Apply smooth camera movement
    this.updateCamera(deltaTime);
  }

  updateCamera(deltaTime) {
    // Position - forward is negative Z in Three.js default camera orientation
    const targetPosition = new Vector3(
      this.drift.x,
      this.drift.y,
      this.forwardPosition
    );

    this.camera.position.x = damp(
      this.camera.position.x,
      targetPosition.x,
      5.0,
      deltaTime
    );
    this.camera.position.y = damp(
      this.camera.position.y,
      targetPosition.y,
      5.0,
      deltaTime
    );
    this.camera.position.z = damp(
      this.camera.position.z,
      targetPosition.z,
      8.0,
      deltaTime
    );

    // Rotation for drift feeling
    this.camera.rotation.x = damp(
      this.camera.rotation.x,
      this.targetRotation.x,
      3.0,
      deltaTime
    );
    this.camera.rotation.y = damp(
      this.camera.rotation.y,
      this.targetRotation.y,
      3.0,
      deltaTime
    );
    this.camera.rotation.z = damp(
      this.camera.rotation.z,
      this.targetRotation.z,
      4.0,
      deltaTime
    );
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
    if (params.driftDamping !== undefined)
      this.driftDamping = params.driftDamping;
    if (params.forwardSpeed !== undefined) this.baseSpeed = params.forwardSpeed;
    if (params.maxDriftAngle !== undefined)
      this.maxDriftAngle = params.maxDriftAngle;
  }

  getVelocityMagnitude() {
    return Math.sqrt(
      this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
    );
  }

  getVelocity() {
    return {
      x: this.velocity.x,
      y: this.velocity.y,
      z: this.currentDirection * this.currentSpeed, // Include direction
      direction: this.currentDirection
    };
  }

  getCurrentSpeed() {
    return this.currentSpeed;
  }

  isScrolling() {
    return Date.now() - this.lastScrollTime < 100;
  }
}
