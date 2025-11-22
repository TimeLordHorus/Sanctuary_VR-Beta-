/**
 * Voice UI Component
 * Visual feedback for voice creation system
 */

export class VoiceUI {
  constructor(core, voiceSystem) {
    this.core = core;
    this.voiceSystem = voiceSystem;

    this.container = null;
    this.statusIndicator = null;
    this.transcriptDisplay = null;
    this.feedbackDisplay = null;
    this.waveformCanvas = null;
    this.waveformContext = null;

    this.isVisible = false;
    this.currentState = 'idle'; // idle, listening, processing, success, error
  }

  /**
   * Initialize the voice UI
   */
  init() {
    console.log('[VoiceUI] Initializing voice UI...');

    this.createUI();
    this.setupEventListeners();

    console.log('[VoiceUI] Voice UI initialized');
  }

  /**
   * Create the UI elements
   */
  createUI() {
    // Main container
    this.container = document.createElement('div');
    this.container.id = 'voice-ui';
    this.container.className = 'voice-ui hidden';
    this.container.innerHTML = `
      <div class="voice-ui-content">
        <div class="voice-status">
          <div class="voice-status-icon">
            <div class="mic-icon">
              <div class="mic-waves"></div>
              <svg viewBox="0 0 24 24" class="mic-svg">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </div>
          </div>
          <div class="voice-status-text">
            <div class="status-label">Voice Assistant</div>
            <div class="status-state">Ready</div>
          </div>
        </div>

        <div class="voice-waveform">
          <canvas id="voice-waveform-canvas" width="300" height="60"></canvas>
        </div>

        <div class="voice-transcript">
          <div class="transcript-label">Listening...</div>
          <div class="transcript-text"></div>
        </div>

        <div class="voice-feedback">
          <div class="feedback-message"></div>
          <div class="feedback-progress">
            <div class="progress-bar"></div>
          </div>
        </div>

        <div class="voice-controls">
          <button class="voice-btn voice-toggle" title="Toggle Voice (V)">
            <svg viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
          <button class="voice-btn voice-help" title="Voice Commands Help">
            <svg viewBox="0 0 24 24">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
            </svg>
          </button>
          <button class="voice-btn voice-settings" title="Voice Settings">
            <svg viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
            </svg>
          </button>
        </div>

        <div class="voice-hints">
          <div class="hint">Try: "Create a red cube"</div>
          <div class="hint">Try: "Make it night"</div>
          <div class="hint">Try: "Change lighting to blue"</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    // Get references
    this.statusIndicator = this.container.querySelector('.voice-status-icon');
    this.statusText = this.container.querySelector('.status-state');
    this.transcriptDisplay = this.container.querySelector('.transcript-text');
    this.feedbackDisplay = this.container.querySelector('.feedback-message');
    this.progressBar = this.container.querySelector('.progress-bar');

    // Setup waveform canvas
    this.waveformCanvas = this.container.querySelector('#voice-waveform-canvas');
    this.waveformContext = this.waveformCanvas.getContext('2d');

    // Setup buttons
    this.container.querySelector('.voice-toggle').addEventListener('click', () => {
      this.voiceSystem.toggleListening();
    });

    this.container.querySelector('.voice-help').addEventListener('click', () => {
      this.showHelp();
    });

    this.container.querySelector('.voice-settings').addEventListener('click', () => {
      this.showSettings();
    });
  }

  /**
   * Setup event listeners for voice system
   */
  setupEventListeners() {
    // Listen for voice system events
    this.core.on('voiceListeningStarted', () => this.handleListeningStart());
    this.core.on('voiceListeningStopped', () => this.handleListeningStop());
    this.core.on('voiceFeedback', (data) => this.showFeedback(data));
    this.core.on('voiceCommandSuccess', (data) => this.handleCommandSuccess(data));
    this.core.on('voiceCommandError', (data) => this.handleCommandError(data));
    this.core.on('voiceSystemError', (data) => this.handleSystemError(data));

    // Keyboard shortcut: V to toggle voice
    document.addEventListener('keydown', (e) => {
      if (e.key === 'v' || e.key === 'V') {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          // Check if not typing in an input
          if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            e.preventDefault();
            this.voiceSystem.toggleListening();
          }
        }
      }
    });

    // Start waveform animation
    this.animateWaveform();
  }

  /**
   * Handle listening start
   */
  handleListeningStart() {
    this.setState('listening');
    this.show();
  }

  /**
   * Handle listening stop
   */
  handleListeningStop() {
    this.setState('idle');
  }

  /**
   * Show feedback message
   */
  showFeedback(data) {
    const { message, type, progress } = data;

    this.feedbackDisplay.textContent = message;
    this.feedbackDisplay.className = `feedback-message ${type}`;

    if (progress !== null && progress !== undefined) {
      this.progressBar.style.width = `${progress * 100}%`;
      this.progressBar.parentElement.style.display = 'block';
    } else {
      this.progressBar.parentElement.style.display = 'none';
    }

    // Update state based on type
    if (type === 'processing') {
      this.setState('processing');
    } else if (type === 'error') {
      this.setState('error');
    } else if (type === 'success') {
      this.setState('success');
    }

    // Update transcript display if interim
    if (type === 'interim') {
      this.transcriptDisplay.textContent = message;
      this.transcriptDisplay.classList.add('interim');
    } else if (type === 'processing') {
      this.transcriptDisplay.classList.remove('interim');
    }
  }

  /**
   * Handle command success
   */
  handleCommandSuccess(data) {
    this.setState('success');

    setTimeout(() => {
      if (this.voiceSystem.isListening) {
        this.setState('listening');
      } else {
        this.setState('idle');
      }
    }, 2000);
  }

  /**
   * Handle command error
   */
  handleCommandError(data) {
    this.setState('error');

    setTimeout(() => {
      if (this.voiceSystem.isListening) {
        this.setState('listening');
      } else {
        this.setState('idle');
      }
    }, 3000);
  }

  /**
   * Handle system error
   */
  handleSystemError(data) {
    this.setState('error');
    this.feedbackDisplay.textContent = data.error;
  }

  /**
   * Set UI state
   */
  setState(state) {
    this.currentState = state;
    this.container.className = `voice-ui ${state}`;

    const stateLabels = {
      idle: 'Ready',
      listening: 'Listening...',
      processing: 'Processing...',
      success: 'Success!',
      error: 'Error'
    };

    this.statusText.textContent = stateLabels[state] || 'Ready';
  }

  /**
   * Animate waveform visualization
   */
  animateWaveform() {
    const animate = () => {
      const canvas = this.waveformCanvas;
      const ctx = this.waveformContext;
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (this.currentState === 'listening' || this.currentState === 'processing') {
        // Draw animated waveform
        const bars = 20;
        const barWidth = width / bars;
        const time = Date.now() / 100;

        ctx.fillStyle = this.currentState === 'listening' ? '#6366f1' : '#8b5cf6';

        for (let i = 0; i < bars; i++) {
          const barHeight = Math.sin(time + i * 0.5) * 20 + 25;
          const x = i * barWidth;
          const y = (height - barHeight) / 2;

          ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
        }
      } else {
        // Draw static line
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Show help dialog
   */
  showHelp() {
    const helpContent = `
      <div class="voice-help-dialog">
        <h3>Voice Commands</h3>
        <div class="help-section">
          <h4>Creating Objects</h4>
          <ul>
            <li>"Create a red cube"</li>
            <li>"Make a large blue sphere"</li>
            <li>"Spawn a tree"</li>
            <li>"Add a wooden table"</li>
          </ul>
        </div>
        <div class="help-section">
          <h4>Environment</h4>
          <ul>
            <li>"Make it night"</li>
            <li>"Change lighting to sunset"</li>
            <li>"Make it rainy"</li>
            <li>"Create a peaceful atmosphere"</li>
          </ul>
        </div>
        <div class="help-section">
          <h4>Modifications</h4>
          <ul>
            <li>"Make it bigger"</li>
            <li>"Change the cube to green"</li>
            <li>"Move it to the left"</li>
            <li>"Delete the sphere"</li>
          </ul>
        </div>
        <div class="help-section">
          <h4>Controls</h4>
          <ul>
            <li>Press <kbd>V</kbd> to toggle voice</li>
            <li>Speak clearly and naturally</li>
            <li>Wait for the feedback before next command</li>
          </ul>
        </div>
      </div>
    `;

    this.core.emit('showDialog', {
      title: 'Voice Commands Help',
      content: helpContent,
      type: 'info'
    });
  }

  /**
   * Show settings dialog
   */
  showSettings() {
    const languages = this.voiceSystem.voiceRecognition.getAvailableLanguages();

    const settingsContent = `
      <div class="voice-settings-dialog">
        <div class="setting-item">
          <label for="voice-language">Language</label>
          <select id="voice-language">
            ${languages.map(lang => `
              <option value="${lang.code}" ${lang.code === this.voiceSystem.config.language ? 'selected' : ''}>
                ${lang.name}
              </option>
            `).join('')}
          </select>
        </div>
        <div class="setting-item">
          <label for="voice-confidence">Confidence Threshold</label>
          <input type="range" id="voice-confidence" min="0" max="1" step="0.1"
                 value="${this.voiceSystem.config.confidenceThreshold}">
          <span class="range-value">${this.voiceSystem.config.confidenceThreshold}</span>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="voice-feedback"
                   ${this.voiceSystem.config.enableFeedback ? 'checked' : ''}>
            Enable Visual Feedback
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input type="checkbox" id="voice-auto-execute"
                   ${this.voiceSystem.config.autoExecute ? 'checked' : ''}>
            Auto-execute Commands
          </label>
        </div>
      </div>
    `;

    this.core.emit('showDialog', {
      title: 'Voice Settings',
      content: settingsContent,
      type: 'settings',
      onConfirm: () => {
        // Save settings
        const language = document.getElementById('voice-language').value;
        const confidence = parseFloat(document.getElementById('voice-confidence').value);
        const feedback = document.getElementById('voice-feedback').checked;
        const autoExecute = document.getElementById('voice-auto-execute').checked;

        this.voiceSystem.updateConfig({
          language,
          confidenceThreshold: confidence,
          enableFeedback: feedback,
          autoExecute
        });
      }
    });
  }

  /**
   * Show the voice UI
   */
  show() {
    this.isVisible = true;
    this.container.classList.remove('hidden');
  }

  /**
   * Hide the voice UI
   */
  hide() {
    this.isVisible = false;
    this.container.classList.add('hidden');
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Destroy the UI
   */
  destroy() {
    if (this.container) {
      this.container.remove();
    }
  }
}
