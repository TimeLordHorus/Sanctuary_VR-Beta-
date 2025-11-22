# Sanctuary VR - Godot Project

This Godot project provides native VR support for Sanctuary VR using Godot 4's built-in OpenXR support.

## Requirements

- Godot 4.2 or later
- OpenXR runtime installed
- VR headset with OpenXR support

## Setup

1. Open this folder in Godot 4
2. The OpenXR plugin is built into Godot 4
3. Configure VR settings in Project Settings → XR

## Project Structure

```
godot-project/
├── scenes/           # VR scenes
│   ├── main.tscn    # Main sanctuary scene
│   └── ui/          # VR UI scenes
├── scripts/         # GDScript files
│   ├── core/        # Core VR systems
│   └── components/  # VR components
├── assets/          # 3D models, textures, audio
│   ├── models/
│   ├── textures/
│   └── audio/
└── addons/          # Godot addons
    └── godot-xr-tools/  # XR Tools addon (recommended)
```

## Getting Started

### Installing XR Tools (Recommended)

The Godot XR Tools addon provides useful VR functionality:

1. Download from: https://github.com/GodotVR/godot-xr-tools
2. Extract to `addons/godot-xr-tools/`
3. Enable in Project Settings → Plugins

### Creating a VR Scene

```gdscript
extends Node3D

var xr_interface: XRInterface

func _ready():
    xr_interface = XRServer.find_interface("OpenXR")
    if xr_interface and xr_interface.is_initialized():
        print("OpenXR initialized")
        get_viewport().use_xr = true
    else:
        print("OpenXR not initialized")
```

### XR Origin Setup

1. Add XROrigin3D node
2. Add XRCamera3D as child
3. Add XRController3D nodes for left/right hands
4. Configure action maps

## VR Features

### Hand Tracking

```gdscript
func _process(_delta):
    if xr_interface.supports_hand_tracking():
        var left_hand = xr_interface.get_hand_tracker(0)
        var right_hand = xr_interface.get_hand_tracker(1)
        # Process hand data
```

### Locomotion

Using XR Tools:
- Movement (direct and smooth)
- Teleportation
- Turning (snap and smooth)
- Climbing

### Interaction

- Grab objects with XRToolsPickable
- Interact with XRToolsInteractable
- Point at UI with XRToolsPointer

## Building for VR

### PC VR
1. Project → Export
2. Select Windows/Linux/macOS
3. Configure export settings
4. Export project

### Meta Quest (Android)
1. Install Android build templates
2. Project → Export → Android
3. Configure Android settings:
   - Min SDK: 29
   - Target SDK: 32+
   - XR Mode: OpenXR
4. Export APK
5. Install via SideQuest or adb

### PCVR (SteamVR)
Export as Windows executable and launch with SteamVR running.

## Scripts

### sanctuary_vr_core.gd
```gdscript
extends Node

signal vr_initialized
signal vr_session_started
signal vr_session_ended

var xr_interface: XRInterface
var is_vr_active := false

func _ready():
    initialize_vr()

func initialize_vr():
    xr_interface = XRServer.find_interface("OpenXR")
    if xr_interface and xr_interface.initialize():
        vr_initialized.emit()
        get_viewport().use_xr = true
        is_vr_active = true
```

## Debugging

### In-Editor Testing
Godot 4 supports OpenXR in the editor. Simply run the scene with your headset connected.

### Remote Debugging (Quest)
1. Enable remote debugging in export settings
2. Connect via USB
3. Deploy and debug on device

## Performance Tips

1. Enable VRS (Variable Rate Shading) in project settings
2. Use appropriate MSAA levels (2x recommended)
3. Implement LOD for complex models
4. Use occlusion culling
5. Optimize physics with simplified collision meshes

## Resources

- [Godot XR Documentation](https://docs.godotengine.org/en/stable/tutorials/xr/index.html)
- [Godot XR Tools](https://github.com/GodotVR/godot-xr-tools)
- [OpenXR Specification](https://www.khronos.org/openxr/)

## Community Addons

Recommended addons for VR development:
- **Godot XR Tools**: Essential VR functionality
- **XR Tunnelling**: Comfort feature for smooth locomotion
- **VR Workspace**: VR-friendly development tools
