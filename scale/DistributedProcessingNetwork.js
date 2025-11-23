/**
 * Distributed Processing Network
 * Inspired by VAST DataSpace - Globally-distributed data computing
 * 
 * Enables processing audio workloads across multiple regions for <50ms latency worldwide
 */

export class DistributedProcessingNetwork {
  constructor() {
    // Regional nodes
    this.regions = new Map()
    
    // Node registry
    this.nodes = new Map()
    
    // Load balancer
    this.loadBalancer = new LoadBalancer()
    
    // Routing table
    this.routingTable = new RoutingTable()
    
    // Health monitor
    this.healthMonitor = new HealthMonitor()
    
    // Performance metrics
    this.metrics = {
      totalRequests: 0,
      avgLatency: 0,
      requestsPerRegion: {},
      failovers: 0,
      activeNodes: 0
    }
    
    // Initialize default regions
    this.initializeRegions()
    
    // Start health monitoring
    this.startHealthMonitoring()
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  /**
   * Initialize default regions
   */
  initializeRegions() {
    const defaultRegions = [
      {
        id: 'us-east',
        name: 'US East',
        location: { lat: 40.7128, lon: -74.0060 }, // New York
        endpoint: 'https://us-east.aurax.ai',
        priority: 1
      },
      {
        id: 'us-west',
        name: 'US West',
        location: { lat: 37.7749, lon: -122.4194 }, // San Francisco
        endpoint: 'https://us-west.aurax.ai',
        priority: 1
      },
      {
        id: 'eu-central',
        name: 'EU Central',
        location: { lat: 50.1109, lon: 8.6821 }, // Frankfurt
        endpoint: 'https://eu.aurax.ai',
        priority: 1
      },
      {
        id: 'asia-pacific',
        name: 'Asia Pacific',
        location: { lat: 1.3521, lon: 103.8198 }, // Singapore
        endpoint: 'https://asia.aurax.ai',
        priority: 1
      }
    ]
    
    defaultRegions.forEach(region => {
      this.registerRegion(region)
    })
  }
  
  /**
   * Register a region
   * @param {Object} region - Region configuration
   */
  registerRegion(region) {
    this.regions.set(region.id, {
      ...region,
      nodes: [],
      healthy: true,
      lastHealthCheck: Date.now()
    })
    
    console.log(`[DistributedNetwork] Registered region: ${region.name}`)
  }
  
  // ============================================================================
  // NODE MANAGEMENT
  // ============================================================================
  
  /**
   * Register a processing node
   * @param {Object} node - Node configuration
   */
  registerNode(node) {
    const nodeId = node.id || this.generateNodeId()
    
    this.nodes.set(nodeId, {
      id: nodeId,
      regionId: node.regionId,
      endpoint: node.endpoint,
      capacity: node.capacity || 100,
      currentLoad: 0,
      healthy: true,
      lastSeen: Date.now()
    })
    
    // Add to region
    const region = this.regions.get(node.regionId)
    if (region) {
      region.nodes.push(nodeId)
    }
    
    this.metrics.activeNodes++
    
    console.log(`[DistributedNetwork] Registered node: ${nodeId} in ${node.regionId}`)
    
    return nodeId
  }
  
  /**
   * Unregister a node
   * @param {string} nodeId - Node ID
   */
  unregisterNode(nodeId) {
    const node = this.nodes.get(nodeId)
    if (!node) return
    
    // Remove from region
    const region = this.regions.get(node.regionId)
    if (region) {
      region.nodes = region.nodes.filter(id => id !== nodeId)
    }
    
    this.nodes.delete(nodeId)
    this.metrics.activeNodes--
    
    console.log(`[DistributedNetwork] Unregistered node: ${nodeId}`)
  }
  
  // ============================================================================
  // REQUEST ROUTING
  // ============================================================================
  
  /**
   * Route request to optimal node
   * @param {Object} request - Processing request
   * @param {Object} options - Routing options
   * @returns {Promise<Object>} Processing result
   */
  async routeRequest(request, options = {}) {
    const startTime = performance.now()
    
    try {
      // 1. Determine optimal region
      const region = await this.selectRegion(request, options)
      
      if (!region) {
        throw new Error('No healthy regions available')
      }
      
      // 2. Select node within region
      const node = await this.selectNode(region, request)
      
      if (!node) {
        throw new Error(`No healthy nodes in region ${region.id}`)
      }
      
      // 3. Execute request on node
      const result = await this.executeOnNode(node, request)
      
      // 4. Update metrics
      const latency = performance.now() - startTime
      this.updateMetrics(region.id, latency)
      
      return {
        success: true,
        result,
        region: region.id,
        node: node.id,
        latency
      }
      
    } catch (error) {
      // Handle failure with retry/failover
      return await this.handleFailure(request, options, error)
    }
  }
  
  /**
   * Select optimal region for request
   * @param {Object} request - Request
   * @param {Object} options - Options
   * @returns {Promise<Object>} Selected region
   */
  async selectRegion(request, options) {
    // If user location provided, use nearest region
    if (options.userLocation) {
      return this.findNearestRegion(options.userLocation)
    }
    
    // Otherwise, use load balancer
    return this.loadBalancer.selectRegion(Array.from(this.regions.values()))
  }
  
  /**
   * Find nearest region to user
   * @param {Object} userLocation - User location {lat, lon}
   * @returns {Object} Nearest region
   */
  findNearestRegion(userLocation) {
    let nearestRegion = null
    let minDistance = Infinity
    
    for (const region of this.regions.values()) {
      if (!region.healthy) continue
      
      const distance = this.calculateDistance(
        userLocation,
        region.location
      )
      
      if (distance < minDistance) {
        minDistance = distance
        nearestRegion = region
      }
    }
    
    return nearestRegion
  }
  
  /**
   * Calculate distance between two points (Haversine formula)
   * @param {Object} point1 - {lat, lon}
   * @param {Object} point2 - {lat, lon}
   * @returns {number} Distance in km
   */
  calculateDistance(point1, point2) {
    const R = 6371 // Earth radius in km
    const dLat = this.toRad(point2.lat - point1.lat)
    const dLon = this.toRad(point2.lon - point1.lon)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
  
  toRad(degrees) {
    return degrees * (Math.PI / 180)
  }
  
  /**
   * Select node within region
   * @param {Object} region - Region
   * @param {Object} request - Request
   * @returns {Promise<Object>} Selected node
   */
  async selectNode(region, request) {
    const healthyNodes = region.nodes
      .map(id => this.nodes.get(id))
      .filter(node => node && node.healthy && node.currentLoad < node.capacity)
    
    if (healthyNodes.length === 0) return null
    
    // Use load balancer to select node
    return this.loadBalancer.selectNode(healthyNodes)
  }
  
  /**
   * Execute request on node
   * @param {Object} node - Node
   * @param {Object} request - Request
   * @returns {Promise<Object>} Result
   */
  async executeOnNode(node, request) {
    // Update node load
    node.currentLoad++
    
    try {
      // Placeholder: Real implementation would make HTTP request to node
      const result = await this.simulateNodeExecution(node, request)
      
      return result
      
    } finally {
      // Decrease node load
      node.currentLoad--
      node.lastSeen = Date.now()
    }
  }
  
  /**
   * Simulate node execution (placeholder)
   * @param {Object} node - Node
   * @param {Object} request - Request
   * @returns {Promise<Object>} Result
   */
  async simulateNodeExecution(node, request) {
    // Simulate network latency (10-50ms)
    const latency = 10 + Math.random() * 40
    await new Promise(resolve => setTimeout(resolve, latency))
    
    // Simulate processing
    return {
      processed: true,
      nodeId: node.id,
      timestamp: Date.now()
    }
  }
  
  // ============================================================================
  // FAILURE HANDLING
  // ============================================================================
  
  /**
   * Handle request failure with retry/failover
   * @param {Object} request - Original request
   * @param {Object} options - Options
   * @param {Error} error - Error that occurred
   * @returns {Promise<Object>} Result
   */
  async handleFailure(request, options, error) {
    console.warn(`[DistributedNetwork] Request failed: ${error.message}`)
    
    // Try failover to next region
    const nextRegion = await this.findFailoverRegion(options.userLocation)
    
    if (!nextRegion) {
      throw new Error('All regions unavailable')
    }
    
    this.metrics.failovers++
    
    console.log(`[DistributedNetwork] Failing over to region: ${nextRegion.id}`)
    
    // Retry with failover region
    return await this.routeRequest(request, {
      ...options,
      excludeRegions: [...(options.excludeRegions || []), options.preferredRegion]
    })
  }
  
  /**
   * Find failover region
   * @param {Object} userLocation - User location
   * @returns {Object} Failover region
   */
  findFailoverRegion(userLocation) {
    // Find next nearest healthy region
    const healthyRegions = Array.from(this.regions.values())
      .filter(r => r.healthy && r.nodes.length > 0)
    
    if (healthyRegions.length === 0) return null
    
    if (userLocation) {
      return this.findNearestRegion(userLocation)
    }
    
    // Return region with lowest load
    return healthyRegions.reduce((best, region) => {
      const regionLoad = this.calculateRegionLoad(region)
      const bestLoad = this.calculateRegionLoad(best)
      return regionLoad < bestLoad ? region : best
    })
  }
  
  /**
   * Calculate region load
   * @param {Object} region - Region
   * @returns {number} Load percentage
   */
  calculateRegionLoad(region) {
    if (region.nodes.length === 0) return 100
    
    const totalLoad = region.nodes.reduce((sum, nodeId) => {
      const node = this.nodes.get(nodeId)
      return sum + (node ? node.currentLoad / node.capacity : 0)
    }, 0)
    
    return (totalLoad / region.nodes.length) * 100
  }
  
  // ============================================================================
  // HEALTH MONITORING
  // ============================================================================
  
  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    setInterval(() => {
      this.checkHealth()
    }, 10000) // Check every 10 seconds
  }
  
  /**
   * Check health of all regions and nodes
   */
  async checkHealth() {
    for (const region of this.regions.values()) {
      const health = await this.healthMonitor.checkRegion(region)
      region.healthy = health.healthy
      region.lastHealthCheck = Date.now()
      
      // Check individual nodes
      for (const nodeId of region.nodes) {
        const node = this.nodes.get(nodeId)
        if (node) {
          const nodeHealth = await this.healthMonitor.checkNode(node)
          node.healthy = nodeHealth.healthy
        }
      }
    }
  }
  
  // ============================================================================
  // METRICS
  // ============================================================================
  
  /**
   * Update metrics
   * @param {string} regionId - Region ID
   * @param {number} latency - Request latency
   */
  updateMetrics(regionId, latency) {
    this.metrics.totalRequests++
    
    const total = this.metrics.totalRequests
    this.metrics.avgLatency = 
      (this.metrics.avgLatency * (total - 1) + latency) / total
    
    if (!this.metrics.requestsPerRegion[regionId]) {
      this.metrics.requestsPerRegion[regionId] = 0
    }
    this.metrics.requestsPerRegion[regionId]++
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgLatency: this.metrics.avgLatency.toFixed(2) + 'ms',
      totalRegions: this.regions.size,
      healthyRegions: Array.from(this.regions.values()).filter(r => r.healthy).length,
      failoverRate: ((this.metrics.failovers / this.metrics.totalRequests) * 100).toFixed(2) + '%'
    }
  }
  
  /**
   * Generate node ID
   * @returns {string} Node ID
   */
  generateNodeId() {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// ============================================================================
// LOAD BALANCER
// ============================================================================

class LoadBalancer {
  constructor() {
    this.algorithm = 'least-loaded' // 'round-robin', 'least-loaded', 'random'
    this.roundRobinIndex = 0
  }
  
  /**
   * Select region using load balancing
   * @param {Array<Object>} regions - Available regions
   * @returns {Object} Selected region
   */
  selectRegion(regions) {
    const healthyRegions = regions.filter(r => r.healthy)
    
    if (healthyRegions.length === 0) return null
    
    switch (this.algorithm) {
      case 'round-robin':
        return this.roundRobin(healthyRegions)
      case 'least-loaded':
        return this.leastLoaded(healthyRegions)
      case 'random':
        return this.random(healthyRegions)
      default:
        return healthyRegions[0]
    }
  }
  
  /**
   * Select node using load balancing
   * @param {Array<Object>} nodes - Available nodes
   * @returns {Object} Selected node
   */
  selectNode(nodes) {
    if (nodes.length === 0) return null
    
    // Always use least-loaded for nodes
    return this.leastLoadedNode(nodes)
  }
  
  roundRobin(items) {
    const item = items[this.roundRobinIndex % items.length]
    this.roundRobinIndex++
    return item
  }
  
  leastLoaded(regions) {
    // Calculate load for each region
    return regions.reduce((best, region) => {
      const regionLoad = region.nodes.length
      const bestLoad = best.nodes.length
      return regionLoad < bestLoad ? region : best
    })
  }
  
  leastLoadedNode(nodes) {
    return nodes.reduce((best, node) => {
      const nodeLoad = node.currentLoad / node.capacity
      const bestLoad = best.currentLoad / best.capacity
      return nodeLoad < bestLoad ? node : best
    })
  }
  
  random(items) {
    return items[Math.floor(Math.random() * items.length)]
  }
}

// ============================================================================
// ROUTING TABLE
// ============================================================================

class RoutingTable {
  constructor() {
    this.routes = new Map()
  }
  
  addRoute(from, to, cost) {
    if (!this.routes.has(from)) {
      this.routes.set(from, new Map())
    }
    this.routes.get(from).set(to, cost)
  }
  
  getRoute(from, to) {
    if (this.routes.has(from)) {
      return this.routes.get(from).get(to)
    }
    return null
  }
}

// ============================================================================
// HEALTH MONITOR
// ============================================================================

class HealthMonitor {
  async checkRegion(region) {
    // Placeholder: Real implementation would ping region endpoint
    return {
      healthy: true,
      latency: Math.random() * 50,
      timestamp: Date.now()
    }
  }
  
  async checkNode(node) {
    // Placeholder: Real implementation would ping node endpoint
    const timeSinceLastSeen = Date.now() - node.lastSeen
    
    return {
      healthy: timeSinceLastSeen < 60000, // Healthy if seen in last 60 seconds
      latency: Math.random() * 20,
      timestamp: Date.now()
    }
  }
}

// Export singleton instance
export const distributedNetwork = new DistributedProcessingNetwork()

