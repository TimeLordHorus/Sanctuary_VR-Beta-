/**
 * Puzzle System
 * Creates and manages environmental puzzles integrated into the landscape
 */

export class PuzzleSystem {
  constructor(core, resourceSystem) {
    this.core = core;
    this.resourceSystem = resourceSystem;

    // Puzzle definitions
    this.puzzleTypes = {
      shrine_offering: {
        name: 'Shrine Offering',
        description: 'Offer the correct resources to activate the ancient shrine',
        difficulty: 'medium',
        requiredResources: ['flowers', 'water', 'fruit'],
        reward: {
          xp: 200,
          items: ['sacred_fruit', 'blessed_water']
        }
      },
      elemental_pillars: {
        name: 'Elemental Pillars',
        description: 'Activate the four elemental pillars in the correct order',
        difficulty: 'hard',
        elements: ['fire', 'water', 'earth', 'air'],
        correctOrder: [2, 0, 3, 1], // water, fire, air, earth
        reward: {
          xp: 300,
          items: ['crystal']
        }
      },
      rune_alignment: {
        name: 'Rune Alignment',
        description: 'Align the floating runes to form the sacred pattern',
        difficulty: 'hard',
        runeCount: 5,
        reward: {
          xp: 350,
          items: ['ancient_wood']
        }
      },
      water_flow: {
        name: 'Water Flow Puzzle',
        description: 'Redirect the water flow to reach all the sacred pools',
        difficulty: 'medium',
        poolCount: 4,
        reward: {
          xp: 250,
          items: ['blessed_water', 'lily']
        }
      },
      crystal_resonance: {
        name: 'Crystal Resonance',
        description: 'Tune the crystals to resonate at the same frequency',
        difficulty: 'medium',
        crystalCount: 3,
        reward: {
          xp: 275,
          items: ['crystal', 'divine_flowers']
        }
      },
      stone_path: {
        name: 'Hidden Stone Path',
        description: 'Find and activate the hidden stepping stones in the correct sequence',
        difficulty: 'easy',
        stoneCount: 6,
        reward: {
          xp: 150,
          items: ['stone', 'herbs']
        }
      }
    };

    // Active puzzles
    this.activePuzzles = new Map();
    this.completedPuzzles = new Set();

    // Storage key
    this.storageKey = 'sanctuary-puzzles';
  }

  /**
   * Initialize puzzle system
   */
  async init() {
    console.log('[PuzzleSystem] Initializing puzzle system...');

    // Load completed puzzles
    this.loadProgress();

    // Set up event listeners
    this.setupEventListeners();

    console.log('[PuzzleSystem] Puzzle system initialized');
    return this;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for puzzle generation requests
    this.core.on('generatePuzzle', (data) => {
      this.generatePuzzle(data.type, data.position);
    });

    // Listen for resource gathering (some puzzles unlock with resources)
    this.core.on('resourceGathered', (data) => {
      this.checkPuzzleUnlocks(data);
    });
  }

  /**
   * Generate a puzzle at a position
   */
  generatePuzzle(type, position) {
    if (!this.puzzleTypes[type]) {
      console.warn('[PuzzleSystem] Unknown puzzle type:', type);
      return null;
    }

    const puzzleId = `${type}_${position.x}_${position.z}`;

    // Don't regenerate completed puzzles
    if (this.completedPuzzles.has(puzzleId)) {
      console.log('[PuzzleSystem] Puzzle already completed:', puzzleId);
      return null;
    }

    // Don't regenerate active puzzles
    if (this.activePuzzles.has(puzzleId)) {
      console.log('[PuzzleSystem] Puzzle already active:', puzzleId);
      return this.activePuzzles.get(puzzleId);
    }

    console.log(`[PuzzleSystem] Generating ${type} puzzle at`, position);

    let puzzle;
    switch (type) {
      case 'shrine_offering':
        puzzle = this.createShrineOfferingPuzzle(puzzleId, position);
        break;
      case 'elemental_pillars':
        puzzle = this.createElementalPillarsPuzzle(puzzleId, position);
        break;
      case 'rune_alignment':
        puzzle = this.createRuneAlignmentPuzzle(puzzleId, position);
        break;
      case 'water_flow':
        puzzle = this.createWaterFlowPuzzle(puzzleId, position);
        break;
      case 'crystal_resonance':
        puzzle = this.createCrystalResonancePuzzle(puzzleId, position);
        break;
      case 'stone_path':
        puzzle = this.createStonePathPuzzle(puzzleId, position);
        break;
      default:
        console.warn('[PuzzleSystem] Unimplemented puzzle type:', type);
        return null;
    }

    this.activePuzzles.set(puzzleId, puzzle);
    return puzzle;
  }

  /**
   * Create Shrine Offering Puzzle
   */
  createShrineOfferingPuzzle(id, position) {
    const config = this.puzzleTypes.shrine_offering;
    const container = document.createElement('a-entity');
    container.id = id;
    container.className = 'puzzle shrine-offering';
    container.setAttribute('position', `${position.x} 0 ${position.z}`);

    // Shrine structure
    const base = document.createElement('a-cylinder');
    base.setAttribute('position', '0 0.3 0');
    base.setAttribute('radius', '2');
    base.setAttribute('height', '0.6');
    base.setAttribute('color', '#d4c4a8');
    container.appendChild(base);

    const pillar = document.createElement('a-cylinder');
    pillar.setAttribute('position', '0 2 0');
    pillar.setAttribute('radius', '0.4');
    pillar.setAttribute('height', '4');
    pillar.setAttribute('color', '#e8dcc8');
    container.appendChild(pillar);

    // Offering bowls
    const bowlPositions = [
      { x: -1, z: 1, type: 'flowers' },
      { x: 1, z: 1, type: 'water' },
      { x: 0, z: -1.5, type: 'fruit' }
    ];

    const offeredItems = new Set();

    bowlPositions.forEach(bowlPos => {
      const bowl = document.createElement('a-torus');
      bowl.className = 'interactive offering-bowl';
      bowl.setAttribute('position', `${bowlPos.x} 0.8 ${bowlPos.z}`);
      bowl.setAttribute('radius', '0.3');
      bowl.setAttribute('radius-tubular', '0.1');
      bowl.setAttribute('color', '#8b7355');
      bowl.setAttribute('rotation', '90 0 0');
      bowl.dataset.requiredResource = bowlPos.type;

      // Label
      const label = document.createElement('a-text');
      label.setAttribute('value', this.resourceSystem.resourceTypes[bowlPos.type].icon);
      label.setAttribute('position', `${bowlPos.x} 1.5 ${bowlPos.z}`);
      label.setAttribute('align', 'center');
      label.setAttribute('width', '2');
      container.appendChild(label);

      bowl.addEventListener('click', () => {
        const requiredType = bowl.dataset.requiredResource;
        const inventory = this.resourceSystem.getInventory();

        if (inventory[requiredType] > 0) {
          this.resourceSystem.removeResource(requiredType, 1);
          offeredItems.add(requiredType);

          // Visual feedback
          bowl.setAttribute('color', '#ffd700');

          // Add offering visual
          const offering = document.createElement('a-sphere');
          offering.setAttribute('position', `${bowlPos.x} 1 ${bowlPos.z}`);
          offering.setAttribute('radius', '0.15');
          offering.setAttribute('color', '#ff6b6b');
          container.appendChild(offering);

          // Check if puzzle is complete
          if (offeredItems.size === config.requiredResources.length) {
            this.completePuzzle(id, container, config);
          }
        } else {
          this.showPuzzleMessage(`Need ${this.resourceSystem.resourceTypes[requiredType].name}`, 'warning');
        }
      });

      container.appendChild(bowl);
    });

    // Instructions
    const instructions = document.createElement('a-text');
    instructions.setAttribute('value', 'Make offerings to the shrine');
    instructions.setAttribute('position', '0 4.5 0');
    instructions.setAttribute('align', 'center');
    instructions.setAttribute('color', '#fff');
    instructions.setAttribute('width', '4');
    container.appendChild(instructions);

    document.querySelector('a-scene').appendChild(container);

    return {
      id,
      type: 'shrine_offering',
      element: container,
      config,
      state: { offeredItems }
    };
  }

  /**
   * Create Elemental Pillars Puzzle
   */
  createElementalPillarsPuzzle(id, position) {
    const config = this.puzzleTypes.elemental_pillars;
    const container = document.createElement('a-entity');
    container.id = id;
    container.className = 'puzzle elemental-pillars';
    container.setAttribute('position', `${position.x} 0 ${position.z}`);

    const elements = [
      { name: 'fire', color: '#ff4500', icon: '🔥', pos: { x: 3, z: 0 } },
      { name: 'water', color: '#4fc3f7', icon: '💧', pos: { x: 0, z: 3 } },
      { name: 'earth', color: '#8b7355', icon: '🌍', pos: { x: -3, z: 0 } },
      { name: 'air', color: '#b0e0e6', icon: '💨', pos: { x: 0, z: -3 } }
    ];

    const activationOrder = [];

    elements.forEach((elem, index) => {
      const pillar = document.createElement('a-cylinder');
      pillar.className = 'interactive elemental-pillar';
      pillar.setAttribute('position', `${elem.pos.x} 1.5 ${elem.pos.z}`);
      pillar.setAttribute('radius', '0.5');
      pillar.setAttribute('height', '3');
      pillar.setAttribute('color', '#555');
      pillar.dataset.elementIndex = index;
      pillar.dataset.elementName = elem.name;

      // Element symbol on top
      const symbol = document.createElement('a-text');
      symbol.setAttribute('value', elem.icon);
      symbol.setAttribute('position', `${elem.pos.x} 3.2 ${elem.pos.z}`);
      symbol.setAttribute('align', 'center');
      symbol.setAttribute('width', '2');
      container.appendChild(symbol);

      pillar.addEventListener('click', () => {
        const elementIndex = parseInt(pillar.dataset.elementIndex);

        // Check if already activated
        if (activationOrder.includes(elementIndex)) return;

        // Activate pillar
        pillar.setAttribute('color', elem.color);
        pillar.setAttribute('material', 'emissive: ' + elem.color + '; emissiveIntensity: 0.5');
        activationOrder.push(elementIndex);

        // Check if order is correct so far
        const correctSoFar = activationOrder.every((val, idx) => val === config.correctOrder[idx]);

        if (!correctSoFar) {
          // Wrong order - reset
          this.showPuzzleMessage('Incorrect order! Resetting...', 'error');
          setTimeout(() => {
            elements.forEach((_, i) => {
              const p = container.querySelector(`[data-element-index="${i}"]`);
              if (p) {
                p.setAttribute('color', '#555');
                p.removeAttribute('material');
              }
            });
            activationOrder.length = 0;
          }, 1500);
        } else if (activationOrder.length === config.correctOrder.length) {
          // Completed!
          this.completePuzzle(id, container, config);
        }
      });

      container.appendChild(pillar);
    });

    // Instructions
    const instructions = document.createElement('a-text');
    instructions.setAttribute('value', 'Activate pillars in the correct elemental order');
    instructions.setAttribute('position', '0 5 0');
    instructions.setAttribute('align', 'center');
    instructions.setAttribute('color', '#fff');
    instructions.setAttribute('width', '6');
    container.appendChild(instructions);

    document.querySelector('a-scene').appendChild(container);

    return {
      id,
      type: 'elemental_pillars',
      element: container,
      config,
      state: { activationOrder }
    };
  }

  /**
   * Create Crystal Resonance Puzzle
   */
  createCrystalResonancePuzzle(id, position) {
    const config = this.puzzleTypes.crystal_resonance;
    const container = document.createElement('a-entity');
    container.id = id;
    container.className = 'puzzle crystal-resonance';
    container.setAttribute('position', `${position.x} 0 ${position.z}`);

    const targetFrequency = Math.random();
    const crystalFrequencies = [];

    for (let i = 0; i < config.crystalCount; i++) {
      const angle = (i / config.crystalCount) * Math.PI * 2;
      const radius = 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const crystal = document.createElement('a-cone');
      crystal.className = 'interactive crystal';
      crystal.setAttribute('position', `${x} 1.5 ${z}`);
      crystal.setAttribute('radius-bottom', '0.3');
      crystal.setAttribute('radius-top', '0.1');
      crystal.setAttribute('height', '1');
      crystal.setAttribute('color', '#b19cd9');
      crystal.setAttribute('material', 'transparent: true; opacity: 0.8');
      crystal.dataset.crystalIndex = i;

      const frequency = Math.random();
      crystalFrequencies.push(frequency);

      crystal.addEventListener('click', () => {
        // Adjust frequency
        crystalFrequencies[i] = (crystalFrequencies[i] + 0.2) % 1;

        // Visual feedback based on proximity to target
        const diff = Math.abs(crystalFrequencies[i] - targetFrequency);
        const hue = (1 - diff) * 280; // Purple to blue
        crystal.setAttribute('animation', `property: rotation; to: 0 360 0; dur: ${500 + diff * 1500}; loop: true`);

        // Check if all crystals are in resonance
        const allInResonance = crystalFrequencies.every(f => Math.abs(f - targetFrequency) < 0.1);

        if (allInResonance) {
          this.completePuzzle(id, container, config);
        }
      });

      container.appendChild(crystal);
    }

    // Instructions
    const instructions = document.createElement('a-text');
    instructions.setAttribute('value', 'Tune all crystals to resonate together');
    instructions.setAttribute('position', '0 3.5 0');
    instructions.setAttribute('align', 'center');
    instructions.setAttribute('color', '#fff');
    instructions.setAttribute('width', '4');
    container.appendChild(instructions);

    document.querySelector('a-scene').appendChild(container);

    return {
      id,
      type: 'crystal_resonance',
      element: container,
      config,
      state: { targetFrequency, crystalFrequencies }
    };
  }

  /**
   * Create Stone Path Puzzle
   */
  createStonePathPuzzle(id, position) {
    const config = this.puzzleTypes.stone_path;
    const container = document.createElement('a-entity');
    container.id = id;
    container.className = 'puzzle stone-path';
    container.setAttribute('position', `${position.x} 0 ${position.z}`);

    const correctPath = [];
    const activatedStones = [];

    // Generate random path
    let currentPos = { x: 0, z: 0 };
    for (let i = 0; i < config.stoneCount; i++) {
      correctPath.push({ ...currentPos });

      // Move to next position
      const directions = [
        { x: 2, z: 0 },
        { x: -2, z: 0 },
        { x: 0, z: 2 },
        { x: 0, z: -2 }
      ];
      const dir = directions[Math.floor(Math.random() * directions.length)];
      currentPos.x += dir.x;
      currentPos.z += dir.z;
    }

    correctPath.forEach((pos, index) => {
      const stone = document.createElement('a-cylinder');
      stone.className = 'interactive stepping-stone';
      stone.setAttribute('position', `${pos.x} 0.1 ${pos.z}`);
      stone.setAttribute('radius', '0.6');
      stone.setAttribute('height', '0.2');
      stone.setAttribute('color', '#7a6f5d');
      stone.dataset.stoneIndex = index;

      stone.addEventListener('click', () => {
        const stoneIndex = parseInt(stone.dataset.stoneIndex);

        // Check if this is the next stone in the sequence
        if (stoneIndex === activatedStones.length) {
          activatedStones.push(stoneIndex);
          stone.setAttribute('color', '#4caf50');
          stone.setAttribute('animation', 'property: position; to: ${pos.x} 0.3 ${pos.z}; dur: 300');

          if (activatedStones.length === config.stoneCount) {
            this.completePuzzle(id, container, config);
          }
        } else if (!activatedStones.includes(stoneIndex)) {
          // Wrong stone - reset
          this.showPuzzleMessage('Wrong stone! Try again.', 'error');
          activatedStones.length = 0;
          correctPath.forEach((_, i) => {
            const s = container.querySelector(`[data-stone-index="${i}"]`);
            if (s) {
              s.setAttribute('color', '#7a6f5d');
              s.setAttribute('position', `${correctPath[i].x} 0.1 ${correctPath[i].z}`);
            }
          });
        }
      });

      container.appendChild(stone);
    });

    // Instructions
    const instructions = document.createElement('a-text');
    instructions.setAttribute('value', 'Step on the stones in the correct order');
    instructions.setAttribute('position', '0 2 0');
    instructions.setAttribute('align', 'center');
    instructions.setAttribute('color', '#fff');
    instructions.setAttribute('width', '4');
    container.appendChild(instructions);

    document.querySelector('a-scene').appendChild(container);

    return {
      id,
      type: 'stone_path',
      element: container,
      config,
      state: { correctPath, activatedStones }
    };
  }

  /**
   * Complete a puzzle
   */
  completePuzzle(id, container, config) {
    console.log('[PuzzleSystem] Puzzle completed:', id);

    // Mark as completed
    this.completedPuzzles.add(id);
    this.activePuzzles.delete(id);

    // Award XP
    if (window.progressionSystem) {
      window.progressionSystem.gainXP(config.reward.xp, `puzzle_${id}`);
    }

    // Award items
    if (config.reward.items) {
      config.reward.items.forEach(item => {
        this.resourceSystem.addResource(item, 1);
      });
    }

    // Visual completion effect
    this.playCompletionEffect(container);

    // Show success message
    this.showPuzzleMessage(`Puzzle Solved! +${config.reward.xp} XP`, 'success');

    // Emit event
    this.core.emit('puzzleCompleted', { id, config });

    // Save progress
    this.saveProgress();

    // Remove puzzle after delay
    setTimeout(() => {
      container.remove();
    }, 5000);
  }

  /**
   * Play completion effect
   */
  playCompletionEffect(container) {
    const pos = container.getAttribute('position');

    // Create burst of light
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const distance = 3;

      const particle = document.createElement('a-sphere');
      particle.setAttribute('position', `${pos.x} 2 ${pos.z}`);
      particle.setAttribute('radius', '0.2');
      particle.setAttribute('color', '#ffd700');
      particle.setAttribute('material', 'emissive: #ffd700; emissiveIntensity: 1');

      particle.setAttribute('animation', `property: position; to: ${pos.x + Math.cos(angle) * distance} ${3 + Math.random() * 2} ${pos.z + Math.sin(angle) * distance}; dur: 1500; easing: easeOutQuad`);
      particle.setAttribute('animation__2', 'property: opacity; to: 0; dur: 1500; easing: easeOutQuad');

      container.appendChild(particle);

      setTimeout(() => particle.remove(), 1500);
    }

    // Play sound effect (if available)
    this.core.emit('playSound', { type: 'puzzle_complete' });
  }

  /**
   * Show puzzle message
   */
  showPuzzleMessage(message, type = 'info') {
    this.core.emit('puzzleMessage', { message, type });

    const toast = document.createElement('div');
    toast.className = `puzzle-toast puzzle-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Check if resources unlock new puzzles
   */
  checkPuzzleUnlocks(data) {
    // Example: Unlock shrine puzzle when player has gathered enough resources
    const inventory = this.resourceSystem.getInventory();
    const totalResources = Object.values(inventory).reduce((sum, val) => sum + val, 0);

    if (totalResources >= 10 && !this.hasGeneratedPuzzle('shrine_offering')) {
      console.log('[PuzzleSystem] Unlocking shrine offering puzzle!');
      // Could trigger puzzle generation here
    }
  }

  /**
   * Check if puzzle type has been generated
   */
  hasGeneratedPuzzle(type) {
    for (const [id, puzzle] of this.activePuzzles.entries()) {
      if (puzzle.type === type) return true;
    }
    for (const id of this.completedPuzzles) {
      if (id.startsWith(type)) return true;
    }
    return false;
  }

  /**
   * Save progress
   */
  saveProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.completedPuzzles)));
    } catch (error) {
      console.error('[PuzzleSystem] Failed to save progress:', error);
    }
  }

  /**
   * Load progress
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.completedPuzzles = new Set(JSON.parse(saved));
        console.log('[PuzzleSystem] Loaded completed puzzles:', this.completedPuzzles.size);
      }
    } catch (error) {
      console.error('[PuzzleSystem] Failed to load progress:', error);
    }
  }

  /**
   * Reset all puzzles
   */
  resetProgress() {
    this.completedPuzzles.clear();
    this.saveProgress();
  }

  /**
   * Destroy puzzle system
   */
  destroy() {
    for (const [id, puzzle] of this.activePuzzles.entries()) {
      puzzle.element.remove();
    }
    this.activePuzzles.clear();
  }
}
