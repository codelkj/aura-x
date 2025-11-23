import React, { useState, useEffect, useRef } from 'react';

/**
 * Plugin Studio Component
 * Interactive plugin testing and performance interface
 */
const PluginStudio = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [pluginManager, setPluginManager] = useState(null);
  const [availablePlugins, setAvailablePlugins] = useState([]);
  const [activePlugins, setActivePlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  // Initialize Audio Context and Plugin Manager
  const initializeAudio = async () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Load plugin scripts
      await loadPluginScripts();
      
      // Create plugin manager
      const manager = new window.PluginManager(ctx);
      
      // Create hot-loader and load all plugins
      const hotLoader = new window.PluginHotLoader(manager);
      await hotLoader.loadAllPlugins();
      
      // Get available plugins (now includes hot-loaded plugins)
      const plugins = manager.getAvailablePlugins();
      
      setAudioContext(ctx);
      setPluginManager(manager);
      setAvailablePlugins(plugins);
      setIsInitialized(true);
      
      // Setup visualizer
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      manager.getMasterOutput().connect(analyser);
      analyserRef.current = analyser;
      
      startVisualization();
      
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      alert('Failed to initialize audio system. Please check console for details.');
    }
  };

  // Load plugin scripts dynamically with hot-loader
  const loadPluginScripts = () => {
    return new Promise((resolve, reject) => {
      const scripts = [
        '/plugins/plugin-manager.js',
        '/plugins/plugin-hot-loader.js'
      ];
      
      let loaded = 0;
      
      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loaded++;
          if (loaded === scripts.length) {
            resolve();
          }
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    });
  };

  // Create plugin instance
  const createPlugin = (pluginId) => {
    if (!pluginManager) return;
    
    try {
      const instance = pluginManager.createPlugin(pluginId);
      setActivePlugins(prev => [...prev, instance]);
      setSelectedPlugin(instance);
    } catch (error) {
      console.error('Failed to create plugin:', error);
      alert(`Failed to create plugin: ${error.message}`);
    }
  };

  // Delete plugin instance
  const deletePlugin = (instanceId) => {
    if (!pluginManager) return;
    
    pluginManager.deletePlugin(instanceId);
    setActivePlugins(prev => prev.filter(p => p.id !== instanceId));
    
    if (selectedPlugin && selectedPlugin.id === instanceId) {
      setSelectedPlugin(null);
    }
  };

  // Update plugin parameter
  const updateParameter = (instanceId, paramName, value) => {
    if (!pluginManager) return;
    
    pluginManager.setParameter(instanceId, paramName, value);
    
    // Force re-render to update UI
    setActivePlugins(prev => [...prev]);
  };

  // Trigger plugin (for percussion instruments)
  const triggerPlugin = (instanceId) => {
    if (!pluginManager || !audioContext) return;
    
    try {
      pluginManager.triggerPlugin(instanceId, audioContext.currentTime, 1.0);
    } catch (error) {
      console.error('Failed to trigger plugin:', error);
    }
  };
  
  // Play note (for synth instruments)
  const playNote = (instanceId, midiNote, velocity) => {
    if (!pluginManager || !audioContext) return;
    
    try {
      pluginManager.noteOn(instanceId, midiNote, velocity, 1.0);
    } catch (error) {
      console.error('Failed to play note:', error);
    }
  };

  // Start visualization
  const startVisualization = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = 'rgb(20, 20, 30)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(76, 175, 80)';
      ctx.beginPath();
      
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    
    draw();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  return (
    <div className="plugin-studio min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎹 Plugin Studio
          </h1>
          <p className="text-gray-300">
            Create, test, and perform with Web Audio plugins
          </p>
        </div>

        {/* Initialize Button */}
        {!isInitialized && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <button
              onClick={initializeAudio}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
            >
              🎵 Initialize Audio System
            </button>
            <p className="text-gray-400 mt-4">
              Click to start the audio engine and load plugins
            </p>
          </div>
        )}

        {/* Main Interface */}
        {isInitialized && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plugin Library */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                📚 Plugin Library
              </h2>
              
              <div className="space-y-3">
                {availablePlugins.map(plugin => (
                  <div
                    key={plugin.id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => createPlugin(plugin.id)}
                  >
                    <h3 className="text-white font-bold">{plugin.name}</h3>
                    <p className="text-gray-300 text-sm">{plugin.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                        {plugin.category}
                      </span>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {plugin.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Plugins & Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Visualizer */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  📊 Audio Visualizer
                </h2>
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={200}
                  className="w-full rounded-lg bg-gray-900"
                />
              </div>

              {/* Active Plugins */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  🎛️ Active Plugins ({activePlugins.length})
                </h2>
                
                {activePlugins.length === 0 && (
                  <p className="text-gray-400 text-center py-8">
                    No active plugins. Click a plugin in the library to create an instance.
                  </p>
                )}
                
                <div className="space-y-4">
                  {activePlugins.map(instance => {
                    const params = pluginManager.getParameters(instance.id);
                    const isSelected = selectedPlugin && selectedPlugin.id === instance.id;
                    
                    return (
                      <div
                        key={instance.id}
                        className={`bg-gray-700 rounded-lg p-4 ${
                          isSelected ? 'ring-2 ring-green-500' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-white font-bold">
                              {instance.metadata.name}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {instance.id}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            {(instance.metadata.category === 'Drums' || instance.metadata.category === 'Percussion') && (
                              <button
                                onClick={() => triggerPlugin(instance.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                              >
                                ▶️ Trigger
                              </button>
                            )}
                            
                            {instance.metadata.category === 'Synths' && (
                              <div className="flex gap-1">
                                {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'].map((note, idx) => (
                                  <button
                                    key={note + idx}
                                    onClick={() => playNote(instance.id, 60 + idx, 0.8)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
                                  >
                                    {note}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            <button
                              onClick={() => deletePlugin(instance.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        
                        {/* Parameters */}
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(params).map(([name, param]) => (
                            <div key={name}>
                              <label className="text-white text-sm block mb-1">
                                {param.label}
                              </label>
                              <input
                                type="range"
                                min={param.min}
                                max={param.max}
                                step={(param.max - param.min) / 100}
                                value={param.value}
                                onChange={(e) => updateParameter(
                                  instance.id,
                                  name,
                                  parseFloat(e.target.value)
                                )}
                                className="w-full"
                              />
                              <div className="text-gray-400 text-xs mt-1">
                                {param.value.toFixed(2)} {param.unit}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Keyboard for synths */}
                        {instance.metadata.type === 'instrument' && instance.pluginId === 'amapiano-bass' && (
                          <div className="mt-4">
                            <p className="text-white text-sm mb-2">Keyboard:</p>
                            <div className="flex gap-1 flex-wrap">
                              {[36, 38, 40, 41, 43, 45, 47, 48].map(note => (
                                <button
                                  key={note}
                                  onClick={() => playNote(instance.id, note)}
                                  className="bg-white hover:bg-gray-300 text-black px-3 py-2 rounded text-sm transition-colors"
                                >
                                  {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'][note - 36]}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginStudio;

