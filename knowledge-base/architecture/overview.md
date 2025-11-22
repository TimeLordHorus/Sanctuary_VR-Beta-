# Architecture Overview

Sanctuary VR follows a modular, layered architecture designed for extensibility and cross-platform compatibility.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  (Scenes, Environments, User Interactions)              │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                    Core Systems Layer                    │
│  (Scene Manager, Environment Manager, Asset Manager)    │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                VR Compatibility Layer                    │
│  (WebXR, OpenXR Abstraction, Input Handling)           │
└─────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│                   Rendering Layer                        │
│  (A-Frame, Three.js, Native Renderers)                 │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Sanctuary Core (`src/core/SanctuaryCore.js`)

The central management system that:
- Initializes the VR environment
- Manages the rendering pipeline
- Handles global events
- Coordinates between subsystems

**Key Responsibilities:**
- Render mode selection (WebXR, A-Frame, Three.js)
- Global state management
- Event bus coordination
- Lifecycle management

### 2. VR Compatibility Layer (`src/core/VRCompatibilityLayer.js`)

Provides abstraction across different VR platforms:
- Detects available VR APIs
- Normalizes input across devices
- Handles capability detection
- Provides fallbacks for unsupported features

**Supported APIs:**
- WebXR (primary)
- OpenXR (via native bridge)
- Legacy WebVR (polyfill)

### 3. Environment Manager (`src/core/EnvironmentManager.js`)

Manages VR environment loading and configuration:
- Loads environment definitions
- Manages environment assets
- Applies lighting and atmosphere
- Handles environment transitions

**Features:**
- Asset preloading
- Environment caching
- Dynamic lighting
- Audio management

### 4. Scene Manager (`src/scenes/SceneManager.js`)

Handles scene lifecycle and transitions:
- Scene loading/unloading
- Transition effects
- Camera management
- Interaction setup

**Capabilities:**
- Scene state persistence
- Smooth transitions
- Teleport point management
- Interactive object registration

## Data Flow

```
User Input → Input Manager → Event Bus → Scene/Environment
                                ↓
                          State Updates
                                ↓
                        Rendering Pipeline
                                ↓
                           VR Display
```

## Module Organization

```
src/
├── index.js                 # Entry point
├── core/                    # Core systems
│   ├── SanctuaryCore.js
│   ├── VRCompatibilityLayer.js
│   ├── EnvironmentManager.js
│   └── InputManager.js
├── scenes/                  # Scene management
│   ├── SceneManager.js
│   └── Scene.js
├── components/             # Reusable VR components
│   ├── Teleporter.js
│   ├── Interactable.js
│   └── VRControls.js
└── utils/                  # Utility functions
    ├── AssetLoader.js
    ├── Logger.js
    └── Performance.js
```

## Rendering Modes

### 1. A-Frame Mode (Default)
- Declarative HTML-based
- Easy to learn
- Great for rapid prototyping
- Entity-component-system architecture

### 2. Three.js Mode
- Full control over rendering
- Custom shaders
- Advanced graphics features
- Performance optimization

### 3. WebXR Direct Mode
- Lowest latency
- Maximum control
- Complex to implement
- Best performance

## Extension Points

Sanctuary VR can be extended at multiple levels:

1. **Custom Scenes**: Add new scenes by implementing scene configurations
2. **Custom Components**: Create reusable interactive components
3. **Environment Presets**: Define new environment configurations
4. **Input Handlers**: Add support for custom input devices
5. **Rendering Plugins**: Extend rendering capabilities

## Performance Considerations

- **Level of Detail (LOD)**: Automatic quality adjustment
- **Occlusion Culling**: Don't render what's not visible
- **Asset Streaming**: Load assets on demand
- **Physics Optimization**: Simplified collision meshes
- **Draw Call Batching**: Reduce GPU overhead

## Threading Model

```
Main Thread:
  ├── UI Updates
  ├── Scene Management
  └── Event Handling

Web Worker:
  ├── Asset Loading
  ├── Physics Simulation
  └── Network Communication

VR Thread (Browser/Native):
  └── Rendering Pipeline
```

## State Management

Sanctuary VR uses a centralized state management approach:

```javascript
State Tree:
  ├── app
  │   ├── initialized
  │   └── renderMode
  ├── vr
  │   ├── sessionActive
  │   ├── capabilities
  │   └── currentAPI
  ├── scene
  │   ├── current
  │   └── loaded
  └── environment
      ├── current
      └── settings
```

## Integration Architecture

### Unity Integration
```
Unity Project → WebGL Build → Sanctuary VR Wrapper
```

### Godot Integration
```
Godot Project → HTML5 Export → Sanctuary VR Integration
```

### Native OpenXR
```
Native App → OpenXR Runtime → Platform Bridge → Sanctuary Core
```

## Security Considerations

- Sandboxed asset loading
- Content Security Policy enforcement
- Input validation
- User permission management
- Safe shader compilation

## Next Steps

- [Creating Custom Components](../guides/custom-components.md)
- [Scene Development Guide](../guides/creating-scenes.md)
- [API Reference](../api/README.md)
