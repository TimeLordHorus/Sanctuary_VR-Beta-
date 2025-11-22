/**
 * Boot Screen Manager
 * Handles the interactive loading sequence with mini-game verification
 */

import { Logger } from '../utils/Logger.js';

export class BootScreen {
  constructor() {
    this.bootContainer = null;
    this.currentPhase = 'init'; // init, password, minigame, loading, complete
    this.verified = false;
    this.passwordAttempts = 0;
    this.maxAttempts = 3;
    this.lockoutTime = 30000; // 30 seconds
    this.lastFailedAttempt = 0;

    // Mini-game state
    this.stones = [];
    this.targetPattern = [];
    this.currentPattern = [];
    this.gameCompleted = false;

    // Security
    this.sessionToken = null;
    this.bootStartTime = Date.now();
  }

  async init() {
    Logger.info('Initializing boot screen');

    this.bootContainer = document.getElementById('boot-screen');
    if (!this.bootContainer) {
      Logger.error('Boot screen container not found');
      return;
    }

    // Generate session token
    this.sessionToken = this.generateToken();

    // Start boot sequence
    await this.startBootSequence();
  }

  async startBootSequence() {
    // Phase 1: System initialization
    await this.showSystemInit();

    // Phase 2: Password protection
    await this.showPasswordScreen();
  }

  async showSystemInit() {
    this.currentPhase = 'init';

    const initScreen = `
      <div class="boot-phase" id="system-init">
        <div class="boot-logo">
          <div class="logo-mandala">
            <div class="mandala-ring"></div>
            <div class="mandala-ring"></div>
            <div class="mandala-ring"></div>
            <div class="mandala-center"></div>
          </div>
          <h1 class="boot-title">SANCTUARY VR</h1>
          <p class="boot-version">v0.2.0-beta</p>
        </div>

        <div class="boot-console">
          <div class="console-line"><span class="prompt">[SYSTEM]</span> Initializing Sanctuary Core...</div>
          <div class="console-line"><span class="prompt">[VR]</span> Loading WebXR modules...</div>
          <div class="console-line"><span class="prompt">[NETWORK]</span> Establishing secure connections...</div>
          <div class="console-line"><span class="prompt">[SECURITY]</span> Activating protection protocols...</div>
          <div class="console-line success"><span class="prompt">[OK]</span> All systems operational</div>
        </div>

        <div class="boot-progress">
          <div class="progress-bar">
            <div class="progress-fill" id="init-progress"></div>
          </div>
          <p class="progress-text">Initializing sanctuary systems...</p>
        </div>
      </div>
    `;

    this.bootContainer.innerHTML = initScreen;

    // Animate console lines
    const lines = this.bootContainer.querySelectorAll('.console-line');
    for (let i = 0; i < lines.length; i++) {
      await this.sleep(300);
      lines[i].classList.add('visible');
    }

    // Animate progress bar
    const progressBar = document.getElementById('init-progress');
    if (progressBar) {
      progressBar.style.width = '100%';
    }

    await this.sleep(1500);
  }

  async showPasswordScreen() {
    this.currentPhase = 'password';

    // Check if locked out
    if (this.isLockedOut()) {
      this.showLockoutScreen();
      return;
    }

    const passwordScreen = `
      <div class="boot-phase" id="password-screen">
        <div class="security-frame">
          <div class="security-header">
            <div class="security-icon">🔐</div>
            <h2>SANCTUARY ACCESS CONTROL</h2>
            <p class="security-subtitle">Enter your sanctuary passphrase</p>
          </div>

          <div class="password-container">
            <div class="password-field-wrapper">
              <input
                type="password"
                id="sanctuary-password"
                class="password-input"
                placeholder="Enter passphrase..."
                autocomplete="off"
                maxlength="32">
              <button class="toggle-visibility" id="toggle-password">👁️</button>
            </div>

            <div class="password-hint">
              <p>Hint: The key to inner peace (default: "sanctuary")</p>
            </div>

            <div class="password-attempts">
              <span>Attempts remaining: <strong id="attempts-left">${this.maxAttempts - this.passwordAttempts}</strong></span>
            </div>

            <button class="boot-button primary" id="verify-password">
              Unlock Sanctuary
            </button>

            <div class="security-footer">
              <p>🛡️ Protected by quantum encryption</p>
              <p class="session-id">Session: ${this.sessionToken.substring(0, 8)}</p>
            </div>
          </div>

          <div class="password-feedback" id="password-feedback"></div>
        </div>

        <div class="security-particles" id="security-particles"></div>
      </div>
    `;

    this.bootContainer.innerHTML = passwordScreen;

    // Create security particles
    this.createSecurityParticles();

    // Setup event listeners
    this.setupPasswordListeners();
  }

  setupPasswordListeners() {
    const passwordInput = document.getElementById('sanctuary-password');
    const verifyButton = document.getElementById('verify-password');
    const toggleButton = document.getElementById('toggle-password');

    if (!passwordInput || !verifyButton) return;

    // Toggle password visibility
    toggleButton?.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      toggleButton.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // Enter key support
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.verifyPassword();
      }
    });

    // Verify button
    verifyButton.addEventListener('click', () => {
      this.verifyPassword();
    });

    // Auto-focus
    passwordInput.focus();
  }

  async verifyPassword() {
    const passwordInput = document.getElementById('sanctuary-password');
    const feedback = document.getElementById('password-feedback');

    if (!passwordInput || !feedback) return;

    const password = passwordInput.value.trim();

    // Check if empty
    if (!password) {
      this.showPasswordFeedback('Please enter a passphrase', 'error');
      return;
    }

    // Simple password check (in production, this would be more secure)
    const correctPassword = 'sanctuary'; // Default password

    if (password === correctPassword) {
      this.showPasswordFeedback('Access granted! ✓', 'success');
      await this.sleep(1000);
      await this.showMiniGame();
    } else {
      this.passwordAttempts++;
      this.lastFailedAttempt = Date.now();

      const attemptsLeft = this.maxAttempts - this.passwordAttempts;

      if (attemptsLeft <= 0) {
        this.showPasswordFeedback('Maximum attempts exceeded. System locked.', 'error');
        await this.sleep(2000);
        this.showLockoutScreen();
      } else {
        this.showPasswordFeedback(
          `Incorrect passphrase. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
          'error'
        );

        // Update attempts display
        const attemptsElement = document.getElementById('attempts-left');
        if (attemptsElement) {
          attemptsElement.textContent = attemptsLeft;
          attemptsElement.style.color = attemptsLeft === 1 ? '#ef4444' : '';
        }
      }

      // Shake animation
      passwordInput.classList.add('shake');
      setTimeout(() => passwordInput.classList.remove('shake'), 500);
      passwordInput.value = '';
    }
  }

  showPasswordFeedback(message, type) {
    const feedback = document.getElementById('password-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = `password-feedback ${type}`;
    feedback.classList.add('visible');
  }

  isLockedOut() {
    if (this.passwordAttempts < this.maxAttempts) return false;

    const timeSinceLastAttempt = Date.now() - this.lastFailedAttempt;
    return timeSinceLastAttempt < this.lockoutTime;
  }

  showLockoutScreen() {
    const remainingTime = Math.ceil((this.lockoutTime - (Date.now() - this.lastFailedAttempt)) / 1000);

    const lockoutScreen = `
      <div class="boot-phase" id="lockout-screen">
        <div class="lockout-container">
          <div class="lockout-icon">🚫</div>
          <h2 class="lockout-title">SYSTEM LOCKED</h2>
          <p class="lockout-message">Too many failed attempts detected</p>

          <div class="lockout-timer">
            <div class="timer-circle">
              <span id="lockout-countdown">${remainingTime}</span>
            </div>
            <p>seconds remaining</p>
          </div>

          <div class="lockout-info">
            <p>🛡️ Anti-intrusion protocol activated</p>
            <p>Session: ${this.sessionToken.substring(0, 8)}</p>
          </div>
        </div>
      </div>
    `;

    this.bootContainer.innerHTML = lockoutScreen;

    // Countdown timer
    const countdown = setInterval(() => {
      if (!this.isLockedOut()) {
        clearInterval(countdown);
        this.passwordAttempts = 0;
        this.showPasswordScreen();
      } else {
        const remaining = Math.ceil((this.lockoutTime - (Date.now() - this.lastFailedAttempt)) / 1000);
        const countdownElement = document.getElementById('lockout-countdown');
        if (countdownElement) {
          countdownElement.textContent = remaining;
        }
      }
    }, 1000);
  }

  async showMiniGame() {
    this.currentPhase = 'minigame';

    const miniGameScreen = `
      <div class="boot-phase" id="minigame-screen">
        <div class="minigame-container">
          <div class="minigame-header">
            <h2>HUMAN VERIFICATION</h2>
            <p class="minigame-subtitle">Arrange the sanctuary stones in the correct pattern</p>
          </div>

          <div class="minigame-instructions">
            <p>Click the stones in the order they illuminate</p>
            <div class="pattern-display" id="pattern-display">
              <div class="pattern-stone"></div>
              <div class="pattern-stone"></div>
              <div class="pattern-stone"></div>
              <div class="pattern-stone"></div>
              <div class="pattern-stone"></div>
            </div>
          </div>

          <div class="stone-garden" id="stone-garden">
            <div class="stone" data-index="0">
              <div class="stone-inner">1</div>
            </div>
            <div class="stone" data-index="1">
              <div class="stone-inner">2</div>
            </div>
            <div class="stone" data-index="2">
              <div class="stone-inner">3</div>
            </div>
            <div class="stone" data-index="3">
              <div class="stone-inner">4</div>
            </div>
            <div class="stone" data-index="4">
              <div class="stone-inner">5</div>
            </div>
          </div>

          <div class="minigame-status">
            <p id="game-status">Watch the pattern...</p>
            <button class="boot-button" id="restart-game" style="display: none;">Try Again</button>
          </div>
        </div>
      </div>
    `;

    this.bootContainer.innerHTML = miniGameScreen;

    // Initialize mini-game
    await this.initMiniGame();
  }

  async initMiniGame() {
    // Generate random pattern
    this.targetPattern = this.generatePattern(5);
    this.currentPattern = [];
    this.gameCompleted = false;

    Logger.info('Mini-game pattern:', this.targetPattern);

    // Show pattern
    await this.showPattern();

    // Setup stone click handlers
    this.setupStoneListeners();
  }

  generatePattern(length) {
    const pattern = [];
    for (let i = 0; i < length; i++) {
      pattern.push(Math.floor(Math.random() * 5));
    }
    return pattern;
  }

  async showPattern() {
    const status = document.getElementById('game-status');
    if (status) status.textContent = 'Watch carefully...';

    await this.sleep(1000);

    for (let i = 0; i < this.targetPattern.length; i++) {
      const stoneIndex = this.targetPattern[i];
      await this.highlightStone(stoneIndex);
      await this.sleep(600);
    }

    if (status) status.textContent = 'Now repeat the pattern!';
  }

  async highlightStone(index) {
    const stones = document.querySelectorAll('.stone');
    const patternStones = document.querySelectorAll('.pattern-stone');

    if (stones[index]) {
      stones[index].classList.add('highlighted');

      // Play sound effect (if available)
      this.playTone(200 + index * 100);

      setTimeout(() => {
        stones[index].classList.remove('highlighted');
      }, 400);
    }

    if (patternStones[this.currentPattern.length]) {
      patternStones[this.currentPattern.length].classList.add('filled');
    }
  }

  setupStoneListeners() {
    const stones = document.querySelectorAll('.stone');

    stones.forEach((stone, index) => {
      stone.addEventListener('click', () => {
        if (this.gameCompleted) return;

        this.handleStoneClick(index);
      });
    });

    // Restart button
    const restartButton = document.getElementById('restart-game');
    if (restartButton) {
      restartButton.addEventListener('click', () => {
        this.initMiniGame();
      });
    }
  }

  async handleStoneClick(index) {
    this.currentPattern.push(index);

    // Visual feedback
    const stones = document.querySelectorAll('.stone');
    if (stones[index]) {
      stones[index].classList.add('clicked');
      this.playTone(200 + index * 100);
      setTimeout(() => stones[index].classList.remove('clicked'), 200);
    }

    // Update pattern display
    const patternStones = document.querySelectorAll('.pattern-stone');
    if (patternStones[this.currentPattern.length - 1]) {
      patternStones[this.currentPattern.length - 1].classList.add('filled');
    }

    // Check if pattern matches so far
    const currentIndex = this.currentPattern.length - 1;
    if (this.currentPattern[currentIndex] !== this.targetPattern[currentIndex]) {
      // Wrong pattern
      await this.handleGameFailure();
      return;
    }

    // Check if pattern is complete
    if (this.currentPattern.length === this.targetPattern.length) {
      await this.handleGameSuccess();
    }
  }

  async handleGameSuccess() {
    this.gameCompleted = true;
    this.verified = true;

    const status = document.getElementById('game-status');
    if (status) {
      status.textContent = '✓ Verification successful!';
      status.style.color = '#10b981';
    }

    // Celebrate
    this.celebrateSuccess();

    await this.sleep(2000);
    await this.showFinalLoading();
  }

  async handleGameFailure() {
    const status = document.getElementById('game-status');
    if (status) {
      status.textContent = '✗ Incorrect pattern. Try again!';
      status.style.color = '#ef4444';
    }

    // Show restart button
    const restartButton = document.getElementById('restart-game');
    if (restartButton) {
      restartButton.style.display = 'block';
    }

    // Clear pattern display
    const patternStones = document.querySelectorAll('.pattern-stone');
    patternStones.forEach(stone => stone.classList.remove('filled'));

    // Play error sound
    this.playTone(100, 300);
  }

  celebrateSuccess() {
    // Create success particles
    const container = document.getElementById('minigame-screen');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'success-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 0.5}s`;
      container.appendChild(particle);

      setTimeout(() => particle.remove(), 2000);
    }
  }

  async showFinalLoading() {
    this.currentPhase = 'loading';

    const loadingScreen = `
      <div class="boot-phase" id="final-loading">
        <div class="final-loading-container">
          <div class="loading-mandala">
            <div class="mandala-spinner"></div>
          </div>

          <h2 class="loading-title">Welcome to the Sanctuary</h2>

          <div class="loading-messages" id="loading-messages">
            <p class="loading-message">Preparing your sanctuary...</p>
          </div>

          <div class="loading-bar">
            <div class="loading-fill" id="final-progress"></div>
          </div>
        </div>
      </div>
    `;

    this.bootContainer.innerHTML = loadingScreen;

    const messages = [
      'Preparing your sanctuary...',
      'Loading VR environments...',
      'Establishing connections...',
      'Synchronizing systems...',
      'Almost ready...'
    ];

    const messagesContainer = document.getElementById('loading-messages');
    const progressBar = document.getElementById('final-progress');

    for (let i = 0; i < messages.length; i++) {
      if (messagesContainer) {
        messagesContainer.innerHTML = `<p class="loading-message">${messages[i]}</p>`;
      }

      if (progressBar) {
        progressBar.style.width = `${((i + 1) / messages.length) * 100}%`;
      }

      await this.sleep(800);
    }

    await this.sleep(500);
    this.completeBoot();
  }

  completeBoot() {
    this.currentPhase = 'complete';
    Logger.info('Boot sequence complete');

    // Hide boot screen
    if (this.bootContainer) {
      this.bootContainer.classList.add('fade-out');
      setTimeout(() => {
        this.bootContainer.style.display = 'none';
      }, 1000);
    }

    // Emit boot complete event
    if (typeof window !== 'undefined' && window.sanctuaryInstance) {
      window.sanctuaryInstance.core?.emit('bootComplete', {
        verified: this.verified,
        sessionToken: this.sessionToken,
        bootTime: Date.now() - this.bootStartTime
      });
    }
  }

  createSecurityParticles() {
    const container = document.getElementById('security-particles');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'security-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 3}s`;
      particle.style.animationDuration = `${3 + Math.random() * 2}s`;
      container.appendChild(particle);
    }
  }

  playTone(frequency, duration = 100) {
    // Simple audio feedback using Web Audio API
    if (typeof window === 'undefined' || !window.AudioContext) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      Logger.warn('Audio feedback not available:', error);
    }
  }

  generateToken() {
    return 'sanctuary_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Skip boot (for development)
  skipBoot() {
    Logger.warn('Boot sequence skipped');
    this.verified = true;
    this.completeBoot();
  }
}
