/**
 * Pantheon Selection
 * Allows users to choose a patron deity/archetype that flavors their sanctuary experience
 */

export class PantheonSelection {
  constructor(core) {
    this.core = core;

    // Available patrons with their influences
    this.patrons = [
      {
        id: 'artemis',
        name: 'Artemis',
        title: 'Goddess of the Hunt & Wilderness',
        description: 'Patron of explorers, naturalists, and those who seek harmony with the wild. Favors independence and precision.',
        symbol: '🏹',
        influences: {
          creativity: 0.6,
          exploration: 0.9,
          pace: 0.7,
          formality: 0.3,
          technicality: 0.5
        },
        initialTraits: ['Adventurous', 'Precise', 'Independent'],
        initialValues: ['Exploration', 'Freedom', 'Nature'],
        preferredEnvironments: ['forest', 'mountains', 'wilderness'],
        preferredColors: ['green', 'silver', 'white'],
        knowledgeDomains: ['nature', 'wildlife', 'astronomy', 'archery']
      },
      {
        id: 'athena',
        name: 'Athena',
        title: 'Goddess of Wisdom & Strategy',
        description: 'Patron of scholars, strategists, and craftspeople. Favors knowledge, careful planning, and skillful creation.',
        symbol: '🦉',
        influences: {
          creativity: 0.7,
          exploration: 0.5,
          pace: 0.4,
          formality: 0.7,
          technicality: 0.9
        },
        initialTraits: ['Wise', 'Strategic', 'Methodical'],
        initialValues: ['Knowledge', 'Craftsmanship', 'Strategy'],
        preferredEnvironments: ['library', 'workshop', 'academy'],
        preferredColors: ['blue', 'gold', 'grey'],
        knowledgeDomains: ['philosophy', 'mathematics', 'architecture', 'warfare']
      },
      {
        id: 'apollo',
        name: 'Apollo',
        title: 'God of Arts & Prophecy',
        description: 'Patron of artists, musicians, and seers. Favors creativity, harmony, and illumination of truth.',
        symbol: '☀️',
        influences: {
          creativity: 0.9,
          exploration: 0.6,
          pace: 0.6,
          formality: 0.6,
          technicality: 0.5
        },
        initialTraits: ['Creative', 'Harmonious', 'Visionary'],
        initialValues: ['Art', 'Beauty', 'Truth'],
        preferredEnvironments: ['temple', 'theater', 'garden'],
        preferredColors: ['gold', 'yellow', 'white'],
        knowledgeDomains: ['music', 'poetry', 'medicine', 'prophecy']
      },
      {
        id: 'hephaestus',
        name: 'Hephaestus',
        title: 'God of the Forge & Technology',
        description: 'Patron of inventors, engineers, and makers. Favors innovation, persistence, and technical mastery.',
        symbol: '🔨',
        influences: {
          creativity: 0.8,
          exploration: 0.4,
          pace: 0.5,
          formality: 0.4,
          technicality: 1.0
        },
        initialTraits: ['Innovative', 'Persistent', 'Technical'],
        initialValues: ['Creation', 'Innovation', 'Mastery'],
        preferredEnvironments: ['forge', 'workshop', 'laboratory'],
        preferredColors: ['red', 'orange', 'bronze'],
        knowledgeDomains: ['engineering', 'metallurgy', 'automation', 'invention']
      },
      {
        id: 'hermes',
        name: 'Hermes',
        title: 'God of Travel & Communication',
        description: 'Patron of travelers, merchants, and messengers. Favors speed, wit, and adaptability.',
        symbol: '⚡',
        influences: {
          creativity: 0.7,
          exploration: 0.8,
          pace: 0.9,
          formality: 0.2,
          technicality: 0.6
        },
        initialTraits: ['Quick', 'Adaptable', 'Curious'],
        initialValues: ['Communication', 'Trade', 'Discovery'],
        preferredEnvironments: ['marketplace', 'crossroads', 'sky'],
        preferredColors: ['blue', 'grey', 'silver'],
        knowledgeDomains: ['commerce', 'linguistics', 'travel', 'technology']
      },
      {
        id: 'dionysus',
        name: 'Dionysus',
        title: 'God of Celebration & Transformation',
        description: 'Patron of artists, performers, and those who embrace change. Favors spontaneity, joy, and metamorphosis.',
        symbol: '🍇',
        influences: {
          creativity: 1.0,
          exploration: 0.7,
          pace: 0.8,
          formality: 0.1,
          technicality: 0.3
        },
        initialTraits: ['Spontaneous', 'Joyful', 'Transformative'],
        initialValues: ['Celebration', 'Freedom', 'Change'],
        preferredEnvironments: ['theater', 'vineyard', 'festival'],
        preferredColors: ['purple', 'green', 'gold'],
        knowledgeDomains: ['theater', 'agriculture', 'psychology', 'ritual']
      },
      {
        id: 'demeter',
        name: 'Demeter',
        title: 'Goddess of Harvest & Growth',
        description: 'Patron of gardeners, nurturers, and those who cultivate. Favors patience, care, and sustainable growth.',
        symbol: '🌾',
        influences: {
          creativity: 0.6,
          exploration: 0.4,
          pace: 0.3,
          formality: 0.5,
          technicality: 0.4
        },
        initialTraits: ['Patient', 'Nurturing', 'Grounded'],
        initialValues: ['Growth', 'Sustainability', 'Care'],
        preferredEnvironments: ['garden', 'farm', 'grove'],
        preferredColors: ['green', 'brown', 'gold'],
        knowledgeDomains: ['agriculture', 'ecology', 'botany', 'seasons']
      },
      {
        id: 'none',
        name: 'The Wanderer',
        title: 'Pathless & Unbounded',
        description: 'No patron guides your path. You forge your own destiny, influenced only by your choices and actions.',
        symbol: '🌟',
        influences: {
          creativity: 0.5,
          exploration: 0.5,
          pace: 0.5,
          formality: 0.5,
          technicality: 0.5
        },
        initialTraits: ['Independent', 'Adaptable', 'Balanced'],
        initialValues: ['Self-Determination', 'Balance', 'Discovery'],
        preferredEnvironments: ['all'],
        preferredColors: ['all'],
        knowledgeDomains: ['all']
      }
    ];

    // Selected patron
    this.selectedPatron = null;

    // UI container
    this.container = null;

    // Storage key
    this.storageKey = 'sanctuary-patron-selection';
  }

  /**
   * Initialize pantheon selection
   */
  async init() {
    console.log('[PantheonSelection] Initializing pantheon selection...');

    // Check if already selected
    const existing = this.loadSelection();
    if (existing) {
      console.log('[PantheonSelection] Patron already selected:', existing.name);
      this.selectedPatron = existing;
      return false; // Don't show selection screen
    }

    this.createUI();
    console.log('[PantheonSelection] Pantheon selection initialized');
    return true; // Show selection screen
  }

  /**
   * Create selection UI
   */
  createUI() {
    this.container = document.createElement('div');
    this.container.id = 'pantheon-selection';
    this.container.className = 'pantheon-selection-overlay';

    this.container.innerHTML = `
      <div class="pantheon-bg">
        ${this.createParticles()}
      </div>

      <div class="pantheon-container">
        <div class="pantheon-header">
          <h1 class="pantheon-title">Choose Your Patron</h1>
          <p class="pantheon-subtitle">
            Select a divine patron to guide and flavor your sanctuary's evolution.
            <br>Your choice will influence your AI companion's personality, preferences, and knowledge.
          </p>
        </div>

        <div class="pantheon-grid">
          ${this.patrons.map(patron => this.createPatronCard(patron)).join('')}
        </div>

        <div class="pantheon-footer">
          <p class="pantheon-hint">💡 This choice influences your starting culture, but you'll continue to evolve based on your actions</p>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.setupEventListeners();
  }

  /**
   * Create patron card HTML
   */
  createPatronCard(patron) {
    return `
      <div class="patron-card" data-patron-id="${patron.id}">
        <div class="patron-symbol">${patron.symbol}</div>
        <h2 class="patron-name">${patron.name}</h2>
        <h3 class="patron-title">${patron.title}</h3>
        <p class="patron-description">${patron.description}</p>

        <div class="patron-details">
          <div class="patron-influences">
            <strong>Influences:</strong>
            <div class="influence-bars">
              ${this.createInfluenceBars(patron.influences)}
            </div>
          </div>

          <div class="patron-traits">
            <strong>Starting Traits:</strong>
            <div class="trait-tags">
              ${patron.initialTraits.map(trait => `<span class="trait-tag">${trait}</span>`).join('')}
            </div>
          </div>

          <div class="patron-domains">
            <strong>Knowledge Focus:</strong>
            <div class="domain-tags">
              ${patron.knowledgeDomains.slice(0, 4).map(domain => `<span class="domain-tag">${domain}</span>`).join('')}
            </div>
          </div>
        </div>

        <button class="patron-select-btn" data-patron-id="${patron.id}">
          Select ${patron.name}
        </button>
      </div>
    `;
  }

  /**
   * Create influence bars
   */
  createInfluenceBars(influences) {
    const labels = {
      creativity: 'Creativity',
      exploration: 'Exploration',
      pace: 'Pace',
      technicality: 'Technical'
    };

    return Object.entries(influences)
      .filter(([key]) => ['creativity', 'exploration', 'pace', 'technicality'].includes(key))
      .map(([key, value]) => `
        <div class="influence-bar-row">
          <span class="influence-label">${labels[key]}</span>
          <div class="influence-bar">
            <div class="influence-fill" style="width: ${value * 100}%"></div>
          </div>
        </div>
      `).join('');
  }

  /**
   * Create floating particles
   */
  createParticles() {
    let particles = '';
    for (let i = 0; i < 40; i++) {
      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = Math.random() * 10 + 15;

      particles += `
        <div class="pantheon-particle" style="
          width: ${size}px;
          height: ${size}px;
          left: ${left}%;
          animation-delay: ${delay}s;
          animation-duration: ${duration}s;
        "></div>
      `;
    }
    return particles;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    const cards = this.container.querySelectorAll('.patron-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('patron-card-hover');
      });

      card.addEventListener('mouseleave', () => {
        card.classList.remove('patron-card-hover');
      });
    });

    const buttons = this.container.querySelectorAll('.patron-select-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const patronId = e.target.dataset.patronId;
        this.selectPatron(patronId);
      });
    });
  }

  /**
   * Select a patron
   */
  selectPatron(patronId) {
    const patron = this.patrons.find(p => p.id === patronId);
    if (!patron) return;

    console.log('[PantheonSelection] Patron selected:', patron.name);
    this.selectedPatron = patron;

    // Apply patron influences to cultural generator if available
    this.applyPatronInfluences(patron);

    // Save selection
    this.saveSelection(patron);

    // Emit event
    this.core.emit('patronSelected', { patron });

    // Hide with animation
    this.hide();
  }

  /**
   * Apply patron influences to cultural generator
   */
  applyPatronInfluences(patron) {
    if (window.culturalGenerator) {
      console.log('[PantheonSelection] Applying patron influences to cultural generator');

      // Set initial personality based on patron
      window.culturalGenerator.culture.personality = {
        creativity: patron.influences.creativity,
        pace: patron.influences.pace,
        exploration: patron.influences.exploration,
        formality: patron.influences.formality,
        technicality: patron.influences.technicality
      };

      // Set initial traits
      window.culturalGenerator.culture.traits = patron.initialTraits.map(name => ({
        name,
        strength: 0.8
      }));

      // Set initial values
      window.culturalGenerator.culture.values = patron.initialValues.map(name => ({
        name,
        description: `Values ${name.toLowerCase()}`,
        strength: 0.8
      }));

      // Set aesthetic preferences
      window.culturalGenerator.culture.aesthetics.preferredColors = patron.preferredColors;

      // Set knowledge domains
      for (const domain of patron.knowledgeDomains) {
        window.culturalGenerator.culture.knowledge.domains.set(domain, 0.7);
      }
      window.culturalGenerator.culture.knowledge.expertise = patron.knowledgeDomains.slice(0, 3);

      // Save the culture
      window.culturalGenerator.saveCulture();

      console.log('[PantheonSelection] Cultural generator initialized with patron:', patron.name);
    }

    // Apply to behavioral analytics if available
    if (window.behavioralAnalytics) {
      window.behavioralAnalytics.behavior.preferences.preferredTheme = patron.name.toLowerCase();
    }
  }

  /**
   * Show selection screen
   */
  show() {
    if (!this.container) {
      this.createUI();
    }
    this.container.style.display = 'flex';
    setTimeout(() => {
      this.container.classList.add('pantheon-visible');
    }, 50);
  }

  /**
   * Hide selection screen
   */
  hide() {
    this.container.classList.add('pantheon-hiding');
    setTimeout(() => {
      this.container.style.display = 'none';
      this.core.emit('pantheonComplete', { patron: this.selectedPatron });
    }, 800);
  }

  /**
   * Save selection to storage
   */
  saveSelection(patron) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        id: patron.id,
        name: patron.name,
        selectedAt: Date.now()
      }));
      console.log('[PantheonSelection] Patron selection saved');
    } catch (error) {
      console.error('[PantheonSelection] Failed to save selection:', error);
    }
  }

  /**
   * Load selection from storage
   */
  loadSelection() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return null;

      const data = JSON.parse(saved);
      const patron = this.patrons.find(p => p.id === data.id);
      return patron;
    } catch (error) {
      console.error('[PantheonSelection] Failed to load selection:', error);
      return null;
    }
  }

  /**
   * Get selected patron
   */
  getSelectedPatron() {
    return this.selectedPatron || this.loadSelection();
  }

  /**
   * Reset selection (for testing)
   */
  reset() {
    localStorage.removeItem(this.storageKey);
    this.selectedPatron = null;
    console.log('[PantheonSelection] Selection reset');
  }
}
