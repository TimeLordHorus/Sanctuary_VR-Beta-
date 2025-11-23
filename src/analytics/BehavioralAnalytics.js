/**
 * Behavioral Analytics
 * Tracks user interactions and analyzes patterns for cultural generation
 */

export class BehavioralAnalytics {
  constructor(core) {
    this.core = core;

    // Configuration
    this.config = {
      trackingEnabled: true,
      sessionTimeout: 1800000, // 30 minutes
      patternDetectionThreshold: 5, // Minimum occurrences to detect pattern
      saveInterval: 60000 // Save every minute
    };

    // User behavior data
    this.behavior = {
      sessions: [],
      currentSession: null,

      // Action tracking
      actions: {
        voiceCommands: [],
        creations: [],
        environments: [],
        interactions: [],
        menuActions: [],
        achievements: []
      },

      // Pattern data
      patterns: {
        favoriteCommands: new Map(),
        preferredEnvironments: new Map(),
        creationStyles: new Map(),
        timePatterns: new Map(),
        interactionSequences: []
      },

      // Aggregate statistics
      stats: {
        totalSessions: 0,
        totalActions: 0,
        totalTimeSpent: 0,
        averageSessionLength: 0,
        mostActiveHour: null,
        mostActiveDayOfWeek: null
      },

      // User preferences (learned from behavior)
      preferences: {
        preferredTheme: null,
        preferredPace: null, // slow, medium, fast
        explorationStyle: null, // methodical, creative, exploratory
        socialPreference: null, // solo, collaborative
        learningStyle: null // tutorial-driven, self-directed
      }
    };

    // Storage key
    this.storageKey = 'sanctuary-behavioral-analytics';
  }

  /**
   * Initialize behavioral analytics
   */
  async init() {
    console.log('[BehavioralAnalytics] Initializing behavioral analytics...');

    // Load existing data
    this.loadBehaviorData();

    // Start new session
    this.startSession();

    // Set up event listeners
    this.setupEventListeners();

    // Start auto-save
    this.startAutoSave();

    console.log('[BehavioralAnalytics] Behavioral analytics initialized');
    console.log(`[BehavioralAnalytics] Loaded ${this.behavior.stats.totalSessions} previous sessions`);

    return this;
  }

  /**
   * Set up event listeners to track user actions
   */
  setupEventListeners() {
    // Track voice commands
    this.core.on('voiceCommandExecuted', (data) => {
      this.trackAction('voiceCommand', {
        command: data.command,
        intent: data.intent,
        entities: data.entities,
        timestamp: Date.now()
      });
    });

    // Track creations
    this.core.on('objectCreated', (data) => {
      this.trackAction('creation', {
        type: data.type,
        properties: data.properties,
        method: data.method, // voice, menu, etc.
        timestamp: Date.now()
      });
    });

    // Track environment changes
    this.core.on('environmentChanged', (data) => {
      this.trackAction('environment', {
        from: data.from,
        to: data.to,
        timestamp: Date.now()
      });
    });

    // Track menu interactions
    this.core.on('menuAction', (data) => {
      this.trackAction('menuAction', {
        action: data.action,
        tab: data.tab,
        timestamp: Date.now()
      });
    });

    // Track achievements
    this.core.on('achievementUnlocked', (data) => {
      this.trackAction('achievement', {
        id: data.id,
        name: data.name,
        timestamp: Date.now()
      });
    });

    // Track XP gains
    this.core.on('xpGained', (data) => {
      this.trackAction('interaction', {
        type: 'xp_gain',
        amount: data.amount,
        source: data.source,
        timestamp: Date.now()
      });
    });

    // Track sanctuary saves
    this.core.on('sanctuarySaved', (data) => {
      this.trackAction('menuAction', {
        action: 'save_sanctuary',
        name: data.name,
        timestamp: Date.now()
      });
    });

    // Track knowledge queries
    this.core.on('knowledgeQueried', (data) => {
      this.trackAction('interaction', {
        type: 'knowledge_query',
        query: data.query,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Start a new session
   */
  startSession() {
    this.behavior.currentSession = {
      id: this.generateSessionId(),
      startTime: Date.now(),
      endTime: null,
      actions: [],
      duration: 0
    };

    this.behavior.stats.totalSessions++;
    console.log('[BehavioralAnalytics] Started new session:', this.behavior.currentSession.id);
  }

  /**
   * End current session
   */
  endSession() {
    if (!this.behavior.currentSession) return;

    this.behavior.currentSession.endTime = Date.now();
    this.behavior.currentSession.duration =
      this.behavior.currentSession.endTime - this.behavior.currentSession.startTime;

    this.behavior.sessions.push(this.behavior.currentSession);
    this.updateSessionStats();

    console.log('[BehavioralAnalytics] Ended session:', this.behavior.currentSession.id);
    console.log('[BehavioralAnalytics] Session duration:', this.behavior.currentSession.duration / 1000 / 60, 'minutes');

    this.saveBehaviorData();
    this.behavior.currentSession = null;
  }

  /**
   * Track a user action
   */
  trackAction(type, data) {
    if (!this.config.trackingEnabled || !this.behavior.currentSession) return;

    const action = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.behavior.currentSession.id
    };

    // Add to current session
    this.behavior.currentSession.actions.push(action);

    // Add to appropriate category
    switch (type) {
      case 'voiceCommand':
        this.behavior.actions.voiceCommands.push(action);
        this.updateCommandPatterns(data.command);
        break;
      case 'creation':
        this.behavior.actions.creations.push(action);
        this.updateCreationPatterns(data);
        break;
      case 'environment':
        this.behavior.actions.environments.push(action);
        this.updateEnvironmentPatterns(data.to);
        break;
      case 'menuAction':
        this.behavior.actions.menuActions.push(action);
        break;
      case 'achievement':
        this.behavior.actions.achievements.push(action);
        break;
      case 'interaction':
        this.behavior.actions.interactions.push(action);
        break;
    }

    // Update time patterns
    this.updateTimePatterns(data.timestamp);

    // Update stats
    this.behavior.stats.totalActions++;

    // Detect patterns periodically
    if (this.behavior.stats.totalActions % 10 === 0) {
      this.detectPatterns();
    }
  }

  /**
   * Update command patterns
   */
  updateCommandPatterns(command) {
    const normalized = command.toLowerCase().trim();
    const count = this.behavior.patterns.favoriteCommands.get(normalized) || 0;
    this.behavior.patterns.favoriteCommands.set(normalized, count + 1);
  }

  /**
   * Update creation patterns
   */
  updateCreationPatterns(data) {
    const key = `${data.type}_${JSON.stringify(data.properties)}`;
    const count = this.behavior.patterns.creationStyles.get(key) || 0;
    this.behavior.patterns.creationStyles.set(key, count + 1);
  }

  /**
   * Update environment patterns
   */
  updateEnvironmentPatterns(environment) {
    const count = this.behavior.patterns.preferredEnvironments.get(environment) || 0;
    this.behavior.patterns.preferredEnvironments.set(environment, count + 1);
  }

  /**
   * Update time patterns
   */
  updateTimePatterns(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    const hourKey = `hour_${hour}`;
    const hourCount = this.behavior.patterns.timePatterns.get(hourKey) || 0;
    this.behavior.patterns.timePatterns.set(hourKey, hourCount + 1);

    const dayKey = `day_${dayOfWeek}`;
    const dayCount = this.behavior.patterns.timePatterns.get(dayKey) || 0;
    this.behavior.patterns.timePatterns.set(dayKey, dayCount + 1);
  }

  /**
   * Detect behavioral patterns
   */
  detectPatterns() {
    // Detect favorite commands
    const sortedCommands = Array.from(this.behavior.patterns.favoriteCommands.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Detect preferred environments
    const sortedEnvironments = Array.from(this.behavior.patterns.preferredEnvironments.entries())
      .sort((a, b) => b[1] - a[1]);

    // Detect most active time
    const hourPattern = Array.from(this.behavior.patterns.timePatterns.entries())
      .filter(([key]) => key.startsWith('hour_'))
      .sort((a, b) => b[1] - a[1])[0];

    if (hourPattern) {
      this.behavior.stats.mostActiveHour = parseInt(hourPattern[0].split('_')[1]);
    }

    const dayPattern = Array.from(this.behavior.patterns.timePatterns.entries())
      .filter(([key]) => key.startsWith('day_'))
      .sort((a, b) => b[1] - a[1])[0];

    if (dayPattern) {
      this.behavior.stats.mostActiveDayOfWeek = parseInt(dayPattern[0].split('_')[1]);
    }

    // Detect exploration style
    this.detectExplorationStyle();

    // Detect learning style
    this.detectLearningStyle();

    // Detect pace preference
    this.detectPacePreference();

    // Emit pattern detection event
    this.core.emit('patternsDetected', {
      favoriteCommands: sortedCommands,
      preferredEnvironments: sortedEnvironments,
      preferences: this.behavior.preferences
    });
  }

  /**
   * Detect exploration style
   */
  detectExplorationStyle() {
    const totalCreations = this.behavior.actions.creations.length;
    const totalEnvironmentChanges = this.behavior.actions.environments.length;
    const totalVoiceCommands = this.behavior.actions.voiceCommands.length;

    if (totalCreations > totalEnvironmentChanges * 2) {
      this.behavior.preferences.explorationStyle = 'creative';
    } else if (totalEnvironmentChanges > totalCreations * 2) {
      this.behavior.preferences.explorationStyle = 'exploratory';
    } else {
      this.behavior.preferences.explorationStyle = 'methodical';
    }
  }

  /**
   * Detect learning style
   */
  detectLearningStyle() {
    const tutorialActions = this.behavior.actions.interactions
      .filter(a => a.data.type === 'tutorial_step').length;
    const selfDirectedActions = this.behavior.actions.voiceCommands.length +
                                this.behavior.actions.creations.length;

    if (tutorialActions > selfDirectedActions) {
      this.behavior.preferences.learningStyle = 'tutorial-driven';
    } else {
      this.behavior.preferences.learningStyle = 'self-directed';
    }
  }

  /**
   * Detect pace preference
   */
  detectPacePreference() {
    if (this.behavior.sessions.length < 2) return;

    const avgActionsPerMinute = this.behavior.stats.totalActions /
                                (this.behavior.stats.totalTimeSpent / 60000);

    if (avgActionsPerMinute < 2) {
      this.behavior.preferences.preferredPace = 'slow';
    } else if (avgActionsPerMinute < 5) {
      this.behavior.preferences.preferredPace = 'medium';
    } else {
      this.behavior.preferences.preferredPace = 'fast';
    }
  }

  /**
   * Get behavioral insights
   */
  getInsights() {
    const favoriteCommands = Array.from(this.behavior.patterns.favoriteCommands.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([command, count]) => ({ command, count }));

    const preferredEnvironments = Array.from(this.behavior.patterns.preferredEnvironments.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([env, count]) => ({ environment: env, count }));

    const creationTypes = new Map();
    for (const action of this.behavior.actions.creations) {
      const type = action.data.type;
      const count = creationTypes.get(type) || 0;
      creationTypes.set(type, count + 1);
    }

    const topCreations = Array.from(creationTypes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    return {
      summary: {
        totalSessions: this.behavior.stats.totalSessions,
        totalActions: this.behavior.stats.totalActions,
        totalTimeSpent: this.behavior.stats.totalTimeSpent,
        averageSessionLength: this.behavior.stats.averageSessionLength
      },
      patterns: {
        favoriteCommands,
        preferredEnvironments,
        topCreations
      },
      preferences: this.behavior.preferences,
      timePatterns: {
        mostActiveHour: this.behavior.stats.mostActiveHour,
        mostActiveDayOfWeek: this.getDayName(this.behavior.stats.mostActiveDayOfWeek)
      }
    };
  }

  /**
   * Get behavior data for cultural generation
   */
  getBehaviorForCulture() {
    return {
      // Top patterns
      favoriteCommands: Array.from(this.behavior.patterns.favoriteCommands.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20),

      preferredEnvironments: Array.from(this.behavior.patterns.preferredEnvironments.entries())
        .sort((a, b) => b[1] - a[1]),

      creationHistory: this.behavior.actions.creations.slice(-100),

      // User profile
      preferences: this.behavior.preferences,

      // Activity patterns
      timePatterns: Object.fromEntries(this.behavior.patterns.timePatterns),

      // Recent interactions
      recentActions: this.behavior.currentSession?.actions.slice(-50) || []
    };
  }

  /**
   * Update session statistics
   */
  updateSessionStats() {
    const totalTime = this.behavior.sessions.reduce((sum, s) => sum + s.duration, 0);
    this.behavior.stats.totalTimeSpent = totalTime;
    this.behavior.stats.averageSessionLength = totalTime / this.behavior.sessions.length;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get day name from number
   */
  getDayName(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber] || 'Unknown';
  }

  /**
   * Start auto-save
   */
  startAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.saveBehaviorData();
    }, this.config.saveInterval);

    // Save before page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  /**
   * Save behavior data
   */
  saveBehaviorData() {
    try {
      const data = {
        sessions: this.behavior.sessions.slice(-50), // Keep last 50 sessions
        actions: {
          voiceCommands: this.behavior.actions.voiceCommands.slice(-200),
          creations: this.behavior.actions.creations.slice(-200),
          environments: this.behavior.actions.environments.slice(-100),
          interactions: this.behavior.actions.interactions.slice(-200),
          menuActions: this.behavior.actions.menuActions.slice(-100),
          achievements: this.behavior.actions.achievements
        },
        patterns: {
          favoriteCommands: Array.from(this.behavior.patterns.favoriteCommands.entries()),
          preferredEnvironments: Array.from(this.behavior.patterns.preferredEnvironments.entries()),
          creationStyles: Array.from(this.behavior.patterns.creationStyles.entries()),
          timePatterns: Array.from(this.behavior.patterns.timePatterns.entries())
        },
        stats: this.behavior.stats,
        preferences: this.behavior.preferences
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('[BehavioralAnalytics] Saved behavior data');
    } catch (error) {
      console.error('[BehavioralAnalytics] Failed to save behavior data:', error);
    }
  }

  /**
   * Load behavior data
   */
  loadBehaviorData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;

      const data = JSON.parse(saved);

      this.behavior.sessions = data.sessions || [];
      this.behavior.actions = data.actions || this.behavior.actions;

      this.behavior.patterns.favoriteCommands = new Map(data.patterns?.favoriteCommands || []);
      this.behavior.patterns.preferredEnvironments = new Map(data.patterns?.preferredEnvironments || []);
      this.behavior.patterns.creationStyles = new Map(data.patterns?.creationStyles || []);
      this.behavior.patterns.timePatterns = new Map(data.patterns?.timePatterns || []);

      this.behavior.stats = data.stats || this.behavior.stats;
      this.behavior.preferences = data.preferences || this.behavior.preferences;

      console.log('[BehavioralAnalytics] Loaded behavior data');
    } catch (error) {
      console.error('[BehavioralAnalytics] Failed to load behavior data:', error);
    }
  }

  /**
   * Clear all behavior data
   */
  clear() {
    this.behavior = {
      sessions: [],
      currentSession: null,
      actions: {
        voiceCommands: [],
        creations: [],
        environments: [],
        interactions: [],
        menuActions: [],
        achievements: []
      },
      patterns: {
        favoriteCommands: new Map(),
        preferredEnvironments: new Map(),
        creationStyles: new Map(),
        timePatterns: new Map(),
        interactionSequences: []
      },
      stats: {
        totalSessions: 0,
        totalActions: 0,
        totalTimeSpent: 0,
        averageSessionLength: 0,
        mostActiveHour: null,
        mostActiveDayOfWeek: null
      },
      preferences: {
        preferredTheme: null,
        preferredPace: null,
        explorationStyle: null,
        socialPreference: null,
        learningStyle: null
      }
    };

    this.saveBehaviorData();
    console.log('[BehavioralAnalytics] Cleared all behavior data');
  }

  /**
   * Destroy analytics
   */
  destroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.endSession();
  }
}
