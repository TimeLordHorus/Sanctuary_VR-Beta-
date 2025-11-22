/**
 * Sanctuary VR - Main Entry Point
 * Initializes the VR environment and manages core systems
 */

import { SanctuaryCore } from './core/SanctuaryCore.js';
import { EnvironmentManager } from './core/EnvironmentManager.js';
import { VRCompatibilityLayer } from './core/VRCompatibilityLayer.js';
import { SceneManager } from './scenes/SceneManager.js';

class SanctuaryVR {
  constructor() {
    this.core = null;
    this.environmentManager = null;
    this.compatibilityLayer = null;
    this.sceneManager = null;
    this.initialized = false;
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

      // Initialize environment manager
      this.environmentManager = new EnvironmentManager(this.core);
      await this.environmentManager.loadEnvironment('sanctuary-main');

      // Initialize scene manager
      this.sceneManager = new SceneManager(this.core);
      await this.sceneManager.loadScene('entrance');

      this.initialized = true;
      console.log('Sanctuary VR initialized successfully');

      return this;
    } catch (error) {
      console.error('Failed to initialize Sanctuary VR:', error);
      throw error;
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
    if (this.sceneManager) this.sceneManager.dispose();
    if (this.environmentManager) this.environmentManager.dispose();
    if (this.core) this.core.dispose();
    this.initialized = false;
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
