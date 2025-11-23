/**
 * 808 Clap - Web Audio Plugin
 * Authentic 808-style clap sound with humanization
 * 
 * Features:
 * - Dual-layer synthesis (noise + filtered tone)
 * - Flam effect for natural feel
 * - Stereo width control
 * - Decay and filter controls
 */

class Clap808Plugin {
  constructor(audioContext) {
    this.context = audioContext;
    
    // Parameters
    this.params = {
      decay: 0.3,        // 0.1 - 2.0 seconds
      filter: 2000,      // 500 - 8000 Hz
      mix: 0.7,          // 0.0 - 1.0 (noise/tone balance)
      flamSpeed: 0.005,  // 0.001 - 0.02 seconds
      flamShift: 3,      // 0 - 5 (number of flam hits)
      stereo: 0.5        // 0.0 - 1.0 (stereo width)
    };
  }
  
  /**
   * Generate 808 clap sound
   * @param {number} time - When to trigger (AudioContext time)
   * @param {number} velocity - 0.0 to 1.0
   */
  trigger(time = 0, velocity = 1.0) {
    const now = time || this.context.currentTime;
    
    // Create main clap layers
    this.createNoiseLayer(now, velocity);
    this.createToneLayer(now, velocity);
    
    // Add flam effect (multiple quick hits)
    for (let i = 1; i <= this.params.flamShift; i++) {
      const flamTime = now + (i * this.params.flamSpeed);
      const flamVel = velocity * (1 - (i / (this.params.flamShift + 1)));
      this.createNoiseLayer(flamTime, flamVel);
      this.createToneLayer(flamTime, flamVel);
    }
  }
  
  /**
   * Create noise layer (white noise burst)
   */
  createNoiseLayer(time, velocity) {
    // Noise buffer
    const bufferSize = this.context.sampleRate * 0.1; // 100ms
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate);
    
    // Fill with white noise
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < bufferSize; i++) {
        // Add stereo variation
        const stereoOffset = channel === 0 ? -this.params.stereo : this.params.stereo;
        data[i] = (Math.random() * 2 - 1) * (1 + stereoOffset * 0.3);
      }
    }
    
    // Create source
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    // Bandpass filter (808 clap characteristic)
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = this.params.filter;
    filter.Q.value = 1.5;
    
    // Envelope
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(velocity * this.params.mix, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + this.params.decay);
    
    // Connect
    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.context.destination);
    
    // Start and stop
    noise.start(time);
    noise.stop(time + this.params.decay);
  }
  
  /**
   * Create tone layer (filtered sine waves)
   */
  createToneLayer(time, velocity) {
    // Multiple sine waves for body
    const frequencies = [1000, 1500, 2000];
    
    frequencies.forEach((freq, index) => {
      const osc = this.context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Filter
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = this.params.filter * 0.8;
      filter.Q.value = 2.0;
      
      // Envelope (shorter for tone)
      const envelope = this.context.createGain();
      const toneDecay = this.params.decay * 0.6;
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(
        velocity * (1 - this.params.mix) * (1 / frequencies.length),
        time + 0.001
      );
      envelope.gain.exponentialRampToValueAtTime(0.001, time + toneDecay);
      
      // Stereo panning
      const panner = this.context.createStereoPanner();
      panner.pan.value = (index - 1) * this.params.stereo * 0.5;
      
      // Connect
      osc.connect(filter);
      filter.connect(envelope);
      envelope.connect(panner);
      panner.connect(this.context.destination);
      
      // Start and stop
      osc.start(time);
      osc.stop(time + toneDecay);
    });
  }
  
  /**
   * Set parameter value
   */
  setParam(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;
    }
  }
  
  /**
   * Get parameter value
   */
  getParam(name) {
    return this.params[name];
  }
  
  /**
   * Get all parameters with metadata
   */
  getParameters() {
    return {
      decay: {
        value: this.params.decay,
        min: 0.1,
        max: 2.0,
        default: 0.3,
        unit: 's',
        label: 'Decay'
      },
      filter: {
        value: this.params.filter,
        min: 500,
        max: 8000,
        default: 2000,
        unit: 'Hz',
        label: 'Filter'
      },
      mix: {
        value: this.params.mix,
        min: 0.0,
        max: 1.0,
        default: 0.7,
        unit: '%',
        label: 'Mix'
      },
      flamSpeed: {
        value: this.params.flamSpeed,
        min: 0.001,
        max: 0.02,
        default: 0.005,
        unit: 's',
        label: 'Flam Speed'
      },
      flamShift: {
        value: this.params.flamShift,
        min: 0,
        max: 5,
        default: 3,
        unit: '',
        label: 'Flam Shift'
      },
      stereo: {
        value: this.params.stereo,
        min: 0.0,
        max: 1.0,
        default: 0.5,
        unit: '%',
        label: 'Stereo'
      }
    };
  }
}

// Export for use in platform
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clap808Plugin;
}

