/**
 * Quest Generator
 * AI-driven quest and mission system based on conversations and voice commands
 */

export class QuestGenerator {
  constructor(core, culturalGenerator, behavioralAnalytics) {
    this.core = core;
    this.cultural = culturalGenerator;
    this.behavioral = behavioralAnalytics;

    // Active quests
    this.quests = [];

    // Quest templates
    this.questTemplates = {
      gathering: {
        type: 'gathering',
        icon: '📦',
        generateFrom: (context) => this.generateGatheringQuest(context),
        xpMultiplier: 1.0
      },
      exploration: {
        type: 'exploration',
        icon: '🗺️',
        generateFrom: (context) => this.generateExplorationQuest(context),
        xpMultiplier: 1.2
      },
      puzzle: {
        type: 'puzzle',
        icon: '🧩',
        generateFrom: (context) => this.generatePuzzleQuest(context),
        xpMultiplier: 1.5
      },
      building: {
        type: 'building',
        icon: '🏗️',
        generateFrom: (context) => this.generateBuildingQuest(context),
        xpMultiplier: 1.3
      },
      knowledge: {
        type: 'knowledge',
        icon: '📚',
        generateFrom: (context) => this.generateKnowledgeQuest(context),
        xpMultiplier: 1.4
      },
      cultural: {
        type: 'cultural',
        icon: '✨',
        generateFrom: (context) => this.generateCulturalQuest(context),
        xpMultiplier: 2.0
      }
    };

    // Quest difficulty levels
    this.difficulties = {
      easy: { xpMultiplier: 1.0, timeMultiplier: 0.5, color: '#4caf50' },
      medium: { xpMultiplier: 1.5, timeMultiplier: 1.0, color: '#ff9800' },
      hard: { xpMultiplier: 2.0, timeMultiplier: 1.5, color: '#f44336' },
      epic: { xpMultiplier: 3.0, timeMultiplier: 2.0, color: '#9c27b0' }
    };

    // Storage key
    this.storageKey = 'sanctuary-quests';
  }

  /**
   * Initialize quest generator
   */
  async init() {
    console.log('[QuestGenerator] Initializing quest generator...');

    // Load existing quests
    this.loadQuests();

    // Set up event listeners
    this.setupEventListeners();

    // Create UI
    this.createQuestUI();

    // Generate initial quest if none exist
    if (this.quests.length === 0) {
      this.generateQuestFromContext({
        source: 'system',
        message: 'Welcome! Begin your journey by exploring the sanctuary.'
      });
    }

    console.log('[QuestGenerator] Quest generator initialized');
    return this;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for voice commands
    this.core.on('voiceCommandExecuted', (data) => {
      this.processVoiceCommandForQuests(data);
    });

    // Listen for AI conversations
    this.core.on('aiMessageSent', (data) => {
      this.processAIConversationForQuests(data);
    });

    // Listen for resource gathering
    this.core.on('resourceGathered', (data) => {
      this.updateQuestProgress('gather', data.type, 1);
    });

    // Listen for puzzle completion
    this.core.on('puzzleCompleted', (data) => {
      this.updateQuestProgress('solve_puzzle', data.id, 1);
    });

    // Listen for item crafting
    this.core.on('itemCrafted', (data) => {
      this.updateQuestProgress('craft', data.recipe, 1);
    });

    // Listen for XP gains
    this.core.on('xpGained', (data) => {
      this.updateQuestProgress('gain_xp', 'xp', data.amount);
    });

    // Listen for key actions
    this.core.on('toggleQuests', () => {
      this.toggleUI();
    });
  }

  /**
   * Process voice command for quest generation
   */
  processVoiceCommandForQuests(data) {
    const { command, intent } = data;

    // Check if command mentions quest-related keywords
    const questKeywords = ['quest', 'mission', 'task', 'challenge', 'goal', 'objective'];
    const commandLower = command.toLowerCase();

    if (questKeywords.some(keyword => commandLower.includes(keyword))) {
      // Generate quest from voice command
      this.generateQuestFromContext({
        source: 'voice',
        message: command,
        intent
      });
    }
  }

  /**
   * Process AI conversation for quest generation
   */
  processAIConversationForQuests(data) {
    const { userMessage, aiResponse } = data;

    // Analyze conversation for quest opportunities
    const questIndicators = [
      'need', 'want', 'should', 'could', 'would like',
      'help me', 'show me', 'teach me', 'find', 'collect'
    ];

    const messageLower = userMessage.toLowerCase();

    if (questIndicators.some(indicator => messageLower.includes(indicator))) {
      // Generate quest from conversation
      this.generateQuestFromContext({
        source: 'ai_conversation',
        message: userMessage,
        aiContext: aiResponse
      });
    }
  }

  /**
   * Generate quest from context
   */
  generateQuestFromContext(context) {
    const { source, message } = context;

    // Determine quest type based on message content
    const questType = this.determineQuestType(message);

    // Get cultural context
    const culturalContext = this.cultural ? this.cultural.getCultureSummary() : null;

    // Get behavioral patterns
    const behavioralContext = this.behavioral ? this.behavioral.getInsights() : null;

    // Generate quest using template
    const template = this.questTemplates[questType];
    if (!template) {
      console.warn('[QuestGenerator] Unknown quest type:', questType);
      return null;
    }

    const quest = template.generateFrom({
      message,
      source,
      cultural: culturalContext,
      behavioral: behavioralContext
    });

    // Add quest
    this.addQuest(quest);

    console.log('[QuestGenerator] Generated quest:', quest.title);
    this.core.emit('questGenerated', { quest });

    return quest;
  }

  /**
   * Determine quest type from message
   */
  determineQuestType(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/gather|collect|find.*resource|get.*wood|find.*stone/)) {
      return 'gathering';
    }

    if (lowerMessage.match(/explore|discover|visit|travel|go to/)) {
      return 'exploration';
    }

    if (lowerMessage.match(/puzzle|solve|riddle|mystery/)) {
      return 'puzzle';
    }

    if (lowerMessage.match(/build|craft|create|make|construct/)) {
      return 'building';
    }

    if (lowerMessage.match(/learn|study|research|knowledge|understand/)) {
      return 'knowledge';
    }

    if (lowerMessage.match(/culture|ritual|tradition|sacred|divine/)) {
      return 'cultural';
    }

    // Default to gathering
    return 'gathering';
  }

  /**
   * Generate gathering quest
   */
  generateGatheringQuest(context) {
    const resources = ['wood', 'stone', 'fruit', 'flowers', 'water', 'crystal'];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const amount = Math.floor(Math.random() * 10) + 5;

    const difficulty = amount > 10 ? 'hard' : amount > 7 ? 'medium' : 'easy';

    return {
      id: this.generateQuestId(),
      type: 'gathering',
      title: `Gather ${amount} ${resource}`,
      description: `Collect ${amount} ${resource} from the sanctuary landscape.`,
      icon: '📦',
      difficulty,
      objectives: [
        {
          id: 'gather',
          type: 'gather',
          resource,
          target: amount,
          current: 0,
          completed: false
        }
      ],
      rewards: {
        xp: Math.floor(amount * 20 * this.difficulties[difficulty].xpMultiplier),
        items: []
      },
      status: 'active',
      createdAt: Date.now(),
      source: context.source
    };
  }

  /**
   * Generate exploration quest
   */
  generateExplorationQuest(context) {
    const biomes = ['Forest', 'Meadow', 'Desert', 'Mountain', 'Wetland', 'Sacred Grove'];
    const biome = biomes[Math.floor(Math.random() * biomes.length)];

    return {
      id: this.generateQuestId(),
      type: 'exploration',
      title: `Explore the ${biome}`,
      description: `Discover and explore the ${biome} biome. Find its unique resources and secrets.`,
      icon: '🗺️',
      difficulty: 'medium',
      objectives: [
        {
          id: 'visit_biome',
          type: 'visit',
          location: biome,
          visited: false,
          completed: false
        },
        {
          id: 'find_resources',
          type: 'find',
          count: 3,
          found: 0,
          completed: false
        }
      ],
      rewards: {
        xp: 300,
        items: []
      },
      status: 'active',
      createdAt: Date.now(),
      source: context.source
    };
  }

  /**
   * Generate puzzle quest
   */
  generatePuzzleQuest(context) {
    const puzzleTypes = ['shrine_offering', 'elemental_pillars', 'crystal_resonance', 'stone_path'];
    const puzzleType = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];

    return {
      id: this.generateQuestId(),
      type: 'puzzle',
      title: 'Solve the Ancient Puzzle',
      description: 'Find and complete a puzzle in the sanctuary to unlock ancient knowledge.',
      icon: '🧩',
      difficulty: 'hard',
      objectives: [
        {
          id: 'solve_puzzle',
          type: 'solve_puzzle',
          puzzleType,
          target: 1,
          current: 0,
          completed: false
        }
      ],
      rewards: {
        xp: 500,
        items: ['crystal', 'ancient_wood']
      },
      status: 'active',
      createdAt: Date.now(),
      source: context.source
    };
  }

  /**
   * Generate building quest
   */
  generateBuildingQuest(context) {
    const items = [
      { name: 'Wooden Staff', recipe: 'wooden_staff' },
      { name: 'Stone Altar', recipe: 'stone_altar' },
      { name: 'Garden Plot', recipe: 'garden_plot' }
    ];

    const item = items[Math.floor(Math.random() * items.length)];

    return {
      id: this.generateQuestId(),
      type: 'building',
      title: `Craft a ${item.name}`,
      description: `Gather resources and craft a ${item.name} for your sanctuary.`,
      icon: '🏗️',
      difficulty: 'medium',
      objectives: [
        {
          id: 'craft',
          type: 'craft',
          item: item.recipe,
          target: 1,
          current: 0,
          completed: false
        }
      ],
      rewards: {
        xp: 400,
        items: []
      },
      status: 'active',
      createdAt: Date.now(),
      source: context.source
    };
  }

  /**
   * Generate knowledge quest
   */
  generateKnowledgeQuest(context) {
    const topics = ['ancient history', 'nature', 'architecture', 'astronomy', 'philosophy'];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    return {
      id: this.generateQuestId(),
      type: 'knowledge',
      title: `Study ${topic}`,
      description: `Use the knowledge indexer to research ${topic} and expand your understanding.`,
      icon: '📚',
      difficulty: 'medium',
      objectives: [
        {
          id: 'research',
          type: 'research',
          topic,
          articles: 3,
          read: 0,
          completed: false
        }
      ],
      rewards: {
        xp: 350,
        items: []
      },
      status: 'active',
      createdAt: Date.now(),
      source: context.source
    };
  }

  /**
   * Generate cultural quest
   */
  generateCulturalQuest(context) {
    const patron = context.cultural?.patron || 'The Wanderer';

    return {
      id: this.generateQuestId(),
      type: 'cultural',
      title: 'Evolve Your Culture',
      description: `Embrace your patron's values and evolve your sanctuary's culture to the next generation.`,
      icon: '✨',
      difficulty: 'epic',
      objectives: [
        {
          id: 'gain_xp',
          type: 'gain_xp',
          target: 1000,
          current: 0,
          completed: false
        },
        {
          id: 'evolve_culture',
          type: 'culture_generation',
          target: 1,
          current: context.cultural?.generation || 0,
          startGeneration: context.cultural?.generation || 0,
          completed: false
        }
      ],
      rewards: {
        xp: 1000,
        items: ['sacred_fruit', 'divine_flowers', 'blessed_water']
      },
      status: 'active',
      createdAt: Date.now(),
      source: context.source,
      patron
    };
  }

  /**
   * Add quest
   */
  addQuest(quest) {
    this.quests.push(quest);
    this.saveQuests();
    this.updateQuestUI();

    // Show notification
    this.showQuestNotification(quest, 'new');
  }

  /**
   * Update quest progress
   */
  updateQuestProgress(objectiveType, value, amount = 1) {
    let anyUpdated = false;

    this.quests.forEach(quest => {
      if (quest.status !== 'active') return;

      quest.objectives.forEach(obj => {
        if (obj.completed) return;

        if (obj.type === objectiveType) {
          // Check if value matches (for specific items/resources)
          if (obj.resource && obj.resource !== value) return;
          if (obj.item && obj.item !== value) return;
          if (obj.puzzleType && obj.puzzleType !== value) return;

          // Update progress
          if (obj.current !== undefined && obj.target !== undefined) {
            obj.current = Math.min(obj.current + amount, obj.target);

            if (obj.current >= obj.target) {
              obj.completed = true;
              console.log('[QuestGenerator] Objective completed:', obj.id);
            }

            anyUpdated = true;
          } else {
            obj.completed = true;
            anyUpdated = true;
          }
        }
      });

      // Check if all objectives completed
      if (quest.objectives.every(obj => obj.completed)) {
        this.completeQuest(quest.id);
      }
    });

    if (anyUpdated) {
      this.saveQuests();
      this.updateQuestUI();
    }
  }

  /**
   * Complete quest
   */
  completeQuest(questId) {
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) return;

    quest.status = 'completed';
    quest.completedAt = Date.now();

    // Award XP
    if (window.progressionSystem && quest.rewards.xp) {
      window.progressionSystem.gainXP(quest.rewards.xp, `quest_${questId}`);
    }

    // Award items
    if (window.resourceSystem && quest.rewards.items) {
      quest.rewards.items.forEach(item => {
        window.resourceSystem.addResource(item, 1);
      });
    }

    console.log('[QuestGenerator] Quest completed:', quest.title);
    this.core.emit('questCompleted', { quest });

    // Show notification
    this.showQuestNotification(quest, 'completed');

    // Save and update UI
    this.saveQuests();
    this.updateQuestUI();
  }

  /**
   * Abandon quest
   */
  abandonQuest(questId) {
    const index = this.quests.findIndex(q => q.id === questId);
    if (index > -1) {
      this.quests.splice(index, 1);
      this.saveQuests();
      this.updateQuestUI();
      console.log('[QuestGenerator] Quest abandoned:', questId);
    }
  }

  /**
   * Generate quest ID
   */
  generateQuestId() {
    return `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create quest UI
   */
  createQuestUI() {
    const ui = document.createElement('div');
    ui.id = 'quest-ui';
    ui.className = 'quest-ui hidden';

    ui.innerHTML = `
      <div class="quest-panel">
        <div class="quest-header">
          <h2>📜 Quests & Missions</h2>
          <button id="close-quests" class="close-btn">✕</button>
        </div>

        <div class="quest-tabs">
          <button class="quest-tab active" data-status="active">Active</button>
          <button class="quest-tab" data-status="completed">Completed</button>
        </div>

        <div id="quest-list" class="quest-list">
          <!-- Quests will be added dynamically -->
        </div>

        <div class="quest-actions">
          <button id="generate-quest-btn" class="quest-action-btn">+ Generate Quest</button>
        </div>
      </div>
    `;

    document.body.appendChild(ui);

    // Set up listeners
    document.getElementById('close-quests')?.addEventListener('click', () => {
      this.hideUI();
    });

    document.querySelectorAll('.quest-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const status = e.target.dataset.status;
        this.switchQuestTab(status);
      });
    });

    document.getElementById('generate-quest-btn')?.addEventListener('click', () => {
      this.generateRandomQuest();
    });

    this.updateQuestUI();
  }

  /**
   * Update quest UI
   */
  updateQuestUI() {
    const container = document.getElementById('quest-list');
    if (!container) return;

    const activeTab = document.querySelector('.quest-tab.active')?.dataset.status || 'active';
    const filteredQuests = this.quests.filter(q => q.status === activeTab);

    if (filteredQuests.length === 0) {
      container.innerHTML = `<div class="no-quests">No ${activeTab} quests</div>`;
      return;
    }

    container.innerHTML = filteredQuests.map(quest => this.createQuestElement(quest)).join('');

    // Attach abandon listeners
    container.querySelectorAll('.abandon-quest-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questId = e.target.dataset.questId;
        if (confirm('Abandon this quest?')) {
          this.abandonQuest(questId);
        }
      });
    });
  }

  /**
   * Create quest element
   */
  createQuestElement(quest) {
    const diffColor = this.difficulties[quest.difficulty].color;
    const progress = this.calculateQuestProgress(quest);

    return `
      <div class="quest-item" style="border-left: 4px solid ${diffColor}">
        <div class="quest-item-header">
          <span class="quest-icon">${quest.icon}</span>
          <div class="quest-title-group">
            <h3 class="quest-title">${quest.title}</h3>
            <span class="quest-difficulty" style="color: ${diffColor}">${quest.difficulty}</span>
          </div>
        </div>

        <p class="quest-description">${quest.description}</p>

        <div class="quest-objectives">
          ${quest.objectives.map(obj => `
            <div class="quest-objective ${obj.completed ? 'completed' : ''}">
              <span class="objective-checkbox">${obj.completed ? '✓' : '○'}</span>
              <span class="objective-text">${this.formatObjective(obj)}</span>
            </div>
          `).join('')}
        </div>

        <div class="quest-progress-bar">
          <div class="quest-progress-fill" style="width: ${progress}%; background: ${diffColor}"></div>
        </div>

        <div class="quest-rewards">
          <strong>Rewards:</strong>
          <span class="reward-xp">+${quest.rewards.xp} XP</span>
          ${quest.rewards.items.length > 0 ? quest.rewards.items.map(item => `<span class="reward-item">${item}</span>`).join('') : ''}
        </div>

        ${quest.status === 'active' ? `
          <button class="abandon-quest-btn" data-quest-id="${quest.id}">Abandon</button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Format objective text
   */
  formatObjective(obj) {
    switch (obj.type) {
      case 'gather':
        return `Gather ${obj.resource}: ${obj.current}/${obj.target}`;
      case 'craft':
        return `Craft ${obj.item}: ${obj.current}/${obj.target}`;
      case 'solve_puzzle':
        return `Solve puzzle: ${obj.current}/${obj.target}`;
      case 'visit':
        return `Visit ${obj.location}`;
      case 'gain_xp':
        return `Gain ${obj.target} XP: ${obj.current}/${obj.target}`;
      case 'culture_generation':
        const generations = obj.current - obj.startGeneration;
        return `Evolve culture: ${generations}/${obj.target} generation(s)`;
      default:
        return obj.id;
    }
  }

  /**
   * Calculate quest progress
   */
  calculateQuestProgress(quest) {
    const completed = quest.objectives.filter(obj => obj.completed).length;
    const total = quest.objectives.length;
    return Math.floor((completed / total) * 100);
  }

  /**
   * Switch quest tab
   */
  switchQuestTab(status) {
    document.querySelectorAll('.quest-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.status === status);
    });

    this.updateQuestUI();
  }

  /**
   * Generate random quest
   */
  generateRandomQuest() {
    const types = Object.keys(this.questTemplates);
    const randomType = types[Math.floor(Math.random() * types.length)];

    this.generateQuestFromContext({
      source: 'manual',
      message: `Generate a ${randomType} quest`
    });
  }

  /**
   * Show quest notification
   */
  showQuestNotification(quest, type) {
    const toast = document.createElement('div');
    toast.className = `quest-toast quest-toast-${type}`;

    if (type === 'new') {
      toast.innerHTML = `
        <strong>New Quest!</strong>
        <span>${quest.icon} ${quest.title}</span>
      `;
    } else if (type === 'completed') {
      toast.innerHTML = `
        <strong>Quest Complete!</strong>
        <span>${quest.icon} ${quest.title}</span>
        <span>+${quest.rewards.xp} XP</span>
      `;
    }

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Show UI
   */
  showUI() {
    const ui = document.getElementById('quest-ui');
    if (ui) {
      ui.classList.remove('hidden');
      this.updateQuestUI();
    }
  }

  /**
   * Hide UI
   */
  hideUI() {
    const ui = document.getElementById('quest-ui');
    if (ui) {
      ui.classList.add('hidden');
    }
  }

  /**
   * Toggle UI
   */
  toggleUI() {
    const ui = document.getElementById('quest-ui');
    if (ui) {
      if (ui.classList.contains('hidden')) {
        this.showUI();
      } else {
        this.hideUI();
      }
    }
  }

  /**
   * Get all quests
   */
  getAllQuests() {
    return [...this.quests];
  }

  /**
   * Get active quests
   */
  getActiveQuests() {
    return this.quests.filter(q => q.status === 'active');
  }

  /**
   * Save quests
   */
  saveQuests() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.quests));
    } catch (error) {
      console.error('[QuestGenerator] Failed to save quests:', error);
    }
  }

  /**
   * Load quests
   */
  loadQuests() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.quests = JSON.parse(saved);
        console.log('[QuestGenerator] Loaded', this.quests.length, 'quests');
      }
    } catch (error) {
      console.error('[QuestGenerator] Failed to load quests:', error);
    }
  }

  /**
   * Clear all quests
   */
  clearAllQuests() {
    this.quests = [];
    this.saveQuests();
    this.updateQuestUI();
  }

  /**
   * Destroy system
   */
  destroy() {
    this.saveQuests();
    document.getElementById('quest-ui')?.remove();
  }
}
