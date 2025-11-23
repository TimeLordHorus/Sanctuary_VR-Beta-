/**
 * Resource System
 * Manages interactive resources and gathering mechanics
 */

export class ResourceSystem {
  constructor(core) {
    this.core = core;

    // Player inventory
    this.inventory = {
      wood: 0,
      stone: 0,
      fruit: 0,
      flowers: 0,
      water: 0,
      herbs: 0,
      crystal: 0,
      ore: 0,
      sacred_fruit: 0,
      blessed_water: 0,
      ancient_wood: 0,
      divine_flowers: 0,
      cactus: 0,
      reeds: 0,
      lily: 0,
      honey: 0,
      ice: 0,
      fish: 0
    };

    // Resource properties
    this.resourceTypes = {
      wood: {
        name: 'Wood',
        icon: '🪵',
        gatherTime: 2000,
        xpReward: 10,
        description: 'Sturdy wood from trees. Used for building and crafting.'
      },
      stone: {
        name: 'Stone',
        icon: '🪨',
        gatherTime: 2500,
        xpReward: 15,
        description: 'Hard stone. Essential for construction.'
      },
      fruit: {
        name: 'Fruit',
        icon: '🍎',
        gatherTime: 1000,
        xpReward: 5,
        description: 'Fresh fruit. Restores energy and provides nourishment.'
      },
      flowers: {
        name: 'Flowers',
        icon: '🌸',
        gatherTime: 800,
        xpReward: 5,
        description: 'Beautiful flowers. Can be used for decoration or alchemy.'
      },
      water: {
        name: 'Water',
        icon: '💧',
        gatherTime: 1500,
        xpReward: 8,
        description: 'Pure water. Essential for life and crafting.'
      },
      herbs: {
        name: 'Herbs',
        icon: '🌿',
        gatherTime: 1200,
        xpReward: 7,
        description: 'Medicinal herbs. Used in alchemy and healing.'
      },
      crystal: {
        name: 'Crystal',
        icon: '💎',
        gatherTime: 3000,
        xpReward: 25,
        description: 'Magical crystal. Contains mystical energy.'
      },
      ore: {
        name: 'Ore',
        icon: '⛏️',
        gatherTime: 2800,
        xpReward: 20,
        description: 'Metal ore. Can be smelted and forged.'
      },
      sacred_fruit: {
        name: 'Sacred Fruit',
        icon: '✨',
        gatherTime: 1500,
        xpReward: 30,
        description: 'Divine fruit blessed by the gods. Grants special powers.'
      },
      blessed_water: {
        name: 'Blessed Water',
        icon: '🌊',
        gatherTime: 2000,
        xpReward: 35,
        description: 'Water from sacred springs. Has purifying properties.'
      },
      ancient_wood: {
        name: 'Ancient Wood',
        icon: '🌳',
        gatherTime: 3500,
        xpReward: 40,
        description: 'Wood from ancient trees. Holds magical properties.'
      },
      divine_flowers: {
        name: 'Divine Flowers',
        icon: '🌺',
        gatherTime: 1800,
        xpReward: 28,
        description: 'Flowers that bloom in sacred groves. Radiate divine energy.'
      },
      cactus: {
        name: 'Cactus',
        icon: '🌵',
        gatherTime: 2200,
        xpReward: 12,
        description: 'Desert cactus. Stores water and has sharp needles.'
      },
      reeds: {
        name: 'Reeds',
        icon: '🎋',
        gatherTime: 1000,
        xpReward: 6,
        description: 'Wetland reeds. Used for weaving and crafting.'
      },
      lily: {
        name: 'Water Lily',
        icon: '🪷',
        gatherTime: 1400,
        xpReward: 10,
        description: 'Beautiful water lily. Symbol of purity and enlightenment.'
      },
      honey: {
        name: 'Honey',
        icon: '🍯',
        gatherTime: 1600,
        xpReward: 15,
        description: 'Sweet honey from meadow bees. Highly nutritious.'
      },
      ice: {
        name: 'Ice',
        icon: '🧊',
        gatherTime: 1800,
        xpReward: 12,
        description: 'Pure mountain ice. Never melts in magical containers.'
      },
      fish: {
        name: 'Fish',
        icon: '🐟',
        gatherTime: 2500,
        xpReward: 18,
        description: 'Fresh fish from wetland waters. Good source of protein.'
      }
    };

    // Crafting recipes
    this.recipes = {
      wooden_staff: {
        name: 'Wooden Staff',
        icon: '🏑',
        ingredients: { wood: 3 },
        result: 'staff',
        xpReward: 50,
        description: 'A simple wooden staff. Channels magical energy.'
      },
      stone_altar: {
        name: 'Stone Altar',
        icon: '⛩️',
        ingredients: { stone: 5, flowers: 3 },
        result: 'altar',
        xpReward: 100,
        description: 'An altar for offerings and rituals.'
      },
      healing_potion: {
        name: 'Healing Potion',
        icon: '🧪',
        ingredients: { herbs: 2, water: 1, flowers: 1 },
        result: 'potion_healing',
        xpReward: 40,
        description: 'Restores health and vitality.'
      },
      energy_elixir: {
        name: 'Energy Elixir',
        icon: '⚗️',
        ingredients: { fruit: 3, honey: 1, blessed_water: 1 },
        result: 'elixir_energy',
        xpReward: 60,
        description: 'Boosts energy and magical power.'
      },
      crystal_wand: {
        name: 'Crystal Wand',
        icon: '🪄',
        ingredients: { crystal: 1, ancient_wood: 2, divine_flowers: 1 },
        result: 'wand',
        xpReward: 150,
        description: 'A powerful magical wand. Amplifies spells.'
      },
      garden_plot: {
        name: 'Garden Plot',
        icon: '🌱',
        ingredients: { stone: 4, wood: 2, water: 2 },
        result: 'garden',
        xpReward: 80,
        description: 'A plot for growing plants and flowers.'
      }
    };

    // Active gathering processes
    this.activeGathering = new Map();

    // Storage key
    this.storageKey = 'sanctuary-resources';
  }

  /**
   * Initialize resource system
   */
  async init() {
    console.log('[ResourceSystem] Initializing resource system...');

    // Load inventory
    this.loadInventory();

    // Set up event listeners
    this.setupEventListeners();

    // Create UI
    this.createResourceUI();

    console.log('[ResourceSystem] Resource system initialized');
    return this;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for clicks on resource elements
    this.core.on('sceneLoaded', () => {
      this.attachResourceListeners();
    });

    // Re-attach listeners when new chunks are generated
    this.core.on('chunkGenerated', () => {
      this.attachResourceListeners();
    });
  }

  /**
   * Attach click listeners to resource elements
   */
  attachResourceListeners() {
    const resources = document.querySelectorAll('.resource.interactive');

    resources.forEach(resource => {
      // Skip if already has listener
      if (resource.dataset.listenerAttached) return;

      resource.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleResourceClick(resource);
      });

      resource.dataset.listenerAttached = 'true';
    });
  }

  /**
   * Handle resource click
   */
  handleResourceClick(resource) {
    const resourceType = resource.dataset.resourceType;

    if (!resourceType || !this.resourceTypes[resourceType]) {
      console.warn('[ResourceSystem] Unknown resource type:', resourceType);
      return;
    }

    // Check if already gathering this resource
    if (this.activeGathering.has(resource)) {
      console.log('[ResourceSystem] Already gathering this resource');
      return;
    }

    // Start gathering
    this.startGathering(resource, resourceType);
  }

  /**
   * Start gathering a resource
   */
  startGathering(element, resourceType) {
    const resourceData = this.resourceTypes[resourceType];

    console.log(`[ResourceSystem] Gathering ${resourceData.name}...`);

    // Show gathering indicator
    this.showGatheringIndicator(element, resourceData);

    // Emit gathering started event
    this.core.emit('resourceGatheringStarted', { type: resourceType, element });

    // Start gathering timer
    const startTime = Date.now();
    const duration = resourceData.gatherTime;

    const gatherInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Update progress indicator
      this.updateGatheringProgress(element, progress);

      if (progress >= 1) {
        clearInterval(gatherInterval);
        this.completeGathering(element, resourceType);
      }
    }, 50);

    this.activeGathering.set(element, gatherInterval);
  }

  /**
   * Complete gathering
   */
  completeGathering(element, resourceType) {
    const resourceData = this.resourceTypes[resourceType];

    // Add to inventory
    this.inventory[resourceType] = (this.inventory[resourceType] || 0) + 1;

    // Award XP
    if (window.progressionSystem) {
      window.progressionSystem.gainXP(resourceData.xpReward, `gather_${resourceType}`);
    }

    // Remove gathering indicator
    this.removeGatheringIndicator(element);
    this.activeGathering.delete(element);

    // Show success message
    this.showResourceMessage(`Gathered ${resourceData.icon} ${resourceData.name}!`, 'success');

    // Play collection effect
    this.playCollectionEffect(element);

    // Emit gathering completed event
    this.core.emit('resourceGathered', {
      type: resourceType,
      amount: 1,
      total: this.inventory[resourceType]
    });

    // Save inventory
    this.saveInventory();

    // Update UI
    this.updateResourceUI();

    console.log(`[ResourceSystem] Gathered ${resourceData.name}. Total: ${this.inventory[resourceType]}`);
  }

  /**
   * Show gathering indicator
   */
  showGatheringIndicator(element, resourceData) {
    // Create progress ring
    const ring = document.createElement('a-ring');
    ring.className = 'gathering-indicator';
    ring.setAttribute('position', '0 2 0');
    ring.setAttribute('radius-inner', '0.8');
    ring.setAttribute('radius-outer', '1');
    ring.setAttribute('color', '#4caf50');
    ring.setAttribute('rotation', '-90 0 0');
    ring.setAttribute('material', 'side: double');

    element.appendChild(ring);

    // Create text label
    const text = document.createElement('a-text');
    text.className = 'gathering-text';
    text.setAttribute('value', `Gathering ${resourceData.icon}`);
    text.setAttribute('position', '0 2.5 0');
    text.setAttribute('align', 'center');
    text.setAttribute('color', '#fff');
    text.setAttribute('width', '2');

    element.appendChild(text);
  }

  /**
   * Update gathering progress
   */
  updateGatheringProgress(element, progress) {
    const ring = element.querySelector('.gathering-indicator');
    if (ring) {
      const scale = progress;
      ring.setAttribute('scale', `${scale} ${scale} 1`);
    }
  }

  /**
   * Remove gathering indicator
   */
  removeGatheringIndicator(element) {
    const indicator = element.querySelector('.gathering-indicator');
    const text = element.querySelector('.gathering-text');

    if (indicator) indicator.remove();
    if (text) text.remove();
  }

  /**
   * Play collection effect
   */
  playCollectionEffect(element) {
    const pos = element.getAttribute('position');
    if (!pos) return;

    // Create sparkle effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 1;

      const sparkle = document.createElement('a-sphere');
      sparkle.setAttribute('position', `${pos.x} ${pos.y + 1} ${pos.z}`);
      sparkle.setAttribute('radius', '0.1');
      sparkle.setAttribute('color', '#ffd700');
      sparkle.setAttribute('material', 'emissive: #ffd700; emissiveIntensity: 1');

      sparkle.setAttribute('animation', `property: position; to: ${pos.x + Math.cos(angle) * distance} ${pos.y + 2} ${pos.z + Math.sin(angle) * distance}; dur: 1000; easing: easeOutQuad`);
      sparkle.setAttribute('animation__2', 'property: opacity; to: 0; dur: 1000; easing: easeOutQuad');

      element.parentElement.appendChild(sparkle);

      setTimeout(() => sparkle.remove(), 1000);
    }
  }

  /**
   * Create resource UI
   */
  createResourceUI() {
    const ui = document.createElement('div');
    ui.id = 'resource-ui';
    ui.className = 'resource-ui';

    ui.innerHTML = `
      <div class="resource-panel">
        <div class="resource-header">
          <h3>💼 Inventory</h3>
          <button id="toggle-resources" class="resource-toggle">▼</button>
        </div>
        <div id="resource-list" class="resource-list">
          <!-- Resources will be added dynamically -->
        </div>
      </div>

      <div class="crafting-panel" style="display: none;">
        <div class="crafting-header">
          <h3>🔨 Crafting</h3>
          <button id="toggle-crafting" class="resource-toggle">▼</button>
        </div>
        <div id="crafting-list" class="crafting-list">
          <!-- Recipes will be added dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(ui);

    // Set up toggle buttons
    document.getElementById('toggle-resources')?.addEventListener('click', () => {
      const list = document.getElementById('resource-list');
      list.style.display = list.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('toggle-crafting')?.addEventListener('click', () => {
      const list = document.getElementById('crafting-list');
      list.style.display = list.style.display === 'none' ? 'block' : 'none';
    });

    // Initial update
    this.updateResourceUI();

    // Show crafting panel after gathering first resource
    this.core.on('resourceGathered', () => {
      document.querySelector('.crafting-panel').style.display = 'block';
      this.updateCraftingUI();
    });
  }

  /**
   * Update resource UI
   */
  updateResourceUI() {
    const list = document.getElementById('resource-list');
    if (!list) return;

    const resourcesWithItems = Object.entries(this.inventory)
      .filter(([type, amount]) => amount > 0)
      .map(([type, amount]) => {
        const data = this.resourceTypes[type];
        return { type, amount, ...data };
      });

    if (resourcesWithItems.length === 0) {
      list.innerHTML = '<div class="resource-empty">No resources yet. Explore and gather!</div>';
      return;
    }

    list.innerHTML = resourcesWithItems
      .map(r => `
        <div class="resource-item">
          <span class="resource-icon">${r.icon}</span>
          <span class="resource-name">${r.name}</span>
          <span class="resource-amount">×${r.amount}</span>
        </div>
      `)
      .join('');
  }

  /**
   * Update crafting UI
   */
  updateCraftingUI() {
    const list = document.getElementById('crafting-list');
    if (!list) return;

    const recipes = Object.entries(this.recipes).map(([id, recipe]) => {
      const canCraft = this.canCraft(id);
      return { id, ...recipe, canCraft };
    });

    list.innerHTML = recipes
      .map(r => `
        <div class="recipe-item ${r.canCraft ? 'craftable' : 'locked'}">
          <div class="recipe-icon">${r.icon}</div>
          <div class="recipe-info">
            <div class="recipe-name">${r.name}</div>
            <div class="recipe-ingredients">
              ${Object.entries(r.ingredients)
                .map(([type, amount]) => {
                  const have = this.inventory[type] || 0;
                  const data = this.resourceTypes[type];
                  return `<span class="${have >= amount ? 'have' : 'need'}">${data.icon}×${amount}</span>`;
                })
                .join(' ')}
            </div>
          </div>
          <button class="craft-button" data-recipe="${r.id}" ${!r.canCraft ? 'disabled' : ''}>
            ${r.canCraft ? 'Craft' : 'Need More'}
          </button>
        </div>
      `)
      .join('');

    // Attach craft button listeners
    list.querySelectorAll('.craft-button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.craft(btn.dataset.recipe);
      });
    });
  }

  /**
   * Check if recipe can be crafted
   */
  canCraft(recipeId) {
    const recipe = this.recipes[recipeId];
    if (!recipe) return false;

    return Object.entries(recipe.ingredients).every(([type, amount]) => {
      return (this.inventory[type] || 0) >= amount;
    });
  }

  /**
   * Craft an item
   */
  craft(recipeId) {
    const recipe = this.recipes[recipeId];
    if (!recipe || !this.canCraft(recipeId)) {
      console.warn('[ResourceSystem] Cannot craft:', recipeId);
      return;
    }

    // Deduct ingredients
    Object.entries(recipe.ingredients).forEach(([type, amount]) => {
      this.inventory[type] -= amount;
    });

    // Award XP
    if (window.progressionSystem) {
      window.progressionSystem.gainXP(recipe.xpReward, `craft_${recipeId}`);
    }

    // Show success
    this.showResourceMessage(`Crafted ${recipe.icon} ${recipe.name}!`, 'success');

    // Emit crafting event
    this.core.emit('itemCrafted', { recipe: recipeId, item: recipe.result });

    // Save and update
    this.saveInventory();
    this.updateResourceUI();
    this.updateCraftingUI();

    console.log(`[ResourceSystem] Crafted ${recipe.name}`);
  }

  /**
   * Show resource message
   */
  showResourceMessage(message, type = 'info') {
    this.core.emit('resourceMessage', { message, type });

    // Also show as toast notification
    const toast = document.createElement('div');
    toast.className = `resource-toast resource-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Get inventory
   */
  getInventory() {
    return { ...this.inventory };
  }

  /**
   * Add resource to inventory
   */
  addResource(type, amount = 1) {
    if (!this.resourceTypes[type]) {
      console.warn('[ResourceSystem] Unknown resource type:', type);
      return;
    }

    this.inventory[type] = (this.inventory[type] || 0) + amount;
    this.saveInventory();
    this.updateResourceUI();
    this.updateCraftingUI();
  }

  /**
   * Remove resource from inventory
   */
  removeResource(type, amount = 1) {
    if (!this.inventory[type]) return;

    this.inventory[type] = Math.max(0, this.inventory[type] - amount);
    this.saveInventory();
    this.updateResourceUI();
    this.updateCraftingUI();
  }

  /**
   * Save inventory
   */
  saveInventory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.inventory));
    } catch (error) {
      console.error('[ResourceSystem] Failed to save inventory:', error);
    }
  }

  /**
   * Load inventory
   */
  loadInventory() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.inventory = { ...this.inventory, ...JSON.parse(saved) };
        console.log('[ResourceSystem] Loaded inventory:', this.inventory);
      }
    } catch (error) {
      console.error('[ResourceSystem] Failed to load inventory:', error);
    }
  }

  /**
   * Clear inventory
   */
  clearInventory() {
    this.inventory = Object.keys(this.inventory).reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});

    this.saveInventory();
    this.updateResourceUI();
    this.updateCraftingUI();
  }

  /**
   * Destroy resource system
   */
  destroy() {
    // Clean up active gathering
    for (const interval of this.activeGathering.values()) {
      clearInterval(interval);
    }
    this.activeGathering.clear();

    // Remove UI
    document.getElementById('resource-ui')?.remove();
  }
}
