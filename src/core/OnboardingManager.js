/**
 * Onboarding Manager
 * Interactive tutorial system for Sanctuary VR
 */

import { Logger } from '../utils/Logger.js';

export class OnboardingManager {
  constructor(core, hudManager) {
    this.core = core;
    this.hudManager = hudManager;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.isActive = false;
    this.hasCompletedBefore = false;
    this.onboardingContainer = null;
    this.skipRequested = false;

    // Tutorial steps
    this.steps = [
      {
        id: 'welcome',
        title: 'Welcome to Sanctuary VR! 🏛️',
        content: 'Your immersive virtual reality sanctuary awaits. Let\'s take a quick tour to show you around!',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'hud-overview',
        title: 'The Sanctuary HUD',
        content: 'This is your main interface. Here you can choose between Local Play, LAN Party, or Online Multiplayer modes.',
        highlight: '#hud-menu',
        position: 'center',
        action: null
      },
      {
        id: 'local-play',
        title: 'Local Play Mode 🏛️',
        content: 'Solo exploration mode. Perfect for meditation, relaxation, and creating your personal sanctuary in peace.',
        highlight: '[data-option-id="local"]',
        position: 'bottom',
        action: null
      },
      {
        id: 'lan-party',
        title: 'LAN Party Mode 🌐',
        content: 'Connect with friends on your local network. Host or join sessions for shared sanctuary experiences.',
        highlight: '[data-option-id="lan"]',
        position: 'bottom',
        action: null
      },
      {
        id: 'online-multiplayer',
        title: 'Multiplayer Online 🌍',
        content: 'Join the global sanctuary community! Quick match, browse servers, or create your own sanctuary room.',
        highlight: '[data-option-id="online"]',
        position: 'bottom',
        action: null
      },
      {
        id: 'voice-creation-intro',
        title: 'Voice Creation System 🎤',
        content: 'Sanctuary VR features powerful voice-controlled creation. Simply speak to bring your visions to life!',
        highlight: null,
        position: 'center',
        action: () => this.showVoiceCreationDemo()
      },
      {
        id: 'voice-commands',
        title: 'How to Use Voice Commands',
        content: 'Press and hold the <strong>V key</strong> or say <strong>"Hey Sanctuary"</strong> to activate voice mode.',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'creation-examples',
        title: 'What You Can Create',
        content: 'Let me show you the amazing things you can create in Sanctuary...',
        highlight: null,
        position: 'center',
        action: () => this.showCreationExamples()
      },
      {
        id: 'environments',
        title: 'Create Environments 🌄',
        content: '<strong>Say:</strong> "Create a peaceful zen garden with flowing water"<br><em>Sanctuary will generate beautiful environments instantly!</em>',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'objects',
        title: 'Create Objects 🗿',
        content: '<strong>Say:</strong> "Add meditation cushions in a circle"<br><em>Place furniture, decorations, and interactive objects anywhere!</em>',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'lighting',
        title: 'Control Lighting 💡',
        content: '<strong>Say:</strong> "Make it sunset with warm golden light"<br><em>Change atmosphere, time of day, and lighting effects!</em>',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'audio',
        title: 'Add Audio 🔊',
        content: '<strong>Say:</strong> "Play gentle rain sounds"<br><em>Ambient music, nature sounds, or meditative audio on command!</em>',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'interactions',
        title: 'Interactive Elements 🎯',
        content: '<strong>Say:</strong> "Add a floating crystal that glows when touched"<br><em>Create interactive objects with custom behaviors!</em>',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'ai-powered',
        title: 'AI-Powered Creation 🤖',
        content: 'Sanctuary uses advanced AI to understand natural language. Describe anything you imagine, and watch it materialize!',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'examples-showcase',
        title: 'Example Commands',
        content: this.getExampleCommands(),
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'vr-controls',
        title: 'VR Controls 🎮',
        content: '<strong>In VR:</strong><br>• Trigger: Interact<br>• Grip: Grab objects<br>• Menu Button: Toggle voice mode<br>• Thumbstick: Move around',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'desktop-controls',
        title: 'Desktop Controls ⌨️',
        content: '<strong>On Desktop:</strong><br>• WASD: Move<br>• Mouse: Look around<br>• V: Voice mode<br>• Click: Interact<br>• ESC: Menu',
        highlight: null,
        position: 'center',
        action: null
      },
      {
        id: 'ready',
        title: 'You\'re All Set! ✨',
        content: 'Ready to create your perfect sanctuary? Choose a mode from the menu to begin your journey!',
        highlight: null,
        position: 'center',
        action: null
      }
    ];

    this.totalSteps = this.steps.length;
  }

  async init() {
    Logger.info('Initializing onboarding manager');

    // Check if user has completed onboarding before
    this.hasCompletedBefore = this.checkOnboardingStatus();

    // Create onboarding UI container
    this.createOnboardingUI();

    // Listen for HUD ready event
    this.core.on('hudReady', () => {
      if (!this.hasCompletedBefore) {
        // Auto-start onboarding for new users
        setTimeout(() => this.start(), 1500);
      }
    });
  }

  checkOnboardingStatus() {
    try {
      return localStorage.getItem('sanctuary_onboarding_completed') === 'true';
    } catch (error) {
      return false;
    }
  }

  saveOnboardingStatus() {
    try {
      localStorage.setItem('sanctuary_onboarding_completed', 'true');
      localStorage.setItem('sanctuary_onboarding_date', new Date().toISOString());
    } catch (error) {
      Logger.warn('Could not save onboarding status:', error);
    }
  }

  createOnboardingUI() {
    const container = document.createElement('div');
    container.id = 'onboarding-container';
    container.className = 'onboarding-container hidden';
    container.innerHTML = `
      <div class="onboarding-overlay"></div>

      <div class="onboarding-spotlight" id="spotlight"></div>

      <div class="onboarding-tooltip" id="onboarding-tooltip">
        <div class="tooltip-header">
          <h3 class="tooltip-title" id="tooltip-title"></h3>
          <div class="tooltip-progress">
            <span id="step-counter">1 / ${this.totalSteps}</span>
          </div>
        </div>

        <div class="tooltip-content" id="tooltip-content"></div>

        <div class="tooltip-footer">
          <button class="tooltip-btn secondary" id="skip-btn">Skip Tutorial</button>
          <div class="tooltip-navigation">
            <button class="tooltip-btn" id="prev-btn" disabled>Previous</button>
            <button class="tooltip-btn primary" id="next-btn">Next</button>
          </div>
        </div>
      </div>

      <div class="voice-demo-panel hidden" id="voice-demo">
        <div class="voice-demo-content">
          <div class="voice-icon">🎤</div>
          <h3>Voice Creation Demo</h3>
          <div class="voice-waveform">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
          <p class="voice-text">"Create a peaceful zen garden..."</p>
          <div class="voice-response">
            <div class="response-icon">✓</div>
            <p>Creating zen garden environment...</p>
          </div>
        </div>
      </div>

      <div class="creation-showcase hidden" id="creation-showcase">
        <div class="showcase-grid">
          <div class="showcase-card">
            <div class="card-icon">🌄</div>
            <h4>Environments</h4>
            <p>Gardens, temples, cosmic spaces</p>
          </div>
          <div class="showcase-card">
            <div class="card-icon">🗿</div>
            <h4>Objects</h4>
            <p>Furniture, art, decorations</p>
          </div>
          <div class="showcase-card">
            <div class="card-icon">💡</div>
            <h4>Lighting</h4>
            <p>Atmosphere, time, effects</p>
          </div>
          <div class="showcase-card">
            <div class="card-icon">🔊</div>
            <h4>Audio</h4>
            <p>Music, nature, ambience</p>
          </div>
          <div class="showcase-card">
            <div class="card-icon">🎯</div>
            <h4>Interactions</h4>
            <p>Buttons, triggers, animations</p>
          </div>
          <div class="showcase-card">
            <div class="card-icon">✨</div>
            <h4>Effects</h4>
            <p>Particles, portals, magic</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    this.onboardingContainer = container;

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const skipBtn = document.getElementById('skip-btn');

    nextBtn?.addEventListener('click', () => this.nextStep());
    prevBtn?.addEventListener('click', () => this.previousStep());
    skipBtn?.addEventListener('click', () => this.skip());

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return;

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        this.nextStep();
      } else if (e.key === 'ArrowLeft') {
        this.previousStep();
      } else if (e.key === 'Escape') {
        this.skip();
      }
    });
  }

  async start() {
    Logger.info('Starting onboarding tutorial');
    this.isActive = true;
    this.currentStep = 0;

    // Show onboarding container
    this.onboardingContainer?.classList.remove('hidden');

    // Hide HUD temporarily
    this.hudManager.hideHUD();

    // Show first step
    await this.showStep(0);
  }

  async showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;

    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];

    // Update tooltip content
    const title = document.getElementById('tooltip-title');
    const content = document.getElementById('tooltip-content');
    const counter = document.getElementById('step-counter');

    if (title) title.textContent = step.title;
    if (content) content.innerHTML = step.content;
    if (counter) counter.textContent = `${stepIndex + 1} / ${this.totalSteps}`;

    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (prevBtn) prevBtn.disabled = stepIndex === 0;
    if (nextBtn) {
      nextBtn.textContent = stepIndex === this.totalSteps - 1 ? 'Finish' : 'Next';
    }

    // Handle highlighting
    this.updateHighlight(step.highlight);

    // Position tooltip
    this.positionTooltip(step.position, step.highlight);

    // Execute step action if any
    if (step.action) {
      await step.action();
    }

    // Animate tooltip entrance
    this.animateTooltip();
  }

  updateHighlight(selector) {
    const spotlight = document.getElementById('spotlight');
    if (!spotlight) return;

    // Remove previous highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });

    if (!selector) {
      spotlight.classList.remove('active');
      return;
    }

    const element = document.querySelector(selector);
    if (!element) {
      spotlight.classList.remove('active');
      return;
    }

    // Highlight the element
    element.classList.add('onboarding-highlight');

    // Position spotlight
    const rect = element.getBoundingClientRect();
    spotlight.style.left = `${rect.left - 10}px`;
    spotlight.style.top = `${rect.top - 10}px`;
    spotlight.style.width = `${rect.width + 20}px`;
    spotlight.style.height = `${rect.height + 20}px`;
    spotlight.classList.add('active');
  }

  positionTooltip(position, highlightSelector) {
    const tooltip = document.getElementById('onboarding-tooltip');
    if (!tooltip) return;

    // Reset positioning
    tooltip.style.top = '';
    tooltip.style.bottom = '';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';

    if (position === 'center' || !highlightSelector) {
      tooltip.style.top = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      return;
    }

    const element = document.querySelector(highlightSelector);
    if (!element) return;

    const rect = element.getBoundingClientRect();

    switch (position) {
      case 'top':
        tooltip.style.bottom = `${window.innerHeight - rect.top + 20}px`;
        break;
      case 'bottom':
        tooltip.style.top = `${rect.bottom + 20}px`;
        break;
      case 'left':
        tooltip.style.left = `${rect.left - tooltip.offsetWidth - 20}px`;
        tooltip.style.top = `${rect.top}px`;
        tooltip.style.transform = '';
        break;
      case 'right':
        tooltip.style.left = `${rect.right + 20}px`;
        tooltip.style.top = `${rect.top}px`;
        tooltip.style.transform = '';
        break;
    }
  }

  animateTooltip() {
    const tooltip = document.getElementById('onboarding-tooltip');
    if (!tooltip) return;

    tooltip.classList.remove('tooltip-enter');
    // Force reflow
    void tooltip.offsetWidth;
    tooltip.classList.add('tooltip-enter');
  }

  async showVoiceCreationDemo() {
    const demo = document.getElementById('voice-demo');
    if (!demo) return;

    demo.classList.remove('hidden');
    demo.classList.add('demo-active');

    // Simulate voice input
    await this.sleep(1000);

    const waveform = demo.querySelector('.voice-waveform');
    waveform?.classList.add('active');

    await this.sleep(2000);

    const response = demo.querySelector('.voice-response');
    response?.classList.add('active');

    await this.sleep(2000);

    demo.classList.add('hidden');
    demo.classList.remove('demo-active');
    waveform?.classList.remove('active');
    response?.classList.remove('active');
  }

  async showCreationExamples() {
    const showcase = document.getElementById('creation-showcase');
    if (!showcase) return;

    showcase.classList.remove('hidden');

    // Animate cards
    const cards = showcase.querySelectorAll('.showcase-card');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('card-enter');
      }, i * 100);
    });

    await this.sleep(3000);

    showcase.classList.add('hidden');
    cards.forEach(card => card.classList.remove('card-enter'));
  }

  getExampleCommands() {
    return `
      <div class="example-commands">
        <div class="command-item">
          <strong>"Create a Japanese zen garden"</strong>
          <span class="command-result">→ Generates complete environment</span>
        </div>
        <div class="command-item">
          <strong>"Add a waterfall on the left"</strong>
          <span class="command-result">→ Places water feature</span>
        </div>
        <div class="command-item">
          <strong>"Make it nighttime with stars"</strong>
          <span class="command-result">→ Changes sky and lighting</span>
        </div>
        <div class="command-item">
          <strong>"Play meditation music"</strong>
          <span class="command-result">→ Starts ambient audio</span>
        </div>
        <div class="command-item">
          <strong>"Remove all objects"</strong>
          <span class="command-result">→ Clears the space</span>
        </div>
      </div>
    `;
  }

  async nextStep() {
    if (this.currentStep < this.totalSteps - 1) {
      await this.showStep(this.currentStep + 1);
    } else {
      this.complete();
    }
  }

  async previousStep() {
    if (this.currentStep > 0) {
      await this.showStep(this.currentStep - 1);
    }
  }

  skip() {
    this.skipRequested = true;
    this.complete();
  }

  complete() {
    Logger.info('Onboarding completed');

    // Save completion status
    if (!this.skipRequested) {
      this.saveOnboardingStatus();
    }

    // Hide onboarding
    this.onboardingContainer?.classList.add('hidden');
    this.isActive = false;

    // Show HUD
    this.hudManager.showHUD();

    // Emit completion event
    this.core.emit('onboardingComplete', {
      completed: !this.skipRequested,
      stepsViewed: this.currentStep + 1
    });
  }

  // Restart onboarding (for help menu)
  restart() {
    this.skipRequested = false;
    this.start();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dispose() {
    if (this.onboardingContainer) {
      this.onboardingContainer.remove();
    }
    this.isActive = false;
  }
}
