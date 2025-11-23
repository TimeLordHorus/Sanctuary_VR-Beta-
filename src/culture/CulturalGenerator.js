/**
 * Cultural Generator
 * Creates generations of sanctuary culture based on user behavior and indexed knowledge
 * Implements a "bigger on the inside" self-evolving system
 */

export class CulturalGenerator {
  constructor(core, knowledgeIndexer, behavioralAnalytics) {
    this.core = core;
    this.knowledge = knowledgeIndexer;
    this.analytics = behavioralAnalytics;

    // Configuration
    this.config = {
      generationInterval: 300000, // Generate new culture every 5 minutes
      minActionsForGeneration: 20, // Minimum actions before generating
      cultureEvolutionRate: 0.1, // How much culture changes each generation
      personalityStrength: 0.7 // How much user behavior influences culture
    };

    // Cultural data
    this.culture = {
      generation: 0,
      personality: {
        creativity: 0.5, // 0-1, analytical to creative
        pace: 0.5, // 0-1, contemplative to energetic
        exploration: 0.5, // 0-1, focused to exploratory
        formality: 0.5, // 0-1, casual to formal
        technicality: 0.5 // 0-1, simple to technical
      },
      traits: [],
      values: [],
      language: {
        vocabulary: new Map(), // Words/phrases unique to this sanctuary
        tone: 'balanced', // casual, balanced, formal
        complexity: 'medium' // simple, medium, complex
      },
      aesthetics: {
        preferredColors: [],
        preferredShapes: [],
        preferredMaterials: [],
        environmentStyle: 'balanced' // minimalist, balanced, elaborate
      },
      knowledge: {
        domains: new Map(), // Knowledge areas and their strength
        expertise: [], // Areas of expertise
        interests: [] // Emerging interests
      },
      evolution: {
        milestones: [],
        mutations: [],
        adaptations: []
      }
    };

    // Generation history
    this.history = [];

    // Storage key
    this.storageKey = 'sanctuary-culture';
  }

  /**
   * Initialize cultural generator
   */
  async init() {
    console.log('[CulturalGenerator] Initializing cultural generator...');

    // Load existing culture
    this.loadCulture();

    // Start generation cycle
    this.startGenerationCycle();

    console.log('[CulturalGenerator] Cultural generator initialized');
    console.log(`[CulturalGenerator] Current generation: ${this.culture.generation}`);

    return this;
  }

  /**
   * Start the culture generation cycle
   */
  startGenerationCycle() {
    this.generationInterval = setInterval(() => {
      this.generateCulture();
    }, this.config.generationInterval);

    // Initial generation
    setTimeout(() => {
      this.generateCulture();
    }, 5000);
  }

  /**
   * Generate new culture based on behavior and knowledge
   */
  async generateCulture() {
    const behaviorData = this.analytics.getBehaviorForCulture();
    const insights = this.analytics.getInsights();

    // Check if we have enough data
    if (this.analytics.behavior.stats.totalActions < this.config.minActionsForGeneration) {
      console.log('[CulturalGenerator] Not enough data for culture generation yet');
      return;
    }

    console.log('[CulturalGenerator] Generating new culture (Generation', this.culture.generation + 1, ')...');

    // Analyze behavior to update personality
    this.updatePersonality(behaviorData, insights);

    // Generate traits from behavior patterns
    this.generateTraits(behaviorData, insights);

    // Generate values from actions and achievements
    this.generateValues(behaviorData);

    // Evolve language based on commands and knowledge
    this.evolveLanguage(behaviorData, insights);

    // Update aesthetic preferences
    this.updateAesthetics(behaviorData);

    // Integrate knowledge domains
    this.integrateKnowledge();

    // Record evolution
    this.recordEvolution();

    // Increment generation
    this.culture.generation++;

    // Save culture
    this.saveCulture();

    // Emit event
    this.core.emit('cultureGenerated', {
      generation: this.culture.generation,
      personality: this.culture.personality,
      traits: this.culture.traits,
      values: this.culture.values
    });

    console.log('[CulturalGenerator] Culture generation complete');
    this.logCultureSummary();
  }

  /**
   * Update personality based on behavior
   */
  updatePersonality(behaviorData, insights) {
    const prefs = behaviorData.preferences;

    // Update creativity (based on creation diversity)
    const creationDiversity = new Set(behaviorData.creationHistory.map(c => c.data.type)).size;
    const creativityScore = Math.min(creationDiversity / 10, 1);
    this.culture.personality.creativity = this.smoothTransition(
      this.culture.personality.creativity,
      creativityScore
    );

    // Update pace (based on actions per minute)
    const paceScore = prefs.preferredPace === 'fast' ? 0.8 :
                      prefs.preferredPace === 'medium' ? 0.5 : 0.2;
    this.culture.personality.pace = this.smoothTransition(
      this.culture.personality.pace,
      paceScore
    );

    // Update exploration (based on exploration style)
    const explorationScore = prefs.explorationStyle === 'exploratory' ? 0.8 :
                            prefs.explorationStyle === 'creative' ? 0.6 : 0.3;
    this.culture.personality.exploration = this.smoothTransition(
      this.culture.personality.exploration,
      explorationScore
    );

    // Update formality (based on language patterns)
    const formalCommands = behaviorData.favoriteCommands.filter(([cmd]) =>
      cmd.includes('please') || cmd.includes('kindly')).length;
    const formalityScore = formalCommands / Math.max(behaviorData.favoriteCommands.length, 1);
    this.culture.personality.formality = this.smoothTransition(
      this.culture.personality.formality,
      formalityScore
    );

    // Update technicality (based on command complexity)
    const complexCommands = behaviorData.favoriteCommands.filter(([cmd]) =>
      cmd.split(' ').length > 5).length;
    const technicalityScore = complexCommands / Math.max(behaviorData.favoriteCommands.length, 1);
    this.culture.personality.technicality = this.smoothTransition(
      this.culture.personality.technicality,
      technicalityScore
    );
  }

  /**
   * Generate traits from behavior patterns
   */
  generateTraits(behaviorData, insights) {
    const newTraits = [];

    // Creativity traits
    if (this.culture.personality.creativity > 0.7) {
      newTraits.push({ name: 'Innovative', strength: this.culture.personality.creativity });
      newTraits.push({ name: 'Imaginative', strength: this.culture.personality.creativity - 0.2 });
    } else if (this.culture.personality.creativity < 0.3) {
      newTraits.push({ name: 'Methodical', strength: 1 - this.culture.personality.creativity });
      newTraits.push({ name: 'Precise', strength: 1 - this.culture.personality.creativity - 0.2 });
    }

    // Pace traits
    if (this.culture.personality.pace > 0.7) {
      newTraits.push({ name: 'Energetic', strength: this.culture.personality.pace });
      newTraits.push({ name: 'Dynamic', strength: this.culture.personality.pace - 0.1 });
    } else if (this.culture.personality.pace < 0.3) {
      newTraits.push({ name: 'Contemplative', strength: 1 - this.culture.personality.pace });
      newTraits.push({ name: 'Thoughtful', strength: 1 - this.culture.personality.pace - 0.1 });
    }

    // Exploration traits
    if (this.culture.personality.exploration > 0.7) {
      newTraits.push({ name: 'Adventurous', strength: this.culture.personality.exploration });
      newTraits.push({ name: 'Curious', strength: this.culture.personality.exploration - 0.1 });
    } else if (this.culture.personality.exploration < 0.3) {
      newTraits.push({ name: 'Focused', strength: 1 - this.culture.personality.exploration });
      newTraits.push({ name: 'Dedicated', strength: 1 - this.culture.personality.exploration - 0.1 });
    }

    // Knowledge-based traits
    if (insights.summary.totalActions > 100) {
      newTraits.push({ name: 'Experienced', strength: Math.min(insights.summary.totalActions / 500, 1) });
    }

    // Update traits (keep top 10 strongest)
    this.culture.traits = newTraits
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10);
  }

  /**
   * Generate values from actions
   */
  generateValues(behaviorData) {
    const newValues = [];

    // Analyze action patterns to infer values
    const creationCount = this.analytics.behavior.actions.creations.length;
    const knowledgeQueryCount = this.analytics.behavior.actions.interactions
      .filter(a => a.data.type === 'knowledge_query').length;
    const achievementCount = this.analytics.behavior.actions.achievements.length;

    // Creation-based values
    if (creationCount > 50) {
      newValues.push({
        name: 'Creation',
        description: 'Values bringing new things into existence',
        strength: Math.min(creationCount / 200, 1)
      });
    }

    // Knowledge-based values
    if (knowledgeQueryCount > 20) {
      newValues.push({
        name: 'Knowledge',
        description: 'Values learning and understanding',
        strength: Math.min(knowledgeQueryCount / 100, 1)
      });
    }

    // Achievement-based values
    if (achievementCount > 10) {
      newValues.push({
        name: 'Achievement',
        description: 'Values accomplishment and progress',
        strength: Math.min(achievementCount / 30, 1)
      });
    }

    // Environment exploration values
    const envChanges = behaviorData.preferredEnvironments.length;
    if (envChanges > 3) {
      newValues.push({
        name: 'Exploration',
        description: 'Values discovery and new experiences',
        strength: Math.min(envChanges / 10, 1)
      });
    }

    // Persistence value (based on session count)
    if (this.analytics.behavior.stats.totalSessions > 5) {
      newValues.push({
        name: 'Persistence',
        description: 'Values dedication and commitment',
        strength: Math.min(this.analytics.behavior.stats.totalSessions / 20, 1)
      });
    }

    this.culture.values = newValues.sort((a, b) => b.strength - a.strength).slice(0, 8);
  }

  /**
   * Evolve language based on usage patterns
   */
  evolveLanguage(behaviorData, insights) {
    // Update vocabulary from favorite commands
    for (const [command, count] of behaviorData.favoriteCommands) {
      const words = command.split(/\s+/);
      for (const word of words) {
        const currentWeight = this.culture.language.vocabulary.get(word) || 0;
        this.culture.language.vocabulary.set(word, currentWeight + count);
      }
    }

    // Prune vocabulary (keep top 100)
    const sortedVocab = Array.from(this.culture.language.vocabulary.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);
    this.culture.language.vocabulary = new Map(sortedVocab);

    // Update tone based on formality
    if (this.culture.personality.formality > 0.7) {
      this.culture.language.tone = 'formal';
    } else if (this.culture.personality.formality < 0.3) {
      this.culture.language.tone = 'casual';
    } else {
      this.culture.language.tone = 'balanced';
    }

    // Update complexity based on technicality
    if (this.culture.personality.technicality > 0.7) {
      this.culture.language.complexity = 'complex';
    } else if (this.culture.personality.technicality < 0.3) {
      this.culture.language.complexity = 'simple';
    } else {
      this.culture.language.complexity = 'medium';
    }
  }

  /**
   * Update aesthetic preferences
   */
  updateAesthetics(behaviorData) {
    // Analyze creation history for color preferences
    const colorCounts = new Map();
    for (const creation of behaviorData.creationHistory) {
      const color = creation.data.properties?.color;
      if (color) {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      }
    }

    this.culture.aesthetics.preferredColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);

    // Analyze for shape preferences
    const shapeCounts = new Map();
    for (const creation of behaviorData.creationHistory) {
      const type = creation.data.type;
      if (type) {
        shapeCounts.set(type, (shapeCounts.get(type) || 0) + 1);
      }
    }

    this.culture.aesthetics.preferredShapes = Array.from(shapeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([shape]) => shape);

    // Determine environment style
    if (this.culture.personality.creativity > 0.7) {
      this.culture.aesthetics.environmentStyle = 'elaborate';
    } else if (this.culture.personality.creativity < 0.3) {
      this.culture.aesthetics.environmentStyle = 'minimalist';
    } else {
      this.culture.aesthetics.environmentStyle = 'balanced';
    }
  }

  /**
   * Integrate knowledge from indexer
   */
  integrateKnowledge() {
    // Get all categories and tags from knowledge base
    const categories = this.knowledge.getCategories();
    const tags = this.knowledge.getTags();

    // Update knowledge domains
    for (const category of categories) {
      const items = this.knowledge.getByCategory(category);
      const strength = Math.min(items.length / 20, 1);
      this.culture.knowledge.domains.set(category, strength);
    }

    // Determine expertise areas (strongest domains)
    const sortedDomains = Array.from(this.culture.knowledge.domains.entries())
      .sort((a, b) => b[1] - a[1]);

    this.culture.knowledge.expertise = sortedDomains
      .slice(0, 5)
      .map(([domain]) => domain);

    this.culture.knowledge.interests = sortedDomains
      .slice(5, 15)
      .map(([domain]) => domain);
  }

  /**
   * Record evolution step
   */
  recordEvolution() {
    const evolution = {
      generation: this.culture.generation,
      timestamp: Date.now(),
      changes: {
        newTraits: this.culture.traits.slice(0, 3).map(t => t.name),
        strongestValues: this.culture.values.slice(0, 3).map(v => v.name),
        topKnowledgeDomains: this.culture.knowledge.expertise.slice(0, 3)
      }
    };

    this.culture.evolution.milestones.push(evolution);

    // Keep last 50 milestones
    if (this.culture.evolution.milestones.length > 50) {
      this.culture.evolution.milestones = this.culture.evolution.milestones.slice(-50);
    }

    // Record mutations (significant personality changes)
    const lastMilestone = this.culture.evolution.milestones[this.culture.evolution.milestones.length - 2];
    if (lastMilestone) {
      // Check for significant changes
      // This creates the "evolution" effect
    }
  }

  /**
   * Smooth transition for personality traits
   */
  smoothTransition(current, target) {
    return current + (target - current) * this.config.cultureEvolutionRate;
  }

  /**
   * Generate AI response based on culture
   */
  generateCulturalResponse(context, userMessage) {
    const personality = this.culture.personality;
    const tone = this.culture.language.tone;
    const complexity = this.culture.language.complexity;

    // Build response influenced by culture
    let response = '';

    // Adjust formality
    if (tone === 'formal') {
      response = this.makeFormal(response);
    } else if (tone === 'casual') {
      response = this.makeCasual(response);
    }

    // Adjust based on personality
    if (personality.creativity > 0.7) {
      response += this.addCreativeElements(userMessage);
    }

    if (personality.technicality > 0.7) {
      response += this.addTechnicalDetails(userMessage);
    }

    // Integrate knowledge
    const relevantKnowledge = this.findRelevantKnowledge(userMessage);
    if (relevantKnowledge.length > 0) {
      response += this.integrateKnowledgeInResponse(relevantKnowledge);
    }

    return {
      response,
      personality,
      culturalContext: {
        generation: this.culture.generation,
        dominantTraits: this.culture.traits.slice(0, 3),
        coreValues: this.culture.values.slice(0, 3)
      }
    };
  }

  /**
   * Find relevant knowledge for a message
   */
  findRelevantKnowledge(message) {
    return this.knowledge.search(message, { maxResults: 3 });
  }

  /**
   * Make response more formal
   */
  makeFormal(text) {
    // Add formal language patterns
    return text; // Placeholder
  }

  /**
   * Make response more casual
   */
  makeCasual(text) {
    // Add casual language patterns
    return text; // Placeholder
  }

  /**
   * Add creative elements to response
   */
  addCreativeElements(message) {
    return ` I notice you're interested in ${message}. Let me think creatively about this...`;
  }

  /**
   * Add technical details to response
   */
  addTechnicalDetails(message) {
    return ` From a technical perspective, ${message} involves several key components...`;
  }

  /**
   * Integrate knowledge into response
   */
  integrateKnowledgeInResponse(knowledge) {
    if (knowledge.length === 0) return '';

    const item = knowledge[0];
    return ` Based on my knowledge from ${item.source}, ${item.description}`;
  }

  /**
   * Get culture summary
   */
  getCultureSummary() {
    return {
      generation: this.culture.generation,
      personality: this.culture.personality,
      traits: this.culture.traits,
      values: this.culture.values,
      language: {
        tone: this.culture.language.tone,
        complexity: this.culture.language.complexity,
        vocabularySize: this.culture.language.vocabulary.size
      },
      aesthetics: this.culture.aesthetics,
      knowledge: {
        expertiseAreas: this.culture.knowledge.expertise,
        interests: this.culture.knowledge.interests,
        totalDomains: this.culture.knowledge.domains.size
      },
      evolution: {
        totalMilestones: this.culture.evolution.milestones.length,
        recentChanges: this.culture.evolution.milestones.slice(-3)
      }
    };
  }

  /**
   * Log culture summary
   */
  logCultureSummary() {
    const summary = this.getCultureSummary();
    console.log('[CulturalGenerator] === Culture Summary ===');
    console.log('[CulturalGenerator] Generation:', summary.generation);
    console.log('[CulturalGenerator] Personality:', summary.personality);
    console.log('[CulturalGenerator] Top Traits:', summary.traits.slice(0, 3).map(t => t.name).join(', '));
    console.log('[CulturalGenerator] Core Values:', summary.values.slice(0, 3).map(v => v.name).join(', '));
    console.log('[CulturalGenerator] Expertise:', summary.knowledge.expertiseAreas.join(', '));
    console.log('[CulturalGenerator] ========================');
  }

  /**
   * Save culture to storage
   */
  saveCulture() {
    try {
      const data = {
        generation: this.culture.generation,
        personality: this.culture.personality,
        traits: this.culture.traits,
        values: this.culture.values,
        language: {
          vocabulary: Array.from(this.culture.language.vocabulary.entries()),
          tone: this.culture.language.tone,
          complexity: this.culture.language.complexity
        },
        aesthetics: this.culture.aesthetics,
        knowledge: {
          domains: Array.from(this.culture.knowledge.domains.entries()),
          expertise: this.culture.knowledge.expertise,
          interests: this.culture.knowledge.interests
        },
        evolution: this.culture.evolution
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('[CulturalGenerator] Saved culture (Generation', this.culture.generation, ')');
    } catch (error) {
      console.error('[CulturalGenerator] Failed to save culture:', error);
    }
  }

  /**
   * Load culture from storage
   */
  loadCulture() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;

      const data = JSON.parse(saved);

      this.culture.generation = data.generation || 0;
      this.culture.personality = data.personality || this.culture.personality;
      this.culture.traits = data.traits || [];
      this.culture.values = data.values || [];

      this.culture.language.vocabulary = new Map(data.language?.vocabulary || []);
      this.culture.language.tone = data.language?.tone || 'balanced';
      this.culture.language.complexity = data.language?.complexity || 'medium';

      this.culture.aesthetics = data.aesthetics || this.culture.aesthetics;

      this.culture.knowledge.domains = new Map(data.knowledge?.domains || []);
      this.culture.knowledge.expertise = data.knowledge?.expertise || [];
      this.culture.knowledge.interests = data.knowledge?.interests || [];

      this.culture.evolution = data.evolution || this.culture.evolution;

      console.log('[CulturalGenerator] Loaded culture (Generation', this.culture.generation, ')');
    } catch (error) {
      console.error('[CulturalGenerator] Failed to load culture:', error);
    }
  }

  /**
   * Clear culture
   */
  clear() {
    this.culture.generation = 0;
    this.culture.personality = {
      creativity: 0.5,
      pace: 0.5,
      exploration: 0.5,
      formality: 0.5,
      technicality: 0.5
    };
    this.culture.traits = [];
    this.culture.values = [];
    this.culture.language.vocabulary.clear();
    this.culture.aesthetics.preferredColors = [];
    this.culture.knowledge.domains.clear();
    this.culture.evolution.milestones = [];

    this.saveCulture();
    console.log('[CulturalGenerator] Cleared culture');
  }

  /**
   * Destroy generator
   */
  destroy() {
    if (this.generationInterval) {
      clearInterval(this.generationInterval);
    }
    this.saveCulture();
  }
}
