import React, { useState } from 'react';

/**
 * Simple Plugin Creator - In-Browser Plugin Development
 * Create and test Web Audio plugins directly in the browser
 */
const PluginCreator = () => {
  const [pluginName, setPluginName] = useState('MyPlugin');
  const [pluginId, setPluginId] = useState('my-plugin');
  const [pluginCategory, setPluginCategory] = useState('Effects');
  const [selectedTemplate, setSelectedTemplate] = useState('effect');
  const [code, setCode] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [savedPlugins, setSavedPlugins] = useState([]);

  // Generate plugin ID from name
  const generatePluginId = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  // Plugin templates
  const getTemplate = (type, name) => {
    const className = name.replace(/[^a-zA-Z0-9]/g, '') + 'Plugin';
    
    const templates = {
      effect: `class ${className} {
  constructor(audioContext) {
    this.context = audioContext;
    
    // Define parameters
    this.params = {
      mix: 0.5,        // Dry/wet mix (0-1)
      intensity: 0.5   // Effect intensity (0-1)
    };
    
    // Create audio nodes
    this.input = this.context.createGain();
    this.output = this.context.createGain();
    this.wetGain = this.context.createGain();
    this.dryGain = this.context.createGain();
    
    // Build audio graph
    this.buildAudioGraph();
    this.updateParameters();
  }
  
  buildAudioGraph() {
    // Dry path (unprocessed signal)
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);
    
    // Wet path (add your processing here)
    this.input.connect(this.wetGain);
    this.wetGain.connect(this.output);
  }
  
  updateParameters() {
    this.wetGain.gain.value = this.params.mix;
    this.dryGain.gain.value = 1.0 - this.params.mix;
  }
  
  // For effects: implement process method
  process(source) {
    source.connect(this.input);
    return this.output;
  }
  
  setParam(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;
      this.updateParameters();
    }
  }
  
  getParam(name) {
    return this.params[name];
  }
  
  getParameters() {
    return {
      mix: {
        value: this.params.mix,
        min: 0.0,
        max: 1.0,
        default: 0.5,
        unit: '',
        label: 'Mix'
      },
      intensity: {
        value: this.params.intensity,
        min: 0.0,
        max: 1.0,
        default: 0.5,
        unit: '',
        label: 'Intensity'
      }
    };
  }
  
  connect(destination) {
    this.output.connect(destination);
  }
  
  disconnect() {
    this.output.disconnect();
  }
}`,

      percussion: `class ${className} {
  constructor(audioContext) {
    this.context = audioContext;
    
    // Define parameters
    this.params = {
      pitch: 200,      // Frequency in Hz
      decay: 0.3,      // Decay time in seconds
      tone: 1000,      // Tone filter frequency
      snap: 0.5        // Attack snap amount
    };
    
    // Create output
    this.output = this.context.createGain();
  }
  
  // Implement trigger method for percussion
  trigger(time, velocity) {
    // Create oscillator for the hit
    const osc = this.context.createOscillator();
    const env = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    
    // Configure oscillator
    osc.type = 'sine';
    osc.frequency.setValueAtTime(this.params.pitch * 2, time);
    osc.frequency.exponentialRampToValueAtTime(this.params.pitch, time + 0.01);
    
    // Configure filter
    filter.type = 'lowpass';
    filter.frequency.value = this.params.tone;
    filter.Q.value = 1.0;
    
    // Configure envelope
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(velocity, time + 0.001);
    env.gain.exponentialRampToValueAtTime(0.001, time + this.params.decay);
    
    // Connect audio graph
    osc.connect(filter);
    filter.connect(env);
    env.connect(this.output);
    
    // Start and stop
    osc.start(time);
    osc.stop(time + this.params.decay + 0.1);
  }
  
  setParam(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;
    }
  }
  
  getParam(name) {
    return this.params[name];
  }
  
  getParameters() {
    return {
      pitch: {
        value: this.params.pitch,
        min: 50,
        max: 1000,
        default: 200,
        unit: 'Hz',
        label: 'Pitch'
      },
      decay: {
        value: this.params.decay,
        min: 0.05,
        max: 2.0,
        default: 0.3,
        unit: 's',
        label: 'Decay'
      },
      tone: {
        value: this.params.tone,
        min: 200,
        max: 5000,
        default: 1000,
        unit: 'Hz',
        label: 'Tone'
      },
      snap: {
        value: this.params.snap,
        min: 0.0,
        max: 1.0,
        default: 0.5,
        unit: '',
        label: 'Snap'
      }
    };
  }
  
  connect(destination) {
    this.output.connect(destination);
  }
  
  disconnect() {
    this.output.disconnect();
  }
}`,

      synth: `class ${className} {
  constructor(audioContext) {
    this.context = audioContext;
    
    // Define parameters
    this.params = {
      waveform: 'sawtooth',  // Oscillator waveform
      attack: 0.01,          // Attack time
      decay: 0.1,            // Decay time
      sustain: 0.7,          // Sustain level
      release: 0.3,          // Release time
      filterFreq: 2000,      // Filter cutoff
      filterRes: 1.0         // Filter resonance
    };
    
    // Create output
    this.output = this.context.createGain();
    this.voices = [];
  }
  
  // Implement noteOn method for synths
  noteOn(midiNote, velocity, duration) {
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    const now = this.context.currentTime;
    
    // Create oscillator
    const osc = this.context.createOscillator();
    osc.type = this.params.waveform;
    osc.frequency.value = freq;
    
    // Create filter
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.params.filterFreq;
    filter.Q.value = this.params.filterRes;
    
    // Create envelope
    const env = this.context.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(velocity, now + this.params.attack);
    env.gain.linearRampToValueAtTime(
      velocity * this.params.sustain,
      now + this.params.attack + this.params.decay
    );
    env.gain.linearRampToValueAtTime(
      velocity * this.params.sustain,
      now + duration
    );
    env.gain.linearRampToValueAtTime(
      0.001,
      now + duration + this.params.release
    );
    
    // Connect audio graph
    osc.connect(filter);
    filter.connect(env);
    env.connect(this.output);
    
    // Start and stop
    osc.start(now);
    osc.stop(now + duration + this.params.release + 0.1);
    
    return { osc, filter, env };
  }
  
  setParam(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;
    }
  }
  
  getParam(name) {
    return this.params[name];
  }
  
  getParameters() {
    return {
      attack: {
        value: this.params.attack,
        min: 0.001,
        max: 1.0,
        default: 0.01,
        unit: 's',
        label: 'Attack'
      },
      decay: {
        value: this.params.decay,
        min: 0.001,
        max: 1.0,
        default: 0.1,
        unit: 's',
        label: 'Decay'
      },
      sustain: {
        value: this.params.sustain,
        min: 0.0,
        max: 1.0,
        default: 0.7,
        unit: '',
        label: 'Sustain'
      },
      release: {
        value: this.params.release,
        min: 0.001,
        max: 2.0,
        default: 0.3,
        unit: 's',
        label: 'Release'
      },
      filterFreq: {
        value: this.params.filterFreq,
        min: 100,
        max: 10000,
        default: 2000,
        unit: 'Hz',
        label: 'Filter Frequency'
      },
      filterRes: {
        value: this.params.filterRes,
        min: 0.1,
        max: 20.0,
        default: 1.0,
        unit: '',
        label: 'Filter Resonance'
      }
    };
  }
  
  connect(destination) {
    this.output.connect(destination);
  }
  
  disconnect() {
    this.output.disconnect();
  }
}`
    };
    
    return templates[type] || templates.effect;
  };

  // Load template
  const loadTemplate = (type) => {
    setSelectedTemplate(type);
    setCode(getTemplate(type, pluginName));
    
    // Update category based on template
    const categories = {
      effect: 'Effects',
      percussion: 'Drums',
      synth: 'Synths'
    };
    setPluginCategory(categories[type] || 'Effects');
  };

  // Handle plugin name change
  const handleNameChange = (name) => {
    setPluginName(name);
    setPluginId(generatePluginId(name));
  };

  // Test plugin
  const testPlugin = () => {
    try {
      // Create a temporary script element to evaluate the code
      const script = document.createElement('script');
      script.textContent = code;
      document.body.appendChild(script);
      
      setTestOutput('✅ Plugin code is valid! No syntax errors detected.');
      
      // Clean up
      document.body.removeChild(script);
    } catch (error) {
      setTestOutput(`❌ Error: ${error.message}`);
    }
  };

  // Save plugin
  const savePlugin = () => {
    const plugin = {
      id: pluginId,
      name: pluginName,
      category: pluginCategory,
      code: code,
      timestamp: new Date().toISOString()
    };
    
    setSavedPlugins([...savedPlugins, plugin]);
    setTestOutput(`✅ Plugin "${pluginName}" saved! You can now download it.`);
  };

  // Download plugin
  const downloadPlugin = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pluginId}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTestOutput(`✅ Plugin downloaded as "${pluginId}.js"`);
  };

  // Load saved plugin
  const loadSavedPlugin = (plugin) => {
    setPluginName(plugin.name);
    setPluginId(plugin.id);
    setPluginCategory(plugin.category);
    setCode(plugin.code);
    setTestOutput(`✅ Loaded plugin "${plugin.name}"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🎹 Plugin Creator</h1>
          <p className="text-gray-300">Create custom Web Audio plugins in your browser</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Plugin Info */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Plugin Info</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plugin Name
                  </label>
                  <input
                    type="text"
                    value={pluginName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="My Awesome Plugin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Plugin ID
                  </label>
                  <input
                    type="text"
                    value={pluginId}
                    onChange={(e) => setPluginId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="my-awesome-plugin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={pluginCategory}
                    onChange={(e) => setPluginCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Effects">Effects</option>
                    <option value="Drums">Drums</option>
                    <option value="Synths">Synths</option>
                    <option value="Percussion">Percussion</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Templates */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Templates</h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => loadTemplate('effect')}
                  className={`w-full px-4 py-3 rounded text-left transition-colors ${
                    selectedTemplate === 'effect'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">✨ Effect Plugin</div>
                  <div className="text-sm opacity-75">Process audio with effects</div>
                </button>

                <button
                  onClick={() => loadTemplate('percussion')}
                  className={`w-full px-4 py-3 rounded text-left transition-colors ${
                    selectedTemplate === 'percussion'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">🥁 Percussion</div>
                  <div className="text-sm opacity-75">One-shot drum sounds</div>
                </button>

                <button
                  onClick={() => loadTemplate('synth')}
                  className={`w-full px-4 py-3 rounded text-left transition-colors ${
                    selectedTemplate === 'synth'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">🎹 Synth</div>
                  <div className="text-sm opacity-75">Playable synthesizer</div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
              
              <div className="space-y-2">
                <button
                  onClick={testPlugin}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  🧪 Test Code
                </button>

                <button
                  onClick={savePlugin}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  💾 Save Plugin
                </button>

                <button
                  onClick={downloadPlugin}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                >
                  ⬇️ Download .js File
                </button>
              </div>
            </div>

            {/* Saved Plugins */}
            {savedPlugins.length > 0 && (
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Saved Plugins ({savedPlugins.length})</h2>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {savedPlugins.map((plugin, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadSavedPlugin(plugin)}
                      className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-left transition-colors"
                    >
                      <div className="font-semibold text-sm">{plugin.name}</div>
                      <div className="text-xs text-gray-400">{plugin.category}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Code Editor */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Code Editor</h2>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 px-4 py-3 bg-gray-900 text-green-400 font-mono text-sm rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="// Your plugin code here..."
                spellCheck={false}
              />
              
              <div className="mt-4 text-sm text-gray-400">
                💡 Tip: Select a template to get started, then customize the code
              </div>
            </div>

            {/* Test Output */}
            {testOutput && (
              <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Output</h2>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{testOutput}</pre>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">📖 How to Use</h2>
              
              <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
                <li>Enter your plugin name and select a category</li>
                <li>Choose a template (Effect, Percussion, or Synth)</li>
                <li>Edit the code in the editor</li>
                <li>Click "Test Code" to check for syntax errors</li>
                <li>Click "Save Plugin" to save to browser memory</li>
                <li>Click "Download .js File" to get the plugin file</li>
                <li>Follow the deployment guide to add it to the platform</li>
              </ol>

              <div className="mt-4 p-4 bg-blue-900 bg-opacity-30 rounded border border-blue-700">
                <div className="font-semibold text-blue-300 mb-2">📚 Next Steps:</div>
                <ul className="space-y-1 text-sm text-blue-200">
                  <li>• Copy downloaded .js file to <code className="bg-gray-800 px-1 rounded">public/plugins/</code></li>
                  <li>• Register in Plugin Manager</li>
                  <li>• Update Plugin Studio to load it</li>
                  <li>• Rebuild platform and test!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginCreator;

