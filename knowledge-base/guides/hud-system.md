# HUD System Guide

The Sanctuary VR HUD (Heads-Up Display) provides a beautiful, modern interface for launching and managing your VR experience.

## Overview

The HUD system features:
- **Glassmorphism Design**: Modern frosted glass aesthetic
- **Smooth Animations**: Fluid transitions and particle effects
- **Multi-Mode Support**: Local, LAN, and Online multiplayer
- **VR & Desktop Compatible**: Works in both VR and desktop modes
- **Responsive**: Adapts to different screen sizes

## Architecture

```
HUD System
├── HUDManager (Core logic)
├── NetworkManager (Multiplayer)
├── VRSpatialUI (VR-specific UI)
└── CSS Styling (Visual effects)
```

## Using the HUD

### Main Menu

The main menu appears when you launch Sanctuary VR and offers four options:

1. **Local Play**: Single-player exploration
2. **LAN Party**: Connect with friends on your local network
3. **Multiplayer Online**: Join the global sanctuary community
4. **Settings**: Configure your VR experience

### Game Modes

#### Local Play
```javascript
// Starts immediately - no network connection needed
// Perfect for solo meditation and exploration
```

#### LAN Party
```javascript
// Host a Session
- Automatically creates a room on your local network
- Other players on the same WiFi can join
- Room code is displayed for easy sharing

// Join a Session
- Enter the host's IP address
- Connects via WebRTC for low latency
```

#### Multiplayer Online
```javascript
// Quick Match
- Automatically finds and joins an available sanctuary
- Fastest way to get started

// Browse Servers
- View list of active sanctuaries
- See player count and ping
- Choose your preferred environment

// Create Room
- Customize your sanctuary
- Set max players (1-50)
- Public or private room options
```

## HUD Manager API

### Initialization

```javascript
import { HUDManager } from './core/HUDManager.js';

const hudManager = new HUDManager(core);
hudManager.init();
```

### Methods

#### `renderMenu(menuId)`
Renders a specific menu by ID.

```javascript
hudManager.renderMenu('main');  // Main menu
hudManager.renderMenu('lan');   // LAN options
hudManager.renderMenu('online'); // Online options
```

#### `showHUD()` / `hideHUD()`
Show or hide the entire HUD.

```javascript
hudManager.showHUD();  // Make HUD visible
hudManager.hideHUD();  // Hide HUD
```

#### `showDialog(content)`
Display a modal dialog.

```javascript
hudManager.showConnectionDialog('Connecting to server...');
```

## Network Manager API

### Initialization

```javascript
import { NetworkManager } from './core/NetworkManager.js';

const networkManager = new NetworkManager(core);
await networkManager.init('online-quick');
```

### Network Modes

```javascript
// Local play - no networking
await networkManager.init('local');

// LAN host
await networkManager.init('lan-host');

// LAN join
await networkManager.init('lan-join', { ip: '192.168.1.100' });

// Online quick match
await networkManager.init('online-quick');

// Online create room
await networkManager.init('online-create', {
  config: {
    name: 'My Sanctuary',
    maxPlayers: 10,
    private: false
  }
});

// Online join room
await networkManager.init('online-join', { roomId: 'ABC123' });
```

## Customizing the HUD

### Creating Custom Menu Options

```javascript
const customMenu = {
  title: 'My Menu',
  subtitle: 'Choose an option',
  options: [
    {
      id: 'custom-option',
      label: 'Custom Option',
      subtitle: 'Description',
      icon: '🎯',
      color: '#4CAF50'
    }
  ]
};

// Add to menus
hudManager.menus['custom'] = customMenu;
hudManager.renderMenu('custom');
```

### Styling Options

The HUD uses CSS custom properties for easy theming:

```css
:root {
  --hud-primary: #6366f1;        /* Primary color */
  --hud-secondary: #8b5cf6;      /* Secondary color */
  --hud-glass-bg: rgba(15, 23, 42, 0.7);  /* Glass background */
  --hud-text-primary: #f8fafc;   /* Primary text color */
}
```

## VR Spatial UI

In VR mode, you can use spatial 3D menus:

```javascript
import { VRSpatialUI } from './components/VRSpatialUI.js';

const scene = document.querySelector('a-scene');
const spatialUI = new VRSpatialUI(scene);
spatialUI.init();

// Show spatial menu
spatialUI.show();

// Create menu options
spatialUI.createMenuOptions([
  {
    label: 'Option 1',
    color: '#4CAF50',
    onClick: () => console.log('Clicked!')
  }
]);
```

### VR Menu Controls

- **Menu Button**: Toggle spatial menu
- **A Button** (Quest/Index): Toggle spatial menu
- **Laser Pointer**: Aim at menu options
- **Trigger**: Select menu option

## Events

The HUD system emits various events:

```javascript
// Listen for game start
core.on('startGame', (config) => {
  console.log('Starting game:', config);
});

// Listen for network ready
core.on('networkReady', (data) => {
  console.log('Network ready:', data);
});

// Listen for network errors
core.on('networkError', (error) => {
  console.error('Network error:', error);
});

// Listen for match found
core.on('matchFound', (data) => {
  console.log('Match found:', data);
});
```

## Animations

The HUD includes several built-in animations:

### Card Entrance
Cards fade in and slide up when menu loads.

### Hover Effects
- Glow effect on hover
- Scale transformation
- Color shift
- Particle emission

### Dialog Animations
- Slide in from top with scale
- Fade background blur

### Background Effects
- Gradient color shifting
- Radial pulse animation
- Floating particles

## Best Practices

### 1. Performance
```javascript
// Limit particle count on lower-end devices
const particleCount = isMobile ? 20 : 50;
```

### 2. Accessibility
```javascript
// Provide clear labels and descriptions
subtitle: 'Clear description of what this option does'
```

### 3. Error Handling
```javascript
try {
  await networkManager.init(mode);
} catch (error) {
  hudManager.showConnectionDialog('Connection failed. Please try again.');
}
```

### 4. User Feedback
```javascript
// Always show loading states
hudManager.showConnectionDialog('Connecting...');

// Provide success/failure feedback
core.on('networkReady', () => {
  hudManager.hideDialog();
  hudManager.hideHUD();
});
```

## Troubleshooting

### HUD Not Showing
```javascript
// Check if container exists
const container = document.getElementById('hud-container');
if (!container) {
  console.error('HUD container not found');
}

// Check if hidden
if (container.classList.contains('hidden')) {
  hudManager.showHUD();
}
```

### Menu Not Rendering
```javascript
// Verify menu content element exists
const content = document.getElementById('hud-menu-content');
if (!content) {
  console.error('Menu content container not found');
}
```

### Particles Not Animating
```javascript
// Check if particles were created
const particles = document.querySelectorAll('.hud-particle');
console.log(`Created ${particles.length} particles`);
```

### Network Connection Fails
```javascript
// Check network manager initialization
console.log('Network mode:', networkManager.mode);
console.log('Connected:', networkManager.socket?.connected);
```

## Advanced Usage

### Custom Dialog

```javascript
const dialog = document.getElementById('hud-dialog');
dialog.innerHTML = `
  <div class="dialog-content">
    <h3>Custom Dialog</h3>
    <p>Your custom content here</p>
    <button class="dialog-button" onclick="closeDialog()">Close</button>
  </div>
`;
dialog.classList.add('visible');
```

### Dynamic Menu Updates

```javascript
// Add option to existing menu
hudManager.menus['main'].options.push({
  id: 'new-feature',
  label: 'New Feature',
  subtitle: 'Check out our new feature!',
  icon: '✨',
  color: '#FF6B6B'
});

// Re-render menu
hudManager.renderMenu('main');
```

### Network Event Handling

```javascript
networkManager.onPeerMessage = (peerId, message) => {
  switch (message.type) {
    case 'custom-event':
      // Handle custom network event
      break;
  }
};
```

## Resources

- [HUDManager.js Source](../src/core/HUDManager.js)
- [NetworkManager.js Source](../src/core/NetworkManager.js)
- [VRSpatialUI.js Source](../src/components/VRSpatialUI.js)
- [HUD CSS Source](../src/styles/hud.css)

## Next Steps

- [Customizing Environments](./customization.md)
- [Multiplayer Architecture](../architecture/multiplayer.md)
- [VR Input Handling](./vr-input.md)
