/**
 * MallScenes - Scene configurations for the Virtual Dead Mall
 * A nostalgic yet futuristic shopping experience
 */
export const mallScenes = {
    'mall-entrance': {
        id: 'mall-entrance',
        name: 'Dead Mall - Main Entrance',
        description: 'The grand entrance to the abandoned mall of the future. Neon lights flicker with ghostly memories.',
        camera: {
            position: [0, 1.6, 8],
            rotation: [0, 0, 0]
        },
        environment: {
            preset: 'default',
            lighting: 'dim',
            fog: {
                type: 'linear',
                color: '#9966ff',
                near: 10,
                far: 50
            },
            ambient: {
                color: '#4a148c',
                intensity: 0.4
            }
        },
        teleportPoints: [
            { id: 'entrance-spawn', position: [0, 0, 8], label: 'Mall Entrance' },
            { id: 'fountain', position: [0, 0, 0], label: 'Central Fountain' },
            { id: 'directory', position: [-5, 0, 2], label: 'Mall Directory' },
            { id: 'atrium', position: [0, 0, -8], label: 'Atrium View' }
        ],
        interactables: [
            {
                id: 'mall-directory',
                type: 'display',
                position: [-5, 1.5, 2],
                action: 'openMallDirectory',
                target: 'directory_ui',
                model: '/models/mall/directory_kiosk.glb'
            },
            {
                id: 'fountain',
                type: 'decoration',
                position: [0, 0, 0],
                model: '/models/mall/fountain_center.glb',
                description: 'An ornate fountain, still running after all these years'
            },
            {
                id: 'door-neon-soul',
                type: 'door',
                position: [-8, 0, -8],
                action: 'loadScene',
                target: 'store-neon-soul',
                label: 'Neon Soul - Cyberpunk Fashion'
            },
            {
                id: 'door-phantom-threads',
                type: 'door',
                position: [8, 0, -8],
                action: 'loadScene',
                target: 'store-phantom-threads',
                label: 'Phantom Threads - Vintage Revival'
            },
            {
                id: 'door-pixel-couture',
                type: 'door',
                position: [0, 0, -15],
                action: 'loadScene',
                target: 'store-pixel-couture',
                label: 'Pixel Couture - Luxury Digital'
            },
            {
                id: 'elevator-to-sanctuary',
                type: 'teleporter',
                position: [10, 0, 8],
                action: 'loadScene',
                target: 'entrance',
                label: 'Return to Sanctuary',
                model: '/models/mall/elevator.glb'
            }
        ],
        objects: [
            {
                type: 'text',
                position: [0, 4, -2],
                value: 'VIRTUAL MALL\nOf The Future',
                scale: [2, 2, 2],
                color: '#00ffff',
                shader: 'neon'
            },
            {
                type: 'model',
                position: [-3, 0, 5],
                model: '/models/mall/plant_dead.glb',
                description: 'A dried-up mall plant in a cracked planter'
            },
            {
                type: 'model',
                position: [3, 0, 5],
                model: '/models/mall/bench_retro.glb',
                description: 'A weathered bench from the 90s'
            }
        ],
        audio: {
            ambient: '/audio/mall/vaporwave_ambient.mp3',
            volume: 0.3,
            loop: true
        }
    },

    'store-neon-soul': {
        id: 'store-neon-soul',
        name: 'Neon Soul',
        description: 'Cyberpunk streetwear meets digital fashion. Pulsing lights and holographic displays.',
        camera: {
            position: [0, 1.6, 5],
            rotation: [0, 0, 0]
        },
        environment: {
            lighting: 'neon',
            ambient: {
                color: '#ff00ff',
                intensity: 0.6
            },
            fog: {
                type: 'exponential',
                color: '#1a0033',
                density: 0.02
            }
        },
        teleportPoints: [
            { id: 'store-entrance', position: [0, 0, 5], label: 'Store Entrance' },
            { id: 'display-jackets', position: [-3, 0, 0], label: 'Jackets' },
            { id: 'display-pants', position: [3, 0, 0], label: 'Pants & Bottoms' },
            { id: 'display-accessories', position: [0, 0, -5], label: 'Accessories' },
            { id: 'fitting-room', position: [5, 0, -3], label: 'Virtual Fitting Room' }
        ],
        interactables: [
            {
                id: 'product-cyber-jacket',
                type: 'product',
                position: [-3, 1.2, 0],
                action: 'viewProduct',
                target: 'av_jacket_cyber_01',
                model: '/models/clothing/avatar/cyber_jacket_01.glb',
                rotationAnimation: true
            },
            {
                id: 'product-tech-cargo',
                type: 'product',
                position: [3, 1.2, 0],
                action: 'viewProduct',
                target: 'av_pants_cyber_01',
                model: '/models/clothing/avatar/tech_cargo.glb',
                rotationAnimation: true
            },
            {
                id: 'product-grav-sneakers',
                type: 'product',
                position: [0, 1.2, -3],
                action: 'viewProduct',
                target: 'av_sneakers_cyber_01',
                model: '/models/clothing/avatar/grav_sneakers.glb',
                rotationAnimation: true
            },
            {
                id: 'fitting-room-mirror',
                type: 'mirror',
                position: [5, 1.6, -3],
                action: 'openFittingRoom',
                description: 'Try on avatar clothing in virtual space'
            },
            {
                id: 'store-exit',
                type: 'door',
                position: [0, 0, 7],
                action: 'loadScene',
                target: 'mall-entrance',
                label: 'Exit to Mall'
            }
        ],
        objects: [
            {
                type: 'text',
                position: [0, 3, -7],
                value: 'NEON SOUL',
                scale: [1.5, 1.5, 1.5],
                color: '#00ffff',
                shader: 'neon',
                animation: 'pulse'
            },
            {
                type: 'model',
                position: [-5, 0, -2],
                model: '/models/mall/mannequin_cyber.glb',
                outfit: 'av_jacket_cyber_01'
            },
            {
                type: 'model',
                position: [5, 0, 0],
                model: '/models/mall/display_rack_neon.glb'
            }
        ],
        audio: {
            ambient: '/audio/mall/synthwave_store.mp3',
            volume: 0.4,
            loop: true
        }
    },

    'store-phantom-threads': {
        id: 'store-phantom-threads',
        name: 'Phantom Threads',
        description: 'Vintage mall fashion frozen in time. Retro vibes from the golden age.',
        camera: {
            position: [0, 1.6, 5],
            rotation: [0, 0, 0]
        },
        environment: {
            lighting: 'warm',
            ambient: {
                color: '#ffcc99',
                intensity: 0.5
            }
        },
        teleportPoints: [
            { id: 'store-entrance', position: [0, 0, 5], label: 'Store Entrance' },
            { id: 'vintage-wall', position: [-3, 0, 0], label: 'Vintage Collection' },
            { id: 'retro-section', position: [3, 0, 0], label: 'Retro Styles' },
            { id: 'nostalgia-corner', position: [0, 0, -5], label: 'Nostalgia Corner' }
        ],
        interactables: [
            {
                id: 'product-retro-jacket',
                type: 'product',
                position: [-3, 1.2, 0],
                action: 'viewProduct',
                target: 'av_jacket_vintage_01',
                model: '/models/clothing/avatar/retro_jacket.glb',
                rotationAnimation: true
            },
            {
                id: 'product-vintage-jeans',
                type: 'product',
                position: [3, 1.2, 0],
                action: 'viewProduct',
                target: 'av_jeans_vintage_01',
                model: '/models/clothing/avatar/vintage_jeans.glb',
                rotationAnimation: true
            },
            {
                id: 'product-mall-tee',
                type: 'product',
                position: [0, 1.2, -3],
                action: 'viewProduct',
                target: 'ph_tshirt_vintage_01',
                model: '/models/clothing/physical/dead_mall_tee_display.glb'
            },
            {
                id: 'store-exit',
                type: 'door',
                position: [0, 0, 7],
                action: 'loadScene',
                target: 'mall-entrance',
                label: 'Exit to Mall'
            }
        ],
        objects: [
            {
                type: 'text',
                position: [0, 3, -7],
                value: 'PHANTOM THREADS',
                scale: [1.2, 1.2, 1.2],
                color: '#ff6699',
                font: 'retro'
            },
            {
                type: 'model',
                position: [-4, 0, -3],
                model: '/models/mall/display_rack_vintage.glb'
            },
            {
                type: 'model',
                position: [4, 0, -3],
                model: '/models/mall/mannequin_retro.glb'
            }
        ],
        audio: {
            ambient: '/audio/mall/80s_muzak.mp3',
            volume: 0.3,
            loop: true
        }
    },

    'store-pixel-couture': {
        id: 'store-pixel-couture',
        name: 'Pixel Couture',
        description: 'High-end digital fashion. Luxury meets the metaverse.',
        camera: {
            position: [0, 1.6, 5],
            rotation: [0, 0, 0]
        },
        environment: {
            lighting: 'bright',
            ambient: {
                color: '#ffffff',
                intensity: 0.8
            }
        },
        teleportPoints: [
            { id: 'store-entrance', position: [0, 0, 5], label: 'Boutique Entrance' },
            { id: 'luxury-display', position: [0, 0, 0], label: 'Featured Collection' },
            { id: 'exclusive-area', position: [0, 0, -5], label: 'Exclusive Items' }
        ],
        interactables: [
            {
                id: 'product-ar-visor',
                type: 'product',
                position: [0, 1.4, 0],
                action: 'viewProduct',
                target: 'av_acc_visor_01',
                model: '/models/clothing/avatar/ar_visor.glb',
                rotationAnimation: true,
                glow: true
            },
            {
                id: 'product-holo-dress',
                type: 'product',
                position: [-3, 1.2, -3],
                action: 'viewProduct',
                target: 'av_dress_cyber_01',
                model: '/models/clothing/avatar/holo_dress.glb',
                rotationAnimation: true,
                holographic: true
            },
            {
                id: 'concierge',
                type: 'npc',
                position: [3, 0, 0],
                action: 'openChatbot',
                label: 'Fashion Concierge AI',
                model: '/models/mall/concierge_hologram.glb'
            },
            {
                id: 'store-exit',
                type: 'door',
                position: [0, 0, 7],
                action: 'loadScene',
                target: 'mall-entrance',
                label: 'Exit to Mall'
            }
        ],
        objects: [
            {
                type: 'text',
                position: [0, 3, -7],
                value: 'PIXEL COUTURE',
                scale: [1.5, 1.5, 1.5],
                color: '#ffd700',
                shader: 'metallic'
            }
        ],
        audio: {
            ambient: '/audio/mall/luxury_ambient.mp3',
            volume: 0.25,
            loop: true
        }
    }
};

export function getAllMallScenes() {
    return Object.values(mallScenes);
}

export function getMallScene(sceneId) {
    return mallScenes[sceneId];
}
