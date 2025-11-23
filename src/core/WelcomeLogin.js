/**
 * Welcome Login
 * Beautiful welcome and login screen for user onboarding
 */

export class WelcomeLogin {
  constructor(core) {
    this.core = core;

    // State
    this.isActive = false;
    this.currentStep = 'welcome'; // welcome, create-account, preferences
    this.container = null;

    // User data
    this.userData = {
      username: '',
      email: '',
      isGuest: false,
      preferences: {
        theme: 'cosmic',
        tutorialMode: 'guided',
        voiceEnabled: true,
        startingEnvironment: 'sanctuary'
      }
    };

    // Storage key
    this.storageKey = 'sanctuary-user-profile';
  }

  /**
   * Initialize the welcome login
   */
  async init() {
    console.log('[WelcomeLogin] Initializing welcome login...');

    // Check if user already has a profile
    const existingProfile = this.loadProfile();
    if (existingProfile) {
      console.log('[WelcomeLogin] User profile found, skipping welcome');
      this.userData = existingProfile;
      return false; // Don't show welcome screen
    }

    // Create welcome UI
    this.createWelcomeUI();

    console.log('[WelcomeLogin] Welcome login initialized');
    return true;
  }

  /**
   * Show the welcome screen
   */
  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.isActive = true;
      this.showWelcomeStep();
      this.core.emit('welcomeLoginShown');
    }
  }

  /**
   * Create the welcome UI
   */
  createWelcomeUI() {
    this.container = document.createElement('div');
    this.container.id = 'welcome-login';
    this.container.className = 'welcome-login hidden';
    this.container.innerHTML = `
      <div class="welcome-login-bg">
        <div class="welcome-particles"></div>
      </div>

      <div class="welcome-login-content">
        <!-- Welcome Step -->
        <div class="welcome-step active" data-step="welcome">
          <div class="welcome-logo">
            <div class="logo-icon">🏛️</div>
            <h1 class="logo-text">Sanctuary VR</h1>
            <p class="logo-subtitle">Your Infinite Virtual Reality Experience</p>
          </div>

          <div class="welcome-message">
            <h2>Welcome to Your Sanctuary</h2>
            <p>A place where imagination becomes reality, where you can create, explore, and evolve beyond limits.</p>
            <div class="welcome-features">
              <div class="feature-item">
                <span class="feature-icon">🎤</span>
                <div class="feature-text">
                  <div class="feature-title">Voice Creation</div>
                  <div class="feature-desc">Speak to create worlds</div>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🤖</span>
                <div class="feature-text">
                  <div class="feature-title">AI Companion</div>
                  <div class="feature-desc">Your intelligent guide</div>
                </div>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🧬</span>
                <div class="feature-text">
                  <div class="feature-title">Self-Evolution</div>
                  <div class="feature-desc">System that grows with you</div>
                </div>
              </div>
            </div>
          </div>

          <div class="welcome-actions">
            <button class="btn-primary large create-account-btn">
              <span>Create Account</span>
              <span class="btn-subtitle">Full experience with saves</span>
            </button>
            <button class="btn-secondary large guest-btn">
              <span>Continue as Guest</span>
              <span class="btn-subtitle">Quick start, no account needed</span>
            </button>
          </div>
        </div>

        <!-- Create Account Step -->
        <div class="welcome-step" data-step="create-account">
          <div class="step-header">
            <button class="back-btn">← Back</button>
            <h2>Create Your Account</h2>
            <p>Join the Sanctuary community</p>
          </div>

          <form class="account-form" id="account-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username"
                     placeholder="Choose your sanctuary name"
                     required minlength="3" maxlength="20">
              <div class="input-hint">3-20 characters, letters and numbers only</div>
            </div>

            <div class="form-group">
              <label for="email">Email (Optional)</label>
              <input type="email" id="email" name="email"
                     placeholder="your@email.com">
              <div class="input-hint">For account recovery and updates</div>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" id="terms" name="terms" required>
                <span>I agree to the <a href="#" class="link">Terms of Service</a> and <a href="#" class="link">Privacy Policy</a></span>
              </label>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" id="newsletter" name="newsletter">
                <span>Send me updates about Sanctuary VR</span>
              </label>
            </div>

            <button type="submit" class="btn-primary large">
              Continue →
            </button>
          </form>
        </div>

        <!-- Preferences Step -->
        <div class="welcome-step" data-step="preferences">
          <div class="step-header">
            <button class="back-btn">← Back</button>
            <h2>Customize Your Experience</h2>
            <p>Set your preferences (you can change these later)</p>
          </div>

          <div class="preferences-form">
            <div class="preference-group">
              <label>Visual Theme</label>
              <div class="theme-options">
                <div class="theme-option" data-theme="sanctuary">
                  <div class="theme-preview sanctuary"></div>
                  <div class="theme-name">Classic Sanctuary</div>
                </div>
                <div class="theme-option active" data-theme="cosmic">
                  <div class="theme-preview cosmic"></div>
                  <div class="theme-name">Cosmic Space</div>
                </div>
                <div class="theme-option" data-theme="forest">
                  <div class="theme-preview forest"></div>
                  <div class="theme-name">Enchanted Forest</div>
                </div>
                <div class="theme-option" data-theme="ocean">
                  <div class="theme-preview ocean"></div>
                  <div class="theme-name">Ocean Depths</div>
                </div>
              </div>
            </div>

            <div class="preference-group">
              <label>Tutorial Mode</label>
              <div class="radio-options">
                <label class="radio-option">
                  <input type="radio" name="tutorial" value="guided" checked>
                  <span class="radio-content">
                    <strong>Guided Tutorial</strong>
                    <small>Step-by-step walkthrough (recommended)</small>
                  </span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="tutorial" value="quick">
                  <span class="radio-content">
                    <strong>Quick Start</strong>
                    <small>Just the basics, learn as you go</small>
                  </span>
                </label>
                <label class="radio-option">
                  <input type="radio" name="tutorial" value="skip">
                  <span class="radio-content">
                    <strong>Skip Tutorial</strong>
                    <small>Jump straight in (for experienced users)</small>
                  </span>
                </label>
              </div>
            </div>

            <div class="preference-group">
              <label>Features</label>
              <div class="toggle-options">
                <label class="toggle-option">
                  <input type="checkbox" name="voice-enabled" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Enable Voice Commands</span>
                </label>
                <label class="toggle-option">
                  <input type="checkbox" name="auto-save" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">Auto-save Sanctuary</span>
                </label>
                <label class="toggle-option">
                  <input type="checkbox" name="ai-companion" checked>
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">AI Companion Active</span>
                </label>
              </div>
            </div>

            <button class="btn-primary large start-btn">
              Enter Sanctuary →
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Create animated particles
    this.createParticles();

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Create background particles
   */
  createParticles() {
    const particlesContainer = this.container.querySelector('.welcome-particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'welcome-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;
      particlesContainer.appendChild(particle);
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Create Account button
    const createAccountBtn = this.container.querySelector('.create-account-btn');
    createAccountBtn.addEventListener('click', () => {
      this.showStep('create-account');
    });

    // Guest button
    const guestBtn = this.container.querySelector('.guest-btn');
    guestBtn.addEventListener('click', () => {
      this.continueAsGuest();
    });

    // Back buttons
    this.container.querySelectorAll('.back-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.showPreviousStep();
      });
    });

    // Account form
    const accountForm = this.container.querySelector('#account-form');
    accountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAccountCreation();
    });

    // Theme selection
    this.container.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.container.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.userData.preferences.theme = e.currentTarget.dataset.theme;
      });
    });

    // Tutorial mode
    this.container.querySelectorAll('[name="tutorial"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.userData.preferences.tutorialMode = e.target.value;
      });
    });

    // Feature toggles
    this.container.querySelector('[name="voice-enabled"]').addEventListener('change', (e) => {
      this.userData.preferences.voiceEnabled = e.target.checked;
    });

    // Start button
    const startBtn = this.container.querySelector('.start-btn');
    startBtn.addEventListener('click', () => {
      this.completeWelcome();
    });
  }

  /**
   * Show a specific step
   */
  showStep(stepName) {
    this.currentStep = stepName;

    // Hide all steps
    this.container.querySelectorAll('.welcome-step').forEach(step => {
      step.classList.remove('active');
    });

    // Show target step
    const targetStep = this.container.querySelector(`[data-step="${stepName}"]`);
    if (targetStep) {
      targetStep.classList.add('active');
    }
  }

  /**
   * Show welcome step
   */
  showWelcomeStep() {
    this.showStep('welcome');
  }

  /**
   * Show previous step
   */
  showPreviousStep() {
    const steps = ['welcome', 'create-account', 'preferences'];
    const currentIndex = steps.indexOf(this.currentStep);

    if (currentIndex > 0) {
      this.showStep(steps[currentIndex - 1]);
    }
  }

  /**
   * Handle account creation
   */
  handleAccountCreation() {
    const form = this.container.querySelector('#account-form');
    const formData = new FormData(form);

    this.userData.username = formData.get('username');
    this.userData.email = formData.get('email') || '';
    this.userData.isGuest = false;

    // Validate username
    if (!this.validateUsername(this.userData.username)) {
      alert('Invalid username. Please use 3-20 characters with letters and numbers only.');
      return;
    }

    // Move to preferences
    this.showStep('preferences');
  }

  /**
   * Validate username
   */
  validateUsername(username) {
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(username);
  }

  /**
   * Continue as guest
   */
  continueAsGuest() {
    this.userData.username = 'Guest' + Math.floor(Math.random() * 10000);
    this.userData.isGuest = true;

    // Show preferences
    this.showStep('preferences');
  }

  /**
   * Complete welcome and start sanctuary
   */
  completeWelcome() {
    // Save user profile
    this.saveProfile();

    // Update progression system with username
    if (window.progressionSystem) {
      window.progressionSystem.userData.username = this.userData.username;
      window.progressionSystem.saveProgress();
    }

    // Hide welcome screen
    this.hide();

    // Emit completion event
    this.core.emit('welcomeComplete', {
      userData: this.userData
    });

    console.log('[WelcomeLogin] Welcome completed:', this.userData);
  }

  /**
   * Hide the welcome screen
   */
  hide() {
    if (this.container) {
      this.container.classList.add('fade-out');

      setTimeout(() => {
        this.container.classList.add('hidden');
        this.container.classList.remove('fade-out');
        this.isActive = false;
        this.core.emit('welcomeLoginHidden');
      }, 500);
    }
  }

  /**
   * Save user profile
   */
  saveProfile() {
    try {
      const profileData = {
        ...this.userData,
        createdAt: Date.now(),
        lastLogin: Date.now()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(profileData));
      console.log('[WelcomeLogin] Profile saved');
    } catch (error) {
      console.error('[WelcomeLogin] Failed to save profile:', error);
    }
  }

  /**
   * Load user profile
   */
  loadProfile() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const profile = JSON.parse(saved);

        // Update last login
        profile.lastLogin = Date.now();
        localStorage.setItem(this.storageKey, JSON.stringify(profile));

        return profile;
      }
    } catch (error) {
      console.error('[WelcomeLogin] Failed to load profile:', error);
    }

    return null;
  }

  /**
   * Get user data
   */
  getUserData() {
    return this.userData;
  }

  /**
   * Check if user should see tutorial
   */
  shouldShowTutorial() {
    return this.userData.preferences.tutorialMode !== 'skip';
  }

  /**
   * Get tutorial mode
   */
  getTutorialMode() {
    return this.userData.preferences.tutorialMode;
  }

  /**
   * Destroy welcome login
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}
