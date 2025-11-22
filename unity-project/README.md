# Sanctuary VR - Unity Project

This Unity project provides native VR support for Sanctuary VR using Unity's XR Interaction Toolkit and OpenXR.

## Requirements

- Unity 2021.3 LTS or later
- OpenXR Plugin
- XR Interaction Toolkit 2.0+
- XR Plugin Management

## Setup

1. Open this folder in Unity Hub
2. Install required packages via Package Manager:
   - XR Plugin Management
   - OpenXR Plugin
   - XR Interaction Toolkit

3. Configure OpenXR:
   - Edit → Project Settings → XR Plugin Management
   - Enable OpenXR
   - Add interaction profiles for your target devices

## Project Structure

```
Assets/
├── Scenes/           # VR scenes
│   └── SanctuaryMain.unity
├── Scripts/          # C# scripts
│   ├── Core/        # Core VR systems
│   └── Components/  # VR components
├── Prefabs/         # Reusable prefabs
├── Materials/       # Materials and shaders
└── Resources/       # Runtime-loaded assets
```

## Building for VR

### PC VR (SteamVR/Oculus)
1. File → Build Settings
2. Select Platform: Windows/Mac/Linux
3. Add Scenes
4. Build

### Meta Quest (Standalone)
1. File → Build Settings
2. Switch Platform to Android
3. Configure Android settings:
   - Minimum API Level: 29
   - IL2CPP scripting backend
4. Build and deploy to Quest

## XR Interaction Toolkit Setup

The project uses Unity's XR Interaction Toolkit for:
- Locomotion (teleport, continuous movement)
- Grab interactions
- UI interactions
- Hand tracking

## Scripts

### SanctuaryVRManager.cs
Main VR management system that integrates with Sanctuary VR core.

### XRRigSetup.cs
Configures the XR Origin and camera rig.

### InteractionHandler.cs
Handles VR interactions and events.

## Testing

### In Editor
Use XR Device Simulator (XR Interaction Toolkit) to test without a headset.

### On Device
Build and deploy to your VR device for full testing.

## Resources

- [Unity XR Documentation](https://docs.unity3d.com/Manual/XR.html)
- [XR Interaction Toolkit](https://docs.unity3d.com/Packages/com.unity.xr.interaction.toolkit@latest)
- [OpenXR Plugin](https://docs.unity3d.com/Packages/com.unity.xr.openxr@latest)
