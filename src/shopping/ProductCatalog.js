/**
 * ProductCatalog - Manages product inventory for the Virtual Mall
 * Includes both virtual avatar clothing and physical clothing items
 */
export class ProductCatalog {
    constructor() {
        this.products = this.initializeProducts();
        this.categories = this.initializeCategories();
        this.brands = this.initializeBrands();
    }

    initializeCategories() {
        return {
            avatar: {
                id: 'avatar',
                name: 'Avatar Fashion',
                description: 'Digital clothing for your virtual self',
                icon: '👤'
            },
            physical: {
                id: 'physical',
                name: 'Physical Fashion',
                description: 'Real-world clothing delivered to you',
                icon: '📦'
            },
            bundle: {
                id: 'bundle',
                name: 'Twin Fashion',
                description: 'Matching sets for you and your avatar',
                icon: '🎁'
            },
            vintage: {
                id: 'vintage',
                name: 'Dead Mall Vintage',
                description: 'Retro styles from the golden age of malls',
                icon: '🕰️'
            },
            cyberpunk: {
                id: 'cyberpunk',
                name: 'Neon Future',
                description: 'Futuristic cyber fashion',
                icon: '🌃'
            }
        };
    }

    initializeBrands() {
        return {
            'phantom-threads': {
                id: 'phantom-threads',
                name: 'Phantom Threads',
                description: 'Ghost mall exclusive vintage revival',
                style: 'vintage',
                priceRange: 'mid'
            },
            'neon-soul': {
                id: 'neon-soul',
                name: 'Neon Soul',
                description: 'Cyberpunk meets streetwear',
                style: 'cyberpunk',
                priceRange: 'high'
            },
            'echo-fashion': {
                id: 'echo-fashion',
                name: 'Echo Fashion',
                description: 'Classic styles reimagined',
                style: 'classic',
                priceRange: 'mid'
            },
            'pixel-couture': {
                id: 'pixel-couture',
                name: 'Pixel Couture',
                description: 'High-end digital fashion',
                style: 'luxury',
                priceRange: 'luxury'
            }
        };
    }

    initializeProducts() {
        return [
            // AVATAR CLOTHING - Cyberpunk Style
            {
                id: 'av_jacket_cyber_01',
                name: 'Neon Pulse Jacket',
                type: 'avatar',
                category: 'cyberpunk',
                slot: 'top',
                brand: 'neon-soul',
                price: 150,
                currency: 'crystals',
                description: 'Light-reactive jacket with animated neon strips. Glows in virtual darkness.',
                colors: ['electric-blue', 'hot-pink', 'acid-green'],
                rarity: 'rare',
                model: '/models/clothing/avatar/cyber_jacket_01.glb',
                thumbnail: '/images/clothing/avatar/cyber_jacket_01.jpg',
                tags: ['cyberpunk', 'jacket', 'animated', 'glow'],
                unlockLevel: 5
            },
            {
                id: 'av_pants_cyber_01',
                name: 'Tech Cargo Pants',
                type: 'avatar',
                category: 'cyberpunk',
                slot: 'bottom',
                brand: 'neon-soul',
                price: 100,
                currency: 'crystals',
                description: 'Tactical cargo pants with holographic pockets and LED accents.',
                colors: ['black', 'dark-grey', 'midnight-blue'],
                rarity: 'common',
                model: '/models/clothing/avatar/tech_cargo.glb',
                thumbnail: '/images/clothing/avatar/tech_cargo.jpg',
                tags: ['cyberpunk', 'pants', 'tactical']
            },
            {
                id: 'av_sneakers_cyber_01',
                name: 'Gravity Defiance Sneakers',
                type: 'avatar',
                category: 'cyberpunk',
                slot: 'shoes',
                brand: 'neon-soul',
                price: 120,
                currency: 'crystals',
                description: 'Anti-gravity effect sneakers. Animated particle trail when walking.',
                colors: ['white-neon', 'black-glow'],
                rarity: 'rare',
                model: '/models/clothing/avatar/grav_sneakers.glb',
                thumbnail: '/images/clothing/avatar/grav_sneakers.jpg',
                tags: ['cyberpunk', 'shoes', 'animated', 'effects'],
                unlockLevel: 8
            },

            // AVATAR CLOTHING - Vintage Dead Mall Style
            {
                id: 'av_jacket_vintage_01',
                name: 'Retro Mall Walker Jacket',
                type: 'avatar',
                category: 'vintage',
                slot: 'top',
                brand: 'phantom-threads',
                price: 80,
                currency: 'crystals',
                description: 'Classic 90s windbreaker with authentic mall-era patterns. Pure nostalgia.',
                colors: ['teal-purple', 'pink-blue', 'black-yellow'],
                rarity: 'common',
                model: '/models/clothing/avatar/retro_jacket.glb',
                thumbnail: '/images/clothing/avatar/retro_jacket.jpg',
                tags: ['vintage', '90s', 'jacket', 'nostalgia']
            },
            {
                id: 'av_jeans_vintage_01',
                name: 'Eternal Denim Jeans',
                type: 'avatar',
                category: 'vintage',
                slot: 'bottom',
                brand: 'phantom-threads',
                price: 60,
                currency: 'crystals',
                description: 'Never-fading vintage wash jeans. Perfect fit, every time.',
                colors: ['light-wash', 'dark-wash', 'black'],
                rarity: 'common',
                model: '/models/clothing/avatar/vintage_jeans.glb',
                thumbnail: '/images/clothing/avatar/vintage_jeans.jpg',
                tags: ['vintage', 'jeans', 'classic']
            },

            // AVATAR ACCESSORIES
            {
                id: 'av_acc_visor_01',
                name: 'AR Data Visor',
                type: 'avatar',
                category: 'cyberpunk',
                slot: 'accessories',
                brand: 'pixel-couture',
                price: 200,
                currency: 'crystals',
                description: 'Augmented reality visor with floating data displays. Actually functional HUD.',
                colors: ['chrome', 'gold', 'rose-gold'],
                rarity: 'epic',
                model: '/models/clothing/avatar/ar_visor.glb',
                thumbnail: '/images/clothing/avatar/ar_visor.jpg',
                tags: ['cyberpunk', 'accessory', 'tech', 'HUD'],
                unlockLevel: 12,
                specialEffect: 'hud_overlay'
            },

            // PHYSICAL CLOTHING - Real-world items
            {
                id: 'ph_jacket_cyber_01',
                name: 'Neon Pulse Jacket (Physical)',
                type: 'physical',
                category: 'cyberpunk',
                slot: 'top',
                brand: 'neon-soul',
                price: 299.99,
                currency: 'usd',
                description: 'Real EL-wire jacket matching your avatar. Battery-powered glow strips.',
                sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                colors: ['black-blue', 'black-pink', 'black-green'],
                rarity: 'rare',
                thumbnail: '/images/clothing/physical/cyber_jacket_real.jpg',
                tags: ['cyberpunk', 'jacket', 'el-wire', 'glow'],
                shipping: {
                    available: true,
                    estimatedDays: 7,
                    regions: ['US', 'EU', 'Asia']
                },
                twinItem: 'av_jacket_cyber_01' // Links to avatar version
            },
            {
                id: 'ph_tshirt_vintage_01',
                name: 'Dead Mall Forever Tee',
                type: 'physical',
                category: 'vintage',
                slot: 'top',
                brand: 'phantom-threads',
                price: 34.99,
                currency: 'usd',
                description: 'Soft cotton tee celebrating the aesthetic of abandoned malls. Vintage print.',
                sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                colors: ['black', 'white', 'grey', 'purple'],
                rarity: 'common',
                thumbnail: '/images/clothing/physical/dead_mall_tee.jpg',
                tags: ['vintage', 't-shirt', 'cotton', 'nostalgia'],
                shipping: {
                    available: true,
                    estimatedDays: 5,
                    regions: ['Worldwide']
                }
            },
            {
                id: 'ph_hoodie_echo_01',
                name: 'Echo Chamber Hoodie',
                type: 'physical',
                category: 'vintage',
                slot: 'top',
                brand: 'echo-fashion',
                price: 79.99,
                currency: 'usd',
                description: 'Premium hoodie with reflective print. Echoes the empty halls of dead malls.',
                sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                colors: ['black', 'charcoal', 'navy', 'burgundy'],
                rarity: 'common',
                thumbnail: '/images/clothing/physical/echo_hoodie.jpg',
                tags: ['vintage', 'hoodie', 'comfort', 'reflective'],
                shipping: {
                    available: true,
                    estimatedDays: 5,
                    regions: ['Worldwide']
                }
            },

            // TWIN BUNDLES - Matching avatar + physical
            {
                id: 'bundle_cyber_starter',
                name: 'Cyber Starter Twin Pack',
                type: 'bundle',
                category: 'bundle',
                brand: 'neon-soul',
                price: 399.99,
                currency: 'usd',
                description: 'Complete cyberpunk outfit for you AND your avatar. Digital + Physical bundle.',
                includes: [
                    'av_jacket_cyber_01',
                    'ph_jacket_cyber_01',
                    'av_pants_cyber_01',
                    'av_sneakers_cyber_01'
                ],
                discount: 0.15, // 15% off
                rarity: 'epic',
                thumbnail: '/images/bundles/cyber_starter.jpg',
                tags: ['bundle', 'cyberpunk', 'starter', 'twin'],
                shipping: {
                    available: true,
                    estimatedDays: 7,
                    regions: ['US', 'EU', 'Asia']
                }
            },
            {
                id: 'bundle_vintage_nostalgia',
                name: 'Nostalgia Twin Pack',
                type: 'bundle',
                category: 'bundle',
                brand: 'phantom-threads',
                price: 149.99,
                currency: 'usd',
                description: 'Vintage mall vibes for your digital and physical life.',
                includes: [
                    'av_jacket_vintage_01',
                    'ph_tshirt_vintage_01',
                    'ph_hoodie_echo_01',
                    'av_jeans_vintage_01'
                ],
                discount: 0.20, // 20% off
                rarity: 'rare',
                thumbnail: '/images/bundles/vintage_nostalgia.jpg',
                tags: ['bundle', 'vintage', 'nostalgia', 'twin'],
                shipping: {
                    available: true,
                    estimatedDays: 5,
                    regions: ['Worldwide']
                }
            },

            // More diverse items
            {
                id: 'av_dress_cyber_01',
                name: 'Holographic Flow Dress',
                type: 'avatar',
                category: 'cyberpunk',
                slot: 'top',
                brand: 'pixel-couture',
                price: 180,
                currency: 'crystals',
                description: 'Flowing dress with holographic material simulation. Changes colors with movement.',
                colors: ['rainbow', 'silver', 'gold'],
                rarity: 'epic',
                model: '/models/clothing/avatar/holo_dress.glb',
                thumbnail: '/images/clothing/avatar/holo_dress.jpg',
                tags: ['cyberpunk', 'dress', 'holographic', 'animated'],
                unlockLevel: 10
            },
            {
                id: 'ph_sneakers_retro_01',
                name: 'Mall Walker Classics',
                type: 'physical',
                category: 'vintage',
                slot: 'shoes',
                brand: 'echo-fashion',
                price: 89.99,
                currency: 'usd',
                description: 'Comfortable sneakers perfect for walking miles of virtual and real mall corridors.',
                sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
                colors: ['white', 'black', 'cream', 'grey'],
                rarity: 'common',
                thumbnail: '/images/clothing/physical/mall_walkers.jpg',
                tags: ['vintage', 'sneakers', 'comfort', 'classic'],
                shipping: {
                    available: true,
                    estimatedDays: 5,
                    regions: ['Worldwide']
                }
            }
        ];
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Get product by ID
    getProduct(id) {
        return this.products.find(p => p.id === id);
    }

    // Filter products by type (avatar, physical, bundle)
    getProductsByType(type) {
        return this.products.filter(p => p.type === type);
    }

    // Filter products by category
    getProductsByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    // Filter products by slot
    getProductsBySlot(slot) {
        return this.products.filter(p => p.slot === slot);
    }

    // Filter products by brand
    getProductsByBrand(brandId) {
        return this.products.filter(p => p.brand === brandId);
    }

    // Search products
    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    // Get products by price range
    getProductsByPriceRange(min, max, currency = 'crystals') {
        return this.products.filter(p =>
            p.currency === currency &&
            p.price >= min &&
            p.price <= max
        );
    }

    // Get products by rarity
    getProductsByRarity(rarity) {
        return this.products.filter(p => p.rarity === rarity);
    }

    // Get featured products
    getFeaturedProducts(limit = 6) {
        // Return random selection of rare/epic items
        const featured = this.products.filter(p =>
            p.rarity === 'rare' || p.rarity === 'epic'
        );

        return this.shuffleArray(featured).slice(0, limit);
    }

    // Get new arrivals
    getNewArrivals(limit = 6) {
        // In a real system, this would check a 'createdAt' date
        // For now, return last items in the catalog
        return this.products.slice(-limit);
    }

    // Get twin items (matching physical/avatar pairs)
    getTwinPairs() {
        const pairs = [];
        const physicalWithTwins = this.products.filter(p => p.twinItem);

        physicalWithTwins.forEach(physical => {
            const avatar = this.getProduct(physical.twinItem);
            if (avatar) {
                pairs.push({
                    physical: physical,
                    avatar: avatar,
                    bundleDiscount: 0.10 // 10% off if bought together
                });
            }
        });

        return pairs;
    }

    // Check if user can afford product
    canAfford(product, userCurrency) {
        if (!product || !userCurrency) return false;

        if (product.currency === 'crystals') {
            return userCurrency.crystals >= product.price;
        } else if (product.currency === 'usd') {
            return true; // Physical items would use external payment
        }

        return false;
    }

    // Calculate bundle price
    getBundlePrice(bundleId) {
        const bundle = this.getProduct(bundleId);
        if (!bundle || bundle.type !== 'bundle') return null;

        let totalPrice = bundle.price;
        const items = bundle.includes.map(id => this.getProduct(id));

        return {
            bundlePrice: bundle.price,
            itemsPrice: items.reduce((sum, item) => sum + (item?.price || 0), 0),
            savings: bundle.discount,
            items: items
        };
    }

    // Utility: Shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Get category info
    getCategory(categoryId) {
        return this.categories[categoryId];
    }

    // Get brand info
    getBrand(brandId) {
        return this.brands[brandId];
    }

    // Get all categories
    getAllCategories() {
        return Object.values(this.categories);
    }

    // Get all brands
    getAllBrands() {
        return Object.values(this.brands);
    }
}

// Create singleton instance
export const productCatalog = new ProductCatalog();
