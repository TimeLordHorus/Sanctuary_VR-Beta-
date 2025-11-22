/**
 * Progression System
 * Manages user levels, XP, stats, and progression mechanics
 */

export class ProgressionSystem {
  constructor(core) {
    this.core = core;

    // User data
    this.userData = {
      username: 'Player',
      level: 1,
      xp: 0,
      totalXP: 0,
      stats: {
        creations: 0,
        voiceCommands: 0,
        sessionsPlayed: 0,
        timeInVR: 0, // minutes
        objectsCreated: 0,
        environmentsModified: 0,
        achievementsUnlocked: 0
      },
      skills: {
        creation: 1,
        modification: 1,
        exploration: 1,
        social: 1,
        mastery: 1
      },
      inventory: [],
      unlockedFeatures: ['basic_creation', 'basic_voice'],
      preferences: {}
    };

    // Level configuration
    this.levelConfig = {
      baseXP: 100,
      xpMultiplier: 1.5,
      maxLevel: 100
    };

    // XP rewards for different actions
    this.xpRewards = {
      // Voice commands
      voice_command: 10,
      voice_command_streak: 5, // bonus per command in streak

      // Creation
      create_object: 15,
      create_complex_object: 30,
      modify_object: 10,
      delete_object: 5,

      // Environment
      change_environment: 20,
      create_custom_scene: 50,

      // Social
      join_multiplayer: 25,
      host_session: 30,
      help_player: 15,

      // Time-based
      play_session: 50, // per session
      daily_login: 25,

      // Milestones
      first_creation: 100,
      first_voice_command: 50,
      first_multiplayer: 75,

      // Achievements
      achievement_unlock: 100
    };

    // Skill progression
    this.skillXPMultipliers = {
      creation: 1.0,
      modification: 1.0,
      exploration: 1.0,
      social: 1.0,
      mastery: 0.5 // Mastery levels up slower
    };

    // Session tracking
    this.sessionStartTime = null;
    this.currentStreak = 0;
    this.lastActionTime = null;

    // Storage key
    this.storageKey = 'sanctuary-progression';
  }

  /**
   * Initialize the progression system
   */
  async init() {
    console.log('[ProgressionSystem] Initializing progression system...');

    // Load saved progress
    await this.loadProgress();

    // Start session tracking
    this.startSession();

    // Setup event listeners
    this.setupEventListeners();

    // Emit ready event
    this.core.emit('progressionReady', {
      level: this.userData.level,
      xp: this.userData.xp,
      stats: this.userData.stats
    });

    console.log('[ProgressionSystem] Progression system initialized');
    return true;
  }

  /**
   * Setup event listeners for tracking actions
   */
  setupEventListeners() {
    // Track voice commands
    this.core.on('voiceCommandSuccess', (data) => {
      this.trackAction('voice_command', data);
    });

    // Track creations
    this.core.on('objectCreated', (data) => {
      this.trackAction('create_object', data);
    });

    this.core.on('objectModified', (data) => {
      this.trackAction('modify_object', data);
    });

    this.core.on('objectDeleted', (data) => {
      this.trackAction('delete_object', data);
    });

    // Track environment changes
    this.core.on('environmentChanged', (data) => {
      this.trackAction('change_environment', data);
    });

    // Track multiplayer
    this.core.on('multiplayerJoined', (data) => {
      this.trackAction('join_multiplayer', data);
    });

    this.core.on('sessionHosted', (data) => {
      this.trackAction('host_session', data);
    });

    // Track achievements
    this.core.on('achievementUnlocked', (data) => {
      this.trackAction('achievement_unlock', data);
    });
  }

  /**
   * Track a user action and award XP
   */
  trackAction(actionType, data = {}) {
    console.log(`[ProgressionSystem] Tracking action: ${actionType}`);

    // Get base XP for action
    let xp = this.xpRewards[actionType] || 0;

    // Apply streak bonus for voice commands
    if (actionType === 'voice_command') {
      if (this.isInStreak()) {
        this.currentStreak++;
        xp += this.currentStreak * this.xpRewards.voice_command_streak;
      } else {
        this.currentStreak = 1;
      }
      this.lastActionTime = Date.now();
      this.userData.stats.voiceCommands++;
    }

    // Update specific stats
    switch (actionType) {
      case 'create_object':
        this.userData.stats.objectsCreated++;
        this.userData.stats.creations++;
        this.gainSkillXP('creation', xp);
        break;
      case 'modify_object':
        this.gainSkillXP('modification', xp);
        break;
      case 'change_environment':
        this.userData.stats.environmentsModified++;
        this.gainSkillXP('exploration', xp);
        break;
      case 'join_multiplayer':
      case 'host_session':
        this.gainSkillXP('social', xp);
        break;
      case 'achievement_unlock':
        this.userData.stats.achievementsUnlocked++;
        this.gainSkillXP('mastery', xp);
        break;
    }

    // Award XP
    if (xp > 0) {
      this.gainXP(xp, actionType);
    }

    // Save progress
    this.saveProgress();
  }

  /**
   * Check if user is in an action streak
   */
  isInStreak() {
    if (!this.lastActionTime) return false;
    const timeSinceLastAction = Date.now() - this.lastActionTime;
    return timeSinceLastAction < 10000; // 10 seconds
  }

  /**
   * Gain XP and check for level up
   */
  gainXP(amount, source = 'unknown') {
    const oldLevel = this.userData.level;

    this.userData.xp += amount;
    this.userData.totalXP += amount;

    console.log(`[ProgressionSystem] +${amount} XP from ${source} (Total: ${this.userData.xp}/${this.getXPForNextLevel()})`);

    // Check for level up
    while (this.userData.xp >= this.getXPForNextLevel() && this.userData.level < this.levelConfig.maxLevel) {
      this.levelUp();
    }

    // Emit XP gained event
    this.core.emit('xpGained', {
      amount,
      source,
      currentXP: this.userData.xp,
      totalXP: this.userData.totalXP,
      leveledUp: this.userData.level > oldLevel,
      newLevel: this.userData.level
    });
  }

  /**
   * Gain skill XP
   */
  gainSkillXP(skill, baseAmount) {
    if (!this.userData.skills[skill]) {
      return;
    }

    const amount = baseAmount * (this.skillXPMultipliers[skill] || 1.0);
    const skillLevel = this.userData.skills[skill];

    // Skill XP required increases with level
    const xpForNextLevel = skillLevel * 100;

    // Track skill XP (we could expand this to have separate skill XP tracking)
    // For now, just increase skill level based on total actions

    console.log(`[ProgressionSystem] +${amount.toFixed(0)} ${skill} XP`);

    this.core.emit('skillXPGained', {
      skill,
      amount,
      level: skillLevel
    });
  }

  /**
   * Level up the user
   */
  levelUp() {
    const xpForLevel = this.getXPForNextLevel();
    this.userData.xp -= xpForLevel;
    this.userData.level++;

    console.log(`[ProgressionSystem] 🎉 LEVEL UP! Now level ${this.userData.level}`);

    // Unlock features at certain levels
    this.checkFeatureUnlocks();

    // Increase all skills slightly
    Object.keys(this.userData.skills).forEach(skill => {
      if (this.userData.level % 5 === 0) { // Every 5 levels
        this.userData.skills[skill]++;
      }
    });

    // Emit level up event
    this.core.emit('levelUp', {
      newLevel: this.userData.level,
      unlockedFeatures: this.getNewUnlocksForLevel(this.userData.level)
    });

    // Save progress
    this.saveProgress();
  }

  /**
   * Get XP required for next level
   */
  getXPForNextLevel() {
    const level = this.userData.level;
    return Math.floor(
      this.levelConfig.baseXP * Math.pow(this.levelConfig.xpMultiplier, level - 1)
    );
  }

  /**
   * Get XP required for a specific level
   */
  getXPForLevel(level) {
    return Math.floor(
      this.levelConfig.baseXP * Math.pow(this.levelConfig.xpMultiplier, level - 1)
    );
  }

  /**
   * Check and unlock features based on level
   */
  checkFeatureUnlocks() {
    const unlocks = {
      5: 'advanced_voice',
      10: 'environment_presets',
      15: 'object_templates',
      20: 'particle_effects',
      25: 'custom_materials',
      30: 'animation_system',
      35: 'scripting',
      40: 'multiplayer_hosting',
      50: 'world_builder',
      75: 'ai_companions',
      100: 'master_creator'
    };

    const level = this.userData.level;
    if (unlocks[level] && !this.userData.unlockedFeatures.includes(unlocks[level])) {
      this.unlockFeature(unlocks[level]);
    }
  }

  /**
   * Get newly unlocked features for a level
   */
  getNewUnlocksForLevel(level) {
    const unlocks = {
      5: ['advanced_voice'],
      10: ['environment_presets'],
      15: ['object_templates'],
      20: ['particle_effects'],
      25: ['custom_materials'],
      30: ['animation_system'],
      35: ['scripting'],
      40: ['multiplayer_hosting'],
      50: ['world_builder'],
      75: ['ai_companions'],
      100: ['master_creator']
    };

    return unlocks[level] || [];
  }

  /**
   * Unlock a feature
   */
  unlockFeature(featureId) {
    if (!this.userData.unlockedFeatures.includes(featureId)) {
      this.userData.unlockedFeatures.push(featureId);

      console.log(`[ProgressionSystem] 🔓 Unlocked feature: ${featureId}`);

      this.core.emit('featureUnlocked', { featureId });
      this.saveProgress();
    }
  }

  /**
   * Check if a feature is unlocked
   */
  isFeatureUnlocked(featureId) {
    return this.userData.unlockedFeatures.includes(featureId);
  }

  /**
   * Start a new session
   */
  startSession() {
    this.sessionStartTime = Date.now();
    this.userData.stats.sessionsPlayed++;

    console.log(`[ProgressionSystem] Session started (#${this.userData.stats.sessionsPlayed})`);

    // Award daily login bonus if first session today
    if (this.isFirstSessionToday()) {
      this.gainXP(this.xpRewards.daily_login, 'daily_login');
    }
  }

  /**
   * End the current session
   */
  endSession() {
    if (!this.sessionStartTime) return;

    const sessionDuration = Date.now() - this.sessionStartTime;
    const sessionMinutes = Math.floor(sessionDuration / 60000);

    this.userData.stats.timeInVR += sessionMinutes;

    // Award session XP
    this.gainXP(this.xpRewards.play_session, 'play_session');

    console.log(`[ProgressionSystem] Session ended (Duration: ${sessionMinutes} minutes)`);

    this.saveProgress();
    this.sessionStartTime = null;
  }

  /**
   * Check if this is the first session today
   */
  isFirstSessionToday() {
    const lastSession = localStorage.getItem('sanctuary-last-session');
    const today = new Date().toDateString();

    if (!lastSession || lastSession !== today) {
      localStorage.setItem('sanctuary-last-session', today);
      return true;
    }

    return false;
  }

  /**
   * Get user stats
   */
  getStats() {
    return {
      ...this.userData.stats,
      level: this.userData.level,
      xp: this.userData.xp,
      totalXP: this.userData.totalXP,
      xpForNextLevel: this.getXPForNextLevel(),
      progress: (this.userData.xp / this.getXPForNextLevel()) * 100
    };
  }

  /**
   * Get user profile
   */
  getProfile() {
    return {
      username: this.userData.username,
      level: this.userData.level,
      xp: this.userData.xp,
      totalXP: this.userData.totalXP,
      stats: this.userData.stats,
      skills: this.userData.skills,
      unlockedFeatures: this.userData.unlockedFeatures,
      rank: this.getRank()
    };
  }

  /**
   * Get user rank based on level
   */
  getRank() {
    const level = this.userData.level;

    if (level >= 100) return 'Master Creator';
    if (level >= 75) return 'Legendary Builder';
    if (level >= 50) return 'Expert Architect';
    if (level >= 40) return 'Advanced Creator';
    if (level >= 30) return 'Skilled Designer';
    if (level >= 20) return 'Proficient Builder';
    if (level >= 10) return 'Apprentice';
    if (level >= 5) return 'Novice';
    return 'Beginner';
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    try {
      const data = {
        userData: this.userData,
        lastSaved: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[ProgressionSystem] Failed to save progress:', error);
    }
  }

  /**
   * Load progress from localStorage
   */
  async loadProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.userData = { ...this.userData, ...data.userData };
        console.log(`[ProgressionSystem] Loaded progress: Level ${this.userData.level}, ${this.userData.totalXP} total XP`);
      }
    } catch (error) {
      console.error('[ProgressionSystem] Failed to load progress:', error);
    }
  }

  /**
   * Reset progress (for testing or user request)
   */
  resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('sanctuary-last-session');
      location.reload();
    }
  }

  /**
   * Export user data
   */
  exportData() {
    return JSON.stringify(this.userData, null, 2);
  }

  /**
   * Import user data
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      this.userData = { ...this.userData, ...data };
      this.saveProgress();
      console.log('[ProgressionSystem] Data imported successfully');
      return true;
    } catch (error) {
      console.error('[ProgressionSystem] Failed to import data:', error);
      return false;
    }
  }

  /**
   * Clean up
   */
  destroy() {
    this.endSession();
  }
}
