/**
 * AvatarManager - Manages avatar state, appearance, and clothing
 * Supports both virtual avatar customization and physical clothing tracking
 */
export class AvatarManager {
    constructor() {
        this.currentAvatar = null;
        this.avatarState = this.loadAvatarState();
        this.clothingSlots = {
            // Avatar clothing slots
            avatar: {
                head: null,
                top: null,
                bottom: null,
                shoes: null,
                accessories: []
            },
            // Physical clothing wishlist/purchases
            physical: {
                head: null,
                top: null,
                bottom: null,
                shoes: null,
                accessories: []
            }
        };

        this.avatarModels = {
            base: {
                male: '/models/avatars/male_base.glb',
                female: '/models/avatars/female_base.glb',
                neutral: '/models/avatars/neutral_base.glb'
            }
        };

        this.init();
    }

    init() {
        // Load saved clothing configuration
        if (this.avatarState.clothing) {
            this.clothingSlots = this.avatarState.clothing;
        }

        // Set default avatar if none exists
        if (!this.avatarState.model) {
            this.avatarState.model = {
                type: 'neutral',
                bodyType: 'average',
                height: 1.7,
                skinTone: '#ffdbac',
                hairColor: '#3d2817',
                hairStyle: 'short'
            };
        }

        console.log('AvatarManager initialized', this.avatarState);
    }

    loadAvatarState() {
        const saved = localStorage.getItem('sanctuary_avatar');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            id: this.generateAvatarId(),
            name: 'My Avatar',
            model: null,
            clothing: null,
            physicalPreferences: {
                size: 'M',
                style: 'casual',
                colors: ['black', 'blue', 'white']
            },
            createdAt: Date.now(),
            lastModified: Date.now()
        };
    }

    saveAvatarState() {
        this.avatarState.lastModified = Date.now();
        this.avatarState.clothing = this.clothingSlots;
        localStorage.setItem('sanctuary_avatar', JSON.stringify(this.avatarState));
        console.log('Avatar state saved');
    }

    generateAvatarId() {
        return `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Update avatar model characteristics
    updateAvatarModel(updates) {
        this.avatarState.model = {
            ...this.avatarState.model,
            ...updates
        };
        this.saveAvatarState();
        this.refreshAvatarDisplay();
    }

    // Equip clothing item to avatar
    equipAvatarClothing(item, slot) {
        if (!item || !slot) return false;

        if (slot === 'accessories') {
            this.clothingSlots.avatar.accessories.push(item);
        } else {
            this.clothingSlots.avatar[slot] = item;
        }

        this.saveAvatarState();
        this.refreshAvatarDisplay();

        console.log(`Equipped ${item.name} to avatar ${slot}`);
        return true;
    }

    // Remove clothing item from avatar
    removeAvatarClothing(slot, accessoryIndex = null) {
        if (slot === 'accessories' && accessoryIndex !== null) {
            this.clothingSlots.avatar.accessories.splice(accessoryIndex, 1);
        } else {
            this.clothingSlots.avatar[slot] = null;
        }

        this.saveAvatarState();
        this.refreshAvatarDisplay();
    }

    // Add physical clothing to wishlist/purchases
    addPhysicalClothing(item, slot) {
        if (!item || !slot) return false;

        if (slot === 'accessories') {
            this.clothingSlots.physical.accessories.push(item);
        } else {
            this.clothingSlots.physical[slot] = item;
        }

        this.saveAvatarState();
        console.log(`Added physical clothing: ${item.name}`);
        return true;
    }

    // Get all equipped items
    getEquippedItems(type = 'avatar') {
        const items = [];
        const slots = this.clothingSlots[type];

        for (const [slot, item] of Object.entries(slots)) {
            if (slot === 'accessories') {
                items.push(...item);
            } else if (item) {
                items.push(item);
            }
        }

        return items;
    }

    // Get total value of equipped items
    getEquippedValue(type = 'avatar') {
        const items = this.getEquippedItems(type);
        return items.reduce((total, item) => total + (item.price || 0), 0);
    }

    // Create or update avatar in VR scene
    createAvatarEntity() {
        const scene = document.querySelector('a-scene');
        if (!scene) return null;

        // Check if avatar already exists
        let avatarEntity = document.getElementById('player-avatar');

        if (!avatarEntity) {
            avatarEntity = document.createElement('a-entity');
            avatarEntity.id = 'player-avatar';
            avatarEntity.setAttribute('position', '0 0 -2');

            // Add base model
            const modelPath = this.avatarModels.base[this.avatarState.model?.type || 'neutral'];
            avatarEntity.setAttribute('gltf-model', modelPath);

            // Add animation mixer for avatar animations
            avatarEntity.setAttribute('animation-mixer', '');

            scene.appendChild(avatarEntity);
        }

        this.currentAvatar = avatarEntity;
        return avatarEntity;
    }

    // Refresh avatar display with current clothing
    refreshAvatarDisplay() {
        if (!this.currentAvatar) {
            this.createAvatarEntity();
        }

        // Apply clothing materials/textures
        // This would integrate with A-Frame's material system
        const equippedItems = this.getEquippedItems('avatar');

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('avatarUpdated', {
            detail: {
                avatar: this.avatarState,
                equippedItems: equippedItems
            }
        }));

        console.log('Avatar display refreshed', equippedItems);
    }

    // Get avatar preview data for UI
    getAvatarPreview() {
        return {
            model: this.avatarState.model,
            avatarClothing: this.clothingSlots.avatar,
            physicalClothing: this.clothingSlots.physical,
            stats: {
                avatarItems: this.getEquippedItems('avatar').length,
                physicalItems: this.getEquippedItems('physical').length,
                avatarValue: this.getEquippedValue('avatar'),
                physicalValue: this.getEquippedValue('physical')
            }
        };
    }

    // Export avatar configuration for sharing
    exportAvatarConfig() {
        return {
            ...this.avatarState,
            clothing: this.clothingSlots,
            exportedAt: Date.now()
        };
    }

    // Import avatar configuration
    importAvatarConfig(config) {
        if (!config || !config.id) return false;

        this.avatarState = config;
        this.clothingSlots = config.clothing || this.clothingSlots;
        this.saveAvatarState();
        this.refreshAvatarDisplay();

        return true;
    }

    // Try on item (preview without purchasing)
    tryOnItem(item, slot) {
        // Create temporary preview state
        const preview = { ...this.clothingSlots };

        if (slot === 'accessories') {
            preview.avatar.accessories = [...preview.avatar.accessories, item];
        } else {
            preview.avatar[slot] = item;
        }

        // Return preview data for UI
        return {
            preview: preview,
            item: item,
            slot: slot
        };
    }

    // Reset avatar to defaults
    resetAvatar() {
        this.clothingSlots = {
            avatar: {
                head: null,
                top: null,
                bottom: null,
                shoes: null,
                accessories: []
            },
            physical: {
                head: null,
                top: null,
                bottom: null,
                shoes: null,
                accessories: []
            }
        };

        this.saveAvatarState();
        this.refreshAvatarDisplay();
    }
}

// Create singleton instance
export const avatarManager = new AvatarManager();
