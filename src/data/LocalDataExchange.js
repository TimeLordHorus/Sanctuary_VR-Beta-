/**
 * Local Data Exchange
 * Decentralized local storage and peer-to-peer data sharing system
 * Stores user data locally and allows sharing without central servers
 */

export class LocalDataExchange {
  constructor(core) {
    this.core = core;

    // Local database
    this.database = {
      user: {
        id: null,
        username: null,
        profile: {},
        createdAt: null
      },
      sanctuaries: [],
      creations: [],
      achievements: [],
      resources: {},
      cultural: {},
      quests: [],
      marketplace: {
        listings: [],
        trades: []
      }
    };

    // Shared data from peers
    this.peerData = new Map();

    // Export/Import format version
    this.version = '1.0.0';

    // Storage keys
    this.storageKey = 'sanctuary-local-database';
    this.exportPrefix = 'sanctuary-export';
  }

  /**
   * Initialize local data exchange
   */
  async init() {
    console.log('[LocalDataExchange] Initializing local data exchange...');

    // Load local database
    this.loadDatabase();

    // Generate user ID if not exists
    if (!this.database.user.id) {
      this.database.user.id = this.generateUserId();
      this.database.user.createdAt = Date.now();
    }

    // Set up automatic sync
    this.setupAutoSync();

    // Create UI
    this.createExchangeUI();

    console.log('[LocalDataExchange] Local data exchange initialized');
    console.log('[LocalDataExchange] User ID:', this.database.user.id);

    return this;
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sync all data from various systems
   */
  syncAllData() {
    console.log('[LocalDataExchange] Syncing all data...');

    // Sync user profile
    if (window.welcomeLogin && window.welcomeLogin.userData) {
      this.database.user.username = window.welcomeLogin.userData.username;
      this.database.user.profile = window.welcomeLogin.userData;
    }

    // Sync resources
    if (window.resourceSystem) {
      this.database.resources = window.resourceSystem.getInventory();
    }

    // Sync progression
    if (window.progressionSystem) {
      this.database.user.level = window.progressionSystem.userData.level;
      this.database.user.xp = window.progressionSystem.userData.xp;
    }

    // Sync achievements
    if (window.achievementSystem) {
      this.database.achievements = window.achievementSystem.getAllAchievements()
        .filter(a => a.unlocked);
    }

    // Sync cultural data
    if (window.culturalGenerator) {
      this.database.cultural = window.culturalGenerator.getCultureSummary();
    }

    // Sync patron
    if (window.pantheonSelection) {
      this.database.user.patron = window.pantheonSelection.getSelectedPatron();
    }

    // Sync quests (if quest system exists)
    if (window.questGenerator) {
      this.database.quests = window.questGenerator.getAllQuests();
    }

    // Save to storage
    this.saveDatabase();

    console.log('[LocalDataExchange] Sync complete');
    this.core.emit('dataSynced', { database: this.database });
  }

  /**
   * Set up automatic sync
   */
  setupAutoSync() {
    // Sync every 30 seconds
    setInterval(() => {
      this.syncAllData();
    }, 30000);

    // Sync on page unload
    window.addEventListener('beforeunload', () => {
      this.syncAllData();
    });

    // Sync on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.syncAllData();
      }
    });
  }

  /**
   * Export user data to file
   */
  exportData(options = {}) {
    const {
      includeProfile = true,
      includeSanctuaries = true,
      includeResources = true,
      includeAchievements = true,
      includeCultural = true,
      includeQuests = true
    } = options;

    // Sync before export
    this.syncAllData();

    // Build export data
    const exportData = {
      version: this.version,
      exportedAt: Date.now(),
      userId: this.database.user.id,
      data: {}
    };

    if (includeProfile) {
      exportData.data.user = this.database.user;
    }

    if (includeSanctuaries) {
      exportData.data.sanctuaries = this.database.sanctuaries;
    }

    if (includeResources) {
      exportData.data.resources = this.database.resources;
    }

    if (includeAchievements) {
      exportData.data.achievements = this.database.achievements;
    }

    if (includeCultural) {
      exportData.data.cultural = this.database.cultural;
    }

    if (includeQuests) {
      exportData.data.quests = this.database.quests;
    }

    // Convert to JSON
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.exportPrefix}-${this.database.user.username || 'user'}-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);

    console.log('[LocalDataExchange] Exported data');
    this.core.emit('dataExported', { size: json.length });

    return exportData;
  }

  /**
   * Import user data from file
   */
  async importData(file, options = {}) {
    const {
      merge = false,
      overwrite = false
    } = options;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);

          // Validate format
          if (!imported.version || !imported.data) {
            throw new Error('Invalid export format');
          }

          // Version check
          if (imported.version !== this.version) {
            console.warn('[LocalDataExchange] Version mismatch:', imported.version, 'vs', this.version);
          }

          // Import data
          if (merge) {
            // Merge with existing data
            this.mergeImportedData(imported.data);
          } else if (overwrite) {
            // Overwrite existing data
            this.database = {
              user: imported.data.user || this.database.user,
              sanctuaries: imported.data.sanctuaries || [],
              creations: imported.data.creations || [],
              achievements: imported.data.achievements || [],
              resources: imported.data.resources || {},
              cultural: imported.data.cultural || {},
              quests: imported.data.quests || [],
              marketplace: this.database.marketplace
            };
          }

          // Save
          this.saveDatabase();

          // Apply to systems
          this.applyImportedDataToSystems(imported.data);

          console.log('[LocalDataExchange] Imported data successfully');
          this.core.emit('dataImported', { imported });

          resolve(imported);
        } catch (error) {
          console.error('[LocalDataExchange] Import failed:', error);
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Merge imported data with existing
   */
  mergeImportedData(importedData) {
    // Merge resources (add quantities)
    if (importedData.resources) {
      Object.entries(importedData.resources).forEach(([type, amount]) => {
        this.database.resources[type] = (this.database.resources[type] || 0) + amount;
      });
    }

    // Merge sanctuaries (add new ones)
    if (importedData.sanctuaries) {
      importedData.sanctuaries.forEach(sanctuary => {
        if (!this.database.sanctuaries.find(s => s.id === sanctuary.id)) {
          this.database.sanctuaries.push(sanctuary);
        }
      });
    }

    // Merge achievements (unlock new ones)
    if (importedData.achievements) {
      importedData.achievements.forEach(achievement => {
        if (!this.database.achievements.find(a => a.id === achievement.id)) {
          this.database.achievements.push(achievement);
        }
      });
    }

    // Merge quests
    if (importedData.quests) {
      importedData.quests.forEach(quest => {
        if (!this.database.quests.find(q => q.id === quest.id)) {
          this.database.quests.push(quest);
        }
      });
    }
  }

  /**
   * Apply imported data to active systems
   */
  applyImportedDataToSystems(importedData) {
    // Apply resources
    if (importedData.resources && window.resourceSystem) {
      Object.entries(importedData.resources).forEach(([type, amount]) => {
        window.resourceSystem.inventory[type] = amount;
      });
      window.resourceSystem.saveInventory();
      window.resourceSystem.updateResourceUI();
    }

    // Apply cultural data
    if (importedData.cultural && window.culturalGenerator) {
      // Could update cultural generator state
    }

    // Apply quests
    if (importedData.quests && window.questGenerator) {
      importedData.quests.forEach(quest => {
        window.questGenerator.addQuest(quest);
      });
    }
  }

  /**
   * Share data to clipboard (for peer sharing)
   */
  shareToClipboard(dataType = 'all') {
    this.syncAllData();

    let shareData = {};

    switch (dataType) {
      case 'profile':
        shareData = { user: this.database.user };
        break;
      case 'resources':
        shareData = { resources: this.database.resources };
        break;
      case 'sanctuary':
        shareData = { sanctuaries: this.database.sanctuaries };
        break;
      case 'all':
        shareData = this.database;
        break;
    }

    const encoded = btoa(JSON.stringify(shareData));
    const shareCode = `SANCTUARY:${encoded}`;

    navigator.clipboard.writeText(shareCode).then(() => {
      console.log('[LocalDataExchange] Share code copied to clipboard');
      this.showMessage('Share code copied to clipboard!', 'success');
    }).catch(err => {
      console.error('[LocalDataExchange] Failed to copy:', err);
    });

    return shareCode;
  }

  /**
   * Load data from share code
   */
  loadFromShareCode(shareCode) {
    try {
      // Validate format
      if (!shareCode.startsWith('SANCTUARY:')) {
        throw new Error('Invalid share code format');
      }

      // Decode
      const encoded = shareCode.replace('SANCTUARY:', '');
      const decoded = atob(encoded);
      const data = JSON.parse(decoded);

      // Store as peer data
      const peerId = data.user?.id || `peer_${Date.now()}`;
      this.peerData.set(peerId, {
        data,
        receivedAt: Date.now()
      });

      console.log('[LocalDataExchange] Loaded peer data');
      this.core.emit('peerDataLoaded', { peerId, data });

      this.showMessage('Peer data loaded successfully!', 'success');

      return { peerId, data };
    } catch (error) {
      console.error('[LocalDataExchange] Failed to load share code:', error);
      this.showMessage('Invalid share code', 'error');
      return null;
    }
  }

  /**
   * Create marketplace listing
   */
  createListing(item) {
    const listing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      seller: this.database.user.id,
      sellerName: this.database.user.username,
      item: item.type,
      quantity: item.quantity,
      price: item.price,
      currency: item.currency || 'resources',
      createdAt: Date.now(),
      status: 'active'
    };

    this.database.marketplace.listings.push(listing);
    this.saveDatabase();

    console.log('[LocalDataExchange] Created listing:', listing.id);
    this.core.emit('listingCreated', { listing });

    return listing;
  }

  /**
   * Browse peer marketplace
   */
  browsePeerMarketplace() {
    const allListings = [];

    // Add own listings
    allListings.push(...this.database.marketplace.listings.filter(l => l.status === 'active'));

    // Add peer listings
    for (const [peerId, peerInfo] of this.peerData.entries()) {
      if (peerInfo.data.marketplace && peerInfo.data.marketplace.listings) {
        peerInfo.data.marketplace.listings
          .filter(l => l.status === 'active')
          .forEach(listing => {
            allListings.push({
              ...listing,
              isPeer: true,
              peerId
            });
          });
      }
    }

    return allListings;
  }

  /**
   * Create exchange UI
   */
  createExchangeUI() {
    const ui = document.createElement('div');
    ui.id = 'data-exchange-ui';
    ui.className = 'data-exchange-ui hidden';

    ui.innerHTML = `
      <div class="data-exchange-panel">
        <div class="data-exchange-header">
          <h2>📦 Data Exchange</h2>
          <button id="close-exchange" class="close-btn">✕</button>
        </div>

        <div class="exchange-tabs">
          <button class="exchange-tab active" data-tab="export">Export</button>
          <button class="exchange-tab" data-tab="import">Import</button>
          <button class="exchange-tab" data-tab="share">Share</button>
          <button class="exchange-tab" data-tab="marketplace">Marketplace</button>
        </div>

        <div class="exchange-content">
          <!-- Export Tab -->
          <div id="export-tab" class="exchange-tab-content active">
            <h3>Export Your Data</h3>
            <p>Download your sanctuary data to share or backup</p>

            <div class="export-options">
              <label><input type="checkbox" id="export-profile" checked> Profile</label>
              <label><input type="checkbox" id="export-resources" checked> Resources</label>
              <label><input type="checkbox" id="export-achievements" checked> Achievements</label>
              <label><input type="checkbox" id="export-cultural" checked> Cultural Data</label>
              <label><input type="checkbox" id="export-quests" checked> Quests</label>
            </div>

            <button id="export-data-btn" class="exchange-btn">📥 Export Data</button>
          </div>

          <!-- Import Tab -->
          <div id="import-tab" class="exchange-tab-content">
            <h3>Import Data</h3>
            <p>Load sanctuary data from a file</p>

            <div class="import-options">
              <label><input type="radio" name="import-mode" value="merge" checked> Merge with existing</label>
              <label><input type="radio" name="import-mode" value="overwrite"> Overwrite existing</label>
            </div>

            <input type="file" id="import-file" accept=".json" style="display: none">
            <button id="import-data-btn" class="exchange-btn">📤 Select File to Import</button>
          </div>

          <!-- Share Tab -->
          <div id="share-tab" class="exchange-tab-content">
            <h3>Share with Peers</h3>
            <p>Generate a share code to exchange data locally</p>

            <div class="share-options">
              <button class="share-type-btn" data-type="all">Share Everything</button>
              <button class="share-type-btn" data-type="profile">Share Profile</button>
              <button class="share-type-btn" data-type="resources">Share Resources</button>
              <button class="share-type-btn" data-type="sanctuary">Share Sanctuary</button>
            </div>

            <div class="share-code-area">
              <h4>Load Peer Data</h4>
              <textarea id="share-code-input" placeholder="Paste share code here..."></textarea>
              <button id="load-share-code-btn" class="exchange-btn">Load Peer Data</button>
            </div>

            <div id="peer-list" class="peer-list">
              <h4>Connected Peers</h4>
              <div id="peer-items"></div>
            </div>
          </div>

          <!-- Marketplace Tab -->
          <div id="marketplace-tab" class="exchange-tab-content">
            <h3>Local Marketplace</h3>
            <p>Trade resources with connected peers</p>

            <div class="marketplace-actions">
              <button id="create-listing-btn" class="exchange-btn">+ Create Listing</button>
              <button id="refresh-marketplace-btn" class="exchange-btn">🔄 Refresh</button>
            </div>

            <div id="marketplace-listings" class="marketplace-listings">
              <!-- Listings will be added dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(ui);

    // Set up event listeners
    this.setupExchangeUIListeners();
  }

  /**
   * Set up UI event listeners
   */
  setupExchangeUIListeners() {
    // Close button
    document.getElementById('close-exchange')?.addEventListener('click', () => {
      this.hideUI();
    });

    // Tab switching
    document.querySelectorAll('.exchange-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Export button
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
      const options = {
        includeProfile: document.getElementById('export-profile')?.checked,
        includeResources: document.getElementById('export-resources')?.checked,
        includeAchievements: document.getElementById('export-achievements')?.checked,
        includeCultural: document.getElementById('export-cultural')?.checked,
        includeQuests: document.getElementById('export-quests')?.checked
      };
      this.exportData(options);
    });

    // Import button
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
      document.getElementById('import-file')?.click();
    });

    document.getElementById('import-file')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const mode = document.querySelector('input[name="import-mode"]:checked')?.value;
        this.importData(file, {
          merge: mode === 'merge',
          overwrite: mode === 'overwrite'
        });
      }
    });

    // Share buttons
    document.querySelectorAll('.share-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.dataset.type;
        this.shareToClipboard(type);
      });
    });

    // Load share code
    document.getElementById('load-share-code-btn')?.addEventListener('click', () => {
      const code = document.getElementById('share-code-input')?.value;
      if (code) {
        this.loadFromShareCode(code);
        this.updatePeerList();
      }
    });

    // Marketplace
    document.getElementById('refresh-marketplace-btn')?.addEventListener('click', () => {
      this.updateMarketplace();
    });
  }

  /**
   * Switch tab
   */
  switchTab(tabName) {
    document.querySelectorAll('.exchange-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.exchange-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Update content when switching
    if (tabName === 'marketplace') {
      this.updateMarketplace();
    } else if (tabName === 'share') {
      this.updatePeerList();
    }
  }

  /**
   * Update peer list
   */
  updatePeerList() {
    const container = document.getElementById('peer-items');
    if (!container) return;

    if (this.peerData.size === 0) {
      container.innerHTML = '<p class="no-peers">No connected peers yet</p>';
      return;
    }

    container.innerHTML = Array.from(this.peerData.entries())
      .map(([peerId, peerInfo]) => `
        <div class="peer-item">
          <div class="peer-info">
            <strong>${peerInfo.data.user?.username || 'Unknown User'}</strong>
            <span class="peer-id">${peerId.substr(0, 20)}...</span>
          </div>
          <div class="peer-stats">
            <span>Lv. ${peerInfo.data.user?.level || 1}</span>
            <span>${Object.keys(peerInfo.data.resources || {}).length} Resources</span>
          </div>
        </div>
      `)
      .join('');
  }

  /**
   * Update marketplace
   */
  updateMarketplace() {
    const container = document.getElementById('marketplace-listings');
    if (!container) return;

    const listings = this.browsePeerMarketplace();

    if (listings.length === 0) {
      container.innerHTML = '<p class="no-listings">No active listings</p>';
      return;
    }

    container.innerHTML = listings.map(listing => `
      <div class="marketplace-listing ${listing.isPeer ? 'peer-listing' : 'own-listing'}">
        <div class="listing-item">
          <strong>${listing.item}</strong>
          <span>×${listing.quantity}</span>
        </div>
        <div class="listing-price">
          ${listing.price} ${listing.currency}
        </div>
        <div class="listing-seller">
          ${listing.sellerName}
          ${listing.isPeer ? '🌐' : '⭐'}
        </div>
      </div>
    `).join('');
  }

  /**
   * Show UI
   */
  showUI() {
    const ui = document.getElementById('data-exchange-ui');
    if (ui) {
      ui.classList.remove('hidden');
      this.syncAllData();
    }
  }

  /**
   * Hide UI
   */
  hideUI() {
    const ui = document.getElementById('data-exchange-ui');
    if (ui) {
      ui.classList.add('hidden');
    }
  }

  /**
   * Toggle UI
   */
  toggleUI() {
    const ui = document.getElementById('data-exchange-ui');
    if (ui) {
      if (ui.classList.contains('hidden')) {
        this.showUI();
      } else {
        this.hideUI();
      }
    }
  }

  /**
   * Show message
   */
  showMessage(message, type = 'info') {
    this.core.emit('exchangeMessage', { message, type });

    const toast = document.createElement('div');
    toast.className = `exchange-toast exchange-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * Save database to storage
   */
  saveDatabase() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.database));
    } catch (error) {
      console.error('[LocalDataExchange] Failed to save database:', error);
    }
  }

  /**
   * Load database from storage
   */
  loadDatabase() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const loaded = JSON.parse(saved);
        this.database = { ...this.database, ...loaded };
        console.log('[LocalDataExchange] Loaded database');
      }
    } catch (error) {
      console.error('[LocalDataExchange] Failed to load database:', error);
    }
  }

  /**
   * Get database
   */
  getDatabase() {
    return { ...this.database };
  }

  /**
   * Clear all data
   */
  clearAllData() {
    if (confirm('Clear all local data? This cannot be undone!')) {
      this.database = {
        user: {
          id: this.generateUserId(),
          username: null,
          profile: {},
          createdAt: Date.now()
        },
        sanctuaries: [],
        creations: [],
        achievements: [],
        resources: {},
        cultural: {},
        quests: [],
        marketplace: {
          listings: [],
          trades: []
        }
      };

      this.saveDatabase();
      console.log('[LocalDataExchange] Cleared all data');
    }
  }

  /**
   * Destroy system
   */
  destroy() {
    this.syncAllData();
    document.getElementById('data-exchange-ui')?.remove();
  }
}
