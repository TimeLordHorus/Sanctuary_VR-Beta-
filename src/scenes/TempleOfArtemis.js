/**
 * Temple of Artemis Scene
 * One of the Seven Wonders of the Ancient World
 * Serves as an interactive tutorial world
 */

export class TempleOfArtemis {
  constructor(core) {
    this.core = core;
    this.scene = null;
    this.camera = null;
    this.interactiveElements = [];
    this.tutorialSteps = [];
    this.currentStep = 0;
    this.completed = false;
  }

  /**
   * Initialize the Temple of Artemis scene
   */
  async init() {
    console.log('[TempleOfArtemis] Initializing Temple of Artemis...');

    this.scene = document.querySelector('a-scene');
    if (!this.scene) {
      console.error('[TempleOfArtemis] A-Frame scene not found');
      return;
    }

    // Create the temple
    this.createTemple();

    // Create interactive elements
    this.createInteractiveElements();

    // Set up tutorial steps
    this.setupTutorialSteps();

    // Set up event listeners
    this.setupEventListeners();

    console.log('[TempleOfArtemis] Temple of Artemis initialized');
    return this;
  }

  /**
   * Create the temple structure
   */
  createTemple() {
    // Create temple container
    const temple = document.createElement('a-entity');
    temple.id = 'temple-of-artemis';
    temple.setAttribute('position', '0 0 -10');

    // Platform/Base (120m x 60m in real temple)
    const platform = document.createElement('a-box');
    platform.setAttribute('position', '0 -0.5 0');
    platform.setAttribute('width', '60');
    platform.setAttribute('height', '1');
    platform.setAttribute('depth', '30');
    platform.setAttribute('color', '#d4c4a8');
    platform.setAttribute('shadow', 'receive: true');
    temple.appendChild(platform);

    // Create 127 columns (as in the original temple)
    // Front colonnade (9 columns)
    for (let i = 0; i < 9; i++) {
      const x = (i - 4) * 6;
      this.createColumn(temple, x, 0, 14, i === 4); // Center column is special
    }

    // Back colonnade (9 columns)
    for (let i = 0; i < 9; i++) {
      const x = (i - 4) * 6;
      this.createColumn(temple, x, 0, -14, false);
    }

    // Side colonnades (21 columns on each side)
    for (let i = 1; i < 20; i++) {
      const z = (i - 10) * 1.5;
      this.createColumn(temple, -24, 0, z, false);
      this.createColumn(temple, 24, 0, z, false);
    }

    // Inner sanctum columns
    for (let i = 0; i < 4; i++) {
      const x = (i - 1.5) * 4;
      this.createColumn(temple, x, 0, 0, false, 12, '#f0e6d2', true);
    }

    // Roof/Entablature
    const roof = document.createElement('a-box');
    roof.setAttribute('position', '0 13 0');
    roof.setAttribute('width', '56');
    roof.setAttribute('height', '2');
    roof.setAttribute('depth', '32');
    roof.setAttribute('color', '#e8dcc8');
    roof.setAttribute('shadow', 'cast: true');
    temple.appendChild(roof);

    // Pediment (triangular roof decoration) - Front
    const pedimentFront = document.createElement('a-triangle');
    pedimentFront.setAttribute('position', '0 15 14.5');
    pedimentFront.setAttribute('rotation', '90 0 0');
    pedimentFront.setAttribute('vertex-a', '-28 0 0');
    pedimentFront.setAttribute('vertex-b', '28 0 0');
    pedimentFront.setAttribute('vertex-c', '0 6 0');
    pedimentFront.setAttribute('color', '#f5e6c8');
    temple.appendChild(pedimentFront);

    // Central statue of Artemis
    this.createArtemisStatue(temple);

    // Altar in front
    const altar = document.createElement('a-box');
    altar.id = 'temple-altar';
    altar.className = 'interactive';
    altar.setAttribute('position', '0 0.5 18');
    altar.setAttribute('width', '3');
    altar.setAttribute('height', '1');
    altar.setAttribute('depth', '2');
    altar.setAttribute('color', '#8b7355');
    altar.setAttribute('shadow', 'cast: true; receive: true');
    temple.appendChild(altar);

    // Sacred flame on altar
    this.createSacredFlame(temple, '0 1.2 18');

    // Offering bowls
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 2;
      this.createOfferingBowl(temple, x, 1.1, 17.5);
    }

    // Garden elements around temple
    this.createGarden(temple);

    // Sky
    const sky = document.createElement('a-sky');
    sky.setAttribute('color', '#87ceeb');
    sky.setAttribute('material', 'shader: gradient; topColor: #87ceeb; bottomColor: #e0f6ff');

    // Environment lighting
    const ambientLight = document.createElement('a-entity');
    ambientLight.setAttribute('light', 'type: ambient; color: #fff; intensity: 0.7');
    temple.appendChild(ambientLight);

    const directionalLight = document.createElement('a-entity');
    directionalLight.setAttribute('light', 'type: directional; color: #ffd; intensity: 0.8; castShadow: true');
    directionalLight.setAttribute('position', '10 20 10');
    temple.appendChild(directionalLight);

    this.scene.appendChild(temple);
    this.scene.appendChild(sky);

    // Set camera position for good view
    const camera = document.querySelector('[camera]');
    if (camera) {
      camera.setAttribute('position', '0 1.6 25');
      camera.setAttribute('rotation', '0 0 0');
    }

    console.log('[TempleOfArtemis] Temple structure created');
  }

  /**
   * Create a classical column
   */
  createColumn(parent, x, y, z, isSpecial = false, height = 15, color = '#f5f5dc', isCentral = false) {
    const column = document.createElement('a-entity');
    column.className = isSpecial ? 'interactive column-special' : 'column';

    // Base
    const base = document.createElement('a-cylinder');
    base.setAttribute('position', `${x} ${y + 0.5} ${z}`);
    base.setAttribute('radius', '0.7');
    base.setAttribute('height', '1');
    base.setAttribute('color', color);
    base.setAttribute('shadow', 'cast: true');
    column.appendChild(base);

    // Shaft
    const shaft = document.createElement('a-cylinder');
    shaft.setAttribute('position', `${x} ${y + height / 2} ${z}`);
    shaft.setAttribute('radius', '0.5');
    shaft.setAttribute('height', height);
    shaft.setAttribute('color', color);
    shaft.setAttribute('shadow', 'cast: true');

    // Add fluting (vertical grooves) texture
    shaft.setAttribute('segments-radial', '20');
    column.appendChild(shaft);

    // Capital (decorative top)
    const capital = document.createElement('a-cylinder');
    capital.setAttribute('position', `${x} ${y + height + 0.5} ${z}`);
    capital.setAttribute('radius', '0.8');
    capital.setAttribute('height', '1');
    capital.setAttribute('color', color);
    capital.setAttribute('shadow', 'cast: true');
    column.appendChild(capital);

    // Decorative elements for special/central columns
    if (isCentral) {
      const decoration = document.createElement('a-ring');
      decoration.setAttribute('position', `${x} ${y + height / 2} ${z + 0.6}`);
      decoration.setAttribute('radius-inner', '0.3');
      decoration.setAttribute('radius-outer', '0.5');
      decoration.setAttribute('color', '#ffd700');
      decoration.setAttribute('rotation', '0 0 0');
      column.appendChild(decoration);
    }

    parent.appendChild(column);

    if (isSpecial) {
      this.interactiveElements.push({
        element: column,
        type: 'column',
        position: { x, y, z }
      });
    }
  }

  /**
   * Create statue of Artemis
   */
  createArtemisStatue(parent) {
    const statue = document.createElement('a-entity');
    statue.id = 'artemis-statue';
    statue.className = 'interactive';
    statue.setAttribute('position', '0 0 0');

    // Base pedestal
    const pedestal = document.createElement('a-box');
    pedestal.setAttribute('position', '0 1 0');
    pedestal.setAttribute('width', '3');
    pedestal.setAttribute('height', '2');
    pedestal.setAttribute('depth', '3');
    pedestal.setAttribute('color', '#d4c4a8');
    statue.appendChild(pedestal);

    // Statue body (simplified representation)
    const body = document.createElement('a-cylinder');
    body.setAttribute('position', '0 4 0');
    body.setAttribute('radius', '0.8');
    body.setAttribute('height', '4');
    body.setAttribute('color', '#ffffff');
    statue.appendChild(body);

    // Head
    const head = document.createElement('a-sphere');
    head.setAttribute('position', '0 6.5 0');
    head.setAttribute('radius', '0.6');
    head.setAttribute('color', '#ffffff');
    statue.appendChild(head);

    // Crown/Diadem
    const crown = document.createElement('a-ring');
    crown.setAttribute('position', '0 7 0');
    crown.setAttribute('radius-inner', '0.6');
    crown.setAttribute('radius-outer', '0.8');
    crown.setAttribute('color', '#ffd700');
    crown.setAttribute('rotation', '90 0 0');
    statue.appendChild(crown);

    // Bow (Artemis's symbol)
    const bow = document.createElement('a-torus');
    bow.setAttribute('position', '-1 4 0');
    bow.setAttribute('radius', '0.8');
    bow.setAttribute('radius-tubular', '0.05');
    bow.setAttribute('color', '#8b4513');
    bow.setAttribute('rotation', '0 0 45');
    statue.appendChild(bow);

    // Quiver
    const quiver = document.createElement('a-cylinder');
    quiver.setAttribute('position', '0.8 3.5 -0.5');
    quiver.setAttribute('radius', '0.15');
    quiver.setAttribute('height', '1.5');
    quiver.setAttribute('color', '#654321');
    quiver.setAttribute('rotation', '0 0 -30');
    statue.appendChild(quiver);

    // Glowing aura
    const aura = document.createElement('a-sphere');
    aura.setAttribute('position', '0 5 0');
    aura.setAttribute('radius', '2');
    aura.setAttribute('color', '#c0c0ff');
    aura.setAttribute('opacity', '0.1');
    aura.setAttribute('material', 'transparent: true');
    aura.setAttribute('animation', 'property: scale; to: 1.1 1.1 1.1; dur: 2000; dir: alternate; loop: true; easing: easeInOutSine');
    statue.appendChild(aura);

    parent.appendChild(statue);

    this.interactiveElements.push({
      element: statue,
      type: 'statue',
      position: { x: 0, y: 0, z: 0 }
    });
  }

  /**
   * Create sacred flame
   */
  createSacredFlame(parent, position) {
    const flame = document.createElement('a-entity');
    flame.id = 'sacred-flame';
    flame.className = 'interactive';
    flame.setAttribute('position', position);

    // Fire base
    const base = document.createElement('a-cone');
    base.setAttribute('radius-bottom', '0.3');
    base.setAttribute('radius-top', '0.1');
    base.setAttribute('height', '0.8');
    base.setAttribute('color', '#ff6600');
    base.setAttribute('opacity', '0.8');
    base.setAttribute('material', 'transparent: true');
    base.setAttribute('animation', 'property: scale; to: 1 1.2 1; dur: 1000; dir: alternate; loop: true; easing: easeInOutSine');
    flame.appendChild(base);

    // Inner flame
    const innerFlame = document.createElement('a-cone');
    innerFlame.setAttribute('radius-bottom', '0.2');
    innerFlame.setAttribute('radius-top', '0.05');
    innerFlame.setAttribute('height', '1');
    innerFlame.setAttribute('color', '#ffff00');
    innerFlame.setAttribute('opacity', '0.9');
    innerFlame.setAttribute('material', 'transparent: true');
    innerFlame.setAttribute('animation', 'property: scale; to: 1 1.3 1; dur: 800; dir: alternate; loop: true; easing: easeInOutSine');
    flame.appendChild(innerFlame);

    // Glow
    const glow = document.createElement('a-sphere');
    glow.setAttribute('radius', '0.5');
    glow.setAttribute('color', '#ff9900');
    glow.setAttribute('opacity', '0.3');
    glow.setAttribute('material', 'transparent: true');
    glow.setAttribute('animation', 'property: scale; to: 1.3 1.3 1.3; dur: 1200; dir: alternate; loop: true; easing: easeInOutSine');
    flame.appendChild(glow);

    // Light source
    const light = document.createElement('a-entity');
    light.setAttribute('light', 'type: point; color: #ff9900; intensity: 1.5; distance: 10');
    light.setAttribute('animation', 'property: light.intensity; to: 2; dur: 1000; dir: alternate; loop: true; easing: easeInOutSine');
    flame.appendChild(light);

    parent.appendChild(flame);

    this.interactiveElements.push({
      element: flame,
      type: 'flame',
      position: position
    });
  }

  /**
   * Create offering bowl
   */
  createOfferingBowl(parent, x, y, z) {
    const bowl = document.createElement('a-entity');
    bowl.className = 'interactive offering-bowl';

    const container = document.createElement('a-torus');
    container.setAttribute('position', `${x} ${y} ${z}`);
    container.setAttribute('radius', '0.3');
    container.setAttribute('radius-tubular', '0.1');
    container.setAttribute('color', '#cd7f32');
    container.setAttribute('rotation', '90 0 0');
    bowl.appendChild(container);

    // Contents (fruit/offerings)
    const offering = document.createElement('a-sphere');
    offering.setAttribute('position', `${x} ${y + 0.1} ${z}`);
    offering.setAttribute('radius', '0.15');
    offering.setAttribute('color', '#ff6b6b');
    bowl.appendChild(offering);

    parent.appendChild(bowl);

    this.interactiveElements.push({
      element: bowl,
      type: 'bowl',
      position: { x, y, z }
    });
  }

  /**
   * Create garden around temple
   */
  createGarden(parent) {
    // Trees
    const treePositions = [
      { x: -35, z: 10 }, { x: -35, z: -10 },
      { x: 35, z: 10 }, { x: 35, z: -10 },
      { x: -30, z: 20 }, { x: 30, z: 20 },
      { x: -30, z: -20 }, { x: 30, z: -20 }
    ];

    treePositions.forEach(pos => {
      this.createTree(parent, pos.x, 0, pos.z);
    });

    // Flowers
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 50;
      // Don't place flowers inside temple area
      if (Math.abs(x) > 28 || Math.abs(z) > 16) {
        this.createFlower(parent, x, 0, z);
      }
    }

    // Ground
    const ground = document.createElement('a-plane');
    ground.setAttribute('position', '0 -0.01 0');
    ground.setAttribute('rotation', '-90 0 0');
    ground.setAttribute('width', '200');
    ground.setAttribute('height', '200');
    ground.setAttribute('color', '#7cb342');
    ground.setAttribute('shadow', 'receive: true');
    parent.appendChild(ground);
  }

  /**
   * Create a tree
   */
  createTree(parent, x, y, z) {
    const tree = document.createElement('a-entity');

    // Trunk
    const trunk = document.createElement('a-cylinder');
    trunk.setAttribute('position', `${x} ${y + 2} ${z}`);
    trunk.setAttribute('radius', '0.3');
    trunk.setAttribute('height', '4');
    trunk.setAttribute('color', '#5d4037');
    tree.appendChild(trunk);

    // Foliage
    const foliage = document.createElement('a-sphere');
    foliage.setAttribute('position', `${x} ${y + 5} ${z}`);
    foliage.setAttribute('radius', '2');
    foliage.setAttribute('color', '#388e3c');
    tree.appendChild(foliage);

    parent.appendChild(tree);
  }

  /**
   * Create a flower
   */
  createFlower(parent, x, y, z) {
    const flower = document.createElement('a-entity');

    // Stem
    const stem = document.createElement('a-cylinder');
    stem.setAttribute('position', `${x} ${y + 0.2} ${z}`);
    stem.setAttribute('radius', '0.02');
    stem.setAttribute('height', '0.4');
    stem.setAttribute('color', '#4caf50');
    flower.appendChild(stem);

    // Petals
    const colors = ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#fff0f5'];
    const petalColor = colors[Math.floor(Math.random() * colors.length)];

    const bloom = document.createElement('a-sphere');
    bloom.setAttribute('position', `${x} ${y + 0.45} ${z}`);
    bloom.setAttribute('radius', '0.1');
    bloom.setAttribute('color', petalColor);
    flower.appendChild(bloom);

    parent.appendChild(flower);
  }

  /**
   * Set up tutorial steps
   */
  setupTutorialSteps() {
    this.tutorialSteps = [
      {
        id: 'welcome',
        title: 'Welcome to the Temple of Artemis',
        description: 'One of the Seven Wonders of the Ancient World. This sacred place will teach you to interact with your sanctuary.',
        target: null,
        highlightType: 'area',
        highlightPosition: '0 5 0',
        action: 'Look around using your mouse or VR headset'
      },
      {
        id: 'movement',
        title: 'Movement',
        description: 'Use WASD keys or left thumbstick to move. Walk towards the temple altar.',
        target: '#temple-altar',
        highlightType: 'element',
        action: 'Walk to the altar'
      },
      {
        id: 'interaction',
        title: 'Interaction',
        description: 'Click or trigger to interact with objects. Try lighting the sacred flame.',
        target: '#sacred-flame',
        highlightType: 'element',
        action: 'Click the sacred flame'
      },
      {
        id: 'voice',
        title: 'Voice Commands',
        description: 'Press V to activate voice commands. Try saying "Create a sphere" or "Change the lighting".',
        target: null,
        highlightType: 'none',
        action: 'Use a voice command'
      },
      {
        id: 'statue',
        title: 'Sacred Statue',
        description: 'Approach the statue of Artemis to receive her blessing and learn about your patron.',
        target: '#artemis-statue',
        highlightType: 'element',
        action: 'Approach the statue'
      },
      {
        id: 'exploration',
        title: 'Exploration',
        description: 'Explore the temple grounds. Walk around the columns, visit the garden, and discover hidden details.',
        target: null,
        highlightType: 'area',
        action: 'Explore the temple'
      },
      {
        id: 'menu',
        title: 'Sanctuary Menu',
        description: 'Press Q to open your Sanctuary Menu. Here you can access AI companion, save sanctuaries, and adjust settings.',
        target: null,
        highlightType: 'none',
        action: 'Press Q to open menu'
      },
      {
        id: 'complete',
        title: 'Tutorial Complete',
        description: 'You have learned the basics! Your sanctuary awaits. May Artemis guide your path.',
        target: null,
        highlightType: 'none',
        action: 'Begin your journey'
      }
    ];

    console.log('[TempleOfArtemis] Tutorial steps configured:', this.tutorialSteps.length);
  }

  /**
   * Set up event listeners for interactions
   */
  setupEventListeners() {
    // Listen for clicks on interactive elements
    this.interactiveElements.forEach(item => {
      item.element.addEventListener('click', () => {
        this.handleInteraction(item);
      });
    });

    // Listen for voice commands
    this.core.on('voiceCommandExecuted', (data) => {
      this.handleVoiceCommand(data);
    });

    // Listen for menu actions
    this.core.on('menuOpened', () => {
      this.handleMenuOpened();
    });
  }

  /**
   * Handle interaction with temple elements
   */
  handleInteraction(item) {
    console.log('[TempleOfArtemis] Interaction with:', item.type);

    switch (item.type) {
      case 'flame':
        this.activateFlame(item.element);
        this.advanceTutorial('interaction');
        break;
      case 'statue':
        this.receiveBlessing();
        this.advanceTutorial('statue');
        break;
      case 'bowl':
        this.makeOffering(item.element);
        break;
      case 'column':
        this.examineColumn(item.element);
        break;
    }

    // Track interaction
    this.core.emit('templeInteraction', { type: item.type, position: item.position });
  }

  /**
   * Activate the sacred flame
   */
  activateFlame(flame) {
    // Enhance flame effect
    const light = flame.querySelector('[light]');
    if (light) {
      light.setAttribute('light', 'intensity', '3');
      light.setAttribute('light', 'distance', '20');
    }

    // Show message
    this.showTempleMessage('The sacred flame burns brighter!', 'success');

    // Award XP
    if (window.progressionSystem) {
      window.progressionSystem.gainXP(50, 'temple_flame');
    }
  }

  /**
   * Receive blessing from Artemis statue
   */
  receiveBlessing() {
    const patron = window.pantheonSelection?.getSelectedPatron();
    const patronName = patron ? patron.name : 'the divine';

    this.showTempleMessage(`${patronName} blesses your sanctuary. May wisdom guide your creations.`, 'blessing');

    // Award significant XP
    if (window.progressionSystem) {
      window.progressionSystem.gainXP(200, 'artemis_blessing');
    }

    // Unlock achievement
    if (window.achievementSystem) {
      window.achievementSystem.checkAchievements();
    }
  }

  /**
   * Make offering
   */
  makeOffering(bowl) {
    // Animate bowl
    bowl.setAttribute('animation', 'property: position; to: 0 1.3 17.5; dur: 500; dir: alternate; loop: 1');

    this.showTempleMessage('Your offering is accepted', 'success');

    if (window.progressionSystem) {
      window.progressionSystem.gainXP(25, 'offering');
    }
  }

  /**
   * Examine column
   */
  examineColumn(column) {
    this.showTempleMessage('An Ionic column, one of 127 that supported this wonder of the ancient world', 'info');
  }

  /**
   * Handle voice command in temple
   */
  handleVoiceCommand(data) {
    this.advanceTutorial('voice');
    this.showTempleMessage('Voice command recognized!', 'success');
  }

  /**
   * Handle menu opened
   */
  handleMenuOpened() {
    this.advanceTutorial('menu');
  }

  /**
   * Advance tutorial to next step
   */
  advanceTutorial(triggerId) {
    const currentStep = this.tutorialSteps[this.currentStep];
    if (currentStep && currentStep.id === triggerId) {
      this.currentStep++;
      if (this.currentStep < this.tutorialSteps.length) {
        this.showTutorialStep(this.tutorialSteps[this.currentStep]);
      } else {
        this.completeTutorial();
      }
    }
  }

  /**
   * Show tutorial step
   */
  showTutorialStep(step) {
    this.core.emit('tutorialStep', step);
    console.log('[TempleOfArtemis] Tutorial step:', step.title);
  }

  /**
   * Complete tutorial
   */
  completeTutorial() {
    this.completed = true;
    this.showTempleMessage('Tutorial Complete! Your sanctuary journey begins.', 'complete');
    this.core.emit('templeTutorialComplete');

    // Award achievement
    if (window.achievementSystem) {
      window.achievementSystem.checkAchievements();
    }

    // Award completion XP
    if (window.progressionSystem) {
      window.progressionSystem.gainXP(500, 'temple_tutorial_complete');
    }
  }

  /**
   * Show temple message
   */
  showTempleMessage(message, type = 'info') {
    this.core.emit('templeMessage', { message, type });
  }

  /**
   * Start tutorial
   */
  startTutorial() {
    this.currentStep = 0;
    this.showTutorialStep(this.tutorialSteps[0]);
  }

  /**
   * Get tutorial progress
   */
  getTutorialProgress() {
    return {
      current: this.currentStep,
      total: this.tutorialSteps.length,
      completed: this.completed,
      currentStep: this.tutorialSteps[this.currentStep]
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    const temple = document.getElementById('temple-of-artemis');
    if (temple) {
      temple.remove();
    }
  }
}
