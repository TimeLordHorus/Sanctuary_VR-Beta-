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
import { VoiceCreationSystem } from './voice/VoiceCreationSystem.js';
import { VoiceUI } from './components/VoiceUI.js';
import { ProgressionSystem } from './progression/ProgressionSystem.js';
import { AchievementSystem } from './progression/AchievementSystem.js';
import { SanctuaryMenu } from './core/SanctuaryMenu.js';
import { KeyboardHint } from './components/KeyboardHint.js';
import { WelcomeLogin } from './core/WelcomeLogin.js';
import { KnowledgeIndexer } from './knowledge/KnowledgeIndexer.js';
import { BehavioralAnalytics } from './analytics/BehavioralAnalytics.js';
import { CulturalGenerator } from './culture/CulturalGenerator.js';
import { PantheonSelection } from './core/PantheonSelection.js';
import { TempleOfArtemis } from './scenes/TempleOfArtemis.js';
import { ProceduralLandscape } from './world/ProceduralLandscape.js';
import { ResourceSystem } from './world/ResourceSystem.js';
import { PuzzleSystem } from './world/PuzzleSystem.js';

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
    this.voiceSystem = null;
    this.voiceUI = null;
    this.progressionSystem = null;
    this.achievementSystem = null;
    this.sanctuaryMenu = null;
    this.keyboardHint = null;
    this.welcomeLogin = null;
    this.knowledgeIndexer = null;
    this.behavioralAnalytics = null;
    this.culturalGenerator = null;
    this.pantheonSelection = null;
    this.templeOfArtemis = null;
    this.proceduralLandscape = null;
    this.resourceSystem = null;
    this.puzzleSystem = null;
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

      // Initialize and show welcome login (if first time)
      this.welcomeLogin = new WelcomeLogin(this.core);
      const shouldShowWelcome = await this.welcomeLogin.init();

      if (shouldShowWelcome) {
        this.welcomeLogin.show();
        // Wait for welcome completion
        await this.waitForWelcome();
      }

      // Initialize and show pantheon selection (if first time)
      this.pantheonSelection = new PantheonSelection(this.core);
      const shouldShowPantheon = await this.pantheonSelection.init();

      if (shouldShowPantheon) {
        this.pantheonSelection.show();
        // Wait for pantheon selection
        await this.waitForPantheon();
      }

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

      // Initialize Voice Creation System
      this.voiceSystem = new VoiceCreationSystem(this.core);
      await this.voiceSystem.init();

      // Initialize Voice UI
      this.voiceUI = new VoiceUI(this.core, this.voiceSystem);
      this.voiceUI.init();

      // Initialize Progression System
      this.progressionSystem = new ProgressionSystem(this.core);
      await this.progressionSystem.init();

      // Initialize Achievement System
      this.achievementSystem = new AchievementSystem(this.core, this.progressionSystem);
      await this.achievementSystem.init();

      // Initialize Knowledge Indexer
      this.knowledgeIndexer = new KnowledgeIndexer(this.core);
      await this.knowledgeIndexer.init();

      // Initialize Behavioral Analytics
      this.behavioralAnalytics = new BehavioralAnalytics(this.core);
      await this.behavioralAnalytics.init();

      // Initialize Cultural Generator
      this.culturalGenerator = new CulturalGenerator(this.core, this.knowledgeIndexer, this.behavioralAnalytics);
      await this.culturalGenerator.init();

      // Initialize Sanctuary Menu (Q to open)
      this.sanctuaryMenu = new SanctuaryMenu(this.core);
      await this.sanctuaryMenu.init();

      // Initialize Keyboard Hints
      this.keyboardHint = new KeyboardHint();
      if (this.keyboardHint.shouldShow()) {
        this.keyboardHint.init();
      }

      // Listen for game start events from HUD
      this.core.on('startGame', (data) => this.startGame(data));

      // Initialize environment manager (but don't load yet)
      this.environmentManager = new EnvironmentManager(this.core);

      // Initialize scene manager (but don't load yet)
      this.sceneManager = new SceneManager(this.core);

      // Initialize Temple of Artemis as tutorial world
      this.templeOfArtemis = new TempleOfArtemis(this.core);
      await this.templeOfArtemis.init();

      // Initialize Resource System
      this.resourceSystem = new ResourceSystem(this.core);
      await this.resourceSystem.init();

      // Initialize Puzzle System
      this.puzzleSystem = new PuzzleSystem(this.core, this.resourceSystem);
      await this.puzzleSystem.init();

      // Initialize Procedural Landscape Generator
      const scene = document.querySelector('a-scene');
      this.proceduralLandscape = new ProceduralLandscape(this.core, scene);
      await this.proceduralLandscape.init();

      // Create floating particles in HUD background
      this.createHUDParticles();

      // Hide loading screen, show HUD (BEFORE loading world)
      this.hideLoadingScreen();

      // Load Temple of Artemis scene
      console.log('[SanctuaryVR] Loading Temple of Artemis tutorial world...');
      this.templeOfArtemis.startTutorial();

      this.initialized = true;
      console.log('Sanctuary VR initialized successfully');

      // Make managers available globally
      window.hudManager = this.hudManager;
      window.onboardingManager = this.onboardingManager;
      window.voiceSystem = this.voiceSystem;
      window.voiceUI = this.voiceUI;
      window.progressionSystem = this.progressionSystem;
      window.achievementSystem = this.achievementSystem;
      window.knowledgeIndexer = this.knowledgeIndexer;
      window.behavioralAnalytics = this.behavioralAnalytics;
      window.culturalGenerator = this.culturalGenerator;
      window.sanctuaryMenu = this.sanctuaryMenu;
      window.pantheonSelection = this.pantheonSelection;
      window.templeOfArtemis = this.templeOfArtemis;
      window.resourceSystem = this.resourceSystem;
      window.puzzleSystem = this.puzzleSystem;
      window.proceduralLandscape = this.proceduralLandscape;

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

  async waitForWelcome() {
    return new Promise((resolve) => {
      // Listen for welcome complete event
      const welcomeHandler = (data) => {
        console.log('[SanctuaryVR] Welcome completed:', data);
        resolve(data);
      };

      this.core.on('welcomeComplete', welcomeHandler);

      // Development: Allow skipping welcome with keyboard shortcut
      const skipHandler = (e) => {
        if (e.key === 'Escape' && e.shiftKey && e.ctrlKey) {
          console.log('Welcome skipped (dev mode)');
          this.welcomeLogin?.hide();
          document.removeEventListener('keydown', skipHandler);
          resolve({ userData: { username: 'DevUser', isGuest: true } });
        }
      };
      document.addEventListener('keydown', skipHandler);
    });
  }

  async waitForPantheon() {
    return new Promise((resolve) => {
      // Listen for pantheon complete event
      const pantheonHandler = (data) => {
        console.log('[SanctuaryVR] Pantheon selection completed:', data);
        resolve(data);
      };

      this.core.on('pantheonComplete', pantheonHandler);

      // Development: Allow skipping pantheon with keyboard shortcut
      const skipHandler = (e) => {
        if (e.key === 'Escape' && e.shiftKey && e.ctrlKey) {
          console.log('Pantheon selection skipped (dev mode)');
          this.pantheonSelection?.hide();
          document.removeEventListener('keydown', skipHandler);
          resolve({ patron: { id: 'none', name: 'The Wanderer' } });
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
    if (this.knowledgeIndexer) this.knowledgeIndexer.destroy();
    if (this.behavioralAnalytics) this.behavioralAnalytics.destroy();
    if (this.culturalGenerator) this.culturalGenerator.destroy();
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
