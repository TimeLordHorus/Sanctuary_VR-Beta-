# Sanctuary VR - Beta

A comprehensive open-source VR environment built with interoperability and accessibility in mind.

## Overview

Sanctuary VR is a flexible, cross-platform virtual reality environment designed to work seamlessly with multiple VR frameworks and development tools. Built on open standards like WebXR and OpenXR, it provides a sanctuary-themed immersive experience accessible through various platforms.

## Features

- **Multi-Platform Support**: Web (WebXR), Desktop (OpenXR), Mobile VR
- **Open Source VR Frameworks**:
  - A-Frame for web-based VR
  - Three.js for advanced 3D graphics
  - OpenXR compatibility layer
  - Godot VR integration
  - Unity VR support
- **IDE Integration**: VSCode, Unity Editor, Godot Engine
- **Modular Architecture**: Easy to extend and customize
- **Accessibility Features**: Multiple interaction modes and comfort settings

## Quick Start

### Web-based VR (A-Frame)
```bash
npm install
npm run dev:web
```

### Desktop Development
```bash
npm run dev:desktop
```

### Unity Integration
Open the `unity-project/` folder in Unity 2021.3 or later.

### Godot Integration
Open `godot-project/project.godot` in Godot 4.0 or later.

## Project Structure

```
sanctuary-vr/
├── src/                    # Core source code
│   ├── core/              # Core VR systems
│   ├── scenes/            # VR scenes and environments
│   ├── components/        # Reusable VR components
│   └── utils/             # Utility functions
├── environments/          # Environment configurations
├── assets/               # 3D models, textures, audio
├── knowledge-base/       # Documentation and guides
├── unity-project/        # Unity VR project
├── godot-project/        # Godot VR project
└── config/              # Configuration files
```

## Documentation

See the [Knowledge Base](./knowledge-base/README.md) for comprehensive documentation, guides, and tutorials.

## Technologies

- **WebXR**: Web-based VR standard
- **OpenXR**: Cross-platform VR API
- **A-Frame**: Declarative web VR framework
- **Three.js**: JavaScript 3D library
- **Godot Engine**: Open source game engine
- **Unity**: Professional game development platform

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please see CONTRIBUTING.md for guidelines.
