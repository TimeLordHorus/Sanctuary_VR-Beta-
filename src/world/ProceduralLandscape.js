/**
 * Procedural Landscape Generator
 * Generates varied terrain with biomes, resources, and interactive elements
 */

export class ProceduralLandscape {
  constructor(core, scene) {
    this.core = core;
    this.scene = scene;

    // Configuration
    this.config = {
      seed: Math.random() * 10000,
      chunkSize: 20, // Size of each terrain chunk
      renderDistance: 3, // Number of chunks to render around player
      biomeSize: 50, // Size of biome regions
      noiseScale: 0.05, // Terrain variation scale
      heightScale: 10, // Maximum terrain height
      waterLevel: 2 // Water height
    };

    // Biome definitions
    this.biomes = {
      forest: {
        name: 'Forest',
        groundColor: '#4a6741',
        treeChance: 0.15,
        flowerChance: 0.25,
        rockChance: 0.05,
        waterChance: 0.02,
        resourceTypes: ['wood', 'fruit', 'flowers', 'herbs']
      },
      meadow: {
        name: 'Meadow',
        groundColor: '#7cb342',
        treeChance: 0.03,
        flowerChance: 0.4,
        rockChance: 0.08,
        waterChance: 0.05,
        resourceTypes: ['flowers', 'herbs', 'fruit', 'honey']
      },
      desert: {
        name: 'Desert',
        groundColor: '#d4b896',
        treeChance: 0.01,
        flowerChance: 0.05,
        rockChance: 0.2,
        waterChance: 0.001,
        resourceTypes: ['stone', 'crystal', 'cactus']
      },
      mountain: {
        name: 'Mountain',
        groundColor: '#8b8b8b',
        treeChance: 0.02,
        flowerChance: 0.05,
        rockChance: 0.4,
        waterChance: 0.01,
        resourceTypes: ['stone', 'crystal', 'ore', 'ice']
      },
      wetland: {
        name: 'Wetland',
        groundColor: '#6b8e6b',
        treeChance: 0.08,
        flowerChance: 0.3,
        rockChance: 0.05,
        waterChance: 0.3,
        resourceTypes: ['water', 'reeds', 'lily', 'fish']
      },
      sacred: {
        name: 'Sacred Grove',
        groundColor: '#b8d4a8',
        treeChance: 0.12,
        flowerChance: 0.35,
        rockChance: 0.03,
        waterChance: 0.1,
        resourceTypes: ['sacred_fruit', 'blessed_water', 'ancient_wood', 'divine_flowers']
      }
    };

    // Generated chunks
    this.chunks = new Map();
    this.generatedResources = [];

    // Noise function for procedural generation
    this.noise = this.createSimplexNoise(this.config.seed);
  }

  /**
   * Initialize landscape generator
   */
  async init() {
    console.log('[ProceduralLandscape] Initializing procedural landscape...');

    // Generate initial chunks around origin
    this.generateInitialChunks();

    // Set up player position tracking for chunk loading
    this.setupChunkStreaming();

    console.log('[ProceduralLandscape] Landscape initialized');
    return this;
  }

  /**
   * Generate initial chunks
   */
  generateInitialChunks() {
    const center = { x: 0, z: 0 };

    for (let x = -this.config.renderDistance; x <= this.config.renderDistance; x++) {
      for (let z = -this.config.renderDistance; z <= this.config.renderDistance; z++) {
        this.generateChunk(x, z);
      }
    }

    console.log(`[ProceduralLandscape] Generated ${this.chunks.size} initial chunks`);
  }

  /**
   * Generate a terrain chunk
   */
  generateChunk(chunkX, chunkZ) {
    const chunkKey = `${chunkX},${chunkZ}`;

    // Don't regenerate existing chunks
    if (this.chunks.has(chunkKey)) return;

    const chunk = document.createElement('a-entity');
    chunk.id = `chunk-${chunkKey}`;
    chunk.setAttribute('position', `${chunkX * this.config.chunkSize} 0 ${chunkZ * this.config.chunkSize}`);

    // Determine biome for this chunk
    const biome = this.getBiomeForChunk(chunkX, chunkZ);

    // Generate terrain
    this.generateTerrain(chunk, chunkX, chunkZ, biome);

    // Generate resources
    this.generateResources(chunk, chunkX, chunkZ, biome);

    // Add to scene
    this.scene.appendChild(chunk);
    this.chunks.set(chunkKey, { element: chunk, biome, x: chunkX, z: chunkZ });

    return chunk;
  }

  /**
   * Generate terrain mesh for chunk
   */
  generateTerrain(chunk, chunkX, chunkZ, biome) {
    const size = this.config.chunkSize;
    const resolution = 10; // Subdivisions

    // Create base plane
    const terrain = document.createElement('a-plane');
    terrain.setAttribute('width', size);
    terrain.setAttribute('height', size);
    terrain.setAttribute('rotation', '-90 0 0');
    terrain.setAttribute('position', `${size/2} 0 ${size/2}`);
    terrain.setAttribute('color', biome.groundColor);
    terrain.setAttribute('shadow', 'receive: true');
    terrain.className = 'terrain-ground';

    chunk.appendChild(terrain);

    // Add terrain variation with elevated/depressed areas
    for (let i = 0; i < 5; i++) {
      const localX = Math.random() * size;
      const localZ = Math.random() * size;
      const worldX = chunkX * size + localX;
      const worldZ = chunkZ * size + localZ;

      const height = this.getTerrainHeight(worldX, worldZ);

      if (height > 2) {
        // Create small hill
        this.createHill(chunk, localX, localZ, height, biome);
      }
    }
  }

  /**
   * Create a hill formation
   */
  createHill(chunk, x, z, height, biome) {
    const radius = 2 + Math.random() * 3;

    const hill = document.createElement('a-cone');
    hill.setAttribute('position', `${x} ${height/2} ${z}`);
    hill.setAttribute('radius-bottom', radius);
    hill.setAttribute('radius-top', radius * 0.3);
    hill.setAttribute('height', height);
    hill.setAttribute('color', this.adjustColor(biome.groundColor, -10));
    hill.setAttribute('shadow', 'cast: true; receive: true');

    chunk.appendChild(hill);
  }

  /**
   * Generate resources in chunk
   */
  generateResources(chunk, chunkX, chunkZ, biome) {
    const size = this.config.chunkSize;
    const attempts = 20; // Number of resource placement attempts

    for (let i = 0; i < attempts; i++) {
      const localX = Math.random() * size;
      const localZ = Math.random() * size;
      const worldX = chunkX * size + localX;
      const worldZ = chunkZ * size + localZ;

      const rand = Math.random();

      // Trees
      if (rand < biome.treeChance) {
        this.createTree(chunk, localX, localZ, biome);
      }
      // Flowers
      else if (rand < biome.treeChance + biome.flowerChance) {
        this.createFlowerPatch(chunk, localX, localZ, biome);
      }
      // Rocks
      else if (rand < biome.treeChance + biome.flowerChance + biome.rockChance) {
        this.createRock(chunk, localX, localZ, biome);
      }
      // Water
      else if (rand < biome.treeChance + biome.flowerChance + biome.rockChance + biome.waterChance) {
        this.createWaterSource(chunk, localX, localZ, biome);
      }
    }

    // Special biome-specific resources
    this.generateBiomeSpecificResources(chunk, chunkX, chunkZ, biome);
  }

  /**
   * Create a tree
   */
  createTree(chunk, x, z, biome) {
    const tree = document.createElement('a-entity');
    tree.className = 'resource interactive tree';
    tree.setAttribute('data-resource-type', 'wood');

    const height = 3 + Math.random() * 3;
    const trunkRadius = 0.2 + Math.random() * 0.1;

    // Trunk
    const trunk = document.createElement('a-cylinder');
    trunk.setAttribute('position', `${x} ${height/2} ${z}`);
    trunk.setAttribute('radius', trunkRadius);
    trunk.setAttribute('height', height);
    trunk.setAttribute('color', '#4a3728');
    trunk.setAttribute('shadow', 'cast: true');
    tree.appendChild(trunk);

    // Foliage
    const foliageRadius = 1 + Math.random() * 1;
    const foliage = document.createElement('a-sphere');
    foliage.setAttribute('position', `${x} ${height + foliageRadius * 0.5} ${z}`);
    foliage.setAttribute('radius', foliageRadius);
    foliage.setAttribute('color', biome.name === 'Sacred Grove' ? '#90ee90' : '#2d5016');
    foliage.setAttribute('shadow', 'cast: true');
    tree.appendChild(foliage);

    // Fruit if applicable
    if (biome.resourceTypes.includes('fruit') && Math.random() < 0.3) {
      for (let i = 0; i < 3; i++) {
        const fruitAngle = Math.random() * Math.PI * 2;
        const fruitDist = foliageRadius * 0.7;
        const fruitX = x + Math.cos(fruitAngle) * fruitDist;
        const fruitZ = z + Math.sin(fruitAngle) * fruitDist;

        const fruit = document.createElement('a-sphere');
        fruit.className = 'resource interactive fruit';
        fruit.setAttribute('data-resource-type', 'fruit');
        fruit.setAttribute('position', `${fruitX} ${height + Math.random() * foliageRadius} ${fruitZ}`);
        fruit.setAttribute('radius', '0.15');
        fruit.setAttribute('color', biome.name === 'Sacred Grove' ? '#ffd700' : '#ff6b6b');
        tree.appendChild(fruit);
      }
    }

    chunk.appendChild(tree);
    this.generatedResources.push({ type: 'tree', element: tree, biome: biome.name });
  }

  /**
   * Create flower patch
   */
  createFlowerPatch(chunk, x, z, biome) {
    const patchSize = 3 + Math.random() * 4;
    const flowerCount = Math.floor(patchSize);

    const patch = document.createElement('a-entity');
    patch.className = 'resource interactive flower-patch';
    patch.setAttribute('data-resource-type', 'flowers');

    const colors = biome.name === 'Sacred Grove'
      ? ['#ffd700', '#fff0f5', '#e6e6fa', '#ffe4e1']
      : ['#ff69b4', '#ff1493', '#ffc0cb', '#ffb6c1', '#fff0f5'];

    for (let i = 0; i < flowerCount; i++) {
      const offsetX = (Math.random() - 0.5) * 2;
      const offsetZ = (Math.random() - 0.5) * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Stem
      const stem = document.createElement('a-cylinder');
      stem.setAttribute('position', `${x + offsetX} 0.15 ${z + offsetZ}`);
      stem.setAttribute('radius', '0.02');
      stem.setAttribute('height', '0.3');
      stem.setAttribute('color', '#4caf50');
      patch.appendChild(stem);

      // Bloom
      const bloom = document.createElement('a-sphere');
      bloom.setAttribute('position', `${x + offsetX} 0.35 ${z + offsetZ}`);
      bloom.setAttribute('radius', '0.08');
      bloom.setAttribute('color', color);
      patch.appendChild(bloom);
    }

    chunk.appendChild(patch);
    this.generatedResources.push({ type: 'flowers', element: patch, biome: biome.name });
  }

  /**
   * Create rock
   */
  createRock(chunk, x, z, biome) {
    const rock = document.createElement('a-entity');
    rock.className = 'resource interactive rock';
    rock.setAttribute('data-resource-type', 'stone');

    const size = 0.5 + Math.random() * 1;
    const shape = Math.random() > 0.5 ? 'a-box' : 'a-dodecahedron';

    const rockMesh = document.createElement(shape);
    rockMesh.setAttribute('position', `${x} ${size/2} ${z}`);

    if (shape === 'a-box') {
      rockMesh.setAttribute('width', size);
      rockMesh.setAttribute('height', size * 0.8);
      rockMesh.setAttribute('depth', size * 0.9);
    } else {
      rockMesh.setAttribute('radius', size/2);
    }

    rockMesh.setAttribute('rotation', `${Math.random() * 30} ${Math.random() * 360} ${Math.random() * 30}`);
    rockMesh.setAttribute('color', biome.name === 'Mountain' ? '#9e9e9e' : '#7a6f5d');
    rockMesh.setAttribute('shadow', 'cast: true; receive: true');

    // Add crystal chance for mountains/sacred groves
    if ((biome.name === 'Mountain' || biome.name === 'Sacred Grove') && Math.random() < 0.3) {
      const crystal = document.createElement('a-cone');
      crystal.className = 'resource interactive crystal';
      crystal.setAttribute('data-resource-type', 'crystal');
      crystal.setAttribute('position', `${x} ${size + 0.3} ${z}`);
      crystal.setAttribute('radius-bottom', '0.15');
      crystal.setAttribute('radius-top', '0.05');
      crystal.setAttribute('height', '0.5');
      crystal.setAttribute('color', '#b19cd9');
      crystal.setAttribute('material', 'transparent: true; opacity: 0.8');
      crystal.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 4000; loop: true; easing: linear');
      rock.appendChild(crystal);
    }

    rock.appendChild(rockMesh);
    chunk.appendChild(rock);
    this.generatedResources.push({ type: 'stone', element: rock, biome: biome.name });
  }

  /**
   * Create water source
   */
  createWaterSource(chunk, x, z, biome) {
    const water = document.createElement('a-entity');
    water.className = 'resource interactive water-source';
    water.setAttribute('data-resource-type', 'water');

    const radius = 2 + Math.random() * 2;

    // Water surface
    const surface = document.createElement('a-circle');
    surface.setAttribute('position', `${x} ${this.config.waterLevel} ${z}`);
    surface.setAttribute('radius', radius);
    surface.setAttribute('rotation', '-90 0 0');
    surface.setAttribute('color', biome.name === 'Sacred Grove' ? '#87ceeb' : '#4fc3f7');
    surface.setAttribute('material', 'transparent: true; opacity: 0.7');
    surface.setAttribute('animation', 'property: material.opacity; to: 0.5; dir: alternate; dur: 2000; loop: true; easing: easeInOutSine');
    water.appendChild(surface);

    // Water depth
    const depth = document.createElement('a-cylinder');
    depth.setAttribute('position', `${x} ${this.config.waterLevel/2} ${z}`);
    depth.setAttribute('radius', radius);
    depth.setAttribute('height', this.config.waterLevel);
    depth.setAttribute('color', '#1976d2');
    depth.setAttribute('material', 'transparent: true; opacity: 0.5');
    water.appendChild(depth);

    // Lily pads for wetland
    if (biome.name === 'Wetland' && Math.random() < 0.7) {
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius * 0.8;
        const lilyX = x + Math.cos(angle) * dist;
        const lilyZ = z + Math.sin(angle) * dist;

        const lily = document.createElement('a-circle');
        lily.className = 'resource interactive lily';
        lily.setAttribute('data-resource-type', 'lily');
        lily.setAttribute('position', `${lilyX} ${this.config.waterLevel + 0.05} ${lilyZ}`);
        lily.setAttribute('radius', '0.3');
        lily.setAttribute('rotation', '-90 0 0');
        lily.setAttribute('color', '#90ee90');
        water.appendChild(lily);

        // Flower on lily
        const lilyFlower = document.createElement('a-sphere');
        lilyFlower.setAttribute('position', `${lilyX} ${this.config.waterLevel + 0.1} ${lilyZ}`);
        lilyFlower.setAttribute('radius', '0.1');
        lilyFlower.setAttribute('color', '#ffc0cb');
        water.appendChild(lilyFlower);
      }
    }

    chunk.appendChild(water);
    this.generatedResources.push({ type: 'water', element: water, biome: biome.name });
  }

  /**
   * Generate biome-specific special resources
   */
  generateBiomeSpecificResources(chunk, chunkX, chunkZ, biome) {
    const size = this.config.chunkSize;

    switch (biome.name) {
      case 'Sacred Grove':
        // Ancient shrine
        if (Math.random() < 0.1) {
          this.createAncientShrine(chunk, size/2, size/2);
        }
        break;

      case 'Desert':
        // Cactus
        if (Math.random() < 0.3) {
          this.createCactus(chunk, Math.random() * size, Math.random() * size);
        }
        break;

      case 'Wetland':
        // Reeds
        for (let i = 0; i < 5; i++) {
          this.createReeds(chunk, Math.random() * size, Math.random() * size);
        }
        break;

      case 'Mountain':
        // Ore veins
        if (Math.random() < 0.2) {
          this.createOreVein(chunk, Math.random() * size, Math.random() * size);
        }
        break;
    }
  }

  /**
   * Create ancient shrine
   */
  createAncientShrine(chunk, x, z) {
    const shrine = document.createElement('a-entity');
    shrine.className = 'interactive puzzle shrine';
    shrine.setAttribute('data-puzzle-type', 'shrine');

    // Base
    const base = document.createElement('a-cylinder');
    base.setAttribute('position', `${x} 0.2 ${z}`);
    base.setAttribute('radius', '1.5');
    base.setAttribute('height', '0.4');
    base.setAttribute('color', '#d4c4a8');
    shrine.appendChild(base);

    // Pillar
    const pillar = document.createElement('a-cylinder');
    pillar.setAttribute('position', `${x} 1.5 ${z}`);
    pillar.setAttribute('radius', '0.3');
    pillar.setAttribute('height', '3');
    pillar.setAttribute('color', '#e8dcc8');
    shrine.appendChild(pillar);

    // Glowing orb on top
    const orb = document.createElement('a-sphere');
    orb.setAttribute('position', `${x} 3.2 ${z}`);
    orb.setAttribute('radius', '0.4');
    orb.setAttribute('color', '#ffd700');
    orb.setAttribute('material', 'emissive: #ffd700; emissiveIntensity: 0.5');
    orb.setAttribute('animation', 'property: position; to: ${x} 3.5 ${z}; dir: alternate; dur: 2000; loop: true; easing: easeInOutSine');
    shrine.appendChild(orb);

    chunk.appendChild(shrine);
  }

  /**
   * Create cactus
   */
  createCactus(chunk, x, z) {
    const cactus = document.createElement('a-entity');
    cactus.className = 'resource interactive cactus';
    cactus.setAttribute('data-resource-type', 'cactus');

    const height = 1.5 + Math.random();

    const body = document.createElement('a-cylinder');
    body.setAttribute('position', `${x} ${height/2} ${z}`);
    body.setAttribute('radius', '0.2');
    body.setAttribute('height', height);
    body.setAttribute('color', '#4a7c59');
    cactus.appendChild(body);

    // Arms
    for (let i = 0; i < 2; i++) {
      const armHeight = height * (0.4 + Math.random() * 0.3);
      const armLength = 0.5 + Math.random() * 0.3;
      const side = i === 0 ? 1 : -1;

      const arm = document.createElement('a-cylinder');
      arm.setAttribute('position', `${x + side * armLength/2} ${armHeight} ${z}`);
      arm.setAttribute('radius', '0.15');
      arm.setAttribute('height', armLength);
      arm.setAttribute('rotation', `0 0 ${side * 90}`);
      arm.setAttribute('color', '#4a7c59');
      cactus.appendChild(arm);
    }

    chunk.appendChild(cactus);
  }

  /**
   * Create reeds
   */
  createReeds(chunk, x, z) {
    const reeds = document.createElement('a-entity');
    reeds.className = 'resource interactive reeds';
    reeds.setAttribute('data-resource-type', 'reeds');

    for (let i = 0; i < 5; i++) {
      const offsetX = (Math.random() - 0.5) * 0.5;
      const offsetZ = (Math.random() - 0.5) * 0.5;
      const height = 1 + Math.random() * 0.5;

      const reed = document.createElement('a-cylinder');
      reed.setAttribute('position', `${x + offsetX} ${height/2} ${z + offsetZ}`);
      reed.setAttribute('radius', '0.03');
      reed.setAttribute('height', height);
      reed.setAttribute('color', '#6b8e23');
      reeds.appendChild(reed);
    }

    chunk.appendChild(reeds);
  }

  /**
   * Create ore vein
   */
  createOreVein(chunk, x, z) {
    const ore = document.createElement('a-entity');
    ore.className = 'resource interactive ore';
    ore.setAttribute('data-resource-type', 'ore');

    const oreCount = 3 + Math.floor(Math.random() * 4);

    for (let i = 0; i < oreCount; i++) {
      const offsetX = (Math.random() - 0.5);
      const offsetZ = (Math.random() - 0.5);

      const nugget = document.createElement('a-dodecahedron');
      nugget.setAttribute('position', `${x + offsetX} ${0.3 + Math.random() * 0.3} ${z + offsetZ}`);
      nugget.setAttribute('radius', '0.2');
      nugget.setAttribute('color', '#b87333');
      nugget.setAttribute('material', 'metalness: 0.8; roughness: 0.2');
      ore.appendChild(nugget);
    }

    chunk.appendChild(ore);
  }

  /**
   * Get biome for chunk position
   */
  getBiomeForChunk(chunkX, chunkZ) {
    const x = chunkX * this.config.biomeSize;
    const z = chunkZ * this.config.biomeSize;

    // Use noise to determine biome
    const biomeNoise = this.noise(x * 0.01, z * 0.01);
    const moistureNoise = this.noise(x * 0.015 + 100, z * 0.015 + 100);
    const temperatureNoise = this.noise(x * 0.02 + 200, z * 0.02 + 200);

    // Sacred groves are rare
    if (biomeNoise > 0.8 && moistureNoise > 0.7) {
      return this.biomes.sacred;
    }

    // Mountain
    if (biomeNoise > 0.6) {
      return this.biomes.mountain;
    }

    // Desert
    if (moistureNoise < -0.4 && temperatureNoise > 0.3) {
      return this.biomes.desert;
    }

    // Wetland
    if (moistureNoise > 0.5) {
      return this.biomes.wetland;
    }

    // Forest
    if (moistureNoise > 0 && temperatureNoise < 0.3) {
      return this.biomes.forest;
    }

    // Default to meadow
    return this.biomes.meadow;
  }

  /**
   * Get terrain height at world position
   */
  getTerrainHeight(x, z) {
    const noise1 = this.noise(x * this.config.noiseScale, z * this.config.noiseScale);
    const noise2 = this.noise(x * this.config.noiseScale * 2, z * this.config.noiseScale * 2) * 0.5;

    return (noise1 + noise2) * this.config.heightScale;
  }

  /**
   * Set up chunk streaming based on player position
   */
  setupChunkStreaming() {
    const camera = document.querySelector('[camera]');
    if (!camera) return;

    // Update chunks every 2 seconds
    setInterval(() => {
      const pos = camera.object3D.position;
      const chunkX = Math.floor(pos.x / this.config.chunkSize);
      const chunkZ = Math.floor(pos.z / this.config.chunkSize);

      // Generate nearby chunks
      for (let x = chunkX - this.config.renderDistance; x <= chunkX + this.config.renderDistance; x++) {
        for (let z = chunkZ - this.config.renderDistance; z <= chunkZ + this.config.renderDistance; z++) {
          this.generateChunk(x, z);
        }
      }

      // Unload distant chunks to save performance
      this.unloadDistantChunks(chunkX, chunkZ);
    }, 2000);
  }

  /**
   * Unload chunks that are too far away
   */
  unloadDistantChunks(centerX, centerZ) {
    const unloadDistance = this.config.renderDistance + 2;

    for (const [key, chunk] of this.chunks.entries()) {
      const distance = Math.sqrt(
        Math.pow(chunk.x - centerX, 2) +
        Math.pow(chunk.z - centerZ, 2)
      );

      if (distance > unloadDistance) {
        chunk.element.remove();
        this.chunks.delete(key);
      }
    }
  }

  /**
   * Simple noise function (Simplex-like)
   */
  createSimplexNoise(seed) {
    // Simplified noise for procedural generation
    return (x, y) => {
      x += seed;
      y += seed;

      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return (n - Math.floor(n)) * 2 - 1; // Returns -1 to 1
    };
  }

  /**
   * Adjust color brightness
   */
  adjustColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  /**
   * Get all resources of a type
   */
  getResourcesByType(type) {
    return this.generatedResources.filter(r => r.type === type);
  }

  /**
   * Get current biome at position
   */
  getBiomeAtPosition(x, z) {
    const chunkX = Math.floor(x / this.config.chunkSize);
    const chunkZ = Math.floor(z / this.config.chunkSize);
    return this.getBiomeForChunk(chunkX, chunkZ);
  }

  /**
   * Destroy landscape
   */
  destroy() {
    for (const [key, chunk] of this.chunks.entries()) {
      chunk.element.remove();
    }
    this.chunks.clear();
    this.generatedResources = [];
  }
}
