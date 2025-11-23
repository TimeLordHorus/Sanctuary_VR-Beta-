/**
 * ShoppingManager - Manages shopping cart, purchases, and virtual currency
 * Integrates with ProgressionSystem for Sanctuary Crystals
 */
import { productCatalog } from './ProductCatalog.js';
import { avatarManager } from '../avatar/AvatarManager.js';

export class ShoppingManager {
    constructor(progressionSystem = null) {
        this.progressionSystem = progressionSystem;
        this.cart = [];
        this.purchaseHistory = [];
        this.wallet = this.loadWallet();
        this.wishlist = [];

        this.init();
    }

    init() {
        // Load saved data
        const saved = localStorage.getItem('sanctuary_shopping');
        if (saved) {
            const data = JSON.parse(saved);
            this.cart = data.cart || [];
            this.purchaseHistory = data.purchaseHistory || [];
            this.wishlist = data.wishlist || [];
        }

        console.log('ShoppingManager initialized', {
            cartItems: this.cart.length,
            purchases: this.purchaseHistory.length,
            crystals: this.wallet.crystals
        });
    }

    loadWallet() {
        const saved = localStorage.getItem('sanctuary_wallet');
        if (saved) {
            return JSON.parse(saved);
        }

        // Initialize with starter currency
        return {
            crystals: 500, // Starter crystals
            usd: 0, // Physical currency tracking (for display only)
            earnedTotal: 500,
            spentTotal: 0,
            lastEarned: Date.now()
        };
    }

    saveWallet() {
        localStorage.setItem('sanctuary_wallet', JSON.stringify(this.wallet));
    }

    saveShoppingData() {
        const data = {
            cart: this.cart,
            purchaseHistory: this.purchaseHistory,
            wishlist: this.wishlist,
            lastUpdated: Date.now()
        };
        localStorage.setItem('sanctuary_shopping', JSON.stringify(data));
    }

    // CURRENCY MANAGEMENT

    getCrystals() {
        return this.wallet.crystals;
    }

    addCrystals(amount, reason = 'reward') {
        if (amount <= 0) return false;

        this.wallet.crystals += amount;
        this.wallet.earnedTotal += amount;
        this.wallet.lastEarned = Date.now();

        this.saveWallet();

        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('crystalsChanged', {
            detail: {
                amount: amount,
                newTotal: this.wallet.crystals,
                reason: reason
            }
        }));

        console.log(`+${amount} Sanctuary Crystals (${reason})`);
        return true;
    }

    spendCrystals(amount, reason = 'purchase') {
        if (amount <= 0 || this.wallet.crystals < amount) return false;

        this.wallet.crystals -= amount;
        this.wallet.spentTotal += amount;

        this.saveWallet();

        window.dispatchEvent(new CustomEvent('crystalsChanged', {
            detail: {
                amount: -amount,
                newTotal: this.wallet.crystals,
                reason: reason
            }
        }));

        console.log(`-${amount} Sanctuary Crystals (${reason})`);
        return true;
    }

    // CART MANAGEMENT

    addToCart(productId, options = {}) {
        const product = productCatalog.getProduct(productId);
        if (!product) {
            console.error('Product not found:', productId);
            return false;
        }

        // Check if item already in cart
        const existingIndex = this.cart.findIndex(item =>
            item.product.id === productId &&
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (existingIndex >= 0) {
            // Increase quantity for physical items
            if (product.type === 'physical') {
                this.cart[existingIndex].quantity += 1;
            } else {
                console.log('Digital item already in cart');
                return false;
            }
        } else {
            // Add new cart item
            this.cart.push({
                product: product,
                options: options, // size, color, etc.
                quantity: product.type === 'physical' ? 1 : 1,
                addedAt: Date.now()
            });
        }

        this.saveShoppingData();

        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                action: 'add',
                product: product,
                cartSize: this.cart.length
            }
        }));

        console.log(`Added to cart: ${product.name}`);
        return true;
    }

    removeFromCart(index) {
        if (index < 0 || index >= this.cart.length) return false;

        const removed = this.cart.splice(index, 1)[0];
        this.saveShoppingData();

        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                action: 'remove',
                product: removed.product,
                cartSize: this.cart.length
            }
        }));

        return true;
    }

    updateCartQuantity(index, quantity) {
        if (index < 0 || index >= this.cart.length || quantity < 1) return false;

        this.cart[index].quantity = quantity;
        this.saveShoppingData();

        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                action: 'update',
                product: this.cart[index].product,
                cartSize: this.cart.length
            }
        }));

        return true;
    }

    clearCart() {
        this.cart = [];
        this.saveShoppingData();

        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: {
                action: 'clear',
                cartSize: 0
            }
        }));
    }

    getCart() {
        return this.cart;
    }

    getCartTotal() {
        let crystals = 0;
        let usd = 0;

        this.cart.forEach(item => {
            const price = item.product.price * (item.quantity || 1);

            if (item.product.currency === 'crystals') {
                crystals += price;
            } else if (item.product.currency === 'usd') {
                usd += price;
            }
        });

        return { crystals, usd };
    }

    // CHECKOUT & PURCHASE

    async checkout() {
        if (this.cart.length === 0) {
            return {
                success: false,
                error: 'Cart is empty'
            };
        }

        const totals = this.getCartTotal();

        // Check crystal balance
        if (totals.crystals > this.wallet.crystals) {
            return {
                success: false,
                error: 'Insufficient Sanctuary Crystals',
                needed: totals.crystals - this.wallet.crystals
            };
        }

        // Process purchase
        const receipt = {
            id: this.generateReceiptId(),
            items: [...this.cart],
            totals: totals,
            timestamp: Date.now(),
            status: 'completed'
        };

        // Deduct crystals
        if (totals.crystals > 0) {
            this.spendCrystals(totals.crystals, 'purchase');
        }

        // Apply items to avatar/inventory
        this.cart.forEach(item => {
            this.applyPurchasedItem(item);
        });

        // Add to purchase history
        this.purchaseHistory.push(receipt);

        // Clear cart
        this.clearCart();

        this.saveShoppingData();

        // Award XP for purchase (if progression system available)
        if (this.progressionSystem) {
            this.progressionSystem.addXP(50, 'mall_purchase');
        }

        window.dispatchEvent(new CustomEvent('purchaseCompleted', {
            detail: receipt
        }));

        console.log('Purchase completed!', receipt);

        return {
            success: true,
            receipt: receipt
        };
    }

    applyPurchasedItem(cartItem) {
        const product = cartItem.product;

        if (product.type === 'avatar') {
            // Apply avatar clothing
            avatarManager.equipAvatarClothing(product, product.slot);

        } else if (product.type === 'physical') {
            // Add to physical clothing wishlist/purchases
            avatarManager.addPhysicalClothing(product, product.slot);

        } else if (product.type === 'bundle') {
            // Apply all items in bundle
            product.includes.forEach(itemId => {
                const item = productCatalog.getProduct(itemId);
                if (item) {
                    if (item.type === 'avatar') {
                        avatarManager.equipAvatarClothing(item, item.slot);
                    } else if (item.type === 'physical') {
                        avatarManager.addPhysicalClothing(item, item.slot);
                    }
                }
            });
        }
    }

    generateReceiptId() {
        return `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // WISHLIST

    addToWishlist(productId) {
        const product = productCatalog.getProduct(productId);
        if (!product) return false;

        if (!this.wishlist.find(item => item.id === productId)) {
            this.wishlist.push({
                ...product,
                addedAt: Date.now()
            });

            this.saveShoppingData();

            window.dispatchEvent(new CustomEvent('wishlistUpdated', {
                detail: {
                    action: 'add',
                    product: product
                }
            }));

            return true;
        }

        return false;
    }

    removeFromWishlist(productId) {
        const index = this.wishlist.findIndex(item => item.id === productId);
        if (index >= 0) {
            const removed = this.wishlist.splice(index, 1)[0];
            this.saveShoppingData();

            window.dispatchEvent(new CustomEvent('wishlistUpdated', {
                detail: {
                    action: 'remove',
                    product: removed
                }
            }));

            return true;
        }

        return false;
    }

    getWishlist() {
        return this.wishlist;
    }

    // PURCHASE HISTORY

    getPurchaseHistory() {
        return this.purchaseHistory;
    }

    getPurchase(receiptId) {
        return this.purchaseHistory.find(p => p.id === receiptId);
    }

    getTotalSpent() {
        return {
            crystals: this.wallet.spentTotal,
            itemsPurchased: this.purchaseHistory.reduce((total, receipt) =>
                total + receipt.items.length, 0
            )
        };
    }

    // REWARDS & EARNING CRYSTALS

    earnCrystalsForAction(action) {
        const rewards = {
            'first_visit_mall': 100,
            'daily_visit_mall': 20,
            'try_on_item': 5,
            'complete_outfit': 50,
            'share_avatar': 30,
            'create_custom_avatar': 75,
            'level_up': 100
        };

        const amount = rewards[action] || 0;
        if (amount > 0) {
            this.addCrystals(amount, action);
            return amount;
        }

        return 0;
    }

    // Give daily bonus crystals
    claimDailyBonus() {
        const lastClaim = localStorage.getItem('last_daily_claim');
        const today = new Date().toDateString();

        if (lastClaim !== today) {
            const bonus = 50;
            this.addCrystals(bonus, 'daily_bonus');
            localStorage.setItem('last_daily_claim', today);

            return {
                success: true,
                amount: bonus
            };
        }

        return {
            success: false,
            error: 'Already claimed today'
        };
    }

    // TRY-ON SYSTEM (Preview items without buying)

    tryOnItem(productId) {
        const product = productCatalog.getProduct(productId);
        if (!product || product.type !== 'avatar') {
            return null;
        }

        // Temporarily apply item to avatar for preview
        const preview = avatarManager.tryOnItem(product, product.slot);

        // Award crystals for trying on (first time)
        const triedOnKey = `tried_on_${productId}`;
        if (!localStorage.getItem(triedOnKey)) {
            this.earnCrystalsForAction('try_on_item');
            localStorage.setItem(triedOnKey, 'true');
        }

        return preview;
    }

    // STATS & ANALYTICS

    getShoppingStats() {
        return {
            wallet: {
                crystals: this.wallet.crystals,
                earned: this.wallet.earnedTotal,
                spent: this.wallet.spentTotal
            },
            cart: {
                items: this.cart.length,
                total: this.getCartTotal()
            },
            wishlist: {
                items: this.wishlist.length
            },
            purchases: {
                total: this.purchaseHistory.length,
                items: this.purchaseHistory.reduce((sum, p) => sum + p.items.length, 0),
                spent: this.getTotalSpent()
            },
            avatar: avatarManager.getAvatarPreview()
        };
    }
}

// Create singleton instance (will be initialized with ProgressionSystem later)
export const shoppingManager = new ShoppingManager();
