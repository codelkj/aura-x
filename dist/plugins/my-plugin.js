class MyPluginPlugin {
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
}