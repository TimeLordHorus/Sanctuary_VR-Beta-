# OpenXR Integration Guide

OpenXR is an open, royalty-free standard for VR and AR applications, providing cross-platform compatibility across devices.

## Overview

OpenXR provides a unified interface to VR/AR hardware from multiple vendors. Sanctuary VR supports OpenXR through:

- Native desktop applications
- Unity XR Plugin
- Godot OpenXR integration
- Custom runtime bridges

## Supported Runtimes

### Desktop Runtimes
- **SteamVR OpenXR**: Valve Index, HTC Vive, WMR
- **Oculus OpenXR**: Meta Quest Link, Rift
- **Windows Mixed Reality**: Native WMR headsets
- **Varjo**: High-end enterprise VR

### Standalone Runtimes
- **Meta Quest**: Native Quest runtime
- **Pico**: PicoVR headsets
- **Lynx**: Mixed reality devices

## Architecture

```
┌──────────────────────────────┐
│    Sanctuary VR Application  │
└──────────────────────────────┘
              │
┌──────────────────────────────┐
│    OpenXR Loader             │
└──────────────────────────────┘
              │
┌──────────────────────────────┐
│    OpenXR Runtime            │
│  (SteamVR, Oculus, WMR)     │
└──────────────────────────────┘
              │
┌──────────────────────────────┐
│    VR Hardware               │
└──────────────────────────────┘
```

## Native C++ Integration

### Basic Setup

```cpp
#include <openxr/openxr.h>

XrInstance instance;
XrSession session;
XrSpace playSpace;

// Create instance
XrInstanceCreateInfo instanceInfo{XR_TYPE_INSTANCE_CREATE_INFO};
instanceInfo.applicationInfo.applicationName = "Sanctuary VR";
instanceInfo.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;

xrCreateInstance(&instanceInfo, &instance);

// Create session
XrSessionCreateInfo sessionInfo{XR_TYPE_SESSION_CREATE_INFO};
xrCreateSession(instance, &sessionInfo, &session);

// Create reference space
XrReferenceSpaceCreateInfo spaceInfo{XR_TYPE_REFERENCE_SPACE_CREATE_INFO};
spaceInfo.referenceSpaceType = XR_REFERENCE_SPACE_TYPE_STAGE;
xrCreateReferenceSpace(session, &spaceInfo, &playSpace);
```

### Frame Loop

```cpp
void RenderFrame() {
    XrFrameState frameState{XR_TYPE_FRAME_STATE};
    xrWaitFrame(session, nullptr, &frameState);
    xrBeginFrame(session, nullptr);

    if (frameState.shouldRender) {
        // Render VR scene
        RenderLayer(frameState);
    }

    XrFrameEndInfo endInfo{XR_TYPE_FRAME_END_INFO};
    endInfo.displayTime = frameState.predictedDisplayTime;
    xrEndFrame(session, &endInfo);
}
```

## Unity OpenXR Integration

### Installation

1. Install via Package Manager:
   - XR Plugin Management
   - OpenXR Plugin
   - XR Interaction Toolkit

2. Configure OpenXR:
   ```
   Edit → Project Settings → XR Plugin Management
   → Enable OpenXR
   → Add interaction profiles
   ```

### Unity Script Example

```csharp
using UnityEngine;
using UnityEngine.XR.OpenXR;
using UnityEngine.XR.OpenXR.Features;

public class SanctuaryVRManager : MonoBehaviour
{
    void Start()
    {
        // Check OpenXR status
        if (OpenXRRuntime.IsExtensionEnabled("XR_EXT_hand_tracking"))
        {
            Debug.Log("Hand tracking available");
        }

        // Get runtime name
        string runtime = OpenXRRuntime.name;
        Debug.Log($"Running on: {runtime}");
    }

    void Update()
    {
        // Access OpenXR features
        var feature = OpenXRSettings.Instance.GetFeature<HandTracking>();
        if (feature && feature.enabled)
        {
            // Use hand tracking
        }
    }
}
```

### Interaction Profiles

```csharp
// Configure controller bindings
public class ControllerSetup : MonoBehaviour
{
    [SerializeField] private InputActionAsset actionAsset;

    void Start()
    {
        // Setup for multiple controller types
        var profiles = new[]
        {
            "/interaction_profiles/oculus/touch_controller",
            "/interaction_profiles/htc/vive_controller",
            "/interaction_profiles/valve/index_controller",
            "/interaction_profiles/microsoft/motion_controller"
        };

        // Bindings are configured in XR Interaction Toolkit
    }
}
```

## Godot OpenXR Integration

### Project Setup

```gdscript
# project.godot
[xr]
openxr/enabled=true
openxr/startup_alert=false

[rendering]
vrs/mode=1  # Enable Variable Rate Shading
```

### GDScript Example

```gdscript
extends Node3D

var xr_interface: XRInterface
var xr_origin: XROrigin3D

func _ready():
    xr_interface = XRServer.find_interface("OpenXR")

    if xr_interface and xr_interface.is_initialized():
        print("OpenXR initialized successfully")

        # Enable VR mode
        get_viewport().use_xr = true

        # Get tracking data
        var hmd_transform = xr_interface.get_transform_for_view(0, Transform3D())
        print("HMD Position: ", hmd_transform.origin)
    else:
        print("OpenXR not available")

func _process(_delta):
    # Update hand tracking if available
    if xr_interface.supports_hand_tracking():
        update_hand_tracking()

func update_hand_tracking():
    # Access hand joint data
    var left_hand = xr_interface.get_hand_tracker(0)  # Left hand
    var right_hand = xr_interface.get_hand_tracker(1) # Right hand
    # Process hand data...
```

### XR Tools Integration

```gdscript
# Using Godot XR Tools addon
extends XRToolsPlayerBody

func _ready():
    super._ready()

    # Configure locomotion
    $MovementDirect.enabled = true
    $MovementTurn.enabled = true
    $MovementJump.enabled = false  # Comfort setting
```

## Extensions and Features

### Hand Tracking (XR_EXT_hand_tracking)

```cpp
// Enable hand tracking extension
const char* extensions[] = {
    XR_EXT_HAND_TRACKING_EXTENSION_NAME
};

XrHandTrackerCreateInfoEXT createInfo{XR_TYPE_HAND_TRACKER_CREATE_INFO_EXT};
createInfo.hand = XR_HAND_LEFT_EXT;
createInfo.handJointSet = XR_HAND_JOINT_SET_DEFAULT_EXT;

XrHandTrackerEXT handTracker;
xrCreateHandTrackerEXT(session, &createInfo, &handTracker);
```

### Eye Tracking (XR_EXT_eye_gaze_interaction)

```cpp
// Request eye gaze tracking
XrSystemEyeGazeInteractionPropertiesEXT eyeGazeProps{
    XR_TYPE_SYSTEM_EYE_GAZE_INTERACTION_PROPERTIES_EXT
};

XrSystemProperties systemProps{XR_TYPE_SYSTEM_PROPERTIES};
systemProps.next = &eyeGazeProps;

xrGetSystemProperties(instance, systemId, &systemProps);

if (eyeGazeProps.supportsEyeGazeInteraction) {
    // Eye tracking available
}
```

### Passthrough (XR_FB_passthrough)

```cpp
// Meta Quest passthrough
#include <openxr/openxr_platform.h>

XrPassthroughCreateInfoFB passthroughInfo{XR_TYPE_PASSTHROUGH_CREATE_INFO_FB};
XrPassthroughFB passthrough;
xrCreatePassthroughFB(session, &passthroughInfo, &passthrough);

// Start passthrough
xrPassthroughStartFB(passthrough);
```

## Performance Optimization

### Foveated Rendering

```cpp
// Variable rate shading
XrFoveationLevelProfileCreateInfoFB foveationInfo{
    XR_TYPE_FOVEATION_LEVEL_PROFILE_CREATE_INFO_FB
};
foveationInfo.level = XR_FOVEATION_LEVEL_HIGH_FB;
foveationInfo.verticalOffset = 0.0f;
foveationInfo.dynamic = XR_FOVEATION_DYNAMIC_LEVEL_ENABLED_FB;

XrFoveationProfileCreateInfoFB profileInfo{
    XR_TYPE_FOVEATION_PROFILE_CREATE_INFO_FB
};
profileInfo.next = &foveationInfo;
```

### Dynamic Resolution

```cpp
void AdjustResolution(float gpuUtilization) {
    static float currentScale = 1.0f;

    if (gpuUtilization > 0.95f) {
        currentScale *= 0.9f;  // Reduce resolution
    } else if (gpuUtilization < 0.80f) {
        currentScale *= 1.05f; // Increase resolution
    }

    currentScale = std::clamp(currentScale, 0.5f, 1.5f);

    // Apply to swapchain
    UpdateSwapchainResolution(currentScale);
}
```

## Cross-Platform Considerations

### Runtime Detection

```cpp
XrInstanceProperties instanceProps{XR_TYPE_INSTANCE_PROPERTIES};
xrGetInstanceProperties(instance, &instanceProps);

std::string runtimeName = instanceProps.runtimeName;

if (runtimeName.find("SteamVR") != std::string::npos) {
    // SteamVR-specific optimizations
} else if (runtimeName.find("Oculus") != std::string::npos) {
    // Meta-specific features
}
```

### Controller Mapping

```cpp
struct ControllerProfile {
    const char* path;
    std::vector<const char*> buttons;
};

ControllerProfile profiles[] = {
    {
        "/interaction_profiles/oculus/touch_controller",
        {"/input/trigger", "/input/squeeze", "/input/thumbstick"}
    },
    {
        "/interaction_profiles/valve/index_controller",
        {"/input/trigger", "/input/squeeze", "/input/trackpad"}
    }
};
```

## Debugging

### Enable Debug Layers

```cpp
// Create instance with validation layers
const char* layers[] = {
    "XR_APILAYER_LUNARG_core_validation"
};

XrInstanceCreateInfo createInfo{XR_TYPE_INSTANCE_CREATE_INFO};
createInfo.enabledApiLayerCount = 1;
createInfo.enabledApiLayerNames = layers;
```

### Runtime Information

```cpp
void LogRuntimeInfo() {
    XrInstanceProperties props{XR_TYPE_INSTANCE_PROPERTIES};
    xrGetInstanceProperties(instance, &props);

    printf("Runtime: %s\n", props.runtimeName);
    printf("Version: %d.%d.%d\n",
        XR_VERSION_MAJOR(props.runtimeVersion),
        XR_VERSION_MINOR(props.runtimeVersion),
        XR_VERSION_PATCH(props.runtimeVersion));
}
```

## Common Issues

### Issue: Runtime Not Found
```bash
# Linux: Set OpenXR runtime
export XR_RUNTIME_JSON=/path/to/runtime.json

# Windows: Registry key
# HKEY_LOCAL_MACHINE\SOFTWARE\Khronos\OpenXR\1\ActiveRuntime
```

### Issue: Performance Problems
- Enable foveated rendering
- Use appropriate MSAA levels (2x recommended)
- Implement occlusion culling
- Use LOD systems

## Resources

- [OpenXR Specification](https://www.khronos.org/openxr/)
- [OpenXR SDK](https://github.com/KhronosGroup/OpenXR-SDK)
- [Unity OpenXR Plugin](https://docs.unity3d.com/Packages/com.unity.xr.openxr@latest)
- [Godot XR Documentation](https://docs.godotengine.org/en/stable/tutorials/xr/index.html)

## Next Steps

- [Unity Integration Guide](./unity.md)
- [Godot Integration Guide](./godot.md)
- [Custom Extensions](../guides/openxr-extensions.md)
