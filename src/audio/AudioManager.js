import { Howl, Howler } from "howler";
import { CONFIG } from "../config.js";

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.currentAmbient = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.masterVolume = CONFIG.audio.masterVolume;

    // Load mute preference
    this.isMuted = localStorage.getItem("endless-scroll-muted") === "true";

    this.bindEvents();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Create ambient drone (base layer)
      this.sounds.ambient = new Howl({
        src: ["/audio/ambient-drone.webm", "/audio/ambient-drone.mp3"],
        loop: true,
        volume: CONFIG.audio.ambientVolume,
        html5: true,
        preload: true,
      });

      // Deep space layer for velocity variations
      this.sounds.deepSpace = new Howl({
        src: ["/audio/deep-space.webm", "/audio/deep-space.mp3"],
        loop: true,
        volume: 0,
        html5: true,
        preload: true,
      });

      // Movement whoosh
      this.sounds.whoosh = new Howl({
        src: ["/audio/whoosh.webm", "/audio/whoosh.mp3"],
        volume: 0.2,
        preload: true,
      });

      // Black hole encounter
      this.sounds.blackholeHum = new Howl({
        src: ["/audio/blackhole-hum.webm", "/audio/blackhole-hum.mp3"],
        loop: true,
        volume: 0,
        preload: true,
      });

      // Ship passing
      this.sounds.shipPass = new Howl({
        src: ["/audio/ship-pass.webm", "/audio/ship-pass.mp3"],
        volume: CONFIG.audio.encounterVolume,
        preload: true,
      });

      // Asteroid field
      this.sounds.asteroidRumble = new Howl({
        src: ["/audio/asteroid-rumble.webm", "/audio/asteroid-rumble.mp3"],
        loop: true,
        volume: 0,
        preload: true,
      });

      // Nebula ambient
      this.sounds.nebulaPad = new Howl({
        src: ["/audio/nebula-pad.webm", "/audio/nebula-pad.mp3"],
        loop: true,
        volume: 0,
        preload: true,
      });

      this.isInitialized = true;
      this.updateMasterVolume();

      console.log("Audio system initialized");
    } catch (error) {
      console.warn("Failed to initialize audio:", error);
      // Continue without audio
    }
  }

  bindEvents() {
    // Mute toggle with M key
    window.addEventListener("keydown", (e) => {
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        this.toggleMute();
      }
    });

    // Handle browser audio policy (user interaction required)
    const startAudioOnInteraction = () => {
      if (!this.isInitialized) {
        this.init();
      }
      document.removeEventListener("click", startAudioOnInteraction);
      document.removeEventListener("wheel", startAudioOnInteraction);
      document.removeEventListener("keydown", startAudioOnInteraction);
    };

    document.addEventListener("click", startAudioOnInteraction);
    document.addEventListener("wheel", startAudioOnInteraction);
    document.addEventListener("keydown", startAudioOnInteraction);
  }

  startAmbient() {
    if (!this.isInitialized || this.isMuted) return;

    try {
      if (this.sounds.ambient && !this.sounds.ambient.playing()) {
        this.currentAmbient = this.sounds.ambient.play();
      }

      if (this.sounds.deepSpace && !this.sounds.deepSpace.playing()) {
        this.sounds.deepSpace.play();
      }

      console.log("Ambient audio started");
    } catch (error) {
      console.warn("Failed to start ambient audio:", error);
    }
  }

  updateVelocity(velocity) {
    if (!this.isInitialized || this.isMuted) return;

    const speed = Math.abs(velocity);
    const normalizedSpeed = Math.min(speed / 50, 1); // Normalize to 0-1

    try {
      // Crossfade between ambient layers based on velocity
      if (this.sounds.ambient) {
        const ambientVol =
          CONFIG.audio.ambientVolume * (1 - normalizedSpeed * 0.5);
        this.sounds.ambient.volume(ambientVol * this.masterVolume);
      }

      if (this.sounds.deepSpace) {
        const deepVol = normalizedSpeed * 0.4;
        this.sounds.deepSpace.volume(deepVol * this.masterVolume);
        this.sounds.deepSpace.rate(0.8 + normalizedSpeed * 0.4); // Pitch shift
      }

      // Trigger whoosh on fast movement
      if (speed > 5 && this.sounds.whoosh && !this.sounds.whoosh.playing()) {
        const whooshId = this.sounds.whoosh.play();
        this.sounds.whoosh.rate(0.8 + speed * 0.02, whooshId);
      }
    } catch (error) {
      console.warn("Error updating velocity audio:", error);
    }
  }

  triggerEncounter(type, data = {}) {
    if (!this.isInitialized || this.isMuted) return;

    try {
      switch (type) {
        case "blackhole":
          if (this.sounds.blackholeHum) {
            const proximity = data.proximity || 1;
            const volume = (1 - proximity) * 0.5 * this.masterVolume;
            this.sounds.blackholeHum.volume(volume);
            if (!this.sounds.blackholeHum.playing()) {
              this.sounds.blackholeHum.play();
            }
          }
          break;

        case "ship":
          if (this.sounds.shipPass) {
            const id = this.sounds.shipPass.play();
            if (data.volume) {
              this.sounds.shipPass.volume(data.volume * this.masterVolume, id);
            }
          }
          break;

        case "asteroid":
          if (this.sounds.asteroidRumble) {
            const volume = (data.intensity || 0.5) * 0.3 * this.masterVolume;
            this.sounds.asteroidRumble.volume(volume);
            if (!this.sounds.asteroidRumble.playing()) {
              this.sounds.asteroidRumble.play();
            }
          }
          break;

        case "nebula":
          if (this.sounds.nebulaPad) {
            this.fadeIn("nebulaPad", 2000);
            // Muffle other sounds
            this.muffle(true);
          }
          break;
      }
    } catch (error) {
      console.warn("Error triggering encounter audio:", error);
    }
  }

  endEncounter(type) {
    if (!this.isInitialized) return;

    try {
      switch (type) {
        case "blackhole":
          if (this.sounds.blackholeHum) {
            this.fadeOut("blackholeHum", 1000);
          }
          break;

        case "asteroid":
          if (this.sounds.asteroidRumble) {
            this.fadeOut("asteroidRumble", 1500);
          }
          break;

        case "nebula":
          if (this.sounds.nebulaPad) {
            this.fadeOut("nebulaPad", 3000);
            this.muffle(false);
          }
          break;
      }
    } catch (error) {
      console.warn("Error ending encounter audio:", error);
    }
  }

  fadeIn(soundName, duration = 1000) {
    const sound = this.sounds[soundName];
    if (sound) {
      const targetVolume = this.getDefaultVolume(soundName) * this.masterVolume;
      const id = sound.play();
      sound.fade(0, targetVolume, duration, id);
      return id;
    }
  }

  fadeOut(soundName, duration = 1000) {
    const sound = this.sounds[soundName];
    if (sound && sound.playing()) {
      sound.fade(sound.volume(), 0, duration);
      sound.once("fade", () => sound.stop());
    }
  }

  getDefaultVolume(soundName) {
    const volumes = {
      ambient: CONFIG.audio.ambientVolume,
      deepSpace: 0.4,
      whoosh: 0.2,
      blackholeHum: 0.5,
      shipPass: CONFIG.audio.encounterVolume,
      asteroidRumble: 0.3,
      nebulaPad: 0.4,
    };
    return volumes[soundName] || 0.5;
  }

  muffle(enable) {
    // Reduce volume of all sounds except nebulaPad
    const muffleAmount = enable ? 0.3 : 1.0;

    ["ambient", "deepSpace", "blackholeHum", "asteroidRumble"].forEach(
      (soundName) => {
        const sound = this.sounds[soundName];
        if (sound) {
          const currentVol =
            this.getDefaultVolume(soundName) * this.masterVolume;
          sound.volume(currentVol * muffleAmount);
        }
      }
    );
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("endless-scroll-muted", this.isMuted.toString());

    if (this.isMuted) {
      Howler.mute(true);
      console.log("Audio muted");
    } else {
      Howler.mute(false);
      console.log("Audio unmuted");
    }
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMasterVolume();
  }

  updateMasterVolume() {
    if (!this.isInitialized) return;

    Howler.volume(this.masterVolume);
  }

  dispose() {
    Object.values(this.sounds).forEach((sound) => {
      if (sound && typeof sound.unload === "function") {
        sound.unload();
      }
    });
    this.sounds = {};
    this.isInitialized = false;
  }
}
