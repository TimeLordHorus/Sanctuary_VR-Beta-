/**
 * Key Mapping System
 * Advanced customizable keyboard controls for desktop VR experience
 */

export class KeyMappingSystem {
  constructor(core) {
    this.core = core;

    // Default key mappings
    this.defaultMappings = {
      // Movement
      moveForward: ['w', 'ArrowUp'],
      moveBackward: ['s', 'ArrowDown'],
      moveLeft: ['a', 'ArrowLeft'],
      moveRight: ['d', 'ArrowRight'],
      jump: [' ', 'Spacebar'],
      crouch: ['c', 'Control'],
      sprint: ['Shift'],

      // Actions
      interact: ['e', 'Enter'],
      use: ['f'],
      drop: ['g'],
      pickup: ['r'],

      // UI
      inventory: ['i', 'Tab'],
      map: ['m'],
      menu: ['Escape'],
      sanctuaryMenu: ['q'],

      // Communication
      voice: ['v'],
      chat: ['t'],

      // Camera
      lookUp: ['PageUp'],
      lookDown: ['PageDown'],
      lookLeft: ['Home'],
      lookRight: ['End'],
      centerCamera: ['z'],

      // Quick slots (1-9)
      quickSlot1: ['1'],
      quickSlot2: ['2'],
      quickSlot3: ['3'],
      quickSlot4: ['4'],
      quickSlot5: ['5'],
      quickSlot6: ['6'],
      quickSlot7: ['7'],
      quickSlot8: ['8'],
      quickSlot9: ['9'],
      quickSlot10: ['0'],

      // Tools
      screenshot: ['F12'],
      toggleHUD: ['h'],
      toggleFullscreen: ['F11'],

      // Progression
      characterSheet: ['p'],
      achievements: ['y'],
      quests: ['j'],

      // World
      placeMarker: ['b'],
      toggleWeather: ['n'],
      toggleTime: ['u'],

      // Advanced
      togglePhysics: ['F1'],
      toggleDebug: ['F2'],
      resetPosition: ['F3'],
      savePosition: ['F4'],
      loadPosition: ['F5']
    };

    // Current active mappings
    this.mappings = this.loadMappings() || JSON.parse(JSON.stringify(this.defaultMappings));

    // Key states
    this.keysPressed = new Set();
    this.keyCallbacks = new Map();

    // Recording state for rebinding
    this.recordingKey = null;
    this.recordingCallback = null;

    // Enabled state
    this.enabled = true;

    // Storage key
    this.storageKey = 'sanctuary-key-mappings';
  }

  /**
   * Initialize key mapping system
   */
  async init() {
    console.log('[KeyMappingSystem] Initializing key mapping system...');

    // Set up event listeners
    this.setupEventListeners();

    // Create UI
    this.createKeyMappingUI();

    // Register default actions
    this.registerDefaultActions();

    console.log('[KeyMappingSystem] Key mapping system initialized');
    return this;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e), true);
    document.addEventListener('keyup', (e) => this.handleKeyUp(e), true);

    // Prevent default for mapped keys
    document.addEventListener('keydown', (e) => {
      if (this.isMappedKey(e.key) && this.enabled) {
        // Don't prevent if typing in input
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        e.preventDefault();
      }
    }, true);
  }

  /**
   * Handle key down
   */
  handleKeyDown(e) {
    if (!this.enabled) return;

    // Skip if typing in input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    // If recording a new key binding
    if (this.recordingKey) {
      this.completeKeyRecording(e.key);
      e.preventDefault();
      return;
    }

    const key = this.normalizeKey(e.key);

    // Add to pressed keys
    this.keysPressed.add(key);

    // Find action for this key
    const action = this.getActionForKey(key);
    if (action) {
      this.executeAction(action, 'keydown', e);
      e.preventDefault();
    }

    // Check for key combinations
    this.checkKeyCombinations();
  }

  /**
   * Handle key up
   */
  handleKeyUp(e) {
    if (!this.enabled) return;

    const key = this.normalizeKey(e.key);
    this.keysPressed.delete(key);

    // Find action for this key
    const action = this.getActionForKey(key);
    if (action) {
      this.executeAction(action, 'keyup', e);
    }
  }

  /**
   * Register default actions
   */
  registerDefaultActions() {
    // Movement
    this.registerAction('moveForward', () => this.move('forward'));
    this.registerAction('moveBackward', () => this.move('backward'));
    this.registerAction('moveLeft', () => this.move('left'));
    this.registerAction('moveRight', () => this.move('right'));
    this.registerAction('jump', () => this.jump());
    this.registerAction('sprint', () => this.setSprint(true), () => this.setSprint(false));

    // Actions
    this.registerAction('interact', () => this.interact());
    this.registerAction('use', () => this.use());

    // UI
    this.registerAction('inventory', () => this.toggleInventory());
    this.registerAction('sanctuaryMenu', () => this.toggleSanctuaryMenu());
    this.registerAction('voice', () => this.toggleVoice());
    this.registerAction('quests', () => this.toggleQuests());

    // Camera
    this.registerAction('centerCamera', () => this.centerCamera());

    // Tools
    this.registerAction('toggleHUD', () => this.toggleHUD());
    this.registerAction('screenshot', () => this.takeScreenshot());

    console.log('[KeyMappingSystem] Registered', this.keyCallbacks.size, 'default actions');
  }

  /**
   * Register an action
   */
  registerAction(actionName, onPress, onRelease = null) {
    this.keyCallbacks.set(actionName, {
      onPress,
      onRelease
    });
  }

  /**
   * Execute an action
   */
  executeAction(actionName, eventType, event) {
    const callbacks = this.keyCallbacks.get(actionName);
    if (!callbacks) return;

    if (eventType === 'keydown' && callbacks.onPress) {
      callbacks.onPress(event);
      this.core.emit('keyAction', { action: actionName, type: 'press' });
    } else if (eventType === 'keyup' && callbacks.onRelease) {
      callbacks.onRelease(event);
      this.core.emit('keyAction', { action: actionName, type: 'release' });
    }
  }

  /**
   * Get action name for a key
   */
  getActionForKey(key) {
    for (const [action, keys] of Object.entries(this.mappings)) {
      if (keys.includes(key)) {
        return action;
      }
    }
    return null;
  }

  /**
   * Check if key is mapped
   */
  isMappedKey(key) {
    const normalized = this.normalizeKey(key);
    return Object.values(this.mappings).some(keys => keys.includes(normalized));
  }

  /**
   * Normalize key name
   */
  normalizeKey(key) {
    // Handle special cases
    const keyMap = {
      ' ': 'Spacebar',
      'Control': 'Control',
      'Alt': 'Alt',
      'Meta': 'Meta'
    };

    return keyMap[key] || key.toLowerCase();
  }

  /**
   * Check for key combinations
   */
  checkKeyCombinations() {
    // Example: Ctrl+S for save
    if (this.keysPressed.has('control') && this.keysPressed.has('s')) {
      this.core.emit('keyCombo', { combo: 'ctrl+s' });
    }
  }

  /**
   * Rebind a key
   */
  rebindKey(actionName, newKey) {
    if (!this.mappings[actionName]) {
      console.warn('[KeyMappingSystem] Unknown action:', actionName);
      return false;
    }

    // Remove key from other actions
    this.removeKeyFromAllActions(newKey);

    // Add to this action (replace existing)
    this.mappings[actionName] = [newKey];

    // Save
    this.saveMappings();

    console.log(`[KeyMappingSystem] Rebound ${actionName} to ${newKey}`);
    this.core.emit('keyRebound', { action: actionName, key: newKey });

    return true;
  }

  /**
   * Add secondary key to action
   */
  addSecondaryKey(actionName, newKey) {
    if (!this.mappings[actionName]) {
      console.warn('[KeyMappingSystem] Unknown action:', actionName);
      return false;
    }

    // Remove from other actions
    this.removeKeyFromAllActions(newKey);

    // Add to this action
    if (!this.mappings[actionName].includes(newKey)) {
      this.mappings[actionName].push(newKey);
    }

    this.saveMappings();
    return true;
  }

  /**
   * Remove key from all actions
   */
  removeKeyFromAllActions(key) {
    for (const [action, keys] of Object.entries(this.mappings)) {
      const index = keys.indexOf(key);
      if (index > -1) {
        keys.splice(index, 1);
      }
    }
  }

  /**
   * Start recording a key for rebinding
   */
  startKeyRecording(actionName, callback) {
    this.recordingKey = actionName;
    this.recordingCallback = callback;

    console.log('[KeyMappingSystem] Recording key for:', actionName);
    this.core.emit('keyRecordingStarted', { action: actionName });
  }

  /**
   * Complete key recording
   */
  completeKeyRecording(key) {
    if (!this.recordingKey) return;

    const normalized = this.normalizeKey(key);
    const success = this.rebindKey(this.recordingKey, normalized);

    if (this.recordingCallback) {
      this.recordingCallback(success, normalized);
    }

    this.core.emit('keyRecordingComplete', {
      action: this.recordingKey,
      key: normalized,
      success
    });

    this.recordingKey = null;
    this.recordingCallback = null;
  }

  /**
   * Cancel key recording
   */
  cancelKeyRecording() {
    this.recordingKey = null;
    this.recordingCallback = null;
    this.core.emit('keyRecordingCancelled');
  }

  /**
   * Reset to default mappings
   */
  resetToDefaults() {
    this.mappings = JSON.parse(JSON.stringify(this.defaultMappings));
    this.saveMappings();
    console.log('[KeyMappingSystem] Reset to default key mappings');
    this.core.emit('keyMappingsReset');
  }

  /**
   * Get all mappings
   */
  getAllMappings() {
    return { ...this.mappings };
  }

  /**
   * Get keys for action
   */
  getKeysForAction(actionName) {
    return this.mappings[actionName] || [];
  }

  /**
   * Create key mapping UI
   */
  createKeyMappingUI() {
    const ui = document.createElement('div');
    ui.id = 'key-mapping-ui';
    ui.className = 'key-mapping-ui hidden';

    ui.innerHTML = `
      <div class="key-mapping-panel">
        <div class="key-mapping-header">
          <h2>⌨️ Key Bindings</h2>
          <button id="close-key-mapping" class="close-btn">✕</button>
        </div>

        <div class="key-mapping-actions">
          <button id="reset-keys" class="key-action-btn">Reset to Defaults</button>
          <button id="export-keys" class="key-action-btn">Export</button>
          <button id="import-keys" class="key-action-btn">Import</button>
        </div>

        <div class="key-mapping-sections">
          <div class="key-section">
            <h3>Movement</h3>
            <div id="movement-keys" class="key-list"></div>
          </div>

          <div class="key-section">
            <h3>Actions</h3>
            <div id="action-keys" class="key-list"></div>
          </div>

          <div class="key-section">
            <h3>UI & Menus</h3>
            <div id="ui-keys" class="key-list"></div>
          </div>

          <div class="key-section">
            <h3>Quick Slots</h3>
            <div id="quickslot-keys" class="key-list"></div>
          </div>

          <div class="key-section">
            <h3>Advanced</h3>
            <div id="advanced-keys" class="key-list"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(ui);

    // Set up button listeners
    document.getElementById('close-key-mapping')?.addEventListener('click', () => {
      this.hideUI();
    });

    document.getElementById('reset-keys')?.addEventListener('click', () => {
      if (confirm('Reset all keys to defaults?')) {
        this.resetToDefaults();
        this.updateUI();
      }
    });

    document.getElementById('export-keys')?.addEventListener('click', () => {
      this.exportMappings();
    });

    document.getElementById('import-keys')?.addEventListener('click', () => {
      this.importMappings();
    });

    // Initial population
    this.updateUI();
  }

  /**
   * Update UI with current mappings
   */
  updateUI() {
    const sections = {
      movement: ['moveForward', 'moveBackward', 'moveLeft', 'moveRight', 'jump', 'crouch', 'sprint'],
      action: ['interact', 'use', 'drop', 'pickup'],
      ui: ['inventory', 'map', 'menu', 'sanctuaryMenu', 'voice', 'quests', 'characterSheet'],
      quickslot: ['quickSlot1', 'quickSlot2', 'quickSlot3', 'quickSlot4', 'quickSlot5',
                  'quickSlot6', 'quickSlot7', 'quickSlot8', 'quickSlot9', 'quickSlot10'],
      advanced: ['screenshot', 'toggleHUD', 'toggleFullscreen', 'toggleDebug']
    };

    for (const [section, actions] of Object.entries(sections)) {
      const container = document.getElementById(`${section}-keys`);
      if (!container) continue;

      container.innerHTML = actions.map(action => this.createKeyBindingElement(action)).join('');
    }

    // Attach rebind listeners
    document.querySelectorAll('.rebind-key-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.startKeyRecordingWithUI(action, e.target);
      });
    });
  }

  /**
   * Create key binding element
   */
  createKeyBindingElement(action) {
    const keys = this.mappings[action] || [];
    const displayName = this.getActionDisplayName(action);

    return `
      <div class="key-binding-row">
        <span class="key-binding-name">${displayName}</span>
        <div class="key-binding-keys">
          ${keys.map(k => `<span class="key-badge">${k}</span>`).join('')}
        </div>
        <button class="rebind-key-btn" data-action="${action}">Rebind</button>
      </div>
    `;
  }

  /**
   * Get display name for action
   */
  getActionDisplayName(action) {
    const names = {
      moveForward: 'Move Forward',
      moveBackward: 'Move Backward',
      moveLeft: 'Move Left',
      moveRight: 'Move Right',
      jump: 'Jump',
      crouch: 'Crouch',
      sprint: 'Sprint',
      interact: 'Interact',
      use: 'Use',
      drop: 'Drop',
      pickup: 'Pickup',
      inventory: 'Inventory',
      map: 'Map',
      menu: 'Menu',
      sanctuaryMenu: 'Sanctuary Menu',
      voice: 'Voice',
      quests: 'Quests',
      characterSheet: 'Character Sheet',
      screenshot: 'Screenshot',
      toggleHUD: 'Toggle HUD',
      toggleFullscreen: 'Fullscreen'
    };

    return names[action] || action.replace(/([A-Z])/g, ' $1').trim();
  }

  /**
   * Start key recording with UI feedback
   */
  startKeyRecordingWithUI(action, button) {
    button.textContent = 'Press key...';
    button.classList.add('recording');

    this.startKeyRecording(action, (success, key) => {
      button.textContent = 'Rebind';
      button.classList.remove('recording');

      if (success) {
        this.updateUI();
      }
    });
  }

  /**
   * Show UI
   */
  showUI() {
    const ui = document.getElementById('key-mapping-ui');
    if (ui) {
      ui.classList.remove('hidden');
      this.updateUI();
    }
  }

  /**
   * Hide UI
   */
  hideUI() {
    const ui = document.getElementById('key-mapping-ui');
    if (ui) {
      ui.classList.add('hidden');
    }
  }

  /**
   * Toggle UI
   */
  toggleUI() {
    const ui = document.getElementById('key-mapping-ui');
    if (ui) {
      ui.classList.toggle('hidden');
      if (!ui.classList.contains('hidden')) {
        this.updateUI();
      }
    }
  }

  /**
   * Export mappings
   */
  exportMappings() {
    const data = JSON.stringify(this.mappings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanctuary-keybindings.json';
    a.click();

    URL.revokeObjectURL(url);

    console.log('[KeyMappingSystem] Exported key mappings');
  }

  /**
   * Import mappings
   */
  importMappings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          this.mappings = imported;
          this.saveMappings();
          this.updateUI();
          console.log('[KeyMappingSystem] Imported key mappings');
        } catch (error) {
          console.error('[KeyMappingSystem] Failed to import:', error);
          alert('Failed to import key mappings');
        }
      };
      reader.readAsText(file);
    });

    input.click();
  }

  // Movement action implementations
  move(direction) {
    this.core.emit('playerMove', { direction });
  }

  jump() {
    this.core.emit('playerJump');
  }

  setSprint(sprinting) {
    this.core.emit('playerSprint', { sprinting });
  }

  interact() {
    this.core.emit('playerInteract');
  }

  use() {
    this.core.emit('playerUse');
  }

  toggleInventory() {
    if (window.resourceSystem) {
      const panel = document.querySelector('.resource-panel');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
    }
  }

  toggleSanctuaryMenu() {
    if (window.sanctuaryMenu) {
      window.sanctuaryMenu.toggle();
    }
  }

  toggleVoice() {
    if (window.voiceSystem) {
      this.core.emit('toggleVoice');
    }
  }

  toggleQuests() {
    this.core.emit('toggleQuests');
  }

  centerCamera() {
    const camera = document.querySelector('[camera]');
    if (camera) {
      camera.setAttribute('rotation', '0 0 0');
    }
  }

  toggleHUD() {
    const hud = document.getElementById('hud-container');
    if (hud) {
      hud.style.display = hud.style.display === 'none' ? 'block' : 'none';
    }
  }

  takeScreenshot() {
    this.core.emit('takeScreenshot');
    console.log('[KeyMappingSystem] Screenshot taken');
  }

  /**
   * Save mappings to storage
   */
  saveMappings() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.mappings));
    } catch (error) {
      console.error('[KeyMappingSystem] Failed to save mappings:', error);
    }
  }

  /**
   * Load mappings from storage
   */
  loadMappings() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('[KeyMappingSystem] Failed to load mappings:', error);
      return null;
    }
  }

  /**
   * Enable/disable system
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log('[KeyMappingSystem]', enabled ? 'Enabled' : 'Disabled');
  }

  /**
   * Destroy system
   */
  destroy() {
    this.saveMappings();
    document.getElementById('key-mapping-ui')?.remove();
  }
}
