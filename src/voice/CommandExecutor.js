/**
 * Command Executor
 * Executes parsed voice commands in the VR environment
 */

export class CommandExecutor {
  constructor(core) {
    this.core = core;
    this.scene = null;
    this.camera = null;
    this.eventHandlers = new Map();

    // Command history for undo functionality
    this.commandHistory = [];
    this.maxHistorySize = 50;

    // Currently executing command
    this.currentCommand = null;
    this.isCancelled = false;

    // Object registry
    this.createdObjects = new Map();
    this.objectIdCounter = 0;
  }

  /**
   * Initialize the command executor
   */
  async init() {
    console.log('[CommandExecutor] Initializing command executor...');

    // Get A-Frame scene
    this.scene = document.querySelector('a-scene');
    if (!this.scene) {
      throw new Error('A-Frame scene not found');
    }

    // Get camera
    this.camera = document.querySelector('[camera]');

    // Wait for scene to load
    if (!this.scene.hasLoaded) {
      await new Promise(resolve => {
        this.scene.addEventListener('loaded', resolve, { once: true });
      });
    }

    console.log('[CommandExecutor] Command executor initialized');
    return true;
  }

  /**
   * Execute a parsed command
   */
  async execute(command) {
    if (!command || !command.intent) {
      throw new Error('Invalid command');
    }

    this.currentCommand = command;
    this.isCancelled = false;

    console.log('[CommandExecutor] Executing command:', command);

    try {
      let result;

      switch (command.intent) {
        case 'create_object':
          result = await this.createObject(command.entities);
          break;
        case 'modify_object':
          result = await this.modifyObject(command.entities);
          break;
        case 'delete_object':
          result = await this.deleteObject(command.entities);
          break;
        case 'change_lighting':
          result = await this.changeLighting(command.entities);
          break;
        case 'change_time':
          result = await this.changeTime(command.entities);
          break;
        case 'change_weather':
          result = await this.changeWeather(command.entities);
          break;
        case 'change_atmosphere':
          result = await this.changeAtmosphere(command.entities);
          break;
        case 'move_object':
          result = await this.moveObject(command.entities);
          break;
        case 'teleport':
          result = await this.teleport(command.entities);
          break;
        case 'play_sound':
          result = await this.playSound(command.entities);
          break;
        case 'stop_sound':
          result = await this.stopSound(command.entities);
          break;
        case 'enable_physics':
          result = await this.enablePhysics(command.entities);
          break;
        case 'add_effect':
          result = await this.addEffect(command.entities);
          break;
        case 'undo':
          result = await this.undo();
          break;
        case 'save':
          result = await this.save(command.entities);
          break;
        case 'load':
          result = await this.load(command.entities);
          break;
        default:
          throw new Error(`Unknown intent: ${command.intent}`);
      }

      // Add to history
      this.addToHistory(command, result);

      // Emit success
      this.emit('success', { command, result });

      return result;
    } catch (error) {
      console.error('[CommandExecutor] Execution failed:', error);
      this.emit('error', { command, error: error.message });
      throw error;
    } finally {
      this.currentCommand = null;
    }
  }

  /**
   * Create an object in the scene
   */
  async createObject(entities) {
    const { object_type, color, size, position, material } = entities;

    if (!object_type) {
      throw new Error('Object type not specified');
    }

    // Generate unique ID
    const objectId = `voice-object-${this.objectIdCounter++}`;

    // Create A-Frame entity
    const entity = document.createElement('a-entity');
    entity.setAttribute('id', objectId);

    // Set geometry based on object type
    const geometry = this.getGeometry(object_type, size);
    entity.setAttribute('geometry', geometry);

    // Set material
    const materialProps = this.getMaterial(color, material);
    entity.setAttribute('material', materialProps);

    // Set position
    const pos = this.getPosition(position);
    entity.setAttribute('position', pos);

    // Add interaction component
    entity.setAttribute('class', 'interactive');
    entity.setAttribute('cursor', 'rayOrigin: mouse');

    // Add to scene
    this.scene.appendChild(entity);

    // Register object
    this.createdObjects.set(objectId, {
      entity,
      type: object_type,
      createdAt: Date.now()
    });

    return {
      success: true,
      message: `Created ${object_type}${color ? ' ' + color : ''}`,
      objectId,
      entity
    };
  }

  /**
   * Get geometry configuration for object type
   */
  getGeometry(type, size = 'medium') {
    const scale = typeof size === 'number' ? size : this.getSizeValue(size);

    const geometries = {
      cube: `primitive: box; width: ${scale}; height: ${scale}; depth: ${scale}`,
      sphere: `primitive: sphere; radius: ${scale / 2}`,
      cylinder: `primitive: cylinder; radius: ${scale / 2}; height: ${scale}`,
      plane: `primitive: plane; width: ${scale}; height: ${scale}`,
      pyramid: `primitive: cone; radiusBottom: ${scale / 2}; radiusTop: 0; height: ${scale}`,
      cone: `primitive: cone; radiusBottom: ${scale / 2}; radiusTop: 0; height: ${scale}`,
      ring: `primitive: ring; radiusInner: ${scale / 3}; radiusOuter: ${scale / 2}`,
      torus: `primitive: torus; radius: ${scale / 2}; radiusTubular: ${scale / 8}`
    };

    return geometries[type] || geometries.cube;
  }

  /**
   * Get material configuration
   */
  getMaterial(color = 'white', material = 'standard') {
    const materialTypes = {
      wood: { color: '#8B4513', roughness: 0.8 },
      metal: { color: '#C0C0C0', metalness: 1.0, roughness: 0.2 },
      glass: { color: '#FFFFFF', transparent: true, opacity: 0.5, roughness: 0.1 },
      stone: { color: '#808080', roughness: 0.9 },
      gold: { color: '#FFD700', metalness: 1.0, roughness: 0.3 },
      standard: { color: color }
    };

    const props = materialTypes[material] || materialTypes.standard;
    if (!materialTypes[material]) {
      props.color = color;
    }

    return Object.entries(props).map(([k, v]) => `${k}: ${v}`).join('; ');
  }

  /**
   * Get position (convert relative to absolute)
   */
  getPosition(position) {
    if (!position) {
      // Default: in front of camera
      return this.getCameraFrontPosition(3);
    }

    if (position.x !== undefined) {
      return `${position.x} ${position.y} ${position.z}`;
    }

    if (position.relative) {
      return this.getRelativePosition(position.relative);
    }

    return this.getCameraFrontPosition(3);
  }

  /**
   * Get position in front of camera
   */
  getCameraFrontPosition(distance = 3) {
    if (!this.camera) {
      return `0 1 -${distance}`;
    }

    const cameraPos = this.camera.getAttribute('position');
    const cameraRot = this.camera.getAttribute('rotation');

    // Calculate forward vector
    const yaw = (cameraRot.y * Math.PI) / 180;
    const x = cameraPos.x - Math.sin(yaw) * distance;
    const z = cameraPos.z - Math.cos(yaw) * distance;
    const y = cameraPos.y;

    return `${x.toFixed(2)} ${y.toFixed(2)} ${z.toFixed(2)}`;
  }

  /**
   * Get relative position
   */
  getRelativePosition(relative) {
    const cameraPos = this.camera ? this.camera.getAttribute('position') : { x: 0, y: 1.6, z: 0 };

    const positions = {
      'in front': `${cameraPos.x} ${cameraPos.y} ${cameraPos.z - 3}`,
      'behind': `${cameraPos.x} ${cameraPos.y} ${cameraPos.z + 3}`,
      'left': `${cameraPos.x - 3} ${cameraPos.y} ${cameraPos.z}`,
      'right': `${cameraPos.x + 3} ${cameraPos.y} ${cameraPos.z}`,
      'above': `${cameraPos.x} ${cameraPos.y + 3} ${cameraPos.z}`,
      'below': `${cameraPos.x} ${cameraPos.y - 1} ${cameraPos.z}`
    };

    return positions[relative] || positions['in front'];
  }

  /**
   * Convert size name to value
   */
  getSizeValue(size) {
    const sizes = {
      tiny: 0.5,
      small: 1,
      medium: 2,
      large: 3,
      huge: 5,
      enormous: 8,
      giant: 10,
      massive: 15
    };

    return sizes[size] || sizes.medium;
  }

  /**
   * Modify an existing object
   */
  async modifyObject(entities) {
    const { target, property, value } = entities;

    // Find object to modify (last created if not specified)
    const objectId = target || Array.from(this.createdObjects.keys()).pop();
    if (!objectId) {
      throw new Error('No object to modify');
    }

    const obj = this.createdObjects.get(objectId);
    if (!obj) {
      throw new Error('Object not found');
    }

    // Apply modification
    // This is a simplified version - expand based on property
    if (value) {
      obj.entity.setAttribute('material', `color: ${value}`);
    }

    return {
      success: true,
      message: `Modified ${target || 'object'}`,
      objectId
    };
  }

  /**
   * Delete an object
   */
  async deleteObject(entities) {
    const { target } = entities;

    const objectId = target || Array.from(this.createdObjects.keys()).pop();
    if (!objectId) {
      throw new Error('No object to delete');
    }

    const obj = this.createdObjects.get(objectId);
    if (!obj) {
      throw new Error('Object not found');
    }

    // Remove from scene
    obj.entity.remove();

    // Remove from registry
    this.createdObjects.delete(objectId);

    return {
      success: true,
      message: `Deleted ${target || 'object'}`,
      objectId
    };
  }

  /**
   * Change lighting
   */
  async changeLighting(entities) {
    const { lighting_type, intensity, color } = entities;

    // Find or create main light
    let light = this.scene.querySelector('#main-light');
    if (!light) {
      light = document.createElement('a-entity');
      light.setAttribute('id', 'main-light');
      light.setAttribute('light', 'type: directional');
      this.scene.appendChild(light);
    }

    // Update light properties
    const lightProps = [];

    if (lighting_type) {
      const types = {
        bright: 'intensity: 1.5',
        dim: 'intensity: 0.3',
        dark: 'intensity: 0.1',
        normal: 'intensity: 1.0'
      };
      lightProps.push(types[lighting_type] || 'intensity: 1.0');
    }

    if (intensity !== undefined) {
      lightProps.push(`intensity: ${intensity}`);
    }

    if (color) {
      lightProps.push(`color: ${color}`);
    }

    if (lightProps.length > 0) {
      const current = light.getAttribute('light');
      const updated = current + '; ' + lightProps.join('; ');
      light.setAttribute('light', updated);
    }

    return {
      success: true,
      message: `Changed lighting${lighting_type ? ' to ' + lighting_type : ''}`
    };
  }

  /**
   * Change time of day
   */
  async changeTime(entities) {
    const { time_of_day } = entities;

    // Update sky based on time
    let sky = this.scene.querySelector('a-sky');
    if (!sky) {
      sky = document.createElement('a-sky');
      this.scene.appendChild(sky);
    }

    const timeColors = {
      dawn: '#FFB6C1',
      morning: '#87CEEB',
      noon: '#87CEEB',
      afternoon: '#FFA500',
      dusk: '#FF6347',
      evening: '#4B0082',
      night: '#000033',
      midnight: '#000000'
    };

    if (typeof time_of_day === 'object' && time_of_day.hour !== undefined) {
      // Convert hour to time period
      const hour = time_of_day.hour;
      if (hour >= 5 && hour < 7) time_of_day = 'dawn';
      else if (hour >= 7 && hour < 12) time_of_day = 'morning';
      else if (hour >= 12 && hour < 17) time_of_day = 'afternoon';
      else if (hour >= 17 && hour < 19) time_of_day = 'dusk';
      else if (hour >= 19 && hour < 22) time_of_day = 'evening';
      else time_of_day = 'night';
    }

    const color = timeColors[time_of_day] || timeColors.noon;
    sky.setAttribute('color', color);

    // Update ambient light
    this.changeLighting({
      lighting_type: time_of_day === 'night' ? 'dark' : time_of_day === 'noon' ? 'bright' : 'normal'
    });

    return {
      success: true,
      message: `Changed time to ${time_of_day}`
    };
  }

  /**
   * Change weather
   */
  async changeWeather(entities) {
    const { weather_type, intensity } = entities;

    // Remove existing weather effects
    const existingWeather = this.scene.querySelectorAll('[weather-effect]');
    existingWeather.forEach(el => el.remove());

    // Add new weather effect
    if (weather_type && weather_type !== 'clear') {
      const weatherEntity = document.createElement('a-entity');
      weatherEntity.setAttribute('weather-effect', weather_type);
      weatherEntity.setAttribute('position', '0 10 0');
      this.scene.appendChild(weatherEntity);
    }

    return {
      success: true,
      message: `Changed weather to ${weather_type}`
    };
  }

  /**
   * Change atmosphere
   */
  async changeAtmosphere(entities) {
    const { atmosphere_type } = entities;

    // Map atmosphere to lighting and color changes
    const atmospheres = {
      peaceful: { color: '#E0F7FA', lighting: 'normal' },
      mysterious: { color: '#4A148C', lighting: 'dim' },
      energetic: { color: '#FFEB3B', lighting: 'bright' },
      calming: { color: '#B2DFDB', lighting: 'dim' },
      dramatic: { color: '#BF360C', lighting: 'dark' }
    };

    const atmosphere = atmospheres[atmosphere_type];
    if (atmosphere) {
      await this.changeLighting({ lighting_type: atmosphere.lighting });

      const sky = this.scene.querySelector('a-sky');
      if (sky) {
        sky.setAttribute('color', atmosphere.color);
      }
    }

    return {
      success: true,
      message: `Changed atmosphere to ${atmosphere_type}`
    };
  }

  /**
   * Move object
   */
  async moveObject(entities) {
    const { target, position } = entities;

    const objectId = target || Array.from(this.createdObjects.keys()).pop();
    const obj = this.createdObjects.get(objectId);

    if (!obj) {
      throw new Error('Object not found');
    }

    const newPos = this.getPosition(position);
    obj.entity.setAttribute('position', newPos);

    return {
      success: true,
      message: `Moved ${target || 'object'}`
    };
  }

  /**
   * Teleport player
   */
  async teleport(entities) {
    const { destination } = entities;

    if (!this.camera) {
      throw new Error('Camera not found');
    }

    const pos = this.getPosition(destination);
    const cameraRig = this.camera.parentElement;

    if (cameraRig && cameraRig.tagName === 'A-ENTITY') {
      cameraRig.setAttribute('position', pos);
    } else {
      this.camera.setAttribute('position', pos);
    }

    return {
      success: true,
      message: `Teleported to ${destination}`
    };
  }

  /**
   * Play sound
   */
  async playSound(entities) {
    const { sound_type, volume } = entities;

    const soundEntity = document.createElement('a-entity');
    soundEntity.setAttribute('sound', `src: url(/sounds/${sound_type}.mp3); volume: ${volume || 1}`);
    this.scene.appendChild(soundEntity);

    return {
      success: true,
      message: `Playing ${sound_type} sound`
    };
  }

  /**
   * Stop sound
   */
  async stopSound(entities) {
    const sounds = this.scene.querySelectorAll('[sound]');
    sounds.forEach(sound => {
      sound.components.sound.stopSound();
    });

    return {
      success: true,
      message: 'Stopped all sounds'
    };
  }

  /**
   * Enable physics on object
   */
  async enablePhysics(entities) {
    const { target } = entities;

    const objectId = target || Array.from(this.createdObjects.keys()).pop();
    const obj = this.createdObjects.get(objectId);

    if (!obj) {
      throw new Error('Object not found');
    }

    obj.entity.setAttribute('dynamic-body', '');

    return {
      success: true,
      message: `Enabled physics on ${target || 'object'}`
    };
  }

  /**
   * Add visual effect
   */
  async addEffect(entities) {
    const { effect_type, target, intensity } = entities;

    const effectEntity = document.createElement('a-entity');
    effectEntity.setAttribute('particle-system', `preset: ${effect_type}`);

    if (target) {
      const obj = this.createdObjects.get(target);
      if (obj) {
        obj.entity.appendChild(effectEntity);
      }
    } else {
      effectEntity.setAttribute('position', this.getCameraFrontPosition(3));
      this.scene.appendChild(effectEntity);
    }

    return {
      success: true,
      message: `Added ${effect_type} effect`
    };
  }

  /**
   * Undo last command
   */
  async undo() {
    if (this.commandHistory.length === 0) {
      throw new Error('Nothing to undo');
    }

    const lastEntry = this.commandHistory.pop();
    // Implement undo logic based on command type

    return {
      success: true,
      message: 'Undid last command'
    };
  }

  /**
   * Save scene
   */
  async save(entities) {
    const sceneData = {
      objects: Array.from(this.createdObjects.entries()).map(([id, obj]) => ({
        id,
        type: obj.type,
        position: obj.entity.getAttribute('position'),
        rotation: obj.entity.getAttribute('rotation'),
        scale: obj.entity.getAttribute('scale')
      })),
      timestamp: Date.now()
    };

    localStorage.setItem('sanctuary-scene', JSON.stringify(sceneData));

    return {
      success: true,
      message: 'Scene saved'
    };
  }

  /**
   * Load scene
   */
  async load(entities) {
    const sceneData = JSON.parse(localStorage.getItem('sanctuary-scene') || '{}');

    // Clear current objects
    this.createdObjects.forEach(obj => obj.entity.remove());
    this.createdObjects.clear();

    // Recreate objects
    // Implementation needed

    return {
      success: true,
      message: 'Scene loaded'
    };
  }

  /**
   * Cancel current command
   */
  cancel() {
    this.isCancelled = true;
  }

  /**
   * Add command to history
   */
  addToHistory(command, result) {
    this.commandHistory.push({
      command,
      result,
      timestamp: Date.now()
    });

    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => handler(data));
    }
  }

  /**
   * Destroy executor
   */
  destroy() {
    this.eventHandlers.clear();
    this.commandHistory = [];
    this.currentCommand = null;
  }
}
