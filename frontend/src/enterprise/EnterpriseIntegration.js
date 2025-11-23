/**
 * Enterprise Integration Layer
 * Unified interface for all enterprise features
 * 
 * Integrates:
 * - Multi-Tenancy Manager
 * - Reliability Framework
 * - Cost Optimization Engine
 */

import { multiTenancyManager } from './MultiTenancyManager.js'
import { reliabilityFramework } from './ReliabilityFramework.js'
import { costOptimizationEngine } from './CostOptimizationEngine.js'

export class EnterpriseIntegration {
  constructor() {
    this.multiTenancy = multiTenancyManager
    this.reliability = reliabilityFramework
    this.costOptimization = costOptimizationEngine
    
    // Integration state
    this.initialized = false
    
    // Enterprise metrics
    this.metrics = {
      totalTenants: 0,
      systemHealth: 'unknown',
      totalCosts: 0,
      totalSavings: 0,
      uptimePercentage: 0
    }
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  /**
   * Initialize enterprise features
   */
  async initialize() {
    if (this.initialized) {
      console.warn('[Enterprise] Already initialized')
      return
    }
    
    console.log('[Enterprise] Initializing enterprise features...')
    
    try {
      // Set up integrations between components
      this.setupIntegrations()
      
      // Start monitoring
      this.startMonitoring()
      
      this.initialized = true
      console.log('[Enterprise] Initialization complete')
    } catch (error) {
      console.error('[Enterprise] Initialization failed:', error)
      throw error
    }
  }
  
  /**
   * Set up integrations between components
   */
  setupIntegrations() {
    // Integration 1: Multi-Tenancy → Cost Optimization
    // Track tenant resource usage for cost optimization
    const originalRecordUsage = this.multiTenancy.recordUsage.bind(this.multiTenancy)
    this.multiTenancy.recordUsage = (tenantId, usage) => {
      // Call original method
      originalRecordUsage(tenantId, usage)
      
      // Record costs
      if (usage.cpu) {
        this.costOptimization.recordCost('compute', usage.cpu * 0.05, { tenantId })
      }
      if (usage.memory) {
        this.costOptimization.recordCost('compute', usage.memory * 0.01, { tenantId })
      }
      if (usage.storage) {
        this.costOptimization.recordCost('storage', usage.storage * 0.001, { tenantId })
      }
      if (usage.apiCalls) {
        this.costOptimization.recordCost('network', usage.apiCalls * 0.0001, { tenantId })
      }
    }
    
    // Integration 2: Reliability → Cost Optimization
    // Record request costs
    const originalRecordRequest = this.reliability.recordRequest.bind(this.reliability)
    this.reliability.recordRequest = (success, latency) => {
      // Call original method
      originalRecordRequest(success, latency)
      
      // Record network cost
      this.costOptimization.recordCost('network', 0.001)
    }
    
    // Integration 3: Reliability → Multi-Tenancy
    // Suspend tenants if health check fails
    this.reliability.registerHealthCheck('tenant-health', async () => {
      const tenants = Array.from(this.multiTenancy.tenants.values())
      const unhealthyTenants = tenants.filter(t => t.status === 'suspended')
      
      return {
        healthy: unhealthyTenants.length === 0,
        unhealthyCount: unhealthyTenants.length
      }
    }, 60000)
    
    console.log('[Enterprise] Integrations configured')
  }
  
  /**
   * Start monitoring
   */
  startMonitoring() {
    // Update metrics every minute
    setInterval(() => {
      this.updateMetrics()
    }, 60000)
    
    // Initial update
    this.updateMetrics()
  }
  
  /**
   * Update enterprise metrics
   */
  updateMetrics() {
    const multiTenancyMetrics = this.multiTenancy.getMetrics()
    const reliabilityMetrics = this.reliability.getMetrics()
    const costMetrics = this.costOptimization.getSavingsSummary()
    
    this.metrics = {
      totalTenants: multiTenancyMetrics.totalTenants,
      activeTenants: multiTenancyMetrics.activeTenants,
      systemHealth: this.reliability.healthStatus,
      totalCosts: this.costOptimization.costs.total,
      totalSavings: costMetrics.total,
      uptimePercentage: reliabilityMetrics.uptimePercentage,
      errorRate: reliabilityMetrics.errorRate,
      optimizationRate: costMetrics.optimizationRate
    }
  }
  
  // ============================================================================
  // TENANT OPERATIONS
  // ============================================================================
  
  /**
   * Create enterprise tenant
   * @param {Object} config - Tenant configuration
   * @returns {string} Tenant ID
   */
  async createTenant(config) {
    // Create tenant
    const tenantId = await this.multiTenancy.createTenant(config)
    
    // Register tenant-specific health check
    this.reliability.registerHealthCheck(`tenant-${tenantId}`, async () => {
      const tenant = this.multiTenancy.getTenant(tenantId)
      
      if (!tenant) {
        return { healthy: false, error: 'Tenant not found' }
      }
      
      // Check if tenant is within quotas
      const allocation = this.multiTenancy.resourceAllocations.get(tenantId)
      if (!allocation) {
        return { healthy: false, error: 'No resource allocation' }
      }
      
      const withinQuotas = 
        tenant.usage.cpu <= allocation.quotas.cpu &&
        tenant.usage.memory <= allocation.quotas.memory &&
        tenant.usage.storage <= allocation.quotas.storage
      
      return {
        healthy: withinQuotas && tenant.status === 'active',
        usage: tenant.usage,
        quotas: allocation.quotas
      }
    }, 300000) // Check every 5 minutes
    
    // Register tenant-specific circuit breaker
    this.reliability.registerCircuitBreaker(`tenant-${tenantId}-api`, {
      failureThreshold: 10,
      successThreshold: 3,
      timeout: 120000
    })
    
    console.log(`[Enterprise] Created enterprise tenant: ${tenantId}`)
    
    return tenantId
  }
  
  /**
   * Get tenant dashboard
   * @param {string} tenantId - Tenant ID
   * @returns {Object} Dashboard data
   */
  getTenantDashboard(tenantId) {
    const tenant = this.multiTenancy.getTenant(tenantId)
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`)
    }
    
    // Get health status
    const healthStatus = this.reliability.getHealthStatus()
    const tenantHealth = healthStatus.checks[`tenant-${tenantId}`]
    
    // Get billing
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const billing = this.multiTenancy.getBillingSummary(tenantId, currentMonth, currentYear)
    
    // Get cost forecast
    const forecast = this.costOptimization.getCostForecast(30)
    
    return {
      tenant: {
        id: tenant.id,
        organizationName: tenant.organizationName,
        plan: tenant.plan,
        status: tenant.status,
        createdAt: tenant.createdAt
      },
      usage: tenant.usage,
      quotas: tenant.quotas,
      health: tenantHealth,
      billing,
      forecast,
      recommendations: this.costOptimization.getRecommendations().slice(0, 5)
    }
  }
  
  // ============================================================================
  // SYSTEM OPERATIONS
  // ============================================================================
  
  /**
   * Get system dashboard
   * @returns {Object} Dashboard data
   */
  getSystemDashboard() {
    return {
      metrics: this.metrics,
      multiTenancy: this.multiTenancy.getMetrics(),
      reliability: this.reliability.getMetrics(),
      health: this.reliability.getHealthStatus(),
      costs: this.costOptimization.getCostBreakdown(30),
      savings: this.costOptimization.getSavingsSummary(),
      recommendations: this.costOptimization.getRecommendations().slice(0, 10)
    }
  }
  
  /**
   * Execute tenant operation with reliability
   * @param {string} tenantId - Tenant ID
   * @param {Function} operation - Operation to execute
   * @param {Function} fallback - Fallback function
   * @returns {Promise<any>} Result
   */
  async executeWithReliability(tenantId, operation, fallback = null) {
    return await this.reliability.executeWithCircuitBreaker(
      `tenant-${tenantId}-api`,
      operation,
      fallback
    )
  }
  
  /**
   * Check tenant quota and allocate
   * @param {string} tenantId - Tenant ID
   * @param {Object} request - Resource request
   * @returns {boolean} Allocated
   */
  async allocateResources(tenantId, request) {
    // Check if can allocate
    const canAllocate = this.multiTenancy.canAllocate(tenantId, request)
    
    if (!canAllocate) {
      console.warn(`[Enterprise] Tenant ${tenantId} quota exceeded`)
      return false
    }
    
    // Record usage
    this.multiTenancy.recordUsage(tenantId, request)
    
    return true
  }
  
  // ============================================================================
  // REPORTING
  // ============================================================================
  
  /**
   * Generate enterprise report
   * @param {string} period - Report period (daily, weekly, monthly)
   * @returns {Object} Report
   */
  generateReport(period = 'monthly') {
    const days = {
      daily: 1,
      weekly: 7,
      monthly: 30
    }[period] || 30
    
    return {
      period,
      generatedAt: Date.now(),
      summary: {
        totalTenants: this.metrics.totalTenants,
        activeTenants: this.metrics.activeTenants,
        systemHealth: this.metrics.systemHealth,
        uptimePercentage: this.metrics.uptimePercentage
      },
      costs: this.costOptimization.getCostBreakdown(days),
      savings: this.costOptimization.getSavingsSummary(),
      reliability: this.reliability.getMetrics(),
      recommendations: this.costOptimization.getRecommendations(),
      forecast: this.costOptimization.getCostForecast(days)
    }
  }
}

// Export singleton instance
export const enterpriseIntegration = new EnterpriseIntegration()

// Auto-initialize
enterpriseIntegration.initialize().catch(error => {
  console.error('[Enterprise] Auto-initialization failed:', error)
})

