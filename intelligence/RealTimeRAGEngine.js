/**
 * Real-Time RAG (Retrieval-Augmented Generation) Engine
 * Inspired by VAST InsightEngine - Build understanding from experiences
 * 
 * Retrieves relevant past experiences and generates context-aware results
 */

export class RealTimeRAGEngine {
  constructor() {
    // Vector database for experience embeddings
    this.vectorDB = new VectorDatabase()
    
    // LLM interface for generation
    this.llm = new LLMInterface()
    
    // Experience store
    this.experienceStore = new Map()
    
    // Performance metrics
    this.metrics = {
      totalExperiences: 0,
      totalQueries: 0,
      avgRetrievalTime: 0,
      avgGenerationTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    }
    
    // Cache for frequent queries
    this.queryCache = new Map()
  }
  
  // ============================================================================
  // EXPERIENCE INDEXING
  // ============================================================================
  
  /**
   * Index a successful experience
   * @param {Object} experience - Experience to index
   * @returns {Promise<string>} Experience ID
   */
  async indexExperience(experience) {
    const startTime = performance.now()
    
    try {
      // Generate unique ID
      const id = experience.id || this.generateId()
      
      // Extract features for embedding
      const features = this.extractFeatures(experience)
      
      // Create embedding
      const embedding = await this.llm.embed(JSON.stringify(features))
      
      // Store in vector DB
      await this.vectorDB.insert({
        id,
        embedding,
        metadata: {
          ...experience,
          indexed: Date.now()
        }
      })
      
      // Store full experience
      this.experienceStore.set(id, experience)
      
      // Update metrics
      this.metrics.totalExperiences++
      
      console.log(`[RAG] Indexed experience: ${id}`)
      
      return id
      
    } catch (error) {
      console.error('[RAG] Error indexing experience:', error)
      throw error
    }
  }
  
  /**
   * Index multiple experiences in batch
   * @param {Array<Object>} experiences - Experiences to index
   * @returns {Promise<Array<string>>} Experience IDs
   */
  async indexBatch(experiences) {
    const startTime = performance.now()
    
    const ids = await Promise.all(
      experiences.map(exp => this.indexExperience(exp))
    )
    
    const time = performance.now() - startTime
    console.log(`[RAG] Indexed ${experiences.length} experiences in ${time.toFixed(2)}ms`)
    
    return ids
  }
  
  // ============================================================================
  // RETRIEVAL
  // ============================================================================
  
  /**
   * Retrieve relevant experiences
   * @param {string} query - Query string
   * @param {Object} options - Retrieval options
   * @returns {Promise<Array<Object>>} Relevant experiences
   */
  async retrieve(query, options = {}) {
    const startTime = performance.now()
    
    try {
      // Check cache
      const cacheKey = this.getCacheKey(query, options)
      if (this.queryCache.has(cacheKey)) {
        this.metrics.cacheHits++
        return this.queryCache.get(cacheKey)
      }
      this.metrics.cacheMisses++
      
      // Create query embedding
      const queryEmbedding = await this.llm.embed(query)
      
      // Search vector DB
      const results = await this.vectorDB.search(queryEmbedding, {
        limit: options.limit || 10,
        threshold: options.threshold || 0.7,
        filters: options.filters
      })
      
      // Retrieve full experiences
      const experiences = results.map(r => ({
        ...this.experienceStore.get(r.id),
        similarity: r.similarity,
        score: r.score
      }))
      
      // Cache result
      this.queryCache.set(cacheKey, experiences)
      
      // Update metrics
      const retrievalTime = performance.now() - startTime
      this.updateMetrics('retrieval', retrievalTime)
      
      return experiences
      
    } catch (error) {
      console.error('[RAG] Error retrieving experiences:', error)
      return []
    }
  }
  
  // ============================================================================
  // GENERATION
  // ============================================================================
  
  /**
   * Generate with context from retrieved experiences
   * @param {string} query - Query/prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated result
   */
  async generateWithContext(query, options = {}) {
    const startTime = performance.now()
    
    try {
      // 1. Retrieve relevant experiences
      const relevantExperiences = await this.retrieve(query, {
        limit: options.contextLimit || 10,
        threshold: options.similarityThreshold || 0.7
      })
      
      if (relevantExperiences.length === 0) {
        console.warn('[RAG] No relevant experiences found, generating without context')
      }
      
      // 2. Build context from experiences
      const context = this.buildContext(relevantExperiences)
      
      // 3. Generate with LLM
      const result = await this.llm.generate({
        prompt: query,
        context: JSON.stringify(context),
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 500
      })
      
      // 4. Update metrics
      const generationTime = performance.now() - startTime
      this.updateMetrics('generation', generationTime)
      this.metrics.totalQueries++
      
      return {
        result,
        context: relevantExperiences,
        contextCount: relevantExperiences.length,
        generationTime
      }
      
    } catch (error) {
      console.error('[RAG] Error generating with context:', error)
      throw error
    }
  }
  
  /**
   * Build context from retrieved experiences
   * @param {Array<Object>} experiences - Retrieved experiences
   * @returns {Object} Context object
   */
  buildContext(experiences) {
    // Extract key patterns from experiences
    const patterns = {
      bpm: [],
      keys: [],
      instruments: new Set(),
      culturalElements: new Set(),
      successFactors: []
    }
    
    for (const exp of experiences) {
      if (exp.bpm) patterns.bpm.push(exp.bpm)
      if (exp.key) patterns.keys.push(exp.key)
      if (exp.instruments) {
        exp.instruments.forEach(inst => patterns.instruments.add(inst))
      }
      if (exp.culturalElements) {
        exp.culturalElements.forEach(elem => patterns.culturalElements.add(elem))
      }
      if (exp.successScore) {
        patterns.successFactors.push({
          score: exp.successScore,
          factors: exp.successFactors
        })
      }
    }
    
    // Calculate statistics
    return {
      avgBPM: patterns.bpm.length > 0 
        ? patterns.bpm.reduce((a, b) => a + b, 0) / patterns.bpm.length 
        : null,
      commonKeys: this.getMostCommon(patterns.keys),
      popularInstruments: Array.from(patterns.instruments),
      culturalElements: Array.from(patterns.culturalElements),
      successPatterns: this.analyzeSuccessFactors(patterns.successFactors),
      experienceCount: experiences.length,
      avgSimilarity: experiences.reduce((sum, e) => sum + (e.similarity || 0), 0) / experiences.length
    }
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Extract features from experience
   * @param {Object} experience - Experience object
   * @returns {Object} Extracted features
   */
  extractFeatures(experience) {
    return {
      type: experience.type,
      style: experience.style,
      region: experience.region,
      era: experience.era,
      mood: experience.mood,
      bpm: experience.bpm,
      key: experience.key,
      instruments: experience.instruments,
      culturalAuthenticity: experience.culturalAuthenticity,
      userRating: experience.userRating
    }
  }
  
  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Get cache key
   * @param {string} query - Query string
   * @param {Object} options - Options
   * @returns {string} Cache key
   */
  getCacheKey(query, options) {
    return `${query}:${JSON.stringify(options)}`
  }
  
  /**
   * Get most common items
   * @param {Array} items - Items array
   * @returns {Array} Most common items
   */
  getMostCommon(items) {
    const counts = {}
    items.forEach(item => {
      counts[item] = (counts[item] || 0) + 1
    })
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([item]) => item)
  }
  
  /**
   * Analyze success factors
   * @param {Array<Object>} factors - Success factors
   * @returns {Object} Analysis
   */
  analyzeSuccessFactors(factors) {
    if (factors.length === 0) return null
    
    const avgScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length
    
    // Find common factors in high-scoring experiences
    const highScoring = factors.filter(f => f.score > 0.8)
    const commonFactors = new Set()
    
    highScoring.forEach(f => {
      if (f.factors) {
        f.factors.forEach(factor => commonFactors.add(factor))
      }
    })
    
    return {
      avgScore,
      commonFactors: Array.from(commonFactors)
    }
  }
  
  /**
   * Update metrics
   * @param {string} type - Metric type
   * @param {number} time - Time in ms
   */
  updateMetrics(type, time) {
    if (type === 'retrieval') {
      const total = this.metrics.totalQueries
      this.metrics.avgRetrievalTime = 
        (this.metrics.avgRetrievalTime * total + time) / (total + 1)
    } else if (type === 'generation') {
      const total = this.metrics.totalQueries
      this.metrics.avgGenerationTime = 
        (this.metrics.avgGenerationTime * total + time) / (total + 1)
    }
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    const totalCacheAccess = this.metrics.cacheHits + this.metrics.cacheMisses
    
    return {
      ...this.metrics,
      avgRetrievalTime: this.metrics.avgRetrievalTime.toFixed(2) + 'ms',
      avgGenerationTime: this.metrics.avgGenerationTime.toFixed(2) + 'ms',
      cacheHitRate: totalCacheAccess > 0 
        ? ((this.metrics.cacheHits / totalCacheAccess) * 100).toFixed(2) + '%'
        : '0%'
    }
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.queryCache.clear()
    console.log('[RAG] Cache cleared')
  }
}

// ============================================================================
// VECTOR DATABASE
// ============================================================================

class VectorDatabase {
  constructor() {
    this.vectors = []
    this.index = new Map()
  }
  
  /**
   * Insert vector with metadata
   * @param {Object} data - Vector data
   */
  async insert(data) {
    const { id, embedding, metadata } = data
    
    this.vectors.push({
      id,
      embedding,
      metadata
    })
    
    this.index.set(id, this.vectors.length - 1)
  }
  
  /**
   * Search for similar vectors
   * @param {Array<number>} queryEmbedding - Query embedding
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Search results
   */
  async search(queryEmbedding, options = {}) {
    const { limit = 10, threshold = 0.7, filters = {} } = options
    
    // Calculate similarities
    const similarities = this.vectors.map((vec, idx) => ({
      id: vec.id,
      similarity: this.cosineSimilarity(queryEmbedding, vec.embedding),
      metadata: vec.metadata
    }))
    
    // Filter by threshold
    let results = similarities.filter(s => s.similarity >= threshold)
    
    // Apply metadata filters
    if (Object.keys(filters).length > 0) {
      results = results.filter(r => {
        return Object.entries(filters).every(([key, value]) => {
          return r.metadata[key] === value
        })
      })
    }
    
    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity)
    
    // Limit results
    return results.slice(0, limit).map(r => ({
      id: r.id,
      similarity: r.similarity,
      score: r.similarity
    }))
  }
  
  /**
   * Calculate cosine similarity
   * @param {Array<number>} a - Vector A
   * @param {Array<number>} b - Vector B
   * @returns {number} Similarity score (0-1)
   */
  cosineSimilarity(a, b) {
    if (a.length !== b.length) {
      throw new Error('Vectors must have same length')
    }
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    normA = Math.sqrt(normA)
    normB = Math.sqrt(normB)
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (normA * normB)
  }
  
  /**
   * Get database stats
   * @returns {Object} Stats
   */
  getStats() {
    return {
      totalVectors: this.vectors.length,
      indexSize: this.index.size
    }
  }
}

// ============================================================================
// LLM INTERFACE
// ============================================================================

class LLMInterface {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY
    this.model = 'gpt-4.1-mini'
    this.embeddingModel = 'text-embedding-3-small'
  }
  
  /**
   * Create embedding
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async embed(text) {
    // Placeholder: Real implementation would call OpenAI API
    // For now, create a simple hash-based embedding
    const embedding = new Array(384).fill(0)
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i)
      embedding[i % 384] += charCode / 1000
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / norm)
  }
  
  /**
   * Generate text with LLM
   * @param {Object} params - Generation parameters
   * @returns {Promise<string>} Generated text
   */
  async generate(params) {
    const { prompt, context, temperature = 0.7, maxTokens = 500 } = params
    
    // Placeholder: Real implementation would call OpenAI API
    // For now, return a mock response based on context
    
    if (context) {
      const contextObj = JSON.parse(context)
      
      return {
        text: `Generated track based on ${contextObj.experienceCount} similar experiences:
        
- Average BPM: ${contextObj.avgBPM?.toFixed(0) || 'N/A'}
- Common Keys: ${contextObj.commonKeys?.join(', ') || 'N/A'}
- Popular Instruments: ${contextObj.popularInstruments?.join(', ') || 'N/A'}
- Cultural Elements: ${contextObj.culturalElements?.join(', ') || 'N/A'}
- Success Patterns: ${contextObj.successPatterns?.commonFactors?.join(', ') || 'N/A'}

This track will have ${contextObj.avgSimilarity > 0.8 ? 'high' : 'moderate'} cultural authenticity based on past successful examples.`,
        contextUsed: true,
        experienceCount: contextObj.experienceCount
      }
    }
    
    return {
      text: 'Generated without context (no relevant experiences found)',
      contextUsed: false
    }
  }
}

// Export singleton instance
export const ragEngine = new RealTimeRAGEngine()

