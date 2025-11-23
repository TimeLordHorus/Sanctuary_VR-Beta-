/**
 * Knowledge Indexer
 * Indexes Internet Archive and other data preservation sources
 * Builds a knowledge base that can be queried and used for cultural generation
 */

export class KnowledgeIndexer {
  constructor(core) {
    this.core = core;

    // Configuration
    this.config = {
      maxCacheSize: 1000, // Maximum cached items
      updateInterval: 3600000, // 1 hour
      sources: {
        internetArchive: {
          enabled: true,
          apiUrl: 'https://archive.org/advancedsearch.php',
          metadataUrl: 'https://archive.org/metadata/'
        },
        wikidata: {
          enabled: true,
          apiUrl: 'https://www.wikidata.org/w/api.php'
        },
        wikipedia: {
          enabled: true,
          apiUrl: 'https://en.wikipedia.org/w/api.php'
        }
      }
    };

    // Knowledge storage
    this.knowledge = {
      items: new Map(), // Indexed items
      categories: new Map(), // Category -> items
      tags: new Map(), // Tag -> items
      timeline: [], // Chronological index
      relationships: new Map() // Item -> related items
    };

    // Statistics
    this.stats = {
      totalItems: 0,
      totalSources: 0,
      lastUpdate: null,
      queriesProcessed: 0,
      cacheHits: 0
    };

    // Storage key
    this.storageKey = 'sanctuary-knowledge-index';
  }

  /**
   * Initialize the knowledge indexer
   */
  async init() {
    console.log('[KnowledgeIndexer] Initializing knowledge indexer...');

    // Load existing knowledge from storage
    this.loadKnowledge();

    // Set up auto-update
    this.startAutoUpdate();

    console.log('[KnowledgeIndexer] Knowledge indexer initialized');
    console.log(`[KnowledgeIndexer] Loaded ${this.stats.totalItems} items from cache`);

    return this;
  }

  /**
   * Index content from Internet Archive
   */
  async indexInternetArchive(query, options = {}) {
    const {
      mediatype = 'all',
      collection = null,
      maxResults = 50,
      fields = ['identifier', 'title', 'description', 'creator', 'date', 'subject']
    } = options;

    try {
      console.log(`[KnowledgeIndexer] Indexing Internet Archive for: ${query}`);

      // Build query URL
      const params = new URLSearchParams({
        q: query,
        output: 'json',
        rows: maxResults,
        'fl[]': fields.join(',')
      });

      if (mediatype !== 'all') {
        params.append('mediatype', mediatype);
      }

      if (collection) {
        params.append('collection', collection);
      }

      const url = `${this.config.sources.internetArchive.apiUrl}?${params.toString()}`;

      // Fetch data
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const docs = data.response?.docs || [];

      console.log(`[KnowledgeIndexer] Found ${docs.length} items from Internet Archive`);

      // Index each item
      const indexed = [];
      for (const doc of docs) {
        const item = this.createKnowledgeItem({
          id: `ia_${doc.identifier}`,
          source: 'internet_archive',
          title: doc.title,
          description: doc.description || '',
          creator: doc.creator || 'Unknown',
          date: doc.date || new Date().toISOString(),
          subjects: Array.isArray(doc.subject) ? doc.subject : [doc.subject].filter(Boolean),
          url: `https://archive.org/details/${doc.identifier}`,
          metadata: doc
        });

        this.addItem(item);
        indexed.push(item);
      }

      this.saveKnowledge();
      this.core.emit('knowledgeIndexed', { source: 'internet_archive', count: indexed.length, query });

      return indexed;
    } catch (error) {
      console.error('[KnowledgeIndexer] Failed to index Internet Archive:', error);
      return [];
    }
  }

  /**
   * Index content from Wikipedia
   */
  async indexWikipedia(query, options = {}) {
    const { maxResults = 10, language = 'en' } = options;

    try {
      console.log(`[KnowledgeIndexer] Indexing Wikipedia for: ${query}`);

      // Search for articles
      const searchUrl = `https://${language}.wikipedia.org/w/api.php?` + new URLSearchParams({
        action: 'opensearch',
        search: query,
        limit: maxResults,
        format: 'json',
        origin: '*'
      });

      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      const titles = searchData[1] || [];
      const descriptions = searchData[2] || [];
      const urls = searchData[3] || [];

      console.log(`[KnowledgeIndexer] Found ${titles.length} Wikipedia articles`);

      const indexed = [];
      for (let i = 0; i < titles.length; i++) {
        // Get article content
        const contentUrl = `https://${language}.wikipedia.org/w/api.php?` + new URLSearchParams({
          action: 'query',
          prop: 'extracts|categories',
          exintro: true,
          explaintext: true,
          titles: titles[i],
          format: 'json',
          origin: '*'
        });

        const contentResponse = await fetch(contentUrl);
        const contentData = await contentResponse.json();
        const pages = contentData.query?.pages || {};
        const page = Object.values(pages)[0];

        if (page && page.extract) {
          const item = this.createKnowledgeItem({
            id: `wp_${page.pageid}`,
            source: 'wikipedia',
            title: titles[i],
            description: descriptions[i] || '',
            content: page.extract,
            categories: (page.categories || []).map(c => c.title.replace('Category:', '')),
            url: urls[i],
            date: new Date().toISOString(),
            metadata: page
          });

          this.addItem(item);
          indexed.push(item);
        }
      }

      this.saveKnowledge();
      this.core.emit('knowledgeIndexed', { source: 'wikipedia', count: indexed.length, query });

      return indexed;
    } catch (error) {
      console.error('[KnowledgeIndexer] Failed to index Wikipedia:', error);
      return [];
    }
  }

  /**
   * Index content from Wikidata
   */
  async indexWikidata(query, options = {}) {
    const { maxResults = 20 } = options;

    try {
      console.log(`[KnowledgeIndexer] Indexing Wikidata for: ${query}`);

      const url = `${this.config.sources.wikidata.apiUrl}?` + new URLSearchParams({
        action: 'wbsearchentities',
        search: query,
        language: 'en',
        limit: maxResults,
        format: 'json',
        origin: '*'
      });

      const response = await fetch(url);
      const data = await response.json();
      const entities = data.search || [];

      console.log(`[KnowledgeIndexer] Found ${entities.length} Wikidata entities`);

      const indexed = [];
      for (const entity of entities) {
        const item = this.createKnowledgeItem({
          id: `wd_${entity.id}`,
          source: 'wikidata',
          title: entity.label,
          description: entity.description || '',
          type: entity.concepturi,
          url: entity.concepturi,
          date: new Date().toISOString(),
          metadata: entity
        });

        this.addItem(item);
        indexed.push(item);
      }

      this.saveKnowledge();
      this.core.emit('knowledgeIndexed', { source: 'wikidata', count: indexed.length, query });

      return indexed;
    } catch (error) {
      console.error('[KnowledgeIndexer] Failed to index Wikidata:', error);
      return [];
    }
  }

  /**
   * Create a standardized knowledge item
   */
  createKnowledgeItem(data) {
    return {
      id: data.id,
      source: data.source,
      title: data.title || 'Untitled',
      description: data.description || '',
      content: data.content || '',
      creator: data.creator || 'Unknown',
      date: data.date || new Date().toISOString(),
      subjects: data.subjects || [],
      categories: data.categories || [],
      tags: data.tags || [],
      url: data.url || '',
      metadata: data.metadata || {},
      indexed: Date.now(),
      relevance: 1.0
    };
  }

  /**
   * Add item to knowledge base
   */
  addItem(item) {
    // Add to main storage
    this.knowledge.items.set(item.id, item);

    // Index by categories
    for (const category of item.categories) {
      if (!this.knowledge.categories.has(category)) {
        this.knowledge.categories.set(category, []);
      }
      this.knowledge.categories.get(category).push(item.id);
    }

    // Index by tags
    for (const tag of [...item.subjects, ...item.tags]) {
      if (!this.knowledge.tags.has(tag)) {
        this.knowledge.tags.set(tag, []);
      }
      this.knowledge.tags.get(tag).push(item.id);
    }

    // Add to timeline
    this.knowledge.timeline.push({
      id: item.id,
      date: item.date,
      indexed: item.indexed
    });

    // Sort timeline
    this.knowledge.timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update stats
    this.stats.totalItems = this.knowledge.items.size;
    this.stats.lastUpdate = Date.now();

    // Enforce cache limit
    this.enforceCacheLimit();
  }

  /**
   * Search knowledge base
   */
  search(query, options = {}) {
    const {
      source = null,
      category = null,
      tag = null,
      maxResults = 20,
      sortBy = 'relevance' // relevance, date, title
    } = options;

    this.stats.queriesProcessed++;

    const queryLower = query.toLowerCase();
    let results = [];

    // Search through items
    for (const [id, item] of this.knowledge.items) {
      // Filter by source
      if (source && item.source !== source) continue;

      // Filter by category
      if (category && !item.categories.includes(category)) continue;

      // Filter by tag
      if (tag && !item.subjects.includes(tag) && !item.tags.includes(tag)) continue;

      // Calculate relevance
      let relevance = 0;

      // Title match
      if (item.title.toLowerCase().includes(queryLower)) {
        relevance += 10;
      }

      // Description match
      if (item.description.toLowerCase().includes(queryLower)) {
        relevance += 5;
      }

      // Content match
      if (item.content.toLowerCase().includes(queryLower)) {
        relevance += 3;
      }

      // Subject/tag match
      for (const subject of [...item.subjects, ...item.tags]) {
        if (subject.toLowerCase().includes(queryLower)) {
          relevance += 7;
        }
      }

      if (relevance > 0) {
        results.push({ ...item, searchRelevance: relevance });
      }
    }

    // Sort results
    if (sortBy === 'relevance') {
      results.sort((a, b) => b.searchRelevance - a.searchRelevance);
    } else if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'title') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Limit results
    results = results.slice(0, maxResults);

    console.log(`[KnowledgeIndexer] Search for "${query}" returned ${results.length} results`);

    return results;
  }

  /**
   * Get items by category
   */
  getByCategory(category) {
    const itemIds = this.knowledge.categories.get(category) || [];
    return itemIds.map(id => this.knowledge.items.get(id)).filter(Boolean);
  }

  /**
   * Get items by tag
   */
  getByTag(tag) {
    const itemIds = this.knowledge.tags.get(tag) || [];
    return itemIds.map(id => this.knowledge.items.get(id)).filter(Boolean);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.knowledge.categories.keys());
  }

  /**
   * Get all tags
   */
  getTags() {
    return Array.from(this.knowledge.tags.keys());
  }

  /**
   * Get knowledge statistics
   */
  getStats() {
    return {
      ...this.stats,
      categories: this.knowledge.categories.size,
      tags: this.knowledge.tags.size,
      cacheSize: this.knowledge.items.size
    };
  }

  /**
   * Enforce cache size limit
   */
  enforceCacheLimit() {
    if (this.knowledge.items.size > this.config.maxCacheSize) {
      // Remove oldest items
      const itemsToRemove = this.knowledge.items.size - this.config.maxCacheSize;
      const sortedByDate = this.knowledge.timeline.slice(-itemsToRemove);

      for (const item of sortedByDate) {
        this.removeItem(item.id);
      }

      console.log(`[KnowledgeIndexer] Removed ${itemsToRemove} old items to enforce cache limit`);
    }
  }

  /**
   * Remove item from knowledge base
   */
  removeItem(itemId) {
    const item = this.knowledge.items.get(itemId);
    if (!item) return;

    // Remove from main storage
    this.knowledge.items.delete(itemId);

    // Remove from categories
    for (const category of item.categories) {
      const categoryItems = this.knowledge.categories.get(category);
      if (categoryItems) {
        const index = categoryItems.indexOf(itemId);
        if (index > -1) categoryItems.splice(index, 1);
      }
    }

    // Remove from tags
    for (const tag of [...item.subjects, ...item.tags]) {
      const tagItems = this.knowledge.tags.get(tag);
      if (tagItems) {
        const index = tagItems.indexOf(itemId);
        if (index > -1) tagItems.splice(index, 1);
      }
    }

    // Remove from timeline
    const timelineIndex = this.knowledge.timeline.findIndex(t => t.id === itemId);
    if (timelineIndex > -1) {
      this.knowledge.timeline.splice(timelineIndex, 1);
    }

    this.stats.totalItems = this.knowledge.items.size;
  }

  /**
   * Start auto-update
   */
  startAutoUpdate() {
    this.autoUpdateInterval = setInterval(() => {
      this.saveKnowledge();
    }, this.config.updateInterval);
  }

  /**
   * Save knowledge to storage
   */
  saveKnowledge() {
    try {
      const data = {
        items: Array.from(this.knowledge.items.entries()),
        categories: Array.from(this.knowledge.categories.entries()),
        tags: Array.from(this.knowledge.tags.entries()),
        timeline: this.knowledge.timeline,
        stats: this.stats
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log(`[KnowledgeIndexer] Saved ${this.stats.totalItems} items to storage`);
    } catch (error) {
      console.error('[KnowledgeIndexer] Failed to save knowledge:', error);
    }
  }

  /**
   * Load knowledge from storage
   */
  loadKnowledge() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;

      const data = JSON.parse(saved);

      this.knowledge.items = new Map(data.items || []);
      this.knowledge.categories = new Map(data.categories || []);
      this.knowledge.tags = new Map(data.tags || []);
      this.knowledge.timeline = data.timeline || [];
      this.stats = data.stats || this.stats;

      console.log(`[KnowledgeIndexer] Loaded knowledge from storage`);
    } catch (error) {
      console.error('[KnowledgeIndexer] Failed to load knowledge:', error);
    }
  }

  /**
   * Clear all knowledge
   */
  clear() {
    this.knowledge.items.clear();
    this.knowledge.categories.clear();
    this.knowledge.tags.clear();
    this.knowledge.timeline = [];
    this.stats.totalItems = 0;
    this.saveKnowledge();
    console.log('[KnowledgeIndexer] Cleared all knowledge');
  }

  /**
   * Destroy indexer
   */
  destroy() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
    this.saveKnowledge();
  }
}
