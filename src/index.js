/**
 * Sanctuary VR - Main Entry Point
 * Initializes the VR environment and manages core systems
 */

import { SanctuaryCore } from './core/SanctuaryCore.js';
import { EnvironmentManager } from './core/EnvironmentManager.js';
import { VRCompatibilityLayer } from './core/VRCompatibilityLayer.js';
import { SceneManager } from './scenes/SceneManager.js';
import { HUDManager } from './core/HUDManager.js';
import { NetworkManager } from './core/NetworkManager.js';

class SanctuaryVR {
  constructor() {
    this.core = null;
    this.environmentManager = null;
    this.compatibilityLayer = null;
    this.sceneManager = null;
    this.hudManager = null;
    this.networkManager = null;
    this.initialized = false;
    this.gameStarted = false;
  }

  async init(config = {}) {
    console.log('Initializing Sanctuary VR...');

    try {
      // Initialize compatibility layer for cross-platform VR support
      this.compatibilityLayer = new VRCompatibilityLayer();
      await this.compatibilityLayer.detectVRSupport();

      // Initialize core systems
      this.core = new SanctuaryCore(config);
      await this.core.init();

      // Initialize HUD Manager
      this.hudManager = new HUDManager(this.core);
      this.hudManager.init();

      // Initialize Network Manager
      this.networkManager = new NetworkManager(this.core);

      // Listen for game start events from HUD
      this.core.on('startGame', (data) => this.startGame(data));

      // Initialize environment manager (but don't load yet)
      this.environmentManager = new EnvironmentManager(this.core);

      // Initialize scene manager (but don't load yet)
      this.sceneManager = new SceneManager(this.core);

      // Create floating particles in HUD background
      this.createHUDParticles();

      this.initialized = true;
      console.log('Sanctuary VR initialized successfully');

      // Make HUD manager available globally for dialog callbacks
      window.hudManager = this.hudManager;

      return this;
    } catch (error) {
      console.error('Failed to initialize Sanctuary VR:', error);
      throw error;
    }
  }

  async startGame(gameConfig) {
    console.log('Starting game with config:', gameConfig);

    try {
      // Initialize network based on mode
      await this.networkManager.init(gameConfig.mode, gameConfig);

      // Load environment
      await this.environmentManager.loadEnvironment('sanctuary-main');

      // Load scene
      await this.sceneManager.loadScene('entrance');

      // Hide loading dialog
      this.hudManager.hideDialog();

      // Start game
      this.gameStarted = true;

      // Emit game ready event
      this.core.emit('gameReady', gameConfig);

      console.log('Game started successfully');
    } catch (error) {
      console.error('Failed to start game:', error);
      this.hudManager.showConnectionDialog('Failed to start game. Please try again.');
    }
  }

  createHUDParticles() {
    const particlesContainer = document.getElementById('hud-particles');
    if (!particlesContainer) return;

    // Create 50 floating particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'hud-particle';

      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = '0';

      // Random size
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random animation duration
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;

      particlesContainer.appendChild(particle);
    }
  }

  enterVR() {
    if (!this.initialized) {
      console.error('Sanctuary VR not initialized');
      return;
    }

    this.sceneManager.enterVR();
  }

  exitVR() {
    if (!this.initialized) {
      console.error('Sanctuary VR not initialized');
      return;
    }

    this.sceneManager.exitVR();
  }

  dispose() {
    if (this.networkManager) this.networkManager.dispose();
    if (this.sceneManager) this.sceneManager.dispose();
    if (this.environmentManager) this.environmentManager.dispose();
    if (this.core) this.core.dispose();
    this.initialized = false;
    this.gameStarted = false;
  }
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
  window.SanctuaryVR = SanctuaryVR;

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSanctuaryVR);
  } else {
    initializeSanctuaryVR();
  }
}

async function initializeSanctuaryVR() {
  const sanctuary = new SanctuaryVR();
  await sanctuary.init();
  window.sanctuaryInstance = sanctuary;
}

export default SanctuaryVR;
