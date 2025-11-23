/**
 * Plugin Hot Loader
 * Dynamically loads and reloads plugins without page refresh
 */

class PluginHotLoader {
  constructor(pluginManager) {
    this.pluginManager = pluginManager;
    this.loadedPlugins = new Set();
    this.pollInterval = null;
    this.backendUrl = window.location.origin.replace(/:\d+/, ':8000').replace(/^https:\/\/4173-/, 'https://8000-');
  }

  /**
   * Load all plugins from backend
   */
  async loadAllPlugins() {
    try {
      const response = await fetch(`${this.backendUrl}/api/plugins/list`);
      if (!response.ok) {
        console.error('Failed to fetch plugin list');
        return;
      }

      const data = await response.json();
      const plugins = data.plugins || [];

      // Load each enabled plugin
      for (const plugin of plugins) {
        if (plugin.enabled && !this.loadedPlugins.has(plugin.id)) {
          await this.loadPlugin(plugin);
        }
      }

      return plugins;
    } catch (error) {
      console.error('Failed to load plugins:', error);
      return [];
    }
  }

  /**
   * Load a single plugin
   */
  async loadPlugin(pluginInfo) {
    try {
      const scriptUrl = `/plugins/${pluginInfo.filename}?t=${Date.now()}`;
      
      // Create script element
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.id = `plugin-${pluginInfo.id}`;
      
      // Wait for script to load
      await new Promise((resolve, reject) => {
        script.onload = () => {
          console.log(`✅ Loaded plugin: ${pluginInfo.name} (${pluginInfo.id})`);
          resolve();
        };
        script.onerror = () => {
          console.error(`❌ Failed to load plugin: ${pluginInfo.name}`);
          reject(new Error(`Failed to load ${pluginInfo.filename}`));
        };
        document.head.appendChild(script);
      });

      // Register plugin with manager
      await this.registerPlugin(pluginInfo);
      
      // Mark as loaded
      this.loadedPlugins.add(pluginInfo.id);
      
      return true;
    } catch (error) {
      console.error(`Failed to load plugin ${pluginInfo.id}:`, error);
      return false;
    }
  }

  /**
   * Register plugin with PluginManager
   */
  async registerPlugin(pluginInfo) {
    try {
      // Convert plugin ID to class name
      // e.g., "my-plugin" -> "MyPluginPlugin"
      const className = pluginInfo.id
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Plugin';

      // Check if class exists
      if (typeof window[className] !== 'undefined') {
        this.pluginManager.registerPluginClass(pluginInfo.id, window[className]);
        console.log(`✅ Registered plugin class: ${className} as ${pluginInfo.id}`);
        return true;
      } else {
        console.warn(`⚠️ Plugin class ${className} not found in global scope`);
        return false;
      }
    } catch (error) {
      console.error(`Failed to register plugin ${pluginInfo.id}:`, error);
      return false;
    }
  }

  /**
   * Reload a plugin (hot reload)
   */
  async reloadPlugin(pluginId) {
    try {
      // Remove old script
      const oldScript = document.getElementById(`plugin-${pluginId}`);
      if (oldScript) {
        oldScript.remove();
      }

      // Mark as not loaded
      this.loadedPlugins.delete(pluginId);

      // Fetch plugin info
      const response = await fetch(`${this.backendUrl}/api/plugins/list`);
      if (!response.ok) {
        throw new Error('Failed to fetch plugin list');
      }

      const data = await response.json();
      const plugin = data.plugins.find(p => p.id === pluginId);

      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      // Reload
      await this.loadPlugin(plugin);
      
      console.log(`🔄 Hot reloaded plugin: ${pluginId}`);
      return true;
    } catch (error) {
      console.error(`Failed to reload plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Unload a plugin
   */
  unloadPlugin(pluginId) {
    try {
      // Remove script
      const script = document.getElementById(`plugin-${pluginId}`);
      if (script) {
        script.remove();
      }

      // Mark as not loaded
      this.loadedPlugins.delete(pluginId);

      console.log(`🗑️ Unloaded plugin: ${pluginId}`);
      return true;
    } catch (error) {
      console.error(`Failed to unload plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Start polling for plugin changes
   */
  startPolling(interval = 10000) {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.pollInterval = setInterval(async () => {
      await this.checkForUpdates();
    }, interval);

    console.log(`🔄 Started plugin hot-reload polling (${interval}ms)`);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('⏸️ Stopped plugin hot-reload polling');
    }
  }

  /**
   * Check for plugin updates
   */
  async checkForUpdates() {
    try {
      const response = await fetch(`${this.backendUrl}/api/plugins/list`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      const plugins = data.plugins || [];

      // Check for new or updated plugins
      for (const plugin of plugins) {
        if (plugin.enabled && !this.loadedPlugins.has(plugin.id)) {
          console.log(`🆕 New plugin detected: ${plugin.name}`);
          await this.loadPlugin(plugin);
        }
      }

      // Check for removed plugins
      for (const loadedId of this.loadedPlugins) {
        const stillExists = plugins.find(p => p.id === loadedId && p.enabled);
        if (!stillExists) {
          console.log(`🗑️ Plugin removed: ${loadedId}`);
          this.unloadPlugin(loadedId);
        }
      }
    } catch (error) {
      console.error('Failed to check for plugin updates:', error);
    }
  }

  /**
   * Get loaded plugin IDs
   */
  getLoadedPlugins() {
    return Array.from(this.loadedPlugins);
  }

  /**
   * Check if plugin is loaded
   */
  isPluginLoaded(pluginId) {
    return this.loadedPlugins.has(pluginId);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PluginHotLoader;
}

// Global instance for easy access
if (typeof window !== 'undefined') {
  window.PluginHotLoader = PluginHotLoader;
}

