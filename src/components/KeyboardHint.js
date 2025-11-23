/**
 * Keyboard Hint Component
 * Shows visual indicators for keyboard shortcuts
 */

export class KeyboardHint {
  constructor() {
    this.container = null;
    this.hints = [
      { key: 'Q', description: 'Sanctuary Menu', color: '#6366f1' },
      { key: 'V', description: 'Voice Commands', color: '#8b5cf6' }
    ];
    this.isVisible = true;
    this.autoHideTimeout = null;
  }

  /**
   * Initialize and show keyboard hints
   */
  init() {
    this.createHintContainer();
    this.show();

    // Auto-hide after 10 seconds
    this.autoHideTimeout = setTimeout(() => {
      this.hide();
    }, 10000);

    // Show again on any key press
    document.addEventListener('keydown', () => {
      if (!this.isVisible) {
        this.show();
        clearTimeout(this.autoHideTimeout);
        this.autoHideTimeout = setTimeout(() => {
          this.hide();
        }, 5000);
      }
    }, { once: false, passive: true });
  }

  /**
   * Create the hint container
   */
  createHintContainer() {
    this.container = document.createElement('div');
    this.container.id = 'keyboard-hints';
    this.container.className = 'keyboard-hints';
    this.container.innerHTML = `
      <div class="keyboard-hints-wrapper">
        ${this.hints.map(hint => `
          <div class="keyboard-hint" style="--hint-color: ${hint.color}">
            <kbd class="hint-key">${hint.key}</kbd>
            <span class="hint-description">${hint.description}</span>
          </div>
        `).join('')}
      </div>
      <button class="keyboard-hints-close" title="Close">×</button>
    `;

    document.body.appendChild(this.container);

    // Close button
    this.container.querySelector('.keyboard-hints-close').addEventListener('click', () => {
      this.hide(true);
    });
  }

  /**
   * Show hints
   */
  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
      this.isVisible = true;
    }
  }

  /**
   * Hide hints
   */
  hide(permanent = false) {
    if (this.container) {
      this.container.classList.add('hidden');
      this.isVisible = false;

      if (permanent) {
        clearTimeout(this.autoHideTimeout);
        localStorage.setItem('sanctuary-keyboard-hints-dismissed', 'true');
      }
    }
  }

  /**
   * Check if hints should be shown
   */
  shouldShow() {
    return !localStorage.getItem('sanctuary-keyboard-hints-dismissed');
  }

  /**
   * Destroy hints
   */
  destroy() {
    clearTimeout(this.autoHideTimeout);
    if (this.container) {
      this.container.remove();
    }
  }
}
