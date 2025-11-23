# Virtual Mall - Dead Mall of the Future 🛍️

## Overview

The Virtual Mall is an immersive shopping experience that blends the aesthetics of abandoned malls with futuristic cyberpunk themes. Users can shop for both **virtual avatar clothing** and **physical merchandise** while exploring a nostalgic yet futuristic environment.

## Features

### 🎭 Dual Shopping System

1. **Avatar Fashion** 👤
   - Virtual clothing items for your in-game avatar
   - Cyberpunk, vintage, and futuristic styles
   - Instant try-on and preview system
   - Purchased with Sanctuary Crystals (in-game currency)

2. **Physical Fashion** 📦
   - Real-world clothing delivered to you
   - Matching items with your avatar outfits ("Twin Fashion")
   - Vintage mall aesthetics and cyberpunk designs
   - Standard USD pricing with worldwide shipping

### 💎 Currency System

- **Sanctuary Crystals**: Virtual currency for avatar items
- Starting balance: 500 crystals
- Earn crystals by:
  - First mall visit: +100 crystals
  - Daily mall visits: +20 crystals
  - Trying on items: +5 crystals (first time per item)
  - Completing outfits: +50 crystals
  - Leveling up: +100 crystals
  - Creating custom avatars: +75 crystals

### 🏬 Mall Locations

1. **Mall Entrance**
   - Central fountain
   - Mall directory
   - Access to all stores
   - Return portal to Sanctuary

2. **Neon Soul** - Cyberpunk Fashion
   - High-tech streetwear
   - Animated LED clothing
   - Holographic accessories
   - Tech cargo pants and gravity-defying sneakers

3. **Phantom Threads** - Vintage Revival
   - 90s mall walker aesthetics
   - Retro windbreakers
   - Classic denim and vintage tees
   - Nostalgia-driven designs

4. **Pixel Couture** - Luxury Digital
   - High-end avatar fashion
   - Holographic dresses
   - AR visors with functional HUD
   - Exclusive items (level-gated)

### 🎨 Product Categories

- **Cyberpunk**: Neon lights, tech aesthetics, animated effects
- **Vintage**: 80s-90s mall culture, nostalgic designs
- **Bundle**: Twin packs (avatar + physical matching outfits)
- **Accessories**: Visors, jewelry, tech gadgets

### 👗 Avatar Customization

- **Clothing Slots**: Head, Top, Bottom, Shoes, Accessories
- **Try-On System**: Preview items before purchase
- **Wardrobe Management**: Track all owned items
- **Outfit Combinations**: Mix and match for unique looks
- **Physical Wishlist**: Save real-world items for later

## How to Access

### In VR Scene
1. Look for the **glowing purple portal** in the Sanctuary entrance
2. The portal is located at position `-5, 0, -3` (left side of spawn)
3. Click/interact with the portal to enter

### Via Sanctuary Menu
1. Press **Q** to open the Sanctuary Menu
2. Click the **🛍️ Virtual Mall** tab
3. Browse and shop from the menu interface

## File Structure

```
src/
├── avatar/
│   └── AvatarManager.js          # Avatar state and clothing management
├── shopping/
│   ├── ProductCatalog.js         # Product definitions and filtering
│   ├── ShoppingManager.js        # Cart, currency, purchases
│   └── ShoppingUI.js             # User interface components
├── scenes/
│   └── MallScenes.js             # Virtual mall scene configurations
└── styles/
    └── shopping.css              # Shopping UI styles
```

## Product Data Structure

```javascript
{
  id: 'unique_product_id',
  name: 'Product Name',
  type: 'avatar' | 'physical' | 'bundle',
  category: 'cyberpunk' | 'vintage' | 'bundle',
  slot: 'head' | 'top' | 'bottom' | 'shoes' | 'accessories',
  brand: 'brand_id',
  price: 150,
  currency: 'crystals' | 'usd',
  description: 'Product description...',
  colors: ['color1', 'color2'],
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  model: '/models/path/to/model.glb',
  thumbnail: '/images/path/to/thumbnail.jpg',
  tags: ['tag1', 'tag2'],
  unlockLevel: 5 // Optional level requirement
}
```

## Shopping Flow

1. **Browse** → View products by category or search
2. **Try On** → Preview avatar items (earn crystals!)
3. **Add to Cart** → Select items to purchase
4. **Checkout** → Complete purchase with crystals
5. **Equip** → Items automatically added to wardrobe

## Integration Points

### With Progression System
- Earn crystals through gameplay
- Level-gated exclusive items
- XP rewards for purchases

### With Avatar System
- Real-time clothing updates
- Visual preview system
- Persistent wardrobe storage

### With Scene Manager
- Navigate between mall locations
- Interactive store fronts
- Seamless transitions

## Future Enhancements

- [ ] User-generated content marketplace (Phase 8)
- [ ] Seasonal limited-edition items
- [ ] Fashion shows and avatar contests
- [ ] Social shopping with friends
- [ ] VR fitting rooms with mirrors
- [ ] Animated clothing with special effects
- [ ] Clothing customization (colors, patterns)
- [ ] Trade/gift system between users

## Technical Details

### Storage
- **Avatar State**: `localStorage['sanctuary_avatar']`
- **Shopping Data**: `localStorage['sanctuary_shopping']`
- **Wallet**: `localStorage['sanctuary_wallet']`
- **Mall Visits**: `localStorage['visited_mall']`

### Events
- `cartUpdated`: Cart contents changed
- `crystalsChanged`: Currency balance updated
- `avatarUpdated`: Avatar appearance modified
- `purchaseCompleted`: Transaction successful
- `wishlistUpdated`: Wishlist modified

### API
```javascript
// Shopping Manager
shoppingManager.addToCart(productId, options)
shoppingManager.checkout()
shoppingManager.addCrystals(amount, reason)
shoppingManager.earnCrystalsForAction(action)

// Avatar Manager
avatarManager.equipAvatarClothing(item, slot)
avatarManager.tryOnItem(item, slot)
avatarManager.getEquippedItems(type)

// Product Catalog
productCatalog.getProduct(id)
productCatalog.getProductsByCategory(category)
productCatalog.searchProducts(query)
productCatalog.getFeaturedProducts(limit)
```

## Design Philosophy

The Virtual Mall embraces "dead mall" aesthetics - the haunting beauty of abandoned shopping centers mixed with a cyberpunk future. It's a nostalgic experience that celebrates mall culture while pushing into speculative digital fashion.

**Key Themes:**
- Nostalgia meets futurism
- Physical and digital convergence
- Self-expression through fashion
- Gamified shopping experience
- Community and culture

## Credits

- Concept: Dead Mall of the Future
- Architecture: VR Shopping Experience
- Styles: Cyberpunk, Vaporwave, Y2K Nostalgia
- Currency: Sanctuary Crystals

---

**Welcome to the future of shopping. Welcome to the Virtual Mall.** 🌃✨
