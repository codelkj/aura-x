/**
 * Plugin Manager - Web Audio Plugin System
 * Manages plugin instances, routing, and integration with the platform
 */

class PluginManager {
  constructor(audioContext) {
    this.context = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    this.plugins = new Map();
    this.pluginClasses = new Map();
    this.masterOutput = this.context.createGain();
    this.masterOutput.connect(this.context.destination);
    
    // Register built-in plugins
    this.registerBuiltInPlugins();
  }
  
  /**
   * Register built-in plugin classes
   */
  registerBuiltInPlugins() {
    // These will be loaded from separate files
    if (typeof Clap808Plugin !== 'undefined') {
      this.registerPluginClass('808-clap', Clap808Plugin);
    }
    if (typeof LogDrumPlugin !== 'undefined') {
      this.registerPluginClass('log-drum', LogDrumPlugin);
    }
    if (typeof ShimmerReverbPlugin !== 'undefined') {
      this.registerPluginClass('shimmer-reverb', ShimmerReverbPlugin);
    }
    if (typeof AmapianoBassPlugin !== 'undefined') {
      this.registerPluginClass('amapiano-bass', AmapianoBassPlugin);
    }
    if (typeof MyPluginPlugin !== 'undefined') {
      this.registerPluginClass('my-plugin', MyPluginPlugin);
    }
  }
  
  /**
   * Register a plugin class
   */
  registerPluginClass(id, pluginClass) {
    this.pluginClasses.set(id, pluginClass);
  }
  
  /**
   * Create a plugin instance
   */
  createPlugin(pluginId, instanceId = null) {
    const PluginClass = this.pluginClasses.get(pluginId);
    if (!PluginClass) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }
    
    const id = instanceId || `${pluginId}-${Date.now()}`;
    const plugin = new PluginClass(this.context);
    
    // Wrap plugin with metadata
    const pluginInstance = {
      id,
      pluginId,
      plugin,
      createdAt: Date.now(),
      metadata: this.getPluginMetadata(pluginId)
    };
    
    this.plugins.set(id, pluginInstance);
    return pluginInstance;
  }
  
  /**
   * Get plugin instance
   */
  getPlugin(instanceId) {
    return this.plugins.get(instanceId);
  }
  
  /**
   * Delete plugin instance
   */
  deletePlugin(instanceId) {
    const instance = this.plugins.get(instanceId);
    if (instance) {
      // Stop any active sounds
      if (typeof instance.plugin.allNotesOff === 'function') {
        instance.plugin.allNotesOff();
      }
      if (typeof instance.plugin.disconnect === 'function') {
        instance.plugin.disconnect();
      }
      
      this.plugins.delete(instanceId);
      return true;
    }
    return false;
  }
  
  /**
   * Get all plugin instances
   */
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
  
  /**
   * Get available plugin types
   */
  getAvailablePlugins() {
    return Array.from(this.pluginClasses.keys()).map(id => ({
      id,
      ...this.getPluginMetadata(id)
    }));
  }
  
  /**
   * Get plugin metadata
   */
  getPluginMetadata(pluginId) {
    const metadata = {
      '808-clap': {
        name: '808 Clap',
        category: 'Drums',
        description: 'Authentic 808-style clap with flam effect and stereo width',
        type: 'instrument',
        tags: ['percussion', 'clap', '808', 'amapiano']
      },
      'log-drum': {
        name: 'Log Drum',
        category: 'Drums',
        description: 'Tunable Amapiano log drum with body resonance',
        type: 'instrument',
        tags: ['percussion', 'log drum', 'amapiano', 'pitched']
      },
      'shimmer-reverb': {
        name: 'Shimmer Reverb',
        category: 'Effects',
        description: 'Lush reverb with pitch-shifted feedback for ethereal shimmer',
        type: 'effect',
        tags: ['reverb', 'shimmer', 'ambient', 'space']
      },
      'amapiano-bass': {
        name: 'Amapiano Bass',
        category: 'Synths',
        description: 'Deep, rolling bass synth characteristic of Amapiano music',
        type: 'instrument',
        tags: ['bass', 'synth', 'amapiano', 'sub']
      }
    };
    
    return metadata[pluginId] || {
      name: pluginId,
      category: 'Unknown',
      description: 'No description available',
      type: 'unknown',
      tags: []
    };
  }
  
  /**
   * Trigger a one-shot plugin (like drums)
   */
  triggerPlugin(instanceId, ...args) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    const plugin = instance.plugin;
    
    // Call trigger method if available
    if (typeof plugin.trigger === 'function') {
      return plugin.trigger(...args);
    }
    
    throw new Error(`Plugin "${instance.pluginId}" does not support trigger()`);
  }
  
  /**
   * Send note on to a plugin
   */
  noteOn(instanceId, note, velocity = 1.0, duration = 0) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    const plugin = instance.plugin;
    
    if (typeof plugin.noteOn === 'function') {
      return plugin.noteOn(note, velocity, duration);
    }
    
    throw new Error(`Plugin "${instance.pluginId}" does not support noteOn()`);
  }
  
  /**
   * Send note off to a plugin
   */
  noteOff(instanceId, voice) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    const plugin = instance.plugin;
    
    if (typeof plugin.noteOff === 'function') {
      return plugin.noteOff(voice);
    }
    
    throw new Error(`Plugin "${instance.pluginId}" does not support noteOff()`);
  }
  
  /**
   * Set plugin parameter
   */
  setParameter(instanceId, paramName, value) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    const plugin = instance.plugin;
    
    if (typeof plugin.setParam === 'function') {
      plugin.setParam(paramName, value);
      return true;
    }
    
    return false;
  }
  
  /**
   * Get plugin parameter
   */
  getParameter(instanceId, paramName) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    const plugin = instance.plugin;
    
    if (typeof plugin.getParam === 'function') {
      return plugin.getParam(paramName);
    }
    
    return null;
  }
  
  /**
   * Get all plugin parameters
   */
  getParameters(instanceId) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    const plugin = instance.plugin;
    
    if (typeof plugin.getParameters === 'function') {
      return plugin.getParameters();
    }
    
    return {};
  }
  
  /**
   * Connect plugin to audio destination
   */
  connectPlugin(instanceId, destination = null) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    const plugin = instance.plugin;
    const dest = destination || this.masterOutput;
    
    if (typeof plugin.connect === 'function') {
      plugin.connect(dest);
      return true;
    }
    
    return false;
  }
  
  /**
   * Export plugin state for saving
   */
  exportPluginState(instanceId) {
    const instance = this.getPlugin(instanceId);
    if (!instance) {
      throw new Error(`Plugin instance "${instanceId}" not found`);
    }
    
    return {
      id: instance.id,
      pluginId: instance.pluginId,
      parameters: this.getParameters(instanceId),
      createdAt: instance.createdAt
    };
  }
  
  /**
   * Import plugin state (restore from save)
   */
  importPluginState(state) {
    const instance = this.createPlugin(state.pluginId, state.id);
    
    // Restore parameters
    if (state.parameters) {
      Object.entries(state.parameters).forEach(([name, param]) => {
        this.setParameter(instance.id, name, param.value);
      });
    }
    
    return instance;
  }
  
  /**
   * Get master output node
   */
  getMasterOutput() {
    return this.masterOutput;
  }
  
  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.masterOutput.gain.value = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Resume audio context (needed for user interaction)
   */
  async resume() {
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PluginManager;
}

// Global instance for easy access
if (typeof window !== 'undefined') {
  window.PluginManager = PluginManager;
}

