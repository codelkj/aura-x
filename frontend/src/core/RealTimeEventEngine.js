/**
 * Real-Time Event Engine
 * Inspired by VAST DataEngine - "Central Nervous System" for AURA-X
 * 
 * Instantly processes signals (new data/events) and dispatches instructions
 * for immediate action across all features
 */

export class RealTimeEventEngine {
  constructor() {
    // High-performance event bus
    this.eventBus = new HighPerformanceEventBus()
    
    // Event processors (registered by features)
    this.processors = new Map()
    
    // Event subscribers
    this.subscribers = new Map()
    
    // Event queue for async processing
    this.eventQueue = []
    
    // Performance metrics
    this.metrics = {
      totalEvents: 0,
      avgLatency: 0,
      maxLatency: 0,
      minLatency: Infinity,
      eventsPerSecond: 0,
      lastSecondEvents: 0,
      lastSecondTimestamp: Date.now()
    }
    
    // Start metrics tracking
    this.startMetricsTracking()
  }
  
  // ============================================================================
  // PROCESSOR REGISTRATION
  // ============================================================================
  
  /**
   * Register an event processor
   * @param {string} eventType - Type of event to process
   * @param {Function} processor - Processor function
   */
  registerProcessor(eventType, processor) {
    this.processors.set(eventType, processor)
    console.log(`[EventEngine] Registered processor for: ${eventType}`)
  }
  
  /**
   * Unregister an event processor
   * @param {string} eventType - Type of event
   */
  unregisterProcessor(eventType) {
    this.processors.delete(eventType)
    console.log(`[EventEngine] Unregistered processor for: ${eventType}`)
  }
  
  // ============================================================================
  // SUBSCRIBER MANAGEMENT
  // ============================================================================
  
  /**
   * Subscribe to events
   * @param {string} eventType - Type of event to subscribe to
   * @param {Function} handler - Handler function
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventType, handler) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }
    this.subscribers.get(eventType).push(handler)
    
    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler)
  }
  
  /**
   * Unsubscribe from events
   * @param {string} eventType - Type of event
   * @param {Function} handler - Handler function
   */
  unsubscribe(eventType, handler) {
    if (this.subscribers.has(eventType)) {
      const handlers = this.subscribers.get(eventType)
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
  
  // ============================================================================
  // EVENT PROCESSING (Real-Time, <10ms target)
  // ============================================================================
  
  /**
   * Process event in real-time
   * @param {Object} event - Event to process
   * @returns {Promise<Object>} Processing result
   */
  async processEvent(event) {
    const startTime = performance.now()
    
    try {
      // 1. Get processor for event type
      const processor = this.processors.get(event.type)
      
      if (!processor) {
        console.warn(`[EventEngine] No processor for event type: ${event.type}`)
        return { success: false, error: 'No processor found' }
      }
      
      // 2. Process event
      const result = await processor.process(event)
      
      // 3. Dispatch to subscribers
      await this.dispatchToSubscribers(event.type, result)
      
      // 4. Handle triggered events
      if (result.triggerEvents) {
        for (const triggeredEvent of result.triggerEvents) {
          // Process triggered events asynchronously (don't await)
          this.processEvent(triggeredEvent).catch(error => {
            console.error(`[EventEngine] Error processing triggered event:`, error)
          })
        }
      }
      
      // 5. Update metrics
      const latency = performance.now() - startTime
      this.updateMetrics(latency)
      
      // Log if latency exceeds target
      if (latency > 10) {
        console.warn(`[EventEngine] High latency: ${latency.toFixed(2)}ms for ${event.type}`)
      }
      
      return {
        success: true,
        result,
        latency
      }
      
    } catch (error) {
      const latency = performance.now() - startTime
      this.updateMetrics(latency)
      
      console.error(`[EventEngine] Error processing event:`, error)
      return {
        success: false,
        error: error.message,
        latency
      }
    }
  }
  
  /**
   * Dispatch result to all subscribers
   * @param {string} eventType - Event type
   * @param {Object} result - Processing result
   */
  async dispatchToSubscribers(eventType, result) {
    const subscribers = this.subscribers.get(eventType) || []
    
    // Dispatch to all subscribers in parallel
    await Promise.all(
      subscribers.map(async (handler) => {
        try {
          await handler(result)
        } catch (error) {
          console.error(`[EventEngine] Subscriber error for ${eventType}:`, error)
        }
      })
    )
  }
  
  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================
  
  /**
   * Process multiple events in parallel
   * @param {Array<Object>} events - Events to process
   * @returns {Promise<Array<Object>>} Processing results
   */
  async processBatch(events) {
    const startTime = performance.now()
    
    // Process all events in parallel
    const results = await Promise.all(
      events.map(event => this.processEvent(event))
    )
    
    const totalLatency = performance.now() - startTime
    console.log(`[EventEngine] Batch processed ${events.length} events in ${totalLatency.toFixed(2)}ms`)
    
    return results
  }
  
  // ============================================================================
  // METRICS TRACKING
  // ============================================================================
  
  /**
   * Update performance metrics
   * @param {number} latency - Event processing latency
   */
  updateMetrics(latency) {
    this.metrics.totalEvents++
    this.metrics.lastSecondEvents++
    
    // Update latency stats
    this.metrics.avgLatency = 
      (this.metrics.avgLatency * (this.metrics.totalEvents - 1) + latency) / 
      this.metrics.totalEvents
    
    this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency)
    this.metrics.minLatency = Math.min(this.metrics.minLatency, latency)
  }
  
  /**
   * Start metrics tracking
   */
  startMetricsTracking() {
    setInterval(() => {
      // Calculate events per second
      const now = Date.now()
      const elapsed = (now - this.metrics.lastSecondTimestamp) / 1000
      this.metrics.eventsPerSecond = this.metrics.lastSecondEvents / elapsed
      
      // Reset counter
      this.metrics.lastSecondEvents = 0
      this.metrics.lastSecondTimestamp = now
    }, 1000)
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgLatency: this.metrics.avgLatency.toFixed(2) + 'ms',
      maxLatency: this.metrics.maxLatency.toFixed(2) + 'ms',
      minLatency: this.metrics.minLatency === Infinity ? 'N/A' : this.metrics.minLatency.toFixed(2) + 'ms',
      eventsPerSecond: this.metrics.eventsPerSecond.toFixed(2),
      totalProcessors: this.processors.size,
      totalSubscribers: Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.length, 0)
    }
  }
}

// ============================================================================
// HIGH-PERFORMANCE EVENT BUS
// ============================================================================

class HighPerformanceEventBus {
  constructor() {
    this.listeners = new Map()
    this.wildcardListeners = []
  }
  
  /**
   * Register event listener
   * @param {string} event - Event name or '*' for all events
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (event === '*') {
      this.wildcardListeners.push(callback)
    } else {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(callback)
    }
  }
  
  /**
   * Unregister event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (event === '*') {
      const index = this.wildcardListeners.indexOf(callback)
      if (index > -1) {
        this.wildcardListeners.splice(index, 1)
      }
    } else if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    // Call specific listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`[EventBus] Error in listener for ${event}:`, error)
        }
      })
    }
    
    // Call wildcard listeners
    this.wildcardListeners.forEach(callback => {
      try {
        callback({ event, data })
      } catch (error) {
        console.error(`[EventBus] Error in wildcard listener:`, error)
      }
    })
  }
}

// ============================================================================
// EXAMPLE EVENT PROCESSORS
// ============================================================================

/**
 * Audio Upload Processor
 */
export class AudioUploadProcessor {
  async process(event) {
    const { audioData, metadata } = event.data
    
    // 1. Analyze audio
    const analysis = await this.analyzeAudio(audioData)
    
    // 2. Extract features
    const features = await this.extractFeatures(audioData)
    
    // 3. Generate insights
    const insights = await this.generateInsights(analysis, features)
    
    return {
      analysis,
      features,
      insights,
      triggerEvents: [
        {
          type: 'audio.analyzed',
          data: { analysis, features, insights }
        },
        {
          type: 'ui.update',
          data: { status: 'analyzed', audioId: event.data.audioId }
        }
      ]
    }
  }
  
  async analyzeAudio(audioData) {
    // Placeholder: Real implementation would use Web Audio API
    return {
      duration: audioData.length / 44100,
      sampleRate: 44100,
      channels: 2,
      peakAmplitude: 0.8,
      rmsLevel: 0.5
    }
  }
  
  async extractFeatures(audioData) {
    // Placeholder: Real implementation would extract audio features
    return {
      bpm: 115,
      key: 'C Minor',
      energy: 0.7,
      danceability: 0.8
    }
  }
  
  async generateInsights(analysis, features) {
    // Placeholder: Real implementation would use AI
    return {
      genre: 'Amapiano',
      mood: 'Energetic',
      culturalContext: 'Johannesburg 2020s'
    }
  }
}

/**
 * Vocal Input Processor (for Aura Vocal Forge)
 */
export class VocalInputProcessor {
  async process(event) {
    const { audioData, context } = event.data
    
    // 1. Detect pitch
    const pitch = await this.detectPitch(audioData)
    
    // 2. Convert to MIDI
    const midiNotes = await this.vocalToMIDI(pitch, context)
    
    // 3. Apply context (key, scale, chord)
    const contextualizedNotes = await this.applyContext(midiNotes, context)
    
    return {
      pitch,
      midiNotes: contextualizedNotes,
      triggerEvents: [
        {
          type: 'midi.generated',
          data: { notes: contextualizedNotes }
        },
        {
          type: 'daw.update',
          data: { notes: contextualizedNotes }
        },
        {
          type: 'ui.update',
          data: { status: 'notes-added' }
        }
      ]
    }
  }
  
  async detectPitch(audioData) {
    // Placeholder: Real implementation would use pitch detection algorithm
    return {
      frequency: 440, // A4
      confidence: 0.95,
      note: 'A4'
    }
  }
  
  async vocalToMIDI(pitch, context) {
    // Placeholder: Real implementation would convert pitch to MIDI
    return [
      { note: 69, velocity: 100, duration: 0.5 } // A4
    ]
  }
  
  async applyContext(notes, context) {
    // Placeholder: Real implementation would snap to key/scale/chord
    return notes.map(note => ({
      ...note,
      note: this.snapToScale(note.note, context.key, context.scale)
    }))
  }
  
  snapToScale(note, key, scale) {
    // Placeholder: Real implementation would snap to scale
    return note
  }
}

/**
 * Biometric Change Processor (for Consciousness Studio)
 */
export class BiometricChangeProcessor {
  async process(event) {
    const { biometrics, currentAudio } = event.data
    
    // 1. Analyze biometric changes
    const analysis = await this.analyzeBiometrics(biometrics)
    
    // 2. Determine audio adaptations
    const adaptations = await this.determineAdaptations(analysis, currentAudio)
    
    // 3. Apply adaptations
    const adaptedAudio = await this.applyAdaptations(currentAudio, adaptations)
    
    return {
      analysis,
      adaptations,
      adaptedAudio,
      triggerEvents: [
        {
          type: 'audio.adapted',
          data: { adaptedAudio, adaptations }
        },
        {
          type: 'ui.update',
          data: { status: 'adapted', biometrics: analysis }
        }
      ]
    }
  }
  
  async analyzeBiometrics(biometrics) {
    // Placeholder: Real implementation would analyze biometrics
    return {
      stressLevel: biometrics.heartRate > 80 ? 'high' : 'low',
      mood: biometrics.mood || 'neutral',
      energy: biometrics.heartRate / 100
    }
  }
  
  async determineAdaptations(analysis, currentAudio) {
    // Placeholder: Real implementation would determine adaptations
    return {
      tempo: analysis.stressLevel === 'high' ? 'slower' : 'current',
      volume: analysis.stressLevel === 'high' ? 'lower' : 'current',
      effects: analysis.stressLevel === 'high' ? ['reverb', 'calm-pad'] : []
    }
  }
  
  async applyAdaptations(audio, adaptations) {
    // Placeholder: Real implementation would apply audio adaptations
    return audio // Return adapted audio
  }
}

// Export singleton instance
export const eventEngine = new RealTimeEventEngine()

// Register default processors
eventEngine.registerProcessor('audio.uploaded', new AudioUploadProcessor())
eventEngine.registerProcessor('vocal.input', new VocalInputProcessor())
eventEngine.registerProcessor('biometric.change', new BiometricChangeProcessor())

