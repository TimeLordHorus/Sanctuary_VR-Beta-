/**
 * ShoppingUI - User interface for the Virtual Mall shopping experience
 * Integrates with SanctuaryMenu as a new tab
 */
import { shoppingManager } from './ShoppingManager.js';
import { productCatalog } from './ProductCatalog.js';
import { avatarManager } from '../avatar/AvatarManager.js';

export class ShoppingUI {
    constructor() {
        this.currentView = 'browse'; // browse, product, cart, avatar
        this.currentFilter = 'all';
        this.selectedProduct = null;
    }

    /**
     * Generate the shopping tab content HTML
     */
    generateTabContent() {
        return `
            <div class="shopping-container">
                <!-- Shopping Header -->
                <div class="shopping-header">
                    <div class="shopping-title">
                        <span class="shopping-icon">🛍️</span>
                        <h3>Virtual Mall</h3>
                        <span class="subtitle">Dead Mall of the Future</span>
                    </div>
                    <div class="shopping-stats">
                        <div class="stat-item">
                            <span class="stat-icon">💎</span>
                            <span class="stat-value">${shoppingManager.getCrystals()}</span>
                            <span class="stat-label">Crystals</span>
                        </div>
                        <div class="stat-item cart-stat" id="cart-stat">
                            <span class="stat-icon">🛒</span>
                            <span class="stat-value">${shoppingManager.getCart().length}</span>
                            <span class="stat-label">Cart</span>
                        </div>
                    </div>
                </div>

                <!-- Shopping Navigation -->
                <div class="shopping-nav">
                    <button class="shop-nav-btn active" data-view="browse">
                        <span>🏬</span> Browse
                    </button>
                    <button class="shop-nav-btn" data-view="avatar">
                        <span>👤</span> My Avatar
                    </button>
                    <button class="shop-nav-btn" data-view="cart">
                        <span>🛒</span> Cart (${shoppingManager.getCart().length})
                    </button>
                    <button class="shop-nav-btn" data-view="wishlist">
                        <span>❤️</span> Wishlist
                    </button>
                </div>

                <!-- Shopping Views -->
                <div class="shopping-views">
                    <!-- Browse View -->
                    <div class="shopping-view active" data-view="browse">
                        ${this.generateBrowseView()}
                    </div>

                    <!-- Avatar View -->
                    <div class="shopping-view" data-view="avatar">
                        ${this.generateAvatarView()}
                    </div>

                    <!-- Cart View -->
                    <div class="shopping-view" data-view="cart">
                        ${this.generateCartView()}
                    </div>

                    <!-- Wishlist View -->
                    <div class="shopping-view" data-view="wishlist">
                        ${this.generateWishlistView()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate Browse Products View
     */
    generateBrowseView() {
        const categories = productCatalog.getAllCategories();
        const products = productCatalog.getAllProducts();

        return `
            <div class="browse-container">
                <!-- Category Filters -->
                <div class="category-filters">
                    <button class="category-btn active" data-category="all">
                        <span>✨</span> All Items
                    </button>
                    ${categories.map(cat => `
                        <button class="category-btn" data-category="${cat.id}">
                            <span>${cat.icon}</span> ${cat.name}
                        </button>
                    `).join('')}
                </div>

                <!-- Featured Banner -->
                <div class="featured-banner">
                    <div class="banner-content">
                        <h3>🌟 Featured Collection</h3>
                        <p>Twin Fashion - Matching outfits for you and your avatar!</p>
                    </div>
                </div>

                <!-- Product Grid -->
                <div class="product-grid" id="product-grid">
                    ${products.slice(0, 12).map(product => this.generateProductCard(product)).join('')}
                </div>

                <!-- Load More -->
                <div class="load-more-container">
                    <button class="load-more-btn">Load More Items</button>
                </div>
            </div>
        `;
    }

    /**
     * Generate Product Card
     */
    generateProductCard(product) {
        const canAfford = shoppingManager.wallet.crystals >= (product.currency === 'crystals' ? product.price : 0);
        const priceDisplay = product.currency === 'crystals' ? `💎 ${product.price}` : `$${product.price}`;
        const typeIcon = product.type === 'avatar' ? '👤' : product.type === 'physical' ? '📦' : '🎁';
        const rarityClass = product.rarity || 'common';

        return `
            <div class="product-card ${rarityClass}" data-product="${product.id}">
                <div class="product-badge ${product.type}">${typeIcon} ${product.type}</div>
                ${product.rarity !== 'common' ? `<div class="rarity-badge ${product.rarity}">${product.rarity}</div>` : ''}

                <div class="product-image">
                    <div class="product-placeholder">
                        ${this.getProductEmoji(product)}
                    </div>
                </div>

                <div class="product-info">
                    <div class="product-brand">${productCatalog.getBrand(product.brand)?.name || 'Unknown'}</div>
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-desc">${product.description.substring(0, 80)}...</p>

                    <div class="product-footer">
                        <div class="product-price ${!canAfford && product.currency === 'crystals' ? 'unaffordable' : ''}">
                            ${priceDisplay}
                        </div>
                        <button class="product-btn view-btn" onclick="window.viewProduct('${product.id}')">
                            View
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get emoji for product type
     */
    getProductEmoji(product) {
        const emojis = {
            'jacket': '🧥',
            'pants': '👖',
            'shoes': '👟',
            'dress': '👗',
            'accessory': '🕶️',
            'bundle': '🎁'
        };

        return emojis[product.slot] || '👕';
    }

    /**
     * Generate Avatar View
     */
    generateAvatarView() {
        const preview = avatarManager.getAvatarPreview();
        const avatarItems = avatarManager.getEquippedItems('avatar');
        const physicalItems = avatarManager.getEquippedItems('physical');

        return `
            <div class="avatar-container">
                <div class="avatar-preview-section">
                    <div class="avatar-preview">
                        <div class="avatar-display">
                            <span class="avatar-icon">👤</span>
                            <p>Avatar Preview</p>
                        </div>
                        <button class="customize-btn">Customize Avatar</button>
                    </div>

                    <div class="avatar-stats">
                        <h4>Avatar Stats</h4>
                        <div class="stat-row">
                            <span>Avatar Items:</span>
                            <span>${preview.stats.avatarItems}</span>
                        </div>
                        <div class="stat-row">
                            <span>Physical Items:</span>
                            <span>${preview.stats.physicalItems}</span>
                        </div>
                        <div class="stat-row">
                            <span>Total Value:</span>
                            <span>💎 ${preview.stats.avatarValue + preview.stats.physicalValue}</span>
                        </div>
                    </div>
                </div>

                <div class="avatar-wardrobe">
                    <div class="wardrobe-section">
                        <h4>👤 Avatar Wardrobe</h4>
                        <div class="wardrobe-items">
                            ${avatarItems.length > 0 ? avatarItems.map(item => `
                                <div class="wardrobe-item">
                                    <span class="item-icon">${this.getProductEmoji(item)}</span>
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price">💎 ${item.price}</span>
                                </div>
                            `).join('') : '<p class="empty-state">No avatar items equipped</p>'}
                        </div>
                    </div>

                    <div class="wardrobe-section">
                        <h4>📦 Physical Wardrobe</h4>
                        <div class="wardrobe-items">
                            ${physicalItems.length > 0 ? physicalItems.map(item => `
                                <div class="wardrobe-item">
                                    <span class="item-icon">${this.getProductEmoji(item)}</span>
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-price">$${item.price}</span>
                                </div>
                            `).join('') : '<p class="empty-state">No physical items purchased</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate Cart View
     */
    generateCartView() {
        const cart = shoppingManager.getCart();
        const totals = shoppingManager.getCartTotal();

        if (cart.length === 0) {
            return `
                <div class="empty-cart">
                    <div class="empty-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Browse the mall and add some items to get started!</p>
                    <button class="browse-btn" onclick="window.switchShoppingView('browse')">
                        Start Shopping
                    </button>
                </div>
            `;
        }

        return `
            <div class="cart-container">
                <div class="cart-items">
                    ${cart.map((item, index) => `
                        <div class="cart-item">
                            <div class="cart-item-image">
                                ${this.getProductEmoji(item.product)}
                            </div>
                            <div class="cart-item-info">
                                <h4>${item.product.name}</h4>
                                <p class="cart-item-brand">${productCatalog.getBrand(item.product.brand)?.name}</p>
                                <p class="cart-item-type">${item.product.type === 'avatar' ? '👤 Avatar' : '📦 Physical'}</p>
                            </div>
                            <div class="cart-item-price">
                                ${item.product.currency === 'crystals' ? `💎 ${item.product.price}` : `$${item.product.price}`}
                            </div>
                            <button class="cart-item-remove" onclick="window.removeFromCart(${index})">
                                ×
                            </button>
                        </div>
                    `).join('')}
                </div>

                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    <div class="summary-row">
                        <span>Virtual Items:</span>
                        <span>💎 ${totals.crystals}</span>
                    </div>
                    <div class="summary-row">
                        <span>Physical Items:</span>
                        <span>$${totals.usd.toFixed(2)}</span>
                    </div>
                    <div class="summary-row total">
                        <span>Your Balance:</span>
                        <span>💎 ${shoppingManager.getCrystals()}</span>
                    </div>

                    ${totals.crystals > shoppingManager.getCrystals() ? `
                        <div class="insufficient-funds">
                            ⚠️ Insufficient Crystals
                            <br>Need ${totals.crystals - shoppingManager.getCrystals()} more
                        </div>
                    ` : ''}

                    <button class="checkout-btn"
                            onclick="window.checkout()"
                            ${totals.crystals > shoppingManager.getCrystals() ? 'disabled' : ''}>
                        Complete Purchase
                    </button>

                    <button class="clear-cart-btn" onclick="window.clearCart()">
                        Clear Cart
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generate Wishlist View
     */
    generateWishlistView() {
        const wishlist = shoppingManager.getWishlist();

        if (wishlist.length === 0) {
            return `
                <div class="empty-wishlist">
                    <div class="empty-icon">❤️</div>
                    <h3>Your wishlist is empty</h3>
                    <p>Save items you love for later!</p>
                </div>
            `;
        }

        return `
            <div class="wishlist-container">
                <div class="wishlist-grid">
                    ${wishlist.map(product => this.generateProductCard(product)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // View switching
        document.querySelectorAll('.shop-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Category filtering
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Listen to shopping events
        window.addEventListener('cartUpdated', () => this.updateCartDisplay());
        window.addEventListener('crystalsChanged', () => this.updateCrystalDisplay());
        window.addEventListener('avatarUpdated', () => this.updateAvatarDisplay());
    }

    /**
     * Switch shopping view
     */
    switchView(view) {
        this.currentView = view;

        // Update nav buttons
        document.querySelectorAll('.shop-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Update views
        document.querySelectorAll('.shopping-view').forEach(viewEl => {
            viewEl.classList.toggle('active', viewEl.dataset.view === view);
        });

        // Refresh content
        const viewElement = document.querySelector(`.shopping-view[data-view="${view}"]`);
        if (viewElement) {
            viewElement.innerHTML = this[`generate${view.charAt(0).toUpperCase() + view.slice(1)}View`]();
        }
    }

    /**
     * Filter products by category
     */
    filterByCategory(category) {
        this.currentFilter = category;

        // Update category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Filter products
        const products = category === 'all'
            ? productCatalog.getAllProducts()
            : productCatalog.getProductsByCategory(category);

        // Update product grid
        const grid = document.getElementById('product-grid');
        if (grid) {
            grid.innerHTML = products.map(p => this.generateProductCard(p)).join('');
        }
    }

    /**
     * Update displays
     */
    updateCartDisplay() {
        const cartBtns = document.querySelectorAll('.shop-nav-btn[data-view="cart"]');
        cartBtns.forEach(btn => {
            const count = shoppingManager.getCart().length;
            btn.innerHTML = `<span>🛒</span> Cart (${count})`;
        });

        const cartStat = document.getElementById('cart-stat');
        if (cartStat) {
            cartStat.querySelector('.stat-value').textContent = shoppingManager.getCart().length;
        }

        // Refresh cart view if currently active
        if (this.currentView === 'cart') {
            this.switchView('cart');
        }
    }

    updateCrystalDisplay() {
        const crystalDisplays = document.querySelectorAll('.stat-value');
        crystalDisplays.forEach(el => {
            if (el.closest('.stat-item')?.querySelector('.stat-icon')?.textContent === '💎') {
                el.textContent = shoppingManager.getCrystals();
            }
        });
    }

    updateAvatarDisplay() {
        if (this.currentView === 'avatar') {
            this.switchView('avatar');
        }
    }
}

// Global functions for inline event handlers
window.viewProduct = (productId) => {
    const product = productCatalog.getProduct(productId);
    if (product) {
        alert(`Product: ${product.name}\n\n${product.description}\n\nPrice: ${product.currency === 'crystals' ? '💎' : '$'}${product.price}`);
        // In a full implementation, this would open a detailed product modal
    }
};

window.addToCart = (productId) => {
    shoppingManager.addToCart(productId);
    alert('Added to cart!');
};

window.removeFromCart = (index) => {
    shoppingManager.removeFromCart(index);
};

window.clearCart = () => {
    if (confirm('Clear all items from cart?')) {
        shoppingManager.clearCart();
    }
};

window.checkout = async () => {
    const result = await shoppingManager.checkout();

    if (result.success) {
        alert('Purchase complete! Check your avatar wardrobe to see your new items.');
    } else {
        alert(`Purchase failed: ${result.error}`);
    }
};

window.switchShoppingView = (view) => {
    const shoppingUI = window.sanctuaryShoppingUI;
    if (shoppingUI) {
        shoppingUI.switchView(view);
    }
};

// Create singleton
export const shoppingUI = new ShoppingUI();
window.sanctuaryShoppingUI = shoppingUI;
