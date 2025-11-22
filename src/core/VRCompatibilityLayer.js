/**
 * VR Compatibility Layer
 * Provides abstraction for different VR platforms and APIs
 */

export class VRCompatibilityLayer {
  constructor() {
    this.supportedAPIs = {
      webxr: false,
      openxr: false,
      cardboard: false,
      oculus: false
    };

    this.currentAPI = null;
    this.capabilities = {
      handTracking: false,
      eyeTracking: false,
      roomScale: false,
      controllers: false
    };
  }

  async detectVRSupport() {
    console.log('Detecting VR support...');

    // Check for WebXR support
    if (navigator.xr) {
      try {
        this.supportedAPIs.webxr = await navigator.xr.isSessionSupported('immersive-vr');
        if (this.supportedAPIs.webxr) {
          this.currentAPI = 'webxr';
          await this.detectWebXRCapabilities();
        }
      } catch (error) {
        console.warn('WebXR detection failed:', error);
      }
    }

    // Check for legacy WebVR
    if (navigator.getVRDisplays) {
      this.supportedAPIs.cardboard = true;
    }

    // Desktop OpenXR detection (would require native bridge)
    if (typeof window !== 'undefined' && window.OpenXR) {
      this.supportedAPIs.openxr = true;
      this.currentAPI = this.currentAPI || 'openxr';
    }

    console.log('VR Support detected:', this.supportedAPIs);
    console.log('Using API:', this.currentAPI || 'none');

    return this.supportedAPIs;
  }

  async detectWebXRCapabilities() {
    if (!navigator.xr) return;

    try {
      // Check for hand tracking
      const handTracking = await navigator.xr.isSessionSupported('immersive-vr', {
        requiredFeatures: ['hand-tracking']
      }).catch(() => false);

      this.capabilities.handTracking = handTracking;

      // Controllers are typically available in WebXR
      this.capabilities.controllers = true;

      // Room scale is typically available
      this.capabilities.roomScale = true;

      console.log('VR Capabilities:', this.capabilities);
    } catch (error) {
      console.warn('Capability detection failed:', error);
    }
  }

  isVRSupported() {
    return Object.values(this.supportedAPIs).some(supported => supported);
  }

  getCurrentAPI() {
    return this.currentAPI;
  }

  getCapabilities() {
    return { ...this.capabilities };
  }

  async requestVRSession(options = {}) {
    if (!this.isVRSupported()) {
      throw new Error('VR is not supported on this device');
    }

    switch (this.currentAPI) {
      case 'webxr':
        return await this.requestWebXRSession(options);
      case 'openxr':
        return await this.requestOpenXRSession(options);
      default:
        throw new Error('No VR API available');
    }
  }

  async requestWebXRSession(options = {}) {
    const sessionInit = {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['hand-tracking', 'bounded-floor'],
      ...options
    };

    try {
      const session = await navigator.xr.requestSession('immersive-vr', sessionInit);
      console.log('WebXR session started');
      return session;
    } catch (error) {
      console.error('Failed to start WebXR session:', error);
      throw error;
    }
  }

  async requestOpenXRSession(options = {}) {
    // OpenXR session would be handled by native bridge
    if (window.OpenXR && window.OpenXR.requestSession) {
      return await window.OpenXR.requestSession(options);
    }
    throw new Error('OpenXR not available');
  }

  // Polyfill for older browsers
  static installPolyfills() {
    // WebXR polyfill would go here
    if (!navigator.xr && window.WebXRPolyfill) {
      new window.WebXRPolyfill();
    }
  }
}
