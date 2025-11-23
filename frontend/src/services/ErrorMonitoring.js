/**
 * Error Monitoring and Logging System
 * 
 * Comprehensive error tracking, logging, and analytics for the Amapiano AI Platform
 */

class ErrorMonitoring {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/errors',
      enableConsoleLog: config.enableConsoleLog !== false,
      enableRemoteLog: config.enableRemoteLog !== false,
      maxErrorsInMemory: config.maxErrorsInMemory || 100,
      ...config
    };
    
    this.errors = [];
    this.analytics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByComponent: {},
      errorsByUser: {}
    };
    
    this.init();
  }
  
  /**
   * Initialize error monitoring
   */
  init() {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          type: 'runtime_error',
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      });
      
      // Unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          type: 'unhandled_promise_rejection',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack
        });
      });
    }
    
    console.log('✅ Error Monitoring initialized');
  }
  
  /**
   * Log an error
   */
  logError(error, context = {}) {
    const errorEntry = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type: error.type || 'unknown',
      message: error.message,
      stack: error.stack,
      component: context.component,
      user: context.user,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      ...context
    };
    
    // Add to memory
    this.errors.unshift(errorEntry);
    if (this.errors.length > this.config.maxErrorsInMemory) {
      this.errors.pop();
    }
    
    // Update analytics
    this.analytics.totalErrors++;
    this.analytics.errorsByType[errorEntry.type] = 
      (this.analytics.errorsByType[errorEntry.type] || 0) + 1;
    
    if (errorEntry.component) {
      this.analytics.errorsByComponent[errorEntry.component] = 
        (this.analytics.errorsByComponent[errorEntry.component] || 0) + 1;
    }
    
    // Console log
    if (this.config.enableConsoleLog) {
      console.error(`[Error Monitor] ${errorEntry.type}:`, errorEntry.message);
      if (errorEntry.stack) {
        console.error(errorEntry.stack);
      }
    }
    
    // Remote log
    if (this.config.enableRemoteLog) {
      this.sendToRemote(errorEntry);
    }
    
    return errorEntry;
  }
  
  /**
   * Send error to remote logging service
   */
  async sendToRemote(errorEntry) {
    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorEntry)
      });
    } catch (err) {
      // Silently fail to avoid infinite loop
      if (this.config.enableConsoleLog) {
        console.warn('[Error Monitor] Failed to send error to remote:', err.message);
      }
    }
  }
  
  /**
   * Get all errors
   */
  getErrors(filter = {}) {
    let filtered = this.errors;
    
    if (filter.type) {
      filtered = filtered.filter(e => e.type === filter.type);
    }
    
    if (filter.component) {
      filtered = filtered.filter(e => e.component === filter.component);
    }
    
    if (filter.since) {
      const sinceDate = new Date(filter.since);
      filtered = filtered.filter(e => new Date(e.timestamp) >= sinceDate);
    }
    
    return filtered;
  }
  
  /**
   * Get analytics
   */
  getAnalytics() {
    return {
      ...this.analytics,
      errorRate: this.calculateErrorRate(),
      topErrors: this.getTopErrors(5),
      recentErrors: this.errors.slice(0, 10)
    };
  }
  
  /**
   * Calculate error rate (errors per minute)
   */
  calculateErrorRate() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentErrors = this.errors.filter(e => 
      new Date(e.timestamp).getTime() >= oneMinuteAgo
    );
    return recentErrors.length;
  }
  
  /**
   * Get top errors by frequency
   */
  getTopErrors(limit = 5) {
    const errorCounts = {};
    
    this.errors.forEach(error => {
      const key = `${error.type}:${error.message}`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });
    
    return Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => {
        const [type, message] = key.split(':');
        return { type, message, count };
      });
  }
  
  /**
   * Clear all errors
   */
  clearErrors() {
    this.errors = [];
    this.analytics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByComponent: {},
      errorsByUser: {}
    };
  }
  
  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Analytics Tracking System
 */
class AnalyticsTracker {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/analytics',
      enableTracking: config.enableTracking !== false,
      trackPageViews: config.trackPageViews !== false,
      trackUserActions: config.trackUserActions !== false,
      ...config
    };
    
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.userId = config.userId || null;
    
    this.init();
  }
  
  /**
   * Initialize analytics tracking
   */
  init() {
    if (!this.config.enableTracking) {
      return;
    }
    
    // Track page views
    if (this.config.trackPageViews && typeof window !== 'undefined') {
      this.trackPageView();
      
      // Track navigation
      window.addEventListener('popstate', () => {
        this.trackPageView();
      });
    }
    
    console.log('✅ Analytics Tracking initialized');
  }
  
  /**
   * Track an event
   */
  trackEvent(eventName, properties = {}) {
    if (!this.config.enableTracking) {
      return;
    }
    
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    };
    
    this.events.push(event);
    
    // Send to remote
    this.sendToRemote(event);
    
    return event;
  }
  
  /**
   * Track page view
   */
  trackPageView() {
    return this.trackEvent('page_view', {
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer
    });
  }
  
  /**
   * Track user action
   */
  trackAction(action, details = {}) {
    return this.trackEvent('user_action', {
      action,
      ...details
    });
  }
  
  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, details = {}) {
    return this.trackEvent('feature_usage', {
      feature: featureName,
      ...details
    });
  }
  
  /**
   * Track generation
   */
  trackGeneration(generationType, details = {}) {
    return this.trackEvent('generation', {
      type: generationType,
      ...details
    });
  }
  
  /**
   * Track export
   */
  trackExport(exportFormat, details = {}) {
    return this.trackEvent('export', {
      format: exportFormat,
      ...details
    });
  }
  
  /**
   * Send event to remote analytics service
   */
  async sendToRemote(event) {
    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (err) {
      // Silently fail
      console.warn('[Analytics] Failed to send event to remote:', err.message);
    }
  }
  
  /**
   * Get analytics summary
   */
  getSummary() {
    const eventsByType = {};
    const eventsByHour = {};
    
    this.events.forEach(event => {
      // By type
      eventsByType[event.eventName] = (eventsByType[event.eventName] || 0) + 1;
      
      // By hour
      const hour = new Date(event.timestamp).getHours();
      eventsByHour[hour] = (eventsByHour[hour] || 0) + 1;
    });
    
    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsByHour,
      sessionId: this.sessionId,
      userId: this.userId
    };
  }
  
  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Set user ID
   */
  setUserId(userId) {
    this.userId = userId;
  }
}

// Export services
export { ErrorMonitoring, AnalyticsTracker };
export default ErrorMonitoring;

