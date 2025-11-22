/**
 * NLP Engine
 * Natural Language Processing for voice command parsing and intent recognition
 */

export class NLPEngine {
  constructor(core) {
    this.core = core;

    // Intent patterns and their handlers
    this.intents = new Map();
    this.entityExtractors = new Map();
    this.contextHandlers = new Map();

    // Synonyms and variations
    this.synonyms = new Map();

    // Command templates
    this.templates = [];
  }

  /**
   * Initialize the NLP engine
   */
  async init() {
    console.log('[NLPEngine] Initializing NLP engine...');

    // Register intents
    this.registerIntents();

    // Register entity extractors
    this.registerEntityExtractors();

    // Load synonyms
    this.loadSynonyms();

    // Build command templates
    this.buildTemplates();

    console.log('[NLPEngine] NLP engine initialized');
    return true;
  }

  /**
   * Register all supported intents
   */
  registerIntents() {
    // Creation intents
    this.registerIntent('create_object', {
      patterns: [
        /create (?:a |an )?(.+)/i,
        /make (?:a |an )?(.+)/i,
        /spawn (?:a |an )?(.+)/i,
        /add (?:a |an )?(.+)/i,
        /place (?:a |an )?(.+)/i,
        /build (?:a |an )?(.+)/i
      ],
      entities: ['object_type', 'color', 'size', 'position', 'material']
    });

    this.registerIntent('modify_object', {
      patterns: [
        /(?:change|modify|update|edit|alter) (?:the )?(.+)/i,
        /make (?:the )?(.+?) (.+)/i,
        /turn (?:the )?(.+?) (.+)/i,
        /set (?:the )?(.+?) (?:to )?(.+)/i
      ],
      entities: ['target', 'property', 'value']
    });

    this.registerIntent('delete_object', {
      patterns: [
        /(?:delete|remove|destroy|clear) (?:the )?(.+)/i,
        /get rid of (?:the )?(.+)/i
      ],
      entities: ['target']
    });

    // Environment intents
    this.registerIntent('change_lighting', {
      patterns: [
        /(?:change|set|make|adjust) (?:the )?(?:lighting|lights?) (?:to )?(.+)/i,
        /(?:make it|set) (.+?) (?:light|lighting)/i,
        /turn (?:the )?lights (.+)/i
      ],
      entities: ['lighting_type', 'intensity', 'color']
    });

    this.registerIntent('change_time', {
      patterns: [
        /(?:change|set|make) (?:the )?time (?:of day )?(?:to )?(.+)/i,
        /make it (.+?) (?:time|o'clock)/i,
        /set (?:to )?(.+)/i
      ],
      entities: ['time_of_day']
    });

    this.registerIntent('change_weather', {
      patterns: [
        /(?:change|set|make) (?:the )?weather (?:to )?(.+)/i,
        /make it (.+)/i,
        /add (.+?) (?:weather|effect)/i
      ],
      entities: ['weather_type', 'intensity']
    });

    this.registerIntent('change_atmosphere', {
      patterns: [
        /(?:change|set|create) (?:the )?(?:atmosphere|mood|ambiance|vibe) (?:to )?(.+)/i,
        /make it (?:feel )?(.+)/i,
        /set (?:the )?(?:mood|vibe) (?:to )?(.+)/i
      ],
      entities: ['atmosphere_type']
    });

    // Movement and positioning intents
    this.registerIntent('move_object', {
      patterns: [
        /move (?:the )?(.+?) (?:to )?(.+)/i,
        /put (?:the )?(.+?) (?:at|on|in|near) (.+)/i,
        /position (?:the )?(.+?) (?:at )?(.+)/i
      ],
      entities: ['target', 'position', 'direction']
    });

    this.registerIntent('teleport', {
      patterns: [
        /(?:teleport|go|move|travel) (?:to |me to )?(.+)/i,
        /take me to (.+)/i,
        /(?:jump|warp) (?:to )?(.+)/i
      ],
      entities: ['destination']
    });

    // Audio intents
    this.registerIntent('play_sound', {
      patterns: [
        /play (?:a |an |some |the )?(.+?) (?:sound|audio|music)/i,
        /add (?:a |an |some )?(.+?) (?:sound|music|audio)/i,
        /start (?:playing )?(.+)/i
      ],
      entities: ['sound_type', 'volume']
    });

    this.registerIntent('stop_sound', {
      patterns: [
        /stop (?:the |all )?(?:sound|audio|music)/i,
        /silence/i,
        /mute (?:everything)?/i
      ],
      entities: []
    });

    // Interaction intents
    this.registerIntent('enable_physics', {
      patterns: [
        /enable (?:the )?physics (?:on |for )?(.+)?/i,
        /make (.+?) (?:fall|drop|physical)/i,
        /turn on physics/i
      ],
      entities: ['target']
    });

    this.registerIntent('create_interaction', {
      patterns: [
        /make (?:the )?(.+?) (.+?) when (?:I |you |we )?(.+)/i,
        /(?:the )?(.+?) should (.+?) (?:when|if) (.+)/i
      ],
      entities: ['target', 'action', 'trigger']
    });

    // Effects intents
    this.registerIntent('add_effect', {
      patterns: [
        /add (?:a |an )?(.+?) effect (?:to )?(.+)?/i,
        /apply (?:a |an )?(.+?) (?:to |on )?(.+)?/i,
        /create (?:a |an )?(.+?) effect/i
      ],
      entities: ['effect_type', 'target', 'intensity']
    });

    // Query intents
    this.registerIntent('query_object', {
      patterns: [
        /what (?:is|are) (?:the )?(.+)/i,
        /(?:show|tell|list) (?:me )?(?:the |all )?(.+)/i,
        /how many (.+)/i
      ],
      entities: ['query_target']
    });

    this.registerIntent('help', {
      patterns: [
        /help/i,
        /what can (?:I|you) do/i,
        /(?:show|list) (?:commands|examples)/i,
        /how do (?:I|you) (.+)/i
      ],
      entities: ['help_topic']
    });

    // Control intents
    this.registerIntent('undo', {
      patterns: [
        /undo/i,
        /go back/i,
        /revert/i,
        /cancel (?:that)?/i
      ],
      entities: []
    });

    this.registerIntent('save', {
      patterns: [
        /save (?:the |my )?(.+)?/i,
        /export (?:the |my )?(.+)?/i
      ],
      entities: ['save_target']
    });

    this.registerIntent('load', {
      patterns: [
        /load (?:the |my )?(.+)/i,
        /import (.+)/i,
        /open (.+)/i
      ],
      entities: ['load_target']
    });
  }

  /**
   * Register entity extractors
   */
  registerEntityExtractors() {
    // Color extractor
    this.registerEntityExtractor('color', (text) => {
      const colors = [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white',
        'gray', 'brown', 'cyan', 'magenta', 'gold', 'silver', 'bronze', 'crimson',
        'turquoise', 'violet', 'indigo', 'lime', 'teal', 'navy', 'maroon'
      ];

      const words = text.toLowerCase().split(/\s+/);
      for (const color of colors) {
        if (words.includes(color)) {
          return color;
        }
      }
      return null;
    });

    // Size extractor
    this.registerEntityExtractor('size', (text) => {
      const sizePattern = /(tiny|small|medium|large|huge|enormous|giant|massive|(\d+(?:\.\d+)?)\s*(?:meters?|m|units?))/i;
      const match = text.match(sizePattern);
      if (match) {
        if (match[2]) {
          return parseFloat(match[2]);
        }
        return match[1].toLowerCase();
      }
      return null;
    });

    // Position extractor
    this.registerEntityExtractor('position', (text) => {
      // Parse coordinates like "at 1,2,3" or "x:1 y:2 z:3"
      const coordPattern = /(?:at\s+)?(?:(?:x\s*:?\s*)?(-?\d+(?:\.\d+)?)\s*,?\s*(?:y\s*:?\s*)?(-?\d+(?:\.\d+)?)\s*,?\s*(?:z\s*:?\s*)?(-?\d+(?:\.\d+)?))/i;
      const match = text.match(coordPattern);
      if (match) {
        return {
          x: parseFloat(match[1]),
          y: parseFloat(match[2]),
          z: parseFloat(match[3])
        };
      }

      // Parse relative positions
      const relativePattern = /(in front|behind|above|below|left|right|near|far)/i;
      const relMatch = text.match(relativePattern);
      if (relMatch) {
        return { relative: relMatch[1].toLowerCase() };
      }

      return null;
    });

    // Time of day extractor
    this.registerEntityExtractor('time_of_day', (text) => {
      const times = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'evening', 'night', 'midnight', 'sunrise', 'sunset'];
      const words = text.toLowerCase().split(/\s+/);
      for (const time of times) {
        if (words.includes(time)) {
          return time;
        }
      }

      // Parse time like "3pm" or "15:00"
      const timePattern = /(\d{1,2})(?::(\d{2}))?\s*([ap]m)?/i;
      const match = text.match(timePattern);
      if (match) {
        let hour = parseInt(match[1]);
        const minute = match[2] ? parseInt(match[2]) : 0;
        const meridiem = match[3]?.toLowerCase();

        if (meridiem === 'pm' && hour < 12) hour += 12;
        if (meridiem === 'am' && hour === 12) hour = 0;

        return { hour, minute };
      }

      return null;
    });

    // Weather type extractor
    this.registerEntityExtractor('weather_type', (text) => {
      const weather = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy', 'windy', 'clear'];
      const words = text.toLowerCase().split(/\s+/);
      for (const w of weather) {
        if (words.includes(w) || words.includes(w + 'y')) {
          return w;
        }
      }
      return null;
    });

    // Object type extractor
    this.registerEntityExtractor('object_type', (text) => {
      // Common VR objects
      const objects = [
        'cube', 'sphere', 'cylinder', 'plane', 'pyramid', 'cone',
        'tree', 'rock', 'chair', 'table', 'house', 'building', 'wall',
        'light', 'lamp', 'torch', 'fire', 'water', 'fountain',
        'platform', 'stair', 'stairs', 'door', 'window', 'pillar', 'column'
      ];

      const words = text.toLowerCase().split(/\s+/);
      for (const obj of objects) {
        if (words.includes(obj) || words.includes(obj + 's')) {
          return obj;
        }
      }

      // If no match, return the first noun-like word
      const nounPattern = /\b([a-z]+(?:ball|box|block|ring|arch|gate|portal|statue|monument))\b/i;
      const match = text.match(nounPattern);
      if (match) {
        return match[1].toLowerCase();
      }

      return null;
    });

    // Material extractor
    this.registerEntityExtractor('material', (text) => {
      const materials = ['wood', 'metal', 'stone', 'glass', 'plastic', 'concrete', 'brick', 'marble', 'gold', 'silver', 'bronze', 'iron'];
      const words = text.toLowerCase().split(/\s+/);
      for (const material of materials) {
        if (words.includes(material)) {
          return material;
        }
      }
      return null;
    });

    // Intensity extractor
    this.registerEntityExtractor('intensity', (text) => {
      const intensityPattern = /(very )?(low|medium|high|strong|weak|intense|subtle)|(\d+)%/i;
      const match = text.match(intensityPattern);
      if (match) {
        if (match[3]) {
          return parseInt(match[3]) / 100;
        }
        const modifier = match[1] ? 'very ' : '';
        return modifier + (match[2]?.toLowerCase() || '');
      }
      return null;
    });
  }

  /**
   * Load synonym mappings
   */
  loadSynonyms() {
    this.addSynonyms('create', ['make', 'spawn', 'add', 'build', 'generate']);
    this.addSynonyms('delete', ['remove', 'destroy', 'clear', 'erase']);
    this.addSynonyms('change', ['modify', 'update', 'edit', 'alter', 'adjust', 'set']);
    this.addSynonyms('move', ['position', 'place', 'put', 'shift']);
    this.addSynonyms('big', ['large', 'huge', 'enormous', 'giant', 'massive']);
    this.addSynonyms('small', ['tiny', 'little', 'mini', 'compact']);
  }

  /**
   * Build command templates
   */
  buildTemplates() {
    // Templates help with context and ambiguity resolution
    this.templates = [
      { pattern: 'create {object_type} {color} {size}', intent: 'create_object' },
      { pattern: 'make it {time_of_day}', intent: 'change_time' },
      { pattern: 'change {property} to {value}', intent: 'modify_object' },
      { pattern: 'move {target} to {position}', intent: 'move_object' }
    ];
  }

  /**
   * Parse natural language input into structured command
   */
  async parse(text, options = {}) {
    const { context = [], history = [] } = options;

    console.log(`[NLPEngine] Parsing: "${text}"`);

    // Normalize text
    const normalizedText = this.normalizeText(text);

    // Try to match intent
    const intent = this.matchIntent(normalizedText);
    if (!intent) {
      throw new Error(`Could not understand command: "${text}"`);
    }

    // Extract entities
    const entities = this.extractEntities(normalizedText, intent.entities);

    // Resolve context references (e.g., "it", "that", "the same")
    const resolvedEntities = this.resolveContext(entities, context, history);

    // Build structured command
    const command = {
      originalText: text,
      normalizedText,
      intent: intent.name,
      entities: resolvedEntities,
      confidence: this.calculateConfidence(intent, resolvedEntities),
      timestamp: Date.now()
    };

    console.log('[NLPEngine] Parsed command:', command);

    return command;
  }

  /**
   * Normalize text (lowercase, expand contractions, etc.)
   */
  normalizeText(text) {
    let normalized = text.toLowerCase().trim();

    // Expand contractions
    normalized = normalized.replace(/i'm/g, 'i am');
    normalized = normalized.replace(/it's/g, 'it is');
    normalized = normalized.replace(/don't/g, 'do not');
    normalized = normalized.replace(/can't/g, 'cannot');

    // Remove filler words
    normalized = normalized.replace(/\b(um|uh|like|you know|actually|basically)\b/gi, '');

    // Normalize spacing
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
  }

  /**
   * Match text to an intent
   */
  matchIntent(text) {
    for (const [intentName, intentData] of this.intents.entries()) {
      for (const pattern of intentData.patterns) {
        if (pattern.test(text)) {
          return {
            name: intentName,
            pattern,
            entities: intentData.entities,
            match: text.match(pattern)
          };
        }
      }
    }
    return null;
  }

  /**
   * Extract entities from text
   */
  extractEntities(text, entityTypes) {
    const entities = {};

    for (const entityType of entityTypes) {
      const extractor = this.entityExtractors.get(entityType);
      if (extractor) {
        const value = extractor(text);
        if (value !== null) {
          entities[entityType] = value;
        }
      }
    }

    return entities;
  }

  /**
   * Resolve contextual references
   */
  resolveContext(entities, context, history) {
    // If entities reference "it" or "that", use the last object from context
    const hasPronouns = Object.values(entities).some(v =>
      typeof v === 'string' && /\b(it|that|this|them|those)\b/i.test(v)
    );

    if (hasPronouns && context.length > 0) {
      const lastContext = context[context.length - 1];
      if (lastContext.parsedCommand?.entities) {
        // Inherit relevant entities from last command
        return { ...lastContext.parsedCommand.entities, ...entities };
      }
    }

    return entities;
  }

  /**
   * Calculate confidence score for the parse
   */
  calculateConfidence(intent, entities) {
    let confidence = 0.7; // Base confidence

    // Higher confidence if more entities are extracted
    const entityCount = Object.keys(entities).length;
    confidence += Math.min(entityCount * 0.05, 0.2);

    // Lower confidence if required entities are missing
    const requiredEntities = intent.entities.slice(0, 2); // First 2 are usually required
    const missingRequired = requiredEntities.filter(e => !entities[e]).length;
    confidence -= missingRequired * 0.15;

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Register a new intent
   */
  registerIntent(name, config) {
    this.intents.set(name, config);
  }

  /**
   * Register an entity extractor
   */
  registerEntityExtractor(name, extractor) {
    this.entityExtractors.set(name, extractor);
  }

  /**
   * Add synonyms for a word
   */
  addSynonyms(word, synonyms) {
    this.synonyms.set(word, synonyms);
    // Also map synonyms back to the main word
    for (const synonym of synonyms) {
      if (!this.synonyms.has(synonym)) {
        this.synonyms.set(synonym, [word]);
      }
    }
  }

  /**
   * Get supported intents
   */
  getSupportedIntents() {
    return Array.from(this.intents.keys());
  }

  /**
   * Get examples for an intent
   */
  getExamples(intentName) {
    const examples = {
      create_object: [
        'Create a red cube',
        'Make a large blue sphere',
        'Spawn a tree at 5,0,10',
        'Add a wooden table'
      ],
      change_lighting: [
        'Make it darker',
        'Change lighting to sunset',
        'Turn lights to blue',
        'Set bright lighting'
      ],
      change_time: [
        'Make it night',
        'Change time to noon',
        'Set to dawn',
        'Make it 3pm'
      ],
      change_weather: [
        'Make it rainy',
        'Add fog',
        'Change weather to sunny',
        'Create a storm'
      ],
      move_object: [
        'Move the cube to the right',
        'Put the sphere above the platform',
        'Position the tree at 10,0,5'
      ],
      modify_object: [
        'Make the cube bigger',
        'Change the sphere to red',
        'Make it transparent'
      ]
    };

    return examples[intentName] || [];
  }
}
