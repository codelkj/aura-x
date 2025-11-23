/**
 * Multi-Agent Orchestration System
 * Inspired by VAST InsightEngine - Connecting AI agents for collaborative learning
 * 
 * Coordinates multiple AI agents to work together for better results
 */

export class MultiAgentOrchestrator {
  constructor() {
    // Registered agents
    this.agents = new Map()
    
    // Shared knowledge base
    this.sharedKnowledge = new SharedKnowledgeBase()
    
    // Collaboration history
    this.collaborationHistory = []
    
    // Conflict resolver
    this.conflictResolver = new ConflictResolver()
    
    // Performance metrics
    this.metrics = {
      totalCollaborations: 0,
      successfulCollaborations: 0,
      avgCollaborationTime: 0,
      avgAgentsPerTask: 0,
      conflictsResolved: 0
    }
  }
  
  // ============================================================================
  // AGENT REGISTRATION
  // ============================================================================
  
  /**
   * Register an AI agent
   * @param {string} name - Agent name
   * @param {Object} agent - Agent instance
   */
  registerAgent(name, agent) {
    this.agents.set(name, agent)
    
    // Connect agent to shared knowledge
    agent.connectToKnowledge(this.sharedKnowledge)
    
    console.log(`[MultiAgent] Registered agent: ${name}`)
  }
  
  /**
   * Unregister an AI agent
   * @param {string} name - Agent name
   */
  unregisterAgent(name) {
    this.agents.delete(name)
    console.log(`[MultiAgent] Unregistered agent: ${name}`)
  }
  
  /**
   * Get agent by name
   * @param {string} name - Agent name
   * @returns {Object} Agent instance
   */
  getAgent(name) {
    return this.agents.get(name)
  }
  
  // ============================================================================
  // COLLABORATIVE PROCESSING
  // ============================================================================
  
  /**
   * Collaborate on a task
   * @param {Object} task - Task to perform
   * @returns {Promise<Object>} Collaboration result
   */
  async collaborate(task) {
    const startTime = performance.now()
    
    try {
      // 1. Select relevant agents for this task
      const relevantAgents = this.selectAgents(task)
      
      if (relevantAgents.length === 0) {
        throw new Error('No relevant agents found for task')
      }
      
      console.log(`[MultiAgent] Selected ${relevantAgents.length} agents for task: ${task.type}`)
      
      // 2. Each agent analyzes the task
      const agentAnalyses = await Promise.all(
        relevantAgents.map(async (agent) => {
          const analysis = await agent.analyze(task)
          return {
            agentName: agent.name,
            analysis,
            confidence: analysis.confidence || 0.5
          }
        })
      )
      
      // 3. Detect and resolve conflicts
      const conflicts = this.detectConflicts(agentAnalyses)
      let resolvedAnalyses = agentAnalyses
      
      if (conflicts.length > 0) {
        console.log(`[MultiAgent] Detected ${conflicts.length} conflicts, resolving...`)
        resolvedAnalyses = await this.resolveConflicts(conflicts, agentAnalyses)
        this.metrics.conflictsResolved += conflicts.length
      }
      
      // 4. Synthesize results
      const synthesis = await this.synthesizeResults(resolvedAnalyses, task)
      
      // 5. Update shared knowledge
      await this.sharedKnowledge.learn({
        task,
        agentAnalyses: resolvedAnalyses,
        synthesis,
        timestamp: Date.now()
      })
      
      // 6. Record collaboration
      const collaborationTime = performance.now() - startTime
      this.recordCollaboration({
        task,
        agents: relevantAgents.map(a => a.name),
        result: synthesis,
        time: collaborationTime,
        success: true
      })
      
      // 7. Update metrics
      this.updateMetrics(relevantAgents.length, collaborationTime, true)
      
      return {
        success: true,
        result: synthesis,
        agentContributions: resolvedAnalyses,
        collaborationTime
      }
      
    } catch (error) {
      const collaborationTime = performance.now() - startTime
      this.updateMetrics(0, collaborationTime, false)
      
      console.error('[MultiAgent] Collaboration failed:', error)
      return {
        success: false,
        error: error.message,
        collaborationTime
      }
    }
  }
  
  // ============================================================================
  // AGENT SELECTION
  // ============================================================================
  
  /**
   * Select relevant agents for a task
   * @param {Object} task - Task to perform
   * @returns {Array<Object>} Relevant agents
   */
  selectAgents(task) {
    const relevantAgents = []
    
    for (const [name, agent] of this.agents) {
      if (agent.isRelevantFor(task)) {
        relevantAgents.push(agent)
      }
    }
    
    // Sort by relevance score
    relevantAgents.sort((a, b) => {
      const scoreA = a.getRelevanceScore(task)
      const scoreB = b.getRelevanceScore(task)
      return scoreB - scoreA
    })
    
    return relevantAgents
  }
  
  // ============================================================================
  // CONFLICT DETECTION AND RESOLUTION
  // ============================================================================
  
  /**
   * Detect conflicts between agent analyses
   * @param {Array<Object>} analyses - Agent analyses
   * @returns {Array<Object>} Detected conflicts
   */
  detectConflicts(analyses) {
    const conflicts = []
    
    // Check for contradictory recommendations
    for (let i = 0; i < analyses.length; i++) {
      for (let j = i + 1; j < analyses.length; j++) {
        const conflict = this.checkConflict(analyses[i], analyses[j])
        if (conflict) {
          conflicts.push({
            agent1: analyses[i].agentName,
            agent2: analyses[j].agentName,
            type: conflict.type,
            severity: conflict.severity
          })
        }
      }
    }
    
    return conflicts
  }
  
  /**
   * Check if two analyses conflict
   * @param {Object} analysis1 - First analysis
   * @param {Object} analysis2 - Second analysis
   * @returns {Object|null} Conflict details or null
   */
  checkConflict(analysis1, analysis2) {
    // Example: Check if BPM recommendations differ significantly
    if (analysis1.analysis.bpm && analysis2.analysis.bpm) {
      const diff = Math.abs(analysis1.analysis.bpm - analysis2.analysis.bpm)
      if (diff > 10) {
        return {
          type: 'bpm_mismatch',
          severity: diff / 10 // Higher diff = higher severity
        }
      }
    }
    
    // Example: Check if key recommendations conflict
    if (analysis1.analysis.key && analysis2.analysis.key) {
      if (analysis1.analysis.key !== analysis2.analysis.key) {
        return {
          type: 'key_mismatch',
          severity: 0.8
        }
      }
    }
    
    return null
  }
  
  /**
   * Resolve conflicts between analyses
   * @param {Array<Object>} conflicts - Detected conflicts
   * @param {Array<Object>} analyses - Agent analyses
   * @returns {Promise<Array<Object>>} Resolved analyses
   */
  async resolveConflicts(conflicts, analyses) {
    return await this.conflictResolver.resolve(conflicts, analyses)
  }
  
  // ============================================================================
  // RESULT SYNTHESIS
  // ============================================================================
  
  /**
   * Synthesize results from multiple agents
   * @param {Array<Object>} analyses - Agent analyses
   * @param {Object} task - Original task
   * @returns {Promise<Object>} Synthesized result
   */
  async synthesizeResults(analyses, task) {
    // Weighted average based on confidence scores
    const totalConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0)
    
    const synthesis = {
      taskType: task.type,
      recommendations: {},
      confidence: totalConfidence / analyses.length,
      agentContributions: analyses.length
    }
    
    // Synthesize specific fields
    if (task.type === 'create-track') {
      synthesis.recommendations = {
        bpm: this.weightedAverage(analyses, 'bpm'),
        key: this.mostConfident(analyses, 'key'),
        instruments: this.mergeArrays(analyses, 'instruments'),
        culturalAuthenticity: this.weightedAverage(analyses, 'culturalAuthenticity'),
        mood: this.mostConfident(analyses, 'mood')
      }
    }
    
    return synthesis
  }
  
  /**
   * Calculate weighted average
   * @param {Array<Object>} analyses - Agent analyses
   * @param {string} field - Field to average
   * @returns {number} Weighted average
   */
  weightedAverage(analyses, field) {
    let weightedSum = 0
    let totalWeight = 0
    
    for (const analysis of analyses) {
      const value = analysis.analysis[field]
      if (value != null) {
        weightedSum += value * analysis.confidence
        totalWeight += analysis.confidence
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0
  }
  
  /**
   * Get value from most confident agent
   * @param {Array<Object>} analyses - Agent analyses
   * @param {string} field - Field to get
   * @returns {*} Value from most confident agent
   */
  mostConfident(analyses, field) {
    const validAnalyses = analyses.filter(a => a.analysis[field] != null)
    if (validAnalyses.length === 0) return null
    
    const mostConfident = validAnalyses.reduce((max, a) => 
      a.confidence > max.confidence ? a : max
    )
    
    return mostConfident.analysis[field]
  }
  
  /**
   * Merge arrays from all analyses
   * @param {Array<Object>} analyses - Agent analyses
   * @param {string} field - Field to merge
   * @returns {Array} Merged array
   */
  mergeArrays(analyses, field) {
    const merged = new Set()
    
    for (const analysis of analyses) {
      const value = analysis.analysis[field]
      if (Array.isArray(value)) {
        value.forEach(item => merged.add(item))
      }
    }
    
    return Array.from(merged)
  }
  
  // ============================================================================
  // HISTORY AND METRICS
  // ============================================================================
  
  /**
   * Record collaboration
   * @param {Object} collaboration - Collaboration details
   */
  recordCollaboration(collaboration) {
    this.collaborationHistory.push({
      ...collaboration,
      timestamp: Date.now()
    })
    
    // Keep only last 1000 collaborations
    if (this.collaborationHistory.length > 1000) {
      this.collaborationHistory.shift()
    }
  }
  
  /**
   * Update metrics
   * @param {number} agentCount - Number of agents involved
   * @param {number} time - Collaboration time
   * @param {boolean} success - Success status
   */
  updateMetrics(agentCount, time, success) {
    this.metrics.totalCollaborations++
    if (success) {
      this.metrics.successfulCollaborations++
    }
    
    const total = this.metrics.totalCollaborations
    this.metrics.avgCollaborationTime = 
      (this.metrics.avgCollaborationTime * (total - 1) + time) / total
    
    this.metrics.avgAgentsPerTask = 
      (this.metrics.avgAgentsPerTask * (total - 1) + agentCount) / total
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: ((this.metrics.successfulCollaborations / this.metrics.totalCollaborations) * 100).toFixed(2) + '%',
      avgCollaborationTime: this.metrics.avgCollaborationTime.toFixed(2) + 'ms',
      avgAgentsPerTask: this.metrics.avgAgentsPerTask.toFixed(2),
      totalAgents: this.agents.size
    }
  }
}

// ============================================================================
// SHARED KNOWLEDGE BASE
// ============================================================================

class SharedKnowledgeBase {
  constructor() {
    this.knowledge = new Map()
    this.learningHistory = []
  }
  
  /**
   * Learn from collaboration
   * @param {Object} experience - Collaboration experience
   */
  async learn(experience) {
    const key = this.generateKey(experience.task)
    
    // Store experience
    if (!this.knowledge.has(key)) {
      this.knowledge.set(key, [])
    }
    this.knowledge.get(key).push(experience)
    
    // Record learning
    this.learningHistory.push({
      key,
      timestamp: experience.timestamp
    })
  }
  
  /**
   * Retrieve relevant knowledge
   * @param {Object} task - Task to find knowledge for
   * @returns {Array<Object>} Relevant experiences
   */
  async retrieve(task) {
    const key = this.generateKey(task)
    return this.knowledge.get(key) || []
  }
  
  /**
   * Generate key for knowledge storage
   * @param {Object} task - Task
   * @returns {string} Storage key
   */
  generateKey(task) {
    return `${task.type}:${task.style || ''}:${task.region || ''}`
  }
  
  /**
   * Get statistics
   * @returns {Object} Knowledge base stats
   */
  getStats() {
    return {
      totalExperiences: this.learningHistory.length,
      uniqueTaskTypes: this.knowledge.size,
      avgExperiencesPerType: (this.learningHistory.length / this.knowledge.size).toFixed(2)
    }
  }
}

// ============================================================================
// CONFLICT RESOLVER
// ============================================================================

class ConflictResolver {
  /**
   * Resolve conflicts between analyses
   * @param {Array<Object>} conflicts - Conflicts to resolve
   * @param {Array<Object>} analyses - Agent analyses
   * @returns {Promise<Array<Object>>} Resolved analyses
   */
  async resolve(conflicts, analyses) {
    const resolved = [...analyses]
    
    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(conflict, analyses)
      
      // Apply resolution
      if (resolution) {
        const agent1Index = resolved.findIndex(a => a.agentName === conflict.agent1)
        const agent2Index = resolved.findIndex(a => a.agentName === conflict.agent2)
        
        if (resolution.winner === conflict.agent1) {
          // Agent 1 wins, reduce agent 2's confidence
          resolved[agent2Index].confidence *= 0.8
        } else if (resolution.winner === conflict.agent2) {
          // Agent 2 wins, reduce agent 1's confidence
          resolved[agent1Index].confidence *= 0.8
        } else if (resolution.compromise) {
          // Compromise: Average the values
          const field = this.getConflictField(conflict.type)
          const avg = (
            resolved[agent1Index].analysis[field] + 
            resolved[agent2Index].analysis[field]
          ) / 2
          
          resolved[agent1Index].analysis[field] = avg
          resolved[agent2Index].analysis[field] = avg
        }
      }
    }
    
    return resolved
  }
  
  /**
   * Resolve single conflict
   * @param {Object} conflict - Conflict to resolve
   * @param {Array<Object>} analyses - Agent analyses
   * @returns {Promise<Object>} Resolution
   */
  async resolveConflict(conflict, analyses) {
    const agent1 = analyses.find(a => a.agentName === conflict.agent1)
    const agent2 = analyses.find(a => a.agentName === conflict.agent2)
    
    // Resolve based on confidence
    if (agent1.confidence > agent2.confidence * 1.2) {
      return { winner: conflict.agent1 }
    } else if (agent2.confidence > agent1.confidence * 1.2) {
      return { winner: conflict.agent2 }
    } else {
      // Similar confidence, compromise
      return { compromise: true }
    }
  }
  
  /**
   * Get field name from conflict type
   * @param {string} conflictType - Conflict type
   * @returns {string} Field name
   */
  getConflictField(conflictType) {
    const fieldMap = {
      'bpm_mismatch': 'bpm',
      'key_mismatch': 'key'
    }
    return fieldMap[conflictType] || 'unknown'
  }
}

// ============================================================================
// BASE AGENT CLASS
// ============================================================================

export class BaseAgent {
  constructor(name, capabilities) {
    this.name = name
    this.capabilities = capabilities
    this.knowledgeBase = null
  }
  
  /**
   * Connect to shared knowledge base
   * @param {SharedKnowledgeBase} knowledgeBase - Shared knowledge base
   */
  connectToKnowledge(knowledgeBase) {
    this.knowledgeBase = knowledgeBase
  }
  
  /**
   * Check if agent is relevant for task
   * @param {Object} task - Task to check
   * @returns {boolean} True if relevant
   */
  isRelevantFor(task) {
    return this.capabilities.some(cap => task.type.includes(cap))
  }
  
  /**
   * Get relevance score for task
   * @param {Object} task - Task to score
   * @returns {number} Relevance score (0-1)
   */
  getRelevanceScore(task) {
    const matchingCapabilities = this.capabilities.filter(cap => 
      task.type.includes(cap)
    )
    return matchingCapabilities.length / this.capabilities.length
  }
  
  /**
   * Analyze task (to be overridden by subclasses)
   * @param {Object} task - Task to analyze
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(task) {
    throw new Error('analyze() must be implemented by subclass')
  }
}

// Export singleton instance
export const multiAgentOrchestrator = new MultiAgentOrchestrator()

