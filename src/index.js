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
import { BootScreen } from './core/BootScreen.js';
import { OnboardingManager } from './core/OnboardingManager.js';

class SanctuaryVR {
  constructor() {
    this.core = null;
    this.environmentManager = null;
    this.compatibilityLayer = null;
    this.sceneManager = null;
    this.hudManager = null;
    this.networkManager = null;
    this.bootScreen = null;
    this.onboardingManager = null;
    this.initialized = false;
    this.gameStarted = false;
    this.bootCompleted = false;
  }

  async init(config = {}) {
    console.log('Initializing Sanctuary VR...');

    try {
      // Initialize boot screen first
      this.bootScreen = new BootScreen();
      await this.bootScreen.init();

      // Wait for boot completion
      await this.waitForBoot();

      // Show loading screen briefly
      this.showLoadingScreen();

      // Initialize compatibility layer for cross-platform VR support
      this.compatibilityLayer = new VRCompatibilityLayer();
      await this.compatibilityLayer.detectVRSupport();

      // Initialize core systems
      this.core = new SanctuaryCore(config);
      await this.core.init();

      // Listen for boot complete event
      this.core.on('bootComplete', (data) => {
        console.log('Boot complete:', data);
        this.bootCompleted = true;
      });

      // Initialize HUD Manager
      this.hudManager = new HUDManager(this.core);
      this.hudManager.init();

      // Initialize Network Manager
      this.networkManager = new NetworkManager(this.core);

      // Initialize Onboarding Manager
      this.onboardingManager = new OnboardingManager(this.core, this.hudManager);
      this.onboardingManager.init();

      // Listen for game start events from HUD
      this.core.on('startGame', (data) => this.startGame(data));

      // Initialize environment manager (but don't load yet)
      this.environmentManager = new EnvironmentManager(this.core);

      // Initialize scene manager (but don't load yet)
      this.sceneManager = new SceneManager(this.core);

      // Create floating particles in HUD background
      this.createHUDParticles();

      // Hide loading screen, show HUD
      this.hideLoadingScreen();

      this.initialized = true;
      console.log('Sanctuary VR initialized successfully');

      // Make managers available globally
      window.hudManager = this.hudManager;
      window.onboardingManager = this.onboardingManager;

      // Emit HUD ready event to trigger onboarding
      this.core.emit('hudReady');

      return this;
    } catch (error) {
      console.error('Failed to initialize Sanctuary VR:', error);
      throw error;
    }
  }

  async waitForBoot() {
    return new Promise((resolve) => {
      // Check if boot is already complete
      if (this.bootScreen?.currentPhase === 'complete') {
        resolve();
        return;
      }

      // Wait for boot complete event or timeout
      const checkInterval = setInterval(() => {
        if (this.bootScreen?.currentPhase === 'complete') {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Development: Allow skipping boot with keyboard shortcut
      const skipHandler = (e) => {
        if (e.key === 'Escape' && e.shiftKey && e.ctrlKey) {
          console.log('Boot sequence skipped (dev mode)');
          clearInterval(checkInterval);
          this.bootScreen?.skipBoot();
          document.removeEventListener('keydown', skipHandler);
          resolve();
        }
      };
      document.addEventListener('keydown', skipHandler);
    });
  }

  showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 1000);
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
