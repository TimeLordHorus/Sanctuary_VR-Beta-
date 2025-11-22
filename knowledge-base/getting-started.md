# Getting Started with Sanctuary VR

This guide will help you set up and start using Sanctuary VR.

## Prerequisites

- **Node.js** 18+ and npm 9+
- **Modern Web Browser** with WebXR support (Chrome, Edge, Firefox)
- **VR Headset** (optional but recommended):
  - Meta Quest 2/3/Pro
  - Valve Index
  - HTC Vive
  - Windows Mixed Reality
  - Any OpenXR compatible device

## Installation

### Quick Start (Web-based)

```bash
# Clone the repository
git clone https://github.com/yourusername/sanctuary-vr-beta.git
cd sanctuary-vr-beta

# Install dependencies
npm install

# Start development server
npm run dev:web
```

Visit `http://localhost:5173` in your browser.

### Desktop Development

```bash
# Start desktop development mode
npm run dev:desktop
```

## Your First VR Experience

### Using a VR Headset

1. Connect your VR headset to your computer
2. Open the application in a WebXR-compatible browser
3. Click the "Enter VR" button in the bottom right
4. Put on your headset

### Desktop Mode (No VR Headset)

1. Use WASD keys to move around
2. Mouse to look around
3. Click on interactive objects
4. Press ESC to release pointer lock

## Basic Controls

### VR Mode
- **Movement**: Use thumbstick/trackpad on left controller
- **Teleport**: Point and click with right controller
- **Grab**: Grip buttons
- **Interact**: Trigger buttons
- **Menu**: Press menu button on left controller

### Desktop Mode
- **W/A/S/D**: Move forward/left/backward/right
- **Mouse**: Look around
- **Click**: Interact with objects
- **ESC**: Release cursor

## Understanding the Environment

### Main Areas

1. **Entrance Hall**: Starting point with tutorial information
2. **Meditation Space**: Quiet area for relaxation
3. **Main Hall**: Central gathering area

### Interactive Elements

- **Meditation Cushions**: Click to sit and meditate
- **Info Panels**: Read information about the sanctuary
- **Teleport Points**: Quick navigation between areas
- **Floating Orbs**: Decorative elements with gentle animations

## Next Steps

- [Create Your First Scene](./guides/creating-scenes.md)
- [Customize the Environment](./guides/customization.md)
- [Add Custom Interactions](./guides/interactables.md)
- [Deploy to Production](./guides/deployment.md)

## Troubleshooting

If you encounter issues:

1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Verify your browser supports WebXR
3. Ensure your VR headset drivers are up to date
4. Check the browser console for errors

## Getting Help

- Read the [FAQ](./faq.md)
- Check existing [GitHub Issues](https://github.com/yourusername/sanctuary-vr-beta/issues)
- Join our community discussions
