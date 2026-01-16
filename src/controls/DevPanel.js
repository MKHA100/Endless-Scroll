import { CONFIG } from "../config.js";

export class DevPanel {
  constructor(driftController, postProcessing, audioManager) {
    this.driftController = driftController;
    this.postProcessing = postProcessing;
    this.audioManager = audioManager;

    this.panel = null;
    this.isVisible = false;

    this.init();
    this.bindEvents();
    this.loadSettings();
  }

  init() {
    this.panel = document.createElement("div");
    this.panel.id = "dev-panel";
    this.panel.innerHTML = this.createPanelHTML();
    document.body.appendChild(this.panel);

    this.bindInputEvents();
  }

  createPanelHTML() {
    return `
      <h3>Dev Panel</h3>
      <div class="control">
        <label for="sensitivity">Scroll Sensitivity</label>
        <input type="range" id="sensitivity" min="0.1" max="2.0" step="0.1" value="${CONFIG.scroll.sensitivity}">
        <span class="value">${CONFIG.scroll.sensitivity}</span>
      </div>
      
      <div class="control">
        <label for="drift-damping">Drift Damping</label>
        <input type="range" id="drift-damping" min="0.80" max="0.99" step="0.01" value="${CONFIG.scroll.driftDamping}">
        <span class="value">${CONFIG.scroll.driftDamping}</span>
      </div>
      
      <div class="control">
        <label for="forward-speed">Forward Speed</label>
        <input type="range" id="forward-speed" min="0.5" max="10.0" step="0.5" value="${CONFIG.scroll.forwardSpeed}">
        <span class="value">${CONFIG.scroll.forwardSpeed}</span>
      </div>
      
      <div class="control">
        <label for="max-drift-angle">Max Drift Angle</label>
        <input type="range" id="max-drift-angle" min="0.1" max="1.0" step="0.1" value="${CONFIG.scroll.maxDriftAngle}">
        <span class="value">${CONFIG.scroll.maxDriftAngle}</span>
      </div>
      
      <div class="control">
        <label for="bloom-strength">Bloom Strength</label>
        <input type="range" id="bloom-strength" min="0.0" max="2.0" step="0.1" value="${CONFIG.bloom.strength}">
        <span class="value">${CONFIG.bloom.strength}</span>
      </div>
      
      <div class="control">
        <label for="bloom-radius">Bloom Radius</label>
        <input type="range" id="bloom-radius" min="0.1" max="1.0" step="0.1" value="${CONFIG.bloom.radius}">
        <span class="value">${CONFIG.bloom.radius}</span>
      </div>
      
      <div class="control">
        <label for="master-volume">Master Volume</label>
        <input type="range" id="master-volume" min="0.0" max="1.0" step="0.1" value="${CONFIG.audio.masterVolume}">
        <span class="value">${CONFIG.audio.masterVolume}</span>
      </div>
      
      <div class="control">
        <button id="save-settings">Save Settings</button>
        <button id="reset-settings">Reset to Defaults</button>
      </div>
    `;
  }

  bindEvents() {
    // Toggle visibility with backtick key
    window.addEventListener("keydown", (e) => {
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  bindInputEvents() {
    const inputs = this.panel.querySelectorAll('input[type="range"]');
    inputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        this.handleInputChange(e.target.id, parseFloat(e.target.value));
        this.updateValueDisplay(e.target.id, e.target.value);
      });
    });

    // Save and reset buttons
    this.panel.querySelector("#save-settings").addEventListener("click", () => {
      this.saveSettings();
    });

    this.panel
      .querySelector("#reset-settings")
      .addEventListener("click", () => {
        this.resetSettings();
      });
  }

  handleInputChange(id, value) {
    switch (id) {
      case "sensitivity":
        CONFIG.scroll.sensitivity = value;
        this.driftController?.updateParameters({ sensitivity: value });
        break;

      case "drift-damping":
        CONFIG.scroll.driftDamping = value;
        this.driftController?.updateParameters({ driftDamping: value });
        break;

      case "forward-speed":
        CONFIG.scroll.forwardSpeed = value;
        this.driftController?.updateParameters({ forwardSpeed: value });
        break;

      case "max-drift-angle":
        CONFIG.scroll.maxDriftAngle = value;
        this.driftController?.updateParameters({ maxDriftAngle: value });
        break;

      case "bloom-strength":
        CONFIG.bloom.strength = value;
        this.postProcessing?.updateBloom(
          value,
          CONFIG.bloom.radius,
          CONFIG.bloom.threshold
        );
        break;

      case "bloom-radius":
        CONFIG.bloom.radius = value;
        this.postProcessing?.updateBloom(
          CONFIG.bloom.strength,
          value,
          CONFIG.bloom.threshold
        );
        break;

      case "master-volume":
        CONFIG.audio.masterVolume = value;
        this.audioManager?.setMasterVolume(value);
        break;
    }
  }

  updateValueDisplay(id, value) {
    const valueSpan = this.panel.querySelector(`#${id}`).nextElementSibling;
    if (valueSpan) {
      valueSpan.textContent = value;
    }
  }

  toggle() {
    this.isVisible = !this.isVisible;
    this.panel.style.display = this.isVisible ? "block" : "none";
  }

  show() {
    this.isVisible = true;
    this.panel.style.display = "block";
  }

  hide() {
    this.isVisible = false;
    this.panel.style.display = "none";
  }

  saveSettings() {
    const settings = {
      scroll: CONFIG.scroll,
      bloom: CONFIG.bloom,
      audio: CONFIG.audio,
    };

    localStorage.setItem("endless-scroll-settings", JSON.stringify(settings));
    console.log("Settings saved to localStorage");
  }

  loadSettings() {
    const saved = localStorage.getItem("endless-scroll-settings");
    if (saved) {
      try {
        const settings = JSON.parse(saved);

        // Apply settings to CONFIG
        Object.assign(CONFIG.scroll, settings.scroll || {});
        Object.assign(CONFIG.bloom, settings.bloom || {});
        Object.assign(CONFIG.audio, settings.audio || {});

        // Update UI inputs
        this.updateUIFromConfig();

        console.log("Settings loaded from localStorage");
      } catch (e) {
        console.warn("Failed to load settings from localStorage:", e);
      }
    }
  }

  resetSettings() {
    // Reset to original values
    CONFIG.scroll.sensitivity = 0.5;
    CONFIG.scroll.driftDamping = 0.92;
    CONFIG.scroll.forwardSpeed = 2.0;
    CONFIG.scroll.maxDriftAngle = 0.3;
    CONFIG.bloom.strength = 0.4;
    CONFIG.bloom.radius = 0.4;
    CONFIG.audio.masterVolume = 0.7;

    this.updateUIFromConfig();
    this.saveSettings();

    // Apply to systems
    this.driftController?.updateParameters(CONFIG.scroll);
    this.postProcessing?.updateBloom(
      CONFIG.bloom.strength,
      CONFIG.bloom.radius,
      CONFIG.bloom.threshold
    );
    this.audioManager?.setMasterVolume(CONFIG.audio.masterVolume);
  }

  updateUIFromConfig() {
    const updates = [
      ["sensitivity", CONFIG.scroll.sensitivity],
      ["drift-damping", CONFIG.scroll.driftDamping],
      ["forward-speed", CONFIG.scroll.forwardSpeed],
      ["max-drift-angle", CONFIG.scroll.maxDriftAngle],
      ["bloom-strength", CONFIG.bloom.strength],
      ["bloom-radius", CONFIG.bloom.radius],
      ["master-volume", CONFIG.audio.masterVolume],
    ];

    updates.forEach(([id, value]) => {
      const input = this.panel.querySelector(`#${id}`);
      if (input) {
        input.value = value;
        this.updateValueDisplay(id, value);
      }
    });
  }
}
