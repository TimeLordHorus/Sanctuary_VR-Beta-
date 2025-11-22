/**
 * Achievement System
 * Manages achievements, badges, and unlockable rewards
 */

export class AchievementSystem {
  constructor(core, progressionSystem) {
    this.core = core;
    this.progressionSystem = progressionSystem;

    // Achievement tracking
    this.achievements = new Map();
    this.unlockedAchievements = [];

    // Storage key
    this.storageKey = 'sanctuary-achievements';
  }

  /**
   * Initialize the achievement system
   */
  async init() {
    console.log('[AchievementSystem] Initializing achievement system...');

    // Define all achievements
    this.defineAchievements();

    // Load unlocked achievements
    await this.loadAchievements();

    // Setup tracking
    this.setupTracking();

    console.log('[AchievementSystem] Achievement system initialized');
    return true;
  }

  /**
   * Define all available achievements
   */
  defineAchievements() {
    // First Steps
    this.defineAchievement({
      id: 'first_words',
      name: 'First Words',
      description: 'Use your first voice command',
      icon: '🎤',
      rarity: 'common',
      xpReward: 50,
      condition: (stats) => stats.voiceCommands >= 1
    });

    this.defineAchievement({
      id: 'first_creation',
      name: 'Creator Awakened',
      description: 'Create your first object',
      icon: '✨',
      rarity: 'common',
      xpReward: 100,
      condition: (stats) => stats.objectsCreated >= 1
    });

    this.defineAchievement({
      id: 'welcome',
      name: 'Welcome to Sanctuary',
      description: 'Complete the onboarding tutorial',
      icon: '🏛️',
      rarity: 'common',
      xpReward: 75,
      condition: (stats) => stats.sessionsPlayed >= 1
    });

    // Voice Mastery
    this.defineAchievement({
      id: 'voice_apprentice',
      name: 'Voice Apprentice',
      description: 'Use 50 voice commands',
      icon: '🗣️',
      rarity: 'common',
      xpReward: 200,
      condition: (stats) => stats.voiceCommands >= 50
    });

    this.defineAchievement({
      id: 'voice_master',
      name: 'Voice Master',
      description: 'Use 500 voice commands',
      icon: '👑',
      rarity: 'rare',
      xpReward: 1000,
      condition: (stats) => stats.voiceCommands >= 500
    });

    this.defineAchievement({
      id: 'voice_legend',
      name: 'Voice Legend',
      description: 'Use 5000 voice commands',
      icon: '⚡',
      rarity: 'legendary',
      xpReward: 5000,
      condition: (stats) => stats.voiceCommands >= 5000
    });

    // Creation Achievements
    this.defineAchievement({
      id: 'builder',
      name: 'Builder',
      description: 'Create 10 objects',
      icon: '🔨',
      rarity: 'common',
      xpReward: 150,
      condition: (stats) => stats.objectsCreated >= 10
    });

    this.defineAchievement({
      id: 'architect',
      name: 'Architect',
      description: 'Create 100 objects',
      icon: '🏗️',
      rarity: 'uncommon',
      xpReward: 500,
      condition: (stats) => stats.objectsCreated >= 100
    });

    this.defineAchievement({
      id: 'master_builder',
      name: 'Master Builder',
      description: 'Create 1000 objects',
      icon: '🏰',
      rarity: 'epic',
      xpReward: 2500,
      condition: (stats) => stats.objectsCreated >= 1000
    });

    this.defineAchievement({
      id: 'god_of_creation',
      name: 'God of Creation',
      description: 'Create 10,000 objects',
      icon: '🌟',
      rarity: 'legendary',
      xpReward: 10000,
      condition: (stats) => stats.objectsCreated >= 10000
    });

    // Environment Mastery
    this.defineAchievement({
      id: 'weather_controller',
      name: 'Weather Controller',
      description: 'Modify the environment 25 times',
      icon: '🌤️',
      rarity: 'uncommon',
      xpReward: 300,
      condition: (stats) => stats.environmentsModified >= 25
    });

    this.defineAchievement({
      id: 'world_shaper',
      name: 'World Shaper',
      description: 'Modify the environment 100 times',
      icon: '🌍',
      rarity: 'rare',
      xpReward: 1000,
      condition: (stats) => stats.environmentsModified >= 100
    });

    // Time-based Achievements
    this.defineAchievement({
      id: 'regular_visitor',
      name: 'Regular Visitor',
      description: 'Play 10 sessions',
      icon: '📅',
      rarity: 'common',
      xpReward: 200,
      condition: (stats) => stats.sessionsPlayed >= 10
    });

    this.defineAchievement({
      id: 'dedicated',
      name: 'Dedicated Explorer',
      description: 'Play 50 sessions',
      icon: '🎯',
      rarity: 'uncommon',
      xpReward: 750,
      condition: (stats) => stats.sessionsPlayed >= 50
    });

    this.defineAchievement({
      id: 'vr_resident',
      name: 'VR Resident',
      description: 'Spend 10 hours in VR',
      icon: '🏠',
      rarity: 'rare',
      xpReward: 1500,
      condition: (stats) => stats.timeInVR >= 600
    });

    this.defineAchievement({
      id: 'time_master',
      name: 'Time Master',
      description: 'Spend 100 hours in VR',
      icon: '⏰',
      rarity: 'epic',
      xpReward: 5000,
      condition: (stats) => stats.timeInVR >= 6000
    });

    // Level Achievements
    this.defineAchievement({
      id: 'level_10',
      name: 'Rising Star',
      description: 'Reach level 10',
      icon: '⭐',
      rarity: 'common',
      xpReward: 500,
      condition: (stats) => stats.level >= 10
    });

    this.defineAchievement({
      id: 'level_25',
      name: 'Skilled Practitioner',
      description: 'Reach level 25',
      icon: '💫',
      rarity: 'uncommon',
      xpReward: 1000,
      condition: (stats) => stats.level >= 25
    });

    this.defineAchievement({
      id: 'level_50',
      name: 'Expert Creator',
      description: 'Reach level 50',
      icon: '🌠',
      rarity: 'rare',
      xpReward: 2500,
      condition: (stats) => stats.level >= 50
    });

    this.defineAchievement({
      id: 'level_75',
      name: 'Legendary Master',
      description: 'Reach level 75',
      icon: '💎',
      rarity: 'epic',
      xpReward: 5000,
      condition: (stats) => stats.level >= 75
    });

    this.defineAchievement({
      id: 'level_100',
      name: 'Transcendent Being',
      description: 'Reach the maximum level of 100',
      icon: '👑',
      rarity: 'legendary',
      xpReward: 10000,
      condition: (stats) => stats.level >= 100
    });

    // Collection Achievements
    this.defineAchievement({
      id: 'collector',
      name: 'Collector',
      description: 'Unlock 10 achievements',
      icon: '🏆',
      rarity: 'uncommon',
      xpReward: 500,
      condition: (stats) => stats.achievementsUnlocked >= 10
    });

    this.defineAchievement({
      id: 'completionist',
      name: 'Completionist',
      description: 'Unlock 25 achievements',
      icon: '🎖️',
      rarity: 'rare',
      xpReward: 2000,
      condition: (stats) => stats.achievementsUnlocked >= 25
    });

    // Hidden/Special Achievements
    this.defineAchievement({
      id: 'speed_runner',
      name: 'Speed Runner',
      description: 'Complete onboarding in under 2 minutes',
      icon: '⚡',
      rarity: 'rare',
      xpReward: 1000,
      hidden: true,
      condition: (stats) => stats.onboardingTime && stats.onboardingTime < 120
    });

    this.defineAchievement({
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Play a session after midnight',
      icon: '🦉',
      rarity: 'uncommon',
      xpReward: 250,
      hidden: true,
      condition: (stats) => stats.midnightSessions >= 1
    });

    this.defineAchievement({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete 100 voice commands without a single error',
      icon: '💯',
      rarity: 'epic',
      xpReward: 3000,
      hidden: true,
      condition: (stats) => stats.perfectStreak >= 100
    });
  }

  /**
   * Define a single achievement
   */
  defineAchievement(config) {
    this.achievements.set(config.id, {
      ...config,
      unlocked: false,
      unlockedAt: null,
      progress: 0
    });
  }

  /**
   * Setup achievement tracking
   */
  setupTracking() {
    // Check achievements whenever stats update
    this.core.on('xpGained', () => this.checkAchievements());
    this.core.on('levelUp', () => this.checkAchievements());
    this.core.on('voiceCommandSuccess', () => this.checkAchievements());
  }

  /**
   * Check all achievements for unlock conditions
   */
  checkAchievements() {
    const stats = {
      ...this.progressionSystem.userData.stats,
      level: this.progressionSystem.userData.level
    };

    for (const [id, achievement] of this.achievements.entries()) {
      if (!achievement.unlocked && achievement.condition(stats)) {
        this.unlockAchievement(id);
      }
    }
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) {
      return;
    }

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    this.unlockedAchievements.push(achievementId);

    console.log(`[AchievementSystem] 🏆 Achievement Unlocked: ${achievement.name}`);

    // Award XP
    if (achievement.xpReward && this.progressionSystem) {
      this.progressionSystem.gainXP(achievement.xpReward, `achievement_${achievementId}`);
    }

    // Emit event
    this.core.emit('achievementUnlocked', {
      id: achievementId,
      achievement: { ...achievement }
    });

    // Show notification
    this.showAchievementNotification(achievement);

    // Save
    this.saveAchievements();
  }

  /**
   * Show achievement unlock notification
   */
  showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-info">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name ${achievement.rarity}">${achievement.name}</div>
        <div class="achievement-desc">${achievement.description}</div>
        <div class="achievement-reward">+${achievement.xpReward} XP</div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);
  }

  /**
   * Get achievement by ID
   */
  getAchievement(id) {
    return this.achievements.get(id);
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  /**
   * Get locked achievements
   */
  getLockedAchievements() {
    return Array.from(this.achievements.values()).filter(a => !a.unlocked && !a.hidden);
  }

  /**
   * Get achievements by rarity
   */
  getAchievementsByRarity(rarity) {
    return Array.from(this.achievements.values()).filter(a => a.rarity === rarity);
  }

  /**
   * Get achievement progress
   */
  getProgress() {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.length;
    const percentage = (unlocked / total) * 100;

    return {
      total,
      unlocked,
      locked: total - unlocked,
      percentage: percentage.toFixed(1)
    };
  }

  /**
   * Get rarity distribution
   */
  getRarityDistribution() {
    const distribution = {
      common: { total: 0, unlocked: 0 },
      uncommon: { total: 0, unlocked: 0 },
      rare: { total: 0, unlocked: 0 },
      epic: { total: 0, unlocked: 0 },
      legendary: { total: 0, unlocked: 0 }
    };

    for (const achievement of this.achievements.values()) {
      const rarity = achievement.rarity;
      distribution[rarity].total++;
      if (achievement.unlocked) {
        distribution[rarity].unlocked++;
      }
    }

    return distribution;
  }

  /**
   * Save achievements to localStorage
   */
  saveAchievements() {
    try {
      const data = {
        unlocked: this.unlockedAchievements,
        achievements: Array.from(this.achievements.entries()).map(([id, achievement]) => ({
          id,
          unlocked: achievement.unlocked,
          unlockedAt: achievement.unlockedAt
        }))
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('[AchievementSystem] Failed to save achievements:', error);
    }
  }

  /**
   * Load achievements from localStorage
   */
  async loadAchievements() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.unlockedAchievements = data.unlocked || [];

        // Update achievement states
        for (const savedAchievement of data.achievements || []) {
          const achievement = this.achievements.get(savedAchievement.id);
          if (achievement) {
            achievement.unlocked = savedAchievement.unlocked;
            achievement.unlockedAt = savedAchievement.unlockedAt;
          }
        }

        console.log(`[AchievementSystem] Loaded ${this.unlockedAchievements.length} unlocked achievements`);
      }
    } catch (error) {
      console.error('[AchievementSystem] Failed to load achievements:', error);
    }
  }

  /**
   * Reset all achievements
   */
  resetAchievements() {
    if (confirm('Are you sure you want to reset all achievements? This cannot be undone.')) {
      for (const achievement of this.achievements.values()) {
        achievement.unlocked = false;
        achievement.unlockedAt = null;
      }
      this.unlockedAchievements = [];
      this.saveAchievements();
      console.log('[AchievementSystem] All achievements reset');
    }
  }
}
