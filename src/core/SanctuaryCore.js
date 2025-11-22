/**
 * Sanctuary Core
 * Central management system for the VR environment
 */

export class SanctuaryCore {
  constructor(config = {}) {
    this.config = {
      renderMode: config.renderMode || 'webxr',
      quality: config.quality || 'high',
      physics: config.physics !== false,
      audio: config.audio !== false,
      ...config
    };

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.vrSession = null;
    this.eventHandlers = new Map();
  }

  async init() {
    console.log('Initializing Sanctuary Core with config:', this.config);

    // Setup based on render mode
    switch (this.config.renderMode) {
      case 'webxr':
        await this.initWebXR();
        break;
      case 'aframe':
        await this.initAFrame();
        break;
      case 'threejs':
        await this.initThreeJS();
        break;
      default:
        await this.initWebXR();
    }

    this.setupEventListeners();
  }

  async initWebXR() {
    // WebXR initialization will be handled by the compatibility layer
    console.log('WebXR mode initialized');
  }

  async initAFrame() {
    // A-Frame scene will be managed through HTML
    console.log('A-Frame mode initialized');
  }

  async initThreeJS() {
    // Three.js initialization
    const THREE = await import('three');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    document.body.appendChild(this.renderer.domElement);

    console.log('Three.js mode initialized');
  }

  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', () => this.onResize());

    // Handle VR session events
    this.on('vrsessionstart', () => this.onVRSessionStart());
    this.on('vrsessionend', () => this.onVRSessionEnd());
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => handler(data));
    }
  }

  onResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  onVRSessionStart() {
    console.log('VR session started');
  }

  onVRSessionEnd() {
    console.log('VR session ended');
  }

  dispose() {
    // Clean up resources
    if (this.renderer) {
      this.renderer.dispose();
    }
    this.eventHandlers.clear();
  }
}
