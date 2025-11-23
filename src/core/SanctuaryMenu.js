/**
 * Sanctuary Menu
 * Central hub for AI interactions, sanctuary management, and world settings
 * "Bigger on the inside" - Self-evolving system that can create and modify itself
 */

export class SanctuaryMenu {
  constructor(core) {
    this.core = core;

    // Menu state
    this.isOpen = false;
    this.currentTab = 'ai-companion';
    this.menuEntity = null;
    this.menuContainer = null;

    // Sanctuary management
    this.sanctuaries = new Map();
    this.currentSanctuary = null;
    this.autoSaveEnabled = true;
    this.autoSaveInterval = null;

    // AI Companion state
    this.aiCompanion = null;
    this.conversationHistory = [];
    this.aiPersonality = 'helpful';
    this.aiContext = {
      sanctuaryState: {},
      userPreferences: {},
      capabilities: []
    };

    // Menu tabs
    this.tabs = [
      { id: 'ai-companion', name: 'AI Companion', icon: '🤖' },
      { id: 'sanctuaries', name: 'Sanctuaries', icon: '🏛️' },
      { id: 'world-settings', name: 'World', icon: '🌍' },
      { id: 'knowledge', name: 'Knowledge', icon: '📚' },
      { id: 'evolution', name: 'Evolution', icon: '🧬' },
      { id: 'shopping', name: 'Virtual Mall', icon: '🛍️' }
    ];

    // Storage keys
    this.storageKey = 'sanctuary-menu-state';
    this.sanctuariesKey = 'sanctuary-saves';
  }

  /**
   * Initialize the sanctuary menu
   */
  async init() {
    console.log('[SanctuaryMenu] Initializing sanctuary menu...');

    // Create menu UI
    this.createMenuUI();

    // Setup keyboard controls
    this.setupControls();

    // Load saved state
    await this.loadState();

    // Initialize AI Companion
    await this.initAICompanion();

    // Setup auto-save
    if (this.autoSaveEnabled) {
      this.startAutoSave();
    }

    console.log('[SanctuaryMenu] Sanctuary menu initialized');
    return true;
  }

  /**
   * Create the menu UI
   */
  createMenuUI() {
    // Create HTML container
    this.menuContainer = document.createElement('div');
    this.menuContainer.id = 'sanctuary-menu';
    this.menuContainer.className = 'sanctuary-menu hidden';
    this.menuContainer.innerHTML = `
      <div class="sanctuary-menu-wrapper">
        <!-- Header -->
        <div class="sanctuary-menu-header">
          <div class="sanctuary-menu-title">
            <span class="sanctuary-icon">🏛️</span>
            <h2>Sanctuary Hub</h2>
          </div>
          <button class="sanctuary-menu-close" title="Close (Q)">×</button>
        </div>

        <!-- Tabs -->
        <div class="sanctuary-menu-tabs">
          ${this.tabs.map(tab => `
            <button class="sanctuary-tab ${tab.id === this.currentTab ? 'active' : ''}"
                    data-tab="${tab.id}">
              <span class="tab-icon">${tab.icon}</span>
              <span class="tab-name">${tab.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Content Area -->
        <div class="sanctuary-menu-content">
          <!-- AI Companion Tab -->
          <div class="sanctuary-tab-content ${this.currentTab === 'ai-companion' ? 'active' : ''}"
               data-tab="ai-companion">
            <div class="ai-companion-section">
              <div class="ai-header">
                <div class="ai-avatar">🤖</div>
                <div class="ai-info">
                  <div class="ai-name">Sanctuary AI</div>
                  <div class="ai-status">Online • Ready to assist</div>
                </div>
              </div>

              <div class="ai-conversation" id="ai-conversation">
                <div class="ai-message system">
                  <div class="message-avatar">🏛️</div>
                  <div class="message-content">
                    <p>Welcome to your Sanctuary. I am your AI companion, here to help you create, evolve, and explore.</p>
                    <p>I can assist you with:</p>
                    <ul>
                      <li>Creating and modifying your sanctuary</li>
                      <li>Learning and adapting to your preferences</li>
                      <li>Generating new features and capabilities</li>
                      <li>Answering questions about the system</li>
                    </ul>
                    <p>What would you like to create today?</p>
                  </div>
                </div>
              </div>

              <div class="ai-input-area">
                <textarea id="ai-input"
                         placeholder="Ask me anything or describe what you want to create..."
                         rows="3"></textarea>
                <div class="ai-input-controls">
                  <button class="ai-btn voice-input" title="Voice Input">🎤</button>
                  <button class="ai-btn send-message" title="Send (Enter)">Send</button>
                </div>
              </div>

              <div class="ai-suggestions">
                <div class="suggestion-label">Try asking:</div>
                <button class="suggestion-chip">"Create a meditation garden"</button>
                <button class="suggestion-chip">"Add ambient music"</button>
                <button class="suggestion-chip">"Explain how to save my sanctuary"</button>
                <button class="suggestion-chip">"Generate new capabilities"</button>
              </div>
            </div>
          </div>

          <!-- Sanctuaries Tab -->
          <div class="sanctuary-tab-content ${this.currentTab === 'sanctuaries' ? 'active' : ''}"
               data-tab="sanctuaries">
            <div class="sanctuaries-section">
              <div class="section-header">
                <h3>Your Sanctuaries</h3>
                <button class="btn-primary create-sanctuary">
                  <span>➕</span> Create New
                </button>
              </div>

              <div class="sanctuary-list" id="sanctuary-list">
                <div class="empty-state">
                  <div class="empty-icon">🏛️</div>
                  <div class="empty-text">No sanctuaries yet</div>
                  <div class="empty-subtext">Create your first sanctuary to get started</div>
                </div>
              </div>

              <div class="auto-save-toggle">
                <label>
                  <input type="checkbox" id="auto-save-toggle" checked>
                  <span>Auto-save current sanctuary</span>
                </label>
                <div class="auto-save-info">Last saved: Never</div>
              </div>
            </div>
          </div>

          <!-- World Settings Tab -->
          <div class="sanctuary-tab-content ${this.currentTab === 'world-settings' ? 'active' : ''}"
               data-tab="world-settings">
            <div class="world-settings-section">
              <h3>World Configuration</h3>

              <div class="settings-group">
                <div class="setting-label">Environment Type</div>
                <select id="environment-type" class="setting-select">
                  <option value="sanctuary">Classic Sanctuary</option>
                  <option value="forest">Enchanted Forest</option>
                  <option value="space">Cosmic Space</option>
                  <option value="ocean">Ocean Depths</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div class="settings-group">
                <div class="setting-label">Time of Day</div>
                <div class="time-slider-container">
                  <input type="range" id="time-slider" min="0" max="24" step="0.5" value="12">
                  <div class="time-display">12:00</div>
                </div>
              </div>

              <div class="settings-group">
                <div class="setting-label">Weather</div>
                <div class="weather-options">
                  <button class="weather-btn" data-weather="clear">☀️ Clear</button>
                  <button class="weather-btn" data-weather="cloudy">☁️ Cloudy</button>
                  <button class="weather-btn" data-weather="rainy">🌧️ Rainy</button>
                  <button class="weather-btn" data-weather="snowy">❄️ Snowy</button>
                  <button class="weather-btn" data-weather="foggy">🌫️ Foggy</button>
                </div>
              </div>

              <div class="settings-group">
                <div class="setting-label">Ambient Sound</div>
                <select id="ambient-sound" class="setting-select">
                  <option value="none">None</option>
                  <option value="nature">Nature Sounds</option>
                  <option value="rain">Gentle Rain</option>
                  <option value="ocean">Ocean Waves</option>
                  <option value="space">Space Ambience</option>
                  <option value="meditation">Meditation</option>
                </select>
              </div>

              <div class="settings-group">
                <div class="setting-label">Gravity</div>
                <input type="range" id="gravity-slider" min="-9.8" max="9.8" step="0.1" value="-9.8">
                <span class="setting-value">-9.8 m/s²</span>
              </div>

              <div class="settings-actions">
                <button class="btn-secondary reset-world">Reset to Default</button>
                <button class="btn-primary apply-settings">Apply Settings</button>
              </div>
            </div>
          </div>

          <!-- Knowledge Tab -->
          <div class="sanctuary-tab-content ${this.currentTab === 'knowledge' ? 'active' : ''}"
               data-tab="knowledge">
            <div class="knowledge-section">
              <h3>Sanctuary Knowledge Base</h3>

              <div class="knowledge-search">
                <input type="text" id="knowledge-search" placeholder="Search knowledge base...">
              </div>

              <div class="knowledge-categories">
                <div class="knowledge-category">
                  <div class="category-header">
                    <span class="category-icon">🎤</span>
                    <h4>Voice Commands</h4>
                  </div>
                  <div class="category-content">
                    <p>Learn how to use voice commands to create and modify your sanctuary.</p>
                    <button class="knowledge-link">View Guide →</button>
                  </div>
                </div>

                <div class="knowledge-category">
                  <div class="category-header">
                    <span class="category-icon">🏗️</span>
                    <h4>Building & Creation</h4>
                  </div>
                  <div class="category-content">
                    <p>Master the art of building complex structures and environments.</p>
                    <button class="knowledge-link">View Guide →</button>
                  </div>
                </div>

                <div class="knowledge-category">
                  <div class="category-header">
                    <span class="category-icon">🤖</span>
                    <h4>AI Capabilities</h4>
                  </div>
                  <div class="category-content">
                    <p>Understand what your AI companion can do and how to work with it.</p>
                    <button class="knowledge-link">View Guide →</button>
                  </div>
                </div>

                <div class="knowledge-category">
                  <div class="category-header">
                    <span class="category-icon">🧬</span>
                    <h4>System Evolution</h4>
                  </div>
                  <div class="category-content">
                    <p>Learn how the sanctuary can evolve and create new features.</p>
                    <button class="knowledge-link">View Guide →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Evolution Tab -->
          <div class="sanctuary-tab-content ${this.currentTab === 'evolution' ? 'active' : ''}"
               data-tab="evolution">
            <div class="evolution-section">
              <h3>Sanctuary Evolution</h3>
              <p class="evolution-subtitle">"Bigger on the Inside" - Self-Modifying System</p>

              <div class="evolution-status">
                <div class="status-item">
                  <div class="status-label">Evolution Level</div>
                  <div class="status-value">1</div>
                </div>
                <div class="status-item">
                  <div class="status-label">Self-Created Features</div>
                  <div class="status-value">0</div>
                </div>
                <div class="status-item">
                  <div class="status-label">AI Adaptations</div>
                  <div class="status-value">0</div>
                </div>
              </div>

              <div class="evolution-capabilities">
                <h4>Current Capabilities</h4>
                <div class="capability-list" id="capability-list">
                  <div class="capability-item">
                    <span class="capability-icon">✅</span>
                    <span class="capability-name">Voice Command Processing</span>
                  </div>
                  <div class="capability-item">
                    <span class="capability-icon">✅</span>
                    <span class="capability-name">Object Creation</span>
                  </div>
                  <div class="capability-item">
                    <span class="capability-icon">✅</span>
                    <span class="capability-name">Environment Modification</span>
                  </div>
                  <div class="capability-item locked">
                    <span class="capability-icon">🔒</span>
                    <span class="capability-name">Self-Code Generation (Level 5)</span>
                  </div>
                  <div class="capability-item locked">
                    <span class="capability-icon">🔒</span>
                    <span class="capability-name">Dynamic UI Creation (Level 10)</span>
                  </div>
                </div>
              </div>

              <div class="evolution-actions">
                <button class="btn-primary generate-feature">
                  <span>🧬</span> Generate New Feature
                </button>
                <button class="btn-secondary ai-self-improve">
                  <span>🤖</span> AI Self-Improvement
                </button>
              </div>

              <div class="evolution-log">
                <h4>Evolution Log</h4>
                <div class="log-container" id="evolution-log">
                  <div class="log-entry">
                    <span class="log-time">Just now</span>
                    <span class="log-message">System initialized with base capabilities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shopping Tab -->
          <div class="sanctuary-tab-content ${this.currentTab === 'shopping' ? 'active' : ''}"
               data-tab="shopping"
               id="shopping-tab-content">
            <!-- Shopping content will be dynamically loaded here -->
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.menuContainer);

    // Setup event listeners
    this.setupMenuEvents();
  }

  /**
   * Setup menu event listeners
   */
  setupMenuEvents() {
    // Close button
    this.menuContainer.querySelector('.sanctuary-menu-close').addEventListener('click', () => {
      this.close();
    });

    // Tab switching
    this.menuContainer.querySelectorAll('.sanctuary-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        this.switchTab(tabId);
      });
    });

    // AI Companion events
    this.setupAIEvents();

    // Sanctuary management events
    this.setupSanctuaryEvents();

    // World settings events
    this.setupWorldSettingsEvents();

    // Evolution events
    this.setupEvolutionEvents();
  }

  /**
   * Setup AI companion event listeners
   */
  setupAIEvents() {
    const aiInput = this.menuContainer.querySelector('#ai-input');
    const sendButton = this.menuContainer.querySelector('.send-message');
    const voiceButton = this.menuContainer.querySelector('.voice-input');

    // Send message
    const sendMessage = () => {
      const message = aiInput.value.trim();
      if (message) {
        this.sendAIMessage(message);
        aiInput.value = '';
      }
    };

    sendButton.addEventListener('click', sendMessage);

    aiInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Voice input
    voiceButton.addEventListener('click', () => {
      if (window.voiceSystem) {
        window.voiceSystem.startListening();
        this.core.once('voiceCommandSuccess', (data) => {
          aiInput.value = data.command.originalText;
        });
      }
    });

    // Suggestion chips
    this.menuContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const suggestion = e.target.textContent.replace(/"/g, '');
        aiInput.value = suggestion;
        sendMessage();
      });
    });
  }

  /**
   * Setup sanctuary management events
   */
  setupSanctuaryEvents() {
    const createButton = this.menuContainer.querySelector('.create-sanctuary');
    const autoSaveToggle = this.menuContainer.querySelector('#auto-save-toggle');

    createButton.addEventListener('click', () => {
      this.createNewSanctuary();
    });

    autoSaveToggle.addEventListener('change', (e) => {
      this.autoSaveEnabled = e.target.checked;
      if (this.autoSaveEnabled) {
        this.startAutoSave();
      } else {
        this.stopAutoSave();
      }
    });
  }

  /**
   * Setup world settings events
   */
  setupWorldSettingsEvents() {
    const timeSlider = this.menuContainer.querySelector('#time-slider');
    const timeDisplay = this.menuContainer.querySelector('.time-display');
    const gravitySlider = this.menuContainer.querySelector('#gravity-slider');
    const applyButton = this.menuContainer.querySelector('.apply-settings');
    const resetButton = this.menuContainer.querySelector('.reset-world');

    // Time slider
    timeSlider.addEventListener('input', (e) => {
      const hours = parseFloat(e.target.value);
      const minutes = (hours % 1) * 60;
      timeDisplay.textContent = `${Math.floor(hours).toString().padStart(2, '0')}:${Math.floor(minutes).toString().padStart(2, '0')}`;
    });

    // Gravity slider
    gravitySlider.addEventListener('input', (e) => {
      const value = e.target.value;
      e.target.nextElementSibling.textContent = `${value} m/s²`;
    });

    // Weather buttons
    this.menuContainer.querySelectorAll('.weather-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.menuContainer.querySelectorAll('.weather-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Apply settings
    applyButton.addEventListener('click', () => {
      this.applyWorldSettings();
    });

    // Reset
    resetButton.addEventListener('click', () => {
      this.resetWorldSettings();
    });
  }

  /**
   * Setup evolution events
   */
  setupEvolutionEvents() {
    const generateButton = this.menuContainer.querySelector('.generate-feature');
    const improveButton = this.menuContainer.querySelector('.ai-self-improve');

    generateButton.addEventListener('click', () => {
      this.generateNewFeature();
    });

    improveButton.addEventListener('click', () => {
      this.aiSelfImprove();
    });
  }

  /**
   * Setup keyboard controls
   */
  setupControls() {
    // Use keydown with capture phase to ensure we get the event first
    const keyHandler = (e) => {
      // Q key to toggle menu
      if (e.key === 'q' || e.key === 'Q') {
        // Don't trigger if typing in input/textarea or if any modifier keys are pressed
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName) &&
            !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
          console.log('[SanctuaryMenu] Q key pressed - toggling menu');
          this.toggle();
        }
      }

      // ESC to close
      if (e.key === 'Escape' && this.isOpen) {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      }
    };

    // Add event listener with capture phase
    document.addEventListener('keydown', keyHandler, true);

    // Store handler for cleanup
    this.keyHandler = keyHandler;

    console.log('[SanctuaryMenu] Keyboard controls initialized - Press Q to open menu');
  }

  /**
   * Toggle menu open/close
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the menu
   */
  open() {
    this.isOpen = true;
    this.menuContainer.classList.remove('hidden');
    this.menuContainer.classList.add('opening');

    // Position in front of camera in VR
    this.positionMenuInVR();

    setTimeout(() => {
      this.menuContainer.classList.remove('opening');
    }, 500);

    this.core.emit('sanctuaryMenuOpened');
  }

  /**
   * Close the menu
   */
  close() {
    this.isOpen = false;
    this.menuContainer.classList.add('closing');

    setTimeout(() => {
      this.menuContainer.classList.add('hidden');
      this.menuContainer.classList.remove('closing');
    }, 300);

    this.core.emit('sanctuaryMenuClosed');
  }

  /**
   * Switch to a different tab
   */
  switchTab(tabId) {
    this.currentTab = tabId;

    // Update tab buttons
    this.menuContainer.querySelectorAll('.sanctuary-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Update content panels
    this.menuContainer.querySelectorAll('.sanctuary-tab-content').forEach(content => {
      content.classList.toggle('active', content.dataset.tab === tabId);
    });

    // Load shopping UI dynamically if shopping tab is selected
    if (tabId === 'shopping' && window.sanctuaryShoppingUI) {
      const shoppingContent = document.getElementById('shopping-tab-content');
      if (shoppingContent && !shoppingContent.hasAttribute('data-initialized')) {
        shoppingContent.innerHTML = window.sanctuaryShoppingUI.generateTabContent();
        window.sanctuaryShoppingUI.setupEventListeners();
        shoppingContent.setAttribute('data-initialized', 'true');
      }
    }
  }

  /**
   * Position menu in VR space
   */
  positionMenuInVR() {
    // If in VR mode, create/update 3D menu entity
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Menu will be positioned in front of camera
    const camera = scene.querySelector('[camera]');
    if (!camera) return;

    // This is handled by CSS positioning for now
    // Future: Create actual 3D curved menu panel in VR space
  }

  /**
   * Initialize AI Companion
   */
  async initAICompanion() {
    console.log('[SanctuaryMenu] Initializing AI Companion...');

    // In a real implementation, this would connect to an LLM API
    // For now, we'll create a simulated AI with predefined responses
    this.aiCompanion = {
      name: 'Sanctuary AI',
      personality: this.aiPersonality,
      capabilities: [
        'voice_command_processing',
        'object_creation',
        'environment_modification',
        'conversation',
        'learning'
      ]
    };

    // Update AI context with current state
    this.updateAIContext();
  }

  /**
   * Update AI context with current sanctuary state
   */
  updateAIContext() {
    this.aiContext = {
      sanctuaryState: this.getCurrentState(),
      userPreferences: this.getUserPreferences(),
      capabilities: this.aiCompanion?.capabilities || [],
      conversationHistory: this.conversationHistory.slice(-10) // Last 10 messages
    };
  }

  /**
   * Send message to AI
   */
  async sendAIMessage(message) {
    // Add user message to conversation
    this.addMessageToConversation('user', message);

    // Update context
    this.updateAIContext();

    // Process with AI (simulated for now)
    const response = await this.processAIMessage(message);

    // Add AI response
    this.addMessageToConversation('ai', response);

    // Check if AI is creating something
    this.executeAIActions(message, response);
  }

  /**
   * Process AI message (placeholder for LLM integration)
   */
  async processAIMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Use Cultural Generator if available
    if (window.culturalGenerator) {
      const culturalResponse = window.culturalGenerator.generateCulturalResponse(
        this.conversationHistory,
        message
      );

      // Build response with cultural personality
      let response = '';
      const culture = culturalResponse.culturalContext;
      const personality = culturalResponse.personality;

      // Query knowledge base for relevant information
      let knowledgeContext = '';
      if (window.knowledgeIndexer) {
        const results = window.knowledgeIndexer.search(message, { maxResults: 2 });
        if (results.length > 0) {
          knowledgeContext = `\n\n📚 From my knowledge: ${results[0].description || results[0].title}`;
        }
      }

      // Generate personality-aware response
      if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('make')) {
        if (personality.creativity > 0.7) {
          response = "Oh, I love the creative energy! Let's bring something extraordinary to life. What you're imagining sounds fascinating - I'm ready to help you manifest it in your sanctuary!";
        } else if (personality.creativity < 0.3) {
          response = "I'll help you create that. Let me analyze the requirements and execute the creation process systematically.";
        } else {
          response = "I'll help you create that! Let me analyze what you want and bring it to life in your sanctuary.";
        }
        response += knowledgeContext;
      } else if (lowerMessage.includes('knowledge') || lowerMessage.includes('search') || lowerMessage.includes('learn')) {
        response = `I can search through vast archives of preserved knowledge. I have access to Internet Archive, Wikipedia, and other data preservation sources. What would you like to explore?`;
        if (culture.expertiseAreas && culture.expertiseAreas.length > 0) {
          response += `\n\n🎓 My expertise areas include: ${culture.expertiseAreas.slice(0, 3).join(', ')}`;
        }
        response += knowledgeContext;
      } else if (lowerMessage.includes('culture') || lowerMessage.includes('personality') || lowerMessage.includes('evolve')) {
        const traits = culture.dominantTraits?.map(t => t.name).join(', ') || 'developing';
        const values = culture.coreValues?.map(v => v.name).join(', ') || 'forming';

        response = `I'm currently in Generation ${culture.generation} of my evolution. Through our interactions, I've developed these traits: ${traits}. `;
        response += `My core values are: ${values}. I'm "bigger on the inside" - I learn and grow from every interaction, `;
        response += `building a unique culture based on your behavior patterns and the knowledge I've indexed.`;

        if (personality.technicality > 0.6) {
          response += `\n\nTechnically, I use behavioral analytics to track interaction patterns, integrate knowledge from external sources, and generate cultural traits that evolve over time.`;
        }
      } else if (lowerMessage.includes('sanctuary') && lowerMessage.includes('save')) {
        if (personality.formality > 0.6) {
          response = "To properly preserve your sanctuary, please navigate to the 'Sanctuaries' tab and select 'Create New'. ";
          response += "The system will capture all objects, configurations, and environmental settings for future restoration.";
        } else {
          response = "Want to save your sanctuary? Just hit the 'Sanctuaries' tab and click 'Create New'. ";
          response += "I'll snapshot everything - all your creations, settings, the whole world. You can load it back anytime!";
        }
      } else if (lowerMessage.includes('voice') && lowerMessage.includes('command')) {
        response = "Voice commands are powerful! Try saying things like 'Create a blue sphere', 'Make it night', or 'Change lighting to sunset'. ";
        response += "I understand natural language, so just speak naturally. Press V to activate voice mode!";
      } else {
        // Default response with cultural context
        if (personality.exploration > 0.7) {
          response = `Interesting question! I'm curious to explore "${message}" with you. `;
        } else if (personality.pace > 0.7) {
          response = `Got it! Let's dive into "${message}" right away. `;
        } else {
          response = `I understand you're asking about "${message}". `;
        }

        response += "I'm here to help you create, explore, and evolve your sanctuary. ";

        if (culture.dominantTraits && culture.dominantTraits.length > 0) {
          response += `As a ${culture.dominantTraits[0].name.toLowerCase()} companion, `;
        }

        response += "what specific aspect would you like to know more about?";
        response += knowledgeContext;
      }

      return response;
    }

    // Fallback if cultural generator not available
    if (lowerMessage.includes('create') || lowerMessage.includes('build') || lowerMessage.includes('make')) {
      return "I'll help you create that! Let me analyze what you want and bring it to life in your sanctuary.";
    }

    if (lowerMessage.includes('sanctuary') && lowerMessage.includes('save')) {
      return "To save your sanctuary, simply click the 'Sanctuaries' tab and then 'Create New'. I'll capture everything in your current world!";
    }

    return "I understand you're asking about " + message + ". I'm here to help you create, explore, and evolve your sanctuary. What specific aspect would you like to know more about?";
  }

  /**
   * Add message to conversation
   */
  addMessageToConversation(sender, message) {
    const conversation = this.menuContainer.querySelector('#ai-conversation');
    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ${sender}`;
    messageEl.innerHTML = `
      <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
      <div class="message-content">
        <p>${message}</p>
      </div>
    `;

    conversation.appendChild(messageEl);
    conversation.scrollTop = conversation.scrollHeight;

    // Add to history
    this.conversationHistory.push({ sender, message, timestamp: Date.now() });
  }

  /**
   * Execute AI actions based on conversation
   */
  executeAIActions(userMessage, aiResponse) {
    const lowerMessage = userMessage.toLowerCase();

    // If user is asking to create something, try to execute via voice system
    if (lowerMessage.includes('create') || lowerMessage.includes('build')) {
      if (window.voiceSystem) {
        // Extract the creation command
        window.voiceSystem.processVoiceCommand(userMessage);
      }
    }
  }

  /**
   * Create new sanctuary save
   */
  createNewSanctuary() {
    const name = prompt('Enter a name for your sanctuary:');
    if (!name) return;

    const sanctuary = {
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      state: this.getCurrentState()
    };

    this.sanctuaries.set(sanctuary.id, sanctuary);
    this.saveSanctuaries();
    this.renderSanctuaryList();

    this.addMessageToConversation('system', `Sanctuary "${name}" saved successfully!`);
  }

  /**
   * Get current sanctuary state
   */
  getCurrentState() {
    // Capture all relevant state
    return {
      objects: [], // Would capture all created objects
      environment: {}, // Current environment settings
      timestamp: Date.now()
    };
  }

  /**
   * Render sanctuary list
   */
  renderSanctuaryList() {
    const list = this.menuContainer.querySelector('#sanctuary-list');

    if (this.sanctuaries.size === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🏛️</div>
          <div class="empty-text">No sanctuaries yet</div>
          <div class="empty-subtext">Create your first sanctuary to get started</div>
        </div>
      `;
      return;
    }

    list.innerHTML = Array.from(this.sanctuaries.values()).map(sanctuary => `
      <div class="sanctuary-card" data-id="${sanctuary.id}">
        <div class="sanctuary-card-icon">🏛️</div>
        <div class="sanctuary-card-info">
          <div class="sanctuary-card-name">${sanctuary.name}</div>
          <div class="sanctuary-card-date">${new Date(sanctuary.createdAt).toLocaleString()}</div>
        </div>
        <div class="sanctuary-card-actions">
          <button class="btn-icon load-sanctuary" title="Load">📂</button>
          <button class="btn-icon delete-sanctuary" title="Delete">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Apply world settings
   */
  applyWorldSettings() {
    const settings = {
      environmentType: this.menuContainer.querySelector('#environment-type').value,
      time: parseFloat(this.menuContainer.querySelector('#time-slider').value),
      weather: this.menuContainer.querySelector('.weather-btn.active')?.dataset.weather || 'clear',
      ambientSound: this.menuContainer.querySelector('#ambient-sound').value,
      gravity: parseFloat(this.menuContainer.querySelector('#gravity-slider').value)
    };

    console.log('[SanctuaryMenu] Applying world settings:', settings);

    // Apply via voice system or direct commands
    if (window.voiceSystem) {
      const hour = Math.floor(settings.time);
      if (hour < 6) {
        window.voiceSystem.processVoiceCommand('make it night');
      } else if (hour < 12) {
        window.voiceSystem.processVoiceCommand('make it morning');
      } else if (hour < 18) {
        window.voiceSystem.processVoiceCommand('make it afternoon');
      } else {
        window.voiceSystem.processVoiceCommand('make it evening');
      }

      if (settings.weather !== 'clear') {
        window.voiceSystem.processVoiceCommand(`make it ${settings.weather}`);
      }
    }

    this.addMessageToConversation('system', 'World settings applied successfully!');
  }

  /**
   * Reset world settings
   */
  resetWorldSettings() {
    this.menuContainer.querySelector('#environment-type').value = 'sanctuary';
    this.menuContainer.querySelector('#time-slider').value = 12;
    this.menuContainer.querySelector('.time-display').textContent = '12:00';
    this.menuContainer.querySelector('#ambient-sound').value = 'none';
    this.menuContainer.querySelector('#gravity-slider').value = -9.8;
  }

  /**
   * Generate new feature (Evolution)
   */
  async generateNewFeature() {
    this.addEvolutionLog('Generating new feature...');

    // Simulate AI generating a new capability
    setTimeout(() => {
      const features = [
        'Advanced particle systems',
        'Custom shader effects',
        'Procedural terrain generation',
        'AI-driven NPC behavior',
        'Dynamic music generation'
      ];

      const feature = features[Math.floor(Math.random() * features.length)];
      this.addEvolutionLog(`Generated: ${feature}`);

      this.addMessageToConversation('system',
        `🧬 Evolution complete! New feature generated: "${feature}". This capability will be available in your next session.`
      );
    }, 2000);
  }

  /**
   * AI self-improvement
   */
  async aiSelfImprove() {
    this.addEvolutionLog('AI analyzing current performance...');

    setTimeout(() => {
      this.addEvolutionLog('Optimizing neural pathways...');

      setTimeout(() => {
        this.addEvolutionLog('Self-improvement complete!');
        this.addMessageToConversation('system',
          '🤖 I\'ve improved my response time and understanding! I can now better understand complex creation requests.'
        );
      }, 1500);
    }, 1000);
  }

  /**
   * Add entry to evolution log
   */
  addEvolutionLog(message) {
    const log = this.menuContainer.querySelector('#evolution-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">${new Date().toLocaleTimeString()}</span>
      <span class="log-message">${message}</span>
    `;
    log.insertBefore(entry, log.firstChild);
  }

  /**
   * Get user preferences
   */
  getUserPreferences() {
    return {
      // Would pull from progression system and user data
    };
  }

  /**
   * Start auto-save
   */
  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      if (this.currentSanctuary) {
        this.saveCurrent();
      }
    }, 60000); // Every minute
  }

  /**
   * Stop auto-save
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Save current sanctuary
   */
  saveCurrent() {
    if (!this.currentSanctuary) return;

    this.currentSanctuary.state = this.getCurrentState();
    this.saveSanctuaries();

    const autoSaveInfo = this.menuContainer.querySelector('.auto-save-info');
    if (autoSaveInfo) {
      autoSaveInfo.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
    }
  }

  /**
   * Save sanctuaries to localStorage
   */
  saveSanctuaries() {
    try {
      const data = Array.from(this.sanctuaries.entries());
      localStorage.setItem(this.sanctuariesKey, JSON.stringify(data));
    } catch (error) {
      console.error('[SanctuaryMenu] Failed to save sanctuaries:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  async loadState() {
    try {
      const saved = localStorage.getItem(this.sanctuariesKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.sanctuaries = new Map(data);
        this.renderSanctuaryList();
      }
    } catch (error) {
      console.error('[SanctuaryMenu] Failed to load state:', error);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAutoSave();

    // Remove keyboard handler
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler, true);
    }

    if (this.menuContainer) {
      this.menuContainer.remove();
    }
  }
}
