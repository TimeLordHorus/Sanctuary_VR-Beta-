# WebXR Integration Guide

WebXR is the primary platform for Sanctuary VR, providing web-based virtual reality experiences.

## Overview

WebXR Device API provides the foundation for VR experiences in web browsers. Sanctuary VR leverages WebXR for:

- Cross-device compatibility
- No installation required
- Immediate updates
- Web platform integration

## Browser Support

### Fully Supported
- **Chrome/Edge 79+**: Full WebXR support
- **Firefox 90+**: Full WebXR support
- **Oculus Browser**: Native Quest support
- **Samsung Internet**: Mobile VR support

### Partial Support
- **Safari (iOS 15+)**: Limited WebXR support, improving
- **Opera**: Based on Chromium, full support

## Setting Up WebXR

### Basic Setup

```javascript
import { VRCompatibilityLayer } from '../core/VRCompatibilityLayer.js';

const vrLayer = new VRCompatibilityLayer();
await vrLayer.detectVRSupport();

if (vrLayer.supportedAPIs.webxr) {
  const session = await vrLayer.requestVRSession();
  // Start VR experience
}
```

### Session Configuration

```javascript
const sessionInit = {
  requiredFeatures: ['local-floor'],
  optionalFeatures: [
    'bounded-floor',
    'hand-tracking',
    'layers',
    'depth-sensing'
  ]
};

const session = await navigator.xr.requestSession(
  'immersive-vr',
  sessionInit
);
```

## Features

### 1. Hand Tracking

```javascript
// Check for hand tracking support
if (session.inputSources[0].hand) {
  const hand = session.inputSources[0].hand;

  // Access hand joints
  for (const [jointName, joint] of hand.entries()) {
    const pose = frame.getJointPose(joint, referenceSpace);
    // Use pose.transform for hand rendering
  }
}
```

### 2. Controller Input

```javascript
session.addEventListener('inputsourceschange', (event) => {
  event.added.forEach(inputSource => {
    if (inputSource.gamepad) {
      // Access gamepad buttons and axes
      console.log(inputSource.gamepad.buttons);
      console.log(inputSource.gamepad.axes);
    }
  });
});
```

### 3. Room-Scale Tracking

```javascript
// Request bounded-floor reference space
const referenceSpace = await session.requestReferenceSpace('bounded-floor');

// Get play area bounds
const bounds = referenceSpace.boundsGeometry;
bounds.forEach(point => {
  console.log(`Boundary point: ${point.x}, ${point.z}`);
});
```

### 4. Hit Testing

```javascript
// Enable hit testing
const hitTestSource = await session.requestHitTestSource({
  space: viewerSpace
});

// In animation loop
const hitTestResults = frame.getHitTestResults(hitTestSource);
if (hitTestResults.length > 0) {
  const hit = hitTestResults[0];
  const pose = hit.getPose(referenceSpace);
  // Use pose for placement
}
```

## A-Frame WebXR

### Basic Scene Setup

```html
<a-scene webxr="requiredFeatures: local-floor;
                optionalFeatures: hand-tracking, bounded-floor;">
  <!-- Scene content -->
</a-scene>
```

### Custom WebXR Component

```javascript
AFRAME.registerComponent('webxr-custom', {
  init: function() {
    this.el.sceneEl.addEventListener('enter-vr', () => {
      const xrSession = this.el.sceneEl.renderer.xr.getSession();
      // Access WebXR session
    });
  }
});
```

## Three.js WebXR

### Renderer Setup

```javascript
import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Add VR button
document.body.appendChild(VRButton.createButton(renderer));

// Animation loop
renderer.setAnimationLoop((time, frame) => {
  if (frame) {
    // VR rendering
    renderer.render(scene, camera);
  }
});
```

### Controller Setup

```javascript
const controller1 = renderer.xr.getController(0);
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);
```

## Performance Optimization

### Adaptive Quality

```javascript
function adjustQualityForVR(session) {
  const refreshRate = session.frameRate || 90;

  if (refreshRate >= 90) {
    // High quality rendering
    renderer.setPixelRatio(1.5);
  } else {
    // Reduced quality for performance
    renderer.setPixelRatio(1.0);
  }
}
```

### Foveated Rendering

```javascript
// Enable foveated rendering if available
if (session.renderState.layers) {
  const layer = session.renderState.layers[0];
  if (layer.fixedFoveation !== undefined) {
    layer.fixedFoveation = 1; // Medium foveation
  }
}
```

## Debugging WebXR

### Chrome DevTools

1. Enable WebXR emulation in Chrome DevTools
2. Go to Settings → Devices → Add custom device
3. Select a VR headset profile

### Firefox Reality Debugger

```javascript
// Enable debug logging
console.log('XR Session:', session);
console.log('Reference Space:', referenceSpace);
console.log('Frame Rate:', session.frameRate);
```

### Common Issues

**Issue: Session request fails**
```javascript
try {
  const session = await navigator.xr.requestSession('immersive-vr');
} catch (error) {
  if (error.name === 'NotSupportedError') {
    console.log('WebXR not supported');
  } else if (error.name === 'SecurityError') {
    console.log('Must be called from user gesture');
  }
}
```

## Best Practices

### 1. Progressive Enhancement

```javascript
async function initVR() {
  if (!navigator.xr) {
    // Fallback to desktop mode
    initDesktopMode();
    return;
  }

  const supported = await navigator.xr.isSessionSupported('immersive-vr');
  if (supported) {
    initVRMode();
  } else {
    initDesktopMode();
  }
}
```

### 2. User Comfort

```javascript
const comfortSettings = {
  locomotion: 'teleport', // vs 'smooth'
  rotationType: 'snap',   // vs 'smooth'
  snapAngle: 30,          // degrees
  vignette: true          // reduce motion sickness
};
```

### 3. Battery Efficiency

```javascript
// Reduce update frequency for non-critical systems
let physicsAccumulator = 0;
const PHYSICS_TIMESTEP = 1/60;

function onFrame(time, frame) {
  physicsAccumulator += frame.duration;

  while (physicsAccumulator >= PHYSICS_TIMESTEP) {
    updatePhysics(PHYSICS_TIMESTEP);
    physicsAccumulator -= PHYSICS_TIMESTEP;
  }

  render();
}
```

## Testing Across Devices

### Quest Browser
- Test native hand tracking
- Verify controller mapping
- Check performance at 72Hz/90Hz/120Hz

### Desktop VR (Steam VR)
- Test room-scale tracking
- Verify lighthouse tracking
- Check controller bindings

### Mobile VR
- Test 3DOF mode
- Verify touch controls
- Check thermal throttling

## Resources

- [WebXR Spec](https://www.w3.org/TR/webxr/)
- [Immersive Web Working Group](https://www.w3.org/immersive-web/)
- [WebXR Samples](https://immersive-web.github.io/webxr-samples/)
- [A-Frame WebXR](https://aframe.io/docs/1.5.0/introduction/vr-headsets-and-webxr-browsers.html)

## Next Steps

- [OpenXR Integration](./openxr.md)
- [Input Handling Guide](../guides/vr-input.md)
- [Performance Optimization](../guides/performance.md)
