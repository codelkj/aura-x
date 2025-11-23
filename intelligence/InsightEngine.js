/**
 * Insight Engine
 * Inspired by VAST InsightEngine - Generate actionable insights from data
 * 
 * Analyzes patterns, trends, and generates recommendations
 */

export class InsightEngine {
  constructor() {
    // Data analyzers
    this.analyzers = new Map()
    
    // Insight store
    this.insights = []
    
    // Pattern detector
    this.patternDetector = new PatternDetector()
    
    // Trend analyzer
    this.trendAnalyzer = new TrendAnalyzer()
    
    // Recommendation engine
    this.recommendationEngine = new RecommendationEngine()
    
    // Performance metrics
    this.metrics = {
      totalInsights: 0,
      totalAnalyses: 0,
      avgAnalysisTime: 0,
      insightAccuracy: 0
    }
  }
  
  // ============================================================================
  // ANALYZER REGISTRATION
  // ============================================================================
  
  /**
   * Register data analyzer
   * @param {string} name - Analyzer name
   * @param {Object} analyzer - Analyzer instance
   */
  registerAnalyzer(name, analyzer) {
    this.analyzers.set(name, analyzer)
    console.log(`[InsightEngine] Registered analyzer: ${name}`)
  }
  
  // ============================================================================
  // INSIGHT GENERATION
  // ============================================================================
  
  /**
   * Generate insights from data
   * @param {Object} data - Data to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Generated insights
   */
  async generateInsights(data, options = {}) {
    const startTime = performance.now()
    
    try {
      // 1. Run all relevant analyzers
      const analyses = await this.runAnalyzers(data, options)
      
      // 2. Detect patterns
      const patterns = await this.patternDetector.detect(data, analyses)
      
      // 3. Analyze trends
      const trends = await this.trendAnalyzer.analyze(data, analyses)
      
      // 4. Generate recommendations
      const recommendations = await this.recommendationEngine.generate(
        data,
        analyses,
        patterns,
        trends
      )
      
      // 5. Synthesize insights
      const insights = this.synthesizeInsights({
        data,
        analyses,
        patterns,
        trends,
        recommendations
      })
      
      // 6. Store insights
      this.storeInsights(insights)
      
      // 7. Update metrics
      const analysisTime = performance.now() - startTime
      this.updateMetrics(analysisTime, insights)
      
      return insights
      
    } catch (error) {
      console.error('[InsightEngine] Error generating insights:', error)
      throw error
    }
  }
  
  /**
   * Run all relevant analyzers
   * @param {Object} data - Data to analyze
   * @param {Object} options - Options
   * @returns {Promise<Object>} Analysis results
   */
  async runAnalyzers(data, options) {
    const results = {}
    
    for (const [name, analyzer] of this.analyzers) {
      if (analyzer.isRelevantFor(data)) {
        try {
          results[name] = await analyzer.analyze(data, options)
        } catch (error) {
          console.error(`[InsightEngine] Error in analyzer ${name}:`, error)
          results[name] = { error: error.message }
        }
      }
    }
    
    return results
  }
  
  /**
   * Synthesize insights from all analyses
   * @param {Object} components - Analysis components
   * @returns {Object} Synthesized insights
   */
  synthesizeInsights(components) {
    const { data, analyses, patterns, trends, recommendations } = components
    
    return {
      timestamp: Date.now(),
      dataType: data.type,
      summary: this.generateSummary(analyses, patterns, trends),
      keyFindings: this.extractKeyFindings(analyses, patterns, trends),
      patterns: patterns,
      trends: trends,
      recommendations: recommendations,
      confidence: this.calculateConfidence(analyses, patterns, trends),
      actionable: recommendations.length > 0
    }
  }
  
  /**
   * Generate summary
   * @param {Object} analyses - Analyses
   * @param {Object} patterns - Patterns
   * @param {Object} trends - Trends
   * @returns {string} Summary text
   */
  generateSummary(analyses, patterns, trends) {
    const parts = []
    
    if (patterns.length > 0) {
      parts.push(`Detected ${patterns.length} significant patterns`)
    }
    
    if (trends.length > 0) {
      parts.push(`identified ${trends.length} trends`)
    }
    
    const analyzerCount = Object.keys(analyses).length
    parts.push(`from ${analyzerCount} data sources`)
    
    return parts.join(', ')
  }
  
  /**
   * Extract key findings
   * @param {Object} analyses - Analyses
   * @param {Object} patterns - Patterns
   * @param {Object} trends - Trends
   * @returns {Array<Object>} Key findings
   */
  extractKeyFindings(analyses, patterns, trends) {
    const findings = []
    
    // Add high-confidence patterns
    patterns
      .filter(p => p.confidence > 0.8)
      .forEach(p => {
        findings.push({
          type: 'pattern',
          description: p.description,
          confidence: p.confidence,
          impact: p.impact
        })
      })
    
    // Add significant trends
    trends
      .filter(t => t.significance > 0.7)
      .forEach(t => {
        findings.push({
          type: 'trend',
          description: t.description,
          significance: t.significance,
          direction: t.direction
        })
      })
    
    return findings
  }
  
  /**
   * Calculate overall confidence
   * @param {Object} analyses - Analyses
   * @param {Object} patterns - Patterns
   * @param {Object} trends - Trends
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(analyses, patterns, trends) {
    const scores = []
    
    // Analyzer confidence
    Object.values(analyses).forEach(a => {
      if (a.confidence) scores.push(a.confidence)
    })
    
    // Pattern confidence
    patterns.forEach(p => {
      if (p.confidence) scores.push(p.confidence)
    })
    
    // Trend significance
    trends.forEach(t => {
      if (t.significance) scores.push(t.significance)
    })
    
    if (scores.length === 0) return 0.5
    
    return scores.reduce((sum, s) => sum + s, 0) / scores.length
  }
  
  /**
   * Store insights
   * @param {Object} insights - Insights to store
   */
  storeInsights(insights) {
    this.insights.push(insights)
    
    // Keep only last 1000 insights
    if (this.insights.length > 1000) {
      this.insights.shift()
    }
    
    this.metrics.totalInsights++
  }
  
  // ============================================================================
  // HISTORICAL INSIGHTS
  // ============================================================================
  
  /**
   * Get historical insights
   * @param {Object} filters - Filters
   * @returns {Array<Object>} Historical insights
   */
  getHistoricalInsights(filters = {}) {
    let results = [...this.insights]
    
    // Apply filters
    if (filters.dataType) {
      results = results.filter(i => i.dataType === filters.dataType)
    }
    
    if (filters.minConfidence) {
      results = results.filter(i => i.confidence >= filters.minConfidence)
    }
    
    if (filters.since) {
      results = results.filter(i => i.timestamp >= filters.since)
    }
    
    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp - a.timestamp)
    
    return results
  }
  
  /**
   * Get insights summary
   * @returns {Object} Summary statistics
   */
  getInsightsSummary() {
    const totalInsights = this.insights.length
    
    if (totalInsights === 0) {
      return {
        total: 0,
        avgConfidence: 0,
        actionablePercent: 0,
        topPatterns: [],
        topTrends: []
      }
    }
    
    const avgConfidence = 
      this.insights.reduce((sum, i) => sum + i.confidence, 0) / totalInsights
    
    const actionableCount = this.insights.filter(i => i.actionable).length
    const actionablePercent = (actionableCount / totalInsights) * 100
    
    // Extract top patterns
    const allPatterns = this.insights.flatMap(i => i.patterns)
    const patternCounts = {}
    allPatterns.forEach(p => {
      const key = p.type || p.description
      patternCounts[key] = (patternCounts[key] || 0) + 1
    })
    
    const topPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }))
    
    // Extract top trends
    const allTrends = this.insights.flatMap(i => i.trends)
    const trendCounts = {}
    allTrends.forEach(t => {
      const key = t.type || t.description
      trendCounts[key] = (trendCounts[key] || 0) + 1
    })
    
    const topTrends = Object.entries(trendCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trend, count]) => ({ trend, count }))
    
    return {
      total: totalInsights,
      avgConfidence: avgConfidence.toFixed(2),
      actionablePercent: actionablePercent.toFixed(2) + '%',
      topPatterns,
      topTrends
    }
  }
  
  // ============================================================================
  // METRICS
  // ============================================================================
  
  /**
   * Update metrics
   * @param {number} analysisTime - Analysis time in ms
   * @param {Object} insights - Generated insights
   */
  updateMetrics(analysisTime, insights) {
    this.metrics.totalAnalyses++
    
    const total = this.metrics.totalAnalyses
    this.metrics.avgAnalysisTime = 
      (this.metrics.avgAnalysisTime * (total - 1) + analysisTime) / total
    
    // Update accuracy (based on confidence)
    this.metrics.insightAccuracy = 
      (this.metrics.insightAccuracy * (total - 1) + insights.confidence) / total
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgAnalysisTime: this.metrics.avgAnalysisTime.toFixed(2) + 'ms',
      insightAccuracy: (this.metrics.insightAccuracy * 100).toFixed(2) + '%'
    }
  }
}

// ============================================================================
// PATTERN DETECTOR
// ============================================================================

class PatternDetector {
  /**
   * Detect patterns in data
   * @param {Object} data - Data to analyze
   * @param {Object} analyses - Analyzer results
   * @returns {Promise<Array<Object>>} Detected patterns
   */
  async detect(data, analyses) {
    const patterns = []
    
    // Detect frequency patterns
    if (data.timeSeries) {
      const freqPatterns = this.detectFrequencyPatterns(data.timeSeries)
      patterns.push(...freqPatterns)
    }
    
    // Detect correlation patterns
    if (data.multivariate) {
      const corrPatterns = this.detectCorrelationPatterns(data.multivariate)
      patterns.push(...corrPatterns)
    }
    
    // Detect anomalies
    if (data.values) {
      const anomalies = this.detectAnomalies(data.values)
      patterns.push(...anomalies)
    }
    
    return patterns
  }
  
  detectFrequencyPatterns(timeSeries) {
    // Placeholder: Real implementation would use FFT or similar
    return [{
      type: 'frequency',
      description: 'Regular periodic pattern detected',
      confidence: 0.85,
      impact: 'high'
    }]
  }
  
  detectCorrelationPatterns(data) {
    // Placeholder: Real implementation would calculate correlations
    return [{
      type: 'correlation',
      description: 'Strong positive correlation between variables',
      confidence: 0.78,
      impact: 'medium'
    }]
  }
  
  detectAnomalies(values) {
    // Simple anomaly detection using standard deviation
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    const anomalies = values.filter(v => Math.abs(v - mean) > 2 * stdDev)
    
    if (anomalies.length > 0) {
      return [{
        type: 'anomaly',
        description: `${anomalies.length} anomalies detected (>2 std dev from mean)`,
        confidence: 0.9,
        impact: 'high'
      }]
    }
    
    return []
  }
}

// ============================================================================
// TREND ANALYZER
// ============================================================================

class TrendAnalyzer {
  /**
   * Analyze trends in data
   * @param {Object} data - Data to analyze
   * @param {Object} analyses - Analyzer results
   * @returns {Promise<Array<Object>>} Detected trends
   */
  async analyze(data, analyses) {
    const trends = []
    
    // Detect linear trends
    if (data.timeSeries) {
      const linearTrend = this.detectLinearTrend(data.timeSeries)
      if (linearTrend) trends.push(linearTrend)
    }
    
    // Detect growth trends
    if (data.growth) {
      const growthTrend = this.detectGrowthTrend(data.growth)
      if (growthTrend) trends.push(growthTrend)
    }
    
    return trends
  }
  
  detectLinearTrend(timeSeries) {
    // Simple linear regression
    const n = timeSeries.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = timeSeries
    
    const sumX = x.reduce((sum, v) => sum + v, 0)
    const sumY = y.reduce((sum, v) => sum + v, 0)
    const sumXY = x.reduce((sum, v, i) => sum + v * y[i], 0)
    const sumX2 = x.reduce((sum, v) => sum + v * v, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    
    if (Math.abs(slope) > 0.1) {
      return {
        type: 'linear',
        description: slope > 0 ? 'Upward trend detected' : 'Downward trend detected',
        direction: slope > 0 ? 'up' : 'down',
        slope,
        significance: Math.min(Math.abs(slope), 1)
      }
    }
    
    return null
  }
  
  detectGrowthTrend(data) {
    // Placeholder: Real implementation would detect exponential/logarithmic growth
    return {
      type: 'growth',
      description: 'Exponential growth pattern',
      direction: 'up',
      significance: 0.75
    }
  }
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

class RecommendationEngine {
  /**
   * Generate recommendations
   * @param {Object} data - Original data
   * @param {Object} analyses - Analyses
   * @param {Array} patterns - Patterns
   * @param {Array} trends - Trends
   * @returns {Promise<Array<Object>>} Recommendations
   */
  async generate(data, analyses, patterns, trends) {
    const recommendations = []
    
    // Pattern-based recommendations
    patterns.forEach(pattern => {
      if (pattern.type === 'anomaly') {
        recommendations.push({
          type: 'investigate',
          priority: 'high',
          description: 'Investigate detected anomalies',
          action: 'Review anomalous data points and determine cause',
          expectedImpact: 'Prevent potential issues'
        })
      }
    })
    
    // Trend-based recommendations
    trends.forEach(trend => {
      if (trend.direction === 'down' && trend.significance > 0.7) {
        recommendations.push({
          type: 'optimize',
          priority: 'medium',
          description: 'Address declining trend',
          action: 'Implement improvements to reverse negative trend',
          expectedImpact: 'Improve performance metrics'
        })
      }
    })
    
    return recommendations
  }
}

// ============================================================================
// BASE ANALYZER
// ============================================================================

export class BaseAnalyzer {
  constructor(name, dataTypes) {
    this.name = name
    this.dataTypes = dataTypes
  }
  
  isRelevantFor(data) {
    return this.dataTypes.includes(data.type)
  }
  
  async analyze(data, options) {
    throw new Error('analyze() must be implemented by subclass')
  }
}

// Export singleton instance
export const insightEngine = new InsightEngine()

