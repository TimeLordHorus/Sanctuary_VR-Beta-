/**
 * Scene Manager
 * Manages VR scene loading, transitions, and interactions
 */

import { mallScenes } from './MallScenes.js';

export class SceneManager {
  constructor(core) {
    this.core = core;
    this.currentScene = null;
    this.scenes = new Map();
    this.transitionInProgress = false;
  }

  async loadScene(sceneId) {
    if (this.transitionInProgress) {
      console.warn('Scene transition already in progress');
      return;
    }

    console.log(`Loading scene: ${sceneId}`);
    this.transitionInProgress = true;

    try {
      // Unload current scene if exists
      if (this.currentScene) {
        await this.unloadCurrentScene();
      }

      // Load new scene
      const scene = await this.createScene(sceneId);
      this.scenes.set(sceneId, scene);
      this.currentScene = sceneId;

      // Initialize scene
      await this.initializeScene(scene);

      console.log(`Scene ${sceneId} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load scene ${sceneId}:`, error);
      throw error;
    } finally {
      this.transitionInProgress = false;
    }
  }

  async createScene(sceneId) {
    const sceneConfigs = {
      'entrance': {
        id: 'entrance',
        name: 'Sanctuary Entrance',
        description: 'The entrance hall of the sanctuary',
        camera: {
          position: [0, 1.6, 0],
          rotation: [0, 0, 0]
        },
        teleportPoints: [
          { id: 'spawn', position: [0, 0, 0], label: 'Spawn Point' },
          { id: 'altar', position: [0, 0, -10], label: 'Altar' },
          { id: 'meditation', position: [5, 0, -5], label: 'Meditation Area' },
          { id: 'mall-portal', position: [-5, 0, -5], label: 'Virtual Mall Portal' }
        ],
        interactables: [
          {
            id: 'door-main',
            type: 'door',
            position: [0, 0, -15],
            action: 'loadScene',
            target: 'main-hall'
          },
          {
            id: 'meditation-cushion',
            type: 'seat',
            position: [5, 0, -5],
            action: 'sit'
          },
          {
            id: 'mall-portal',
            type: 'portal',
            position: [-5, 0, -5],
            action: 'loadScene',
            target: 'mall-entrance',
            label: 'Enter Virtual Mall'
          }
        ]
      },
      'main-hall': {
        id: 'main-hall',
        name: 'Main Hall',
        description: 'The main sanctuary hall',
        camera: {
          position: [0, 1.6, 5],
          rotation: [0, 0, 0]
        },
        teleportPoints: [
          { id: 'center', position: [0, 0, 0], label: 'Center' },
          { id: 'exit', position: [0, 0, 10], label: 'Exit' }
        ]
      },
      // Merge in mall scenes
      ...mallScenes
    };

    return sceneConfigs[sceneId] || sceneConfigs['entrance'];
  }

  async initializeScene(scene) {
    // Setup camera
    if (scene.camera) {
      this.setupCamera(scene.camera);
    }

    // Setup teleport points
    if (scene.teleportPoints) {
      this.setupTeleportPoints(scene.teleportPoints);
    }

    // Setup interactables
    if (scene.interactables) {
      this.setupInteractables(scene.interactables);
    }
  }

  setupCamera(cameraConfig) {
    console.log('Setting up camera:', cameraConfig);
    // Camera setup would be implemented here based on the render mode
  }

  setupTeleportPoints(teleportPoints) {
    console.log('Setting up teleport points:', teleportPoints.length);
    // Teleport point setup would be implemented here
  }

  setupInteractables(interactables) {
    console.log('Setting up interactables:', interactables.length);
    // Interactable setup would be implemented here
  }

  async unloadCurrentScene() {
    if (!this.currentScene) return;

    console.log(`Unloading scene: ${this.currentScene}`);
    const scene = this.scenes.get(this.currentScene);

    if (scene && scene.cleanup) {
      await scene.cleanup();
    }
  }

  enterVR() {
    console.log('Entering VR mode');
    this.core.emit('vrsessionstart');
  }

  exitVR() {
    console.log('Exiting VR mode');
    this.core.emit('vrsessionend');
  }

  getCurrentScene() {
    return this.scenes.get(this.currentScene);
  }

  dispose() {
    this.scenes.forEach(scene => {
      if (scene.cleanup) scene.cleanup();
    });
    this.scenes.clear();
    this.currentScene = null;
  }
}
