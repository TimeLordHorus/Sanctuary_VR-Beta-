/**
 * HUD Manager
 * Manages the heads-up display and app launcher interface
 */

import { Logger } from '../utils/Logger.js';

export class HUDManager {
  constructor(core) {
    this.core = core;
    this.isVisible = true;
    this.currentMenu = 'main';
    this.menuStack = [];
    this.selectedMode = null;

    this.menus = {
      main: {
        title: 'Sanctuary VR',
        subtitle: 'Choose Your Experience',
        options: [
          {
            id: 'local',
            label: 'Local Play',
            subtitle: 'Solo sanctuary exploration',
            icon: '🏛️',
            color: '#4CAF50'
          },
          {
            id: 'lan',
            label: 'LAN Party',
            subtitle: 'Connect with friends locally',
            icon: '🌐',
            color: '#2196F3'
          },
          {
            id: 'online',
            label: 'Multiplayer Online',
            subtitle: 'Join the global sanctuary',
            icon: '🌍',
            color: '#9C27B0'
          },
          {
            id: 'settings',
            label: 'Settings',
            subtitle: 'Configure your experience',
            icon: '⚙️',
            color: '#FF9800'
          }
        ]
      },
      lan: {
        title: 'LAN Party',
        subtitle: 'Local Network Play',
        options: [
          {
            id: 'host',
            label: 'Host Session',
            subtitle: 'Create a new LAN game',
            icon: '🎮',
            color: '#4CAF50'
          },
          {
            id: 'join',
            label: 'Join Session',
            subtitle: 'Connect to existing game',
            icon: '🔌',
            color: '#2196F3'
          },
          {
            id: 'back',
            label: 'Back',
            subtitle: 'Return to main menu',
            icon: '⬅️',
            color: '#757575'
          }
        ]
      },
      online: {
        title: 'Multiplayer Online',
        subtitle: 'Connect to the Global Sanctuary',
        options: [
          {
            id: 'quick-match',
            label: 'Quick Match',
            subtitle: 'Join random sanctuary',
            icon: '⚡',
            color: '#4CAF50'
          },
          {
            id: 'browse',
            label: 'Browse Servers',
            subtitle: 'Choose your sanctuary',
            icon: '📋',
            color: '#2196F3'
          },
          {
            id: 'create',
            label: 'Create Room',
            subtitle: 'Start your own sanctuary',
            icon: '➕',
            color: '#9C27B0'
          },
          {
            id: 'back',
            label: 'Back',
            subtitle: 'Return to main menu',
            icon: '⬅️',
            color: '#757575'
          }
        ]
      }
    };
  }

  init() {
    Logger.info('Initializing HUD Manager');
    this.createHUDElements();
    this.attachEventListeners();
    this.startAnimations();
  }

  createHUDElements() {
    // HUD container
    const hudContainer = document.getElementById('hud-container');
    if (!hudContainer) {
      Logger.error('HUD container not found');
      return;
    }

    // Render initial menu
    this.renderMenu('main');
  }

  renderMenu(menuId) {
    const menu = this.menus[menuId];
    if (!menu) {
      Logger.error(`Menu not found: ${menuId}`);
      return;
    }

    this.currentMenu = menuId;
    const container = document.getElementById('hud-menu-content');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Create menu title
    const titleSection = document.createElement('div');
    titleSection.className = 'hud-menu-header';
    titleSection.innerHTML = `
      <h1 class="hud-title">${menu.title}</h1>
      <p class="hud-subtitle">${menu.subtitle}</p>
    `;
    container.appendChild(titleSection);

    // Create options grid
    const optionsGrid = document.createElement('div');
    optionsGrid.className = 'hud-options-grid';

    menu.options.forEach((option, index) => {
      const optionCard = this.createOptionCard(option, index);
      optionsGrid.appendChild(optionCard);
    });

    container.appendChild(optionsGrid);

    // Trigger enter animation
    setTimeout(() => {
      const cards = container.querySelectorAll('.hud-option-card');
      cards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add('visible');
        }, i * 100);
      });
    }, 50);
  }

  createOptionCard(option, index) {
    const card = document.createElement('div');
    card.className = 'hud-option-card';
    card.setAttribute('data-option-id', option.id);
    card.style.setProperty('--option-color', option.color);

    card.innerHTML = `
      <div class="option-icon">${option.icon}</div>
      <div class="option-content">
        <h3 class="option-label">${option.label}</h3>
        <p class="option-subtitle">${option.subtitle}</p>
      </div>
      <div class="option-hover-effect"></div>
      <div class="option-particles"></div>
    `;

    // Add click handler
    card.addEventListener('click', () => this.handleOptionClick(option));

    // Add hover effects
    card.addEventListener('mouseenter', () => this.onCardHover(card));
    card.addEventListener('mouseleave', () => this.onCardLeave(card));

    return card;
  }

  handleOptionClick(option) {
    Logger.info(`Option selected: ${option.id}`);

    // Play click sound
    this.playSound('click');

    // Handle option action
    switch (option.id) {
      case 'local':
        this.startLocalPlay();
        break;
      case 'lan':
        this.renderMenu('lan');
        break;
      case 'online':
        this.renderMenu('online');
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'host':
        this.hostLANSession();
        break;
      case 'join':
        this.joinLANSession();
        break;
      case 'quick-match':
        this.quickMatch();
        break;
      case 'browse':
        this.browseServers();
        break;
      case 'create':
        this.createOnlineRoom();
        break;
      case 'back':
        this.renderMenu('main');
        break;
    }
  }

  onCardHover(card) {
    card.classList.add('hovered');
    this.createParticles(card);
  }

  onCardLeave(card) {
    card.classList.remove('hovered');
  }

  createParticles(card) {
    const particlesContainer = card.querySelector('.option-particles');
    if (!particlesContainer) return;

    // Clear existing particles
    particlesContainer.innerHTML = '';

    // Create floating particles
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 2}s`;
      particlesContainer.appendChild(particle);
    }
  }

  startLocalPlay() {
    Logger.info('Starting local play');
    this.hideHUD();
    this.core.emit('startGame', { mode: 'local' });
  }

  hostLANSession() {
    Logger.info('Hosting LAN session');
    this.showConnectionDialog('Hosting LAN session on port 7777...');
    this.core.emit('startGame', { mode: 'lan-host' });
  }

  joinLANSession() {
    Logger.info('Joining LAN session');
    this.showJoinDialog();
  }

  quickMatch() {
    Logger.info('Starting quick match');
    this.showConnectionDialog('Finding sanctuary...');
    this.core.emit('startGame', { mode: 'online-quick' });
  }

  browseServers() {
    Logger.info('Browsing servers');
    this.showServerBrowser();
  }

  createOnlineRoom() {
    Logger.info('Creating online room');
    this.showRoomCreationDialog();
  }

  openSettings() {
    Logger.info('Opening settings');
    // Settings implementation
  }

  showConnectionDialog(message) {
    const dialog = document.getElementById('hud-dialog');
    if (!dialog) return;

    dialog.innerHTML = `
      <div class="dialog-content">
        <div class="loading-spinner"></div>
        <p class="dialog-message">${message}</p>
        <button class="dialog-button" onclick="window.hudManager.hideDialog()">Cancel</button>
      </div>
    `;

    dialog.classList.add('visible');
  }

  showJoinDialog() {
    const dialog = document.getElementById('hud-dialog');
    if (!dialog) return;

    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Join LAN Session</h3>
        <input type="text" id="lan-ip" placeholder="Enter IP address (e.g., 192.168.1.100)" class="dialog-input">
        <div class="dialog-buttons">
          <button class="dialog-button primary" onclick="window.hudManager.connectToLAN()">Connect</button>
          <button class="dialog-button" onclick="window.hudManager.hideDialog()">Cancel</button>
        </div>
      </div>
    `;

    dialog.classList.add('visible');
  }

  showServerBrowser() {
    const dialog = document.getElementById('hud-dialog');
    if (!dialog) return;

    dialog.innerHTML = `
      <div class="dialog-content server-browser">
        <h3>Browse Sanctuaries</h3>
        <div class="server-list">
          <div class="server-item">
            <div class="server-info">
              <h4>Peaceful Sanctuary #1</h4>
              <p>Players: 3/10 • Ping: 45ms</p>
            </div>
            <button class="dialog-button small">Join</button>
          </div>
          <div class="server-item">
            <div class="server-info">
              <h4>Meditation Hall</h4>
              <p>Players: 7/8 • Ping: 32ms</p>
            </div>
            <button class="dialog-button small">Join</button>
          </div>
          <div class="server-item">
            <div class="server-info">
              <h4>Social Sanctuary</h4>
              <p>Players: 5/20 • Ping: 67ms</p>
            </div>
            <button class="dialog-button small">Join</button>
          </div>
        </div>
        <button class="dialog-button" onclick="window.hudManager.hideDialog()">Close</button>
      </div>
    `;

    dialog.classList.add('visible');
  }

  showRoomCreationDialog() {
    const dialog = document.getElementById('hud-dialog');
    if (!dialog) return;

    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>Create Sanctuary</h3>
        <input type="text" id="room-name" placeholder="Sanctuary Name" class="dialog-input">
        <input type="number" id="room-max" placeholder="Max Players (1-50)" min="1" max="50" value="10" class="dialog-input">
        <label class="dialog-checkbox">
          <input type="checkbox" id="room-private">
          <span>Private Room</span>
        </label>
        <div class="dialog-buttons">
          <button class="dialog-button primary" onclick="window.hudManager.createRoom()">Create</button>
          <button class="dialog-button" onclick="window.hudManager.hideDialog()">Cancel</button>
        </div>
      </div>
    `;

    dialog.classList.add('visible');
  }

  connectToLAN() {
    const ipInput = document.getElementById('lan-ip');
    if (!ipInput) return;

    const ip = ipInput.value.trim();
    if (!ip) {
      alert('Please enter an IP address');
      return;
    }

    Logger.info(`Connecting to LAN: ${ip}`);
    this.showConnectionDialog(`Connecting to ${ip}...`);
    this.core.emit('startGame', { mode: 'lan-join', ip });
  }

  createRoom() {
    const nameInput = document.getElementById('room-name');
    const maxInput = document.getElementById('room-max');
    const privateInput = document.getElementById('room-private');

    const roomConfig = {
      name: nameInput?.value || 'My Sanctuary',
      maxPlayers: parseInt(maxInput?.value) || 10,
      private: privateInput?.checked || false
    };

    Logger.info('Creating room:', roomConfig);
    this.showConnectionDialog('Creating sanctuary...');
    this.core.emit('startGame', { mode: 'online-create', config: roomConfig });
  }

  hideDialog() {
    const dialog = document.getElementById('hud-dialog');
    if (dialog) {
      dialog.classList.remove('visible');
    }
  }

  hideHUD() {
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
      hudContainer.classList.add('hidden');
      this.isVisible = false;
    }
  }

  showHUD() {
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
      hudContainer.classList.remove('hidden');
      this.isVisible = true;
    }
  }

  attachEventListeners() {
    // Listen for ESC key to toggle HUD
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isVisible) {
          this.hideHUD();
        } else {
          this.showHUD();
        }
      }
    });
  }

  startAnimations() {
    // Background animation loop
    this.animateBackground();
  }

  animateBackground() {
    const background = document.querySelector('.hud-background');
    if (background) {
      // Subtle gradient animation
      let hue = 0;
      setInterval(() => {
        hue = (hue + 0.5) % 360;
        background.style.setProperty('--hue-rotation', `${hue}deg`);
      }, 50);
    }
  }

  playSound(soundId) {
    // Sound effects implementation
    // This would play UI sounds
  }
}

// Make available globally for dialog buttons
if (typeof window !== 'undefined') {
  window.HUDManager = HUDManager;
}
