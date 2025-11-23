/**
 * Log Drum - Web Audio Plugin
 * Authentic Amapiano log drum sound
 * 
 * Features:
 * - Pitched tom-like sound with decay
 * - Tunable pitch (MIDI note support)
 * - Body resonance control
 * - Attack and decay shaping
 */

class LogDrumPlugin {
  constructor(audioContext) {
    this.context = audioContext;
    
    // Parameters
    this.params = {
      pitch: 60,         // MIDI note (36-84, C2-C6)
      decay: 0.4,        // 0.1 - 2.0 seconds
      body: 0.6,         // 0.0 - 1.0 (resonance amount)
      attack: 0.005,     // 0.001 - 0.05 seconds
      tone: 0.5,         // 0.0 - 1.0 (brightness)
      punch: 0.7         // 0.0 - 1.0 (initial transient)
    };
  }
  
  /**
   * Convert MIDI note to frequency
   */
  midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
  
  /**
   * Generate log drum sound
   * @param {number} time - When to trigger
   * @param {number} velocity - 0.0 to 1.0
   * @param {number} note - MIDI note (optional, uses param if not provided)
   */
  trigger(time = 0, velocity = 1.0, note = null) {
    const now = time || this.context.currentTime;
    const freq = this.midiToFreq(note || this.params.pitch);
    
    // Create fundamental tone
    this.createFundamental(now, freq, velocity);
    
    // Create body resonance
    this.createBody(now, freq, velocity);
    
    // Create punch/click
    this.createPunch(now, velocity);
  }
  
  /**
   * Create fundamental tone (main pitch)
   */
  createFundamental(time, freq, velocity) {
    // Use triangle wave for warm tone
    const osc = this.context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    
    // Pitch envelope (slight downward bend)
    osc.frequency.exponentialRampToValueAtTime(
      freq * 0.95,
      time + this.params.decay * 0.3
    );
    
    // Tone filter
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    const filterFreq = freq * 4 * (0.5 + this.params.tone * 0.5);
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.frequency.exponentialRampToValueAtTime(
      freq * 2,
      time + this.params.decay
    );
    filter.Q.value = 2.0;
    
    // Amplitude envelope
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(velocity * 0.8, time + this.params.attack);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + this.params.decay);
    
    // Connect
    osc.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.context.destination);
    
    // Start and stop
    osc.start(time);
    osc.stop(time + this.params.decay);
  }
  
  /**
   * Create body resonance (harmonic overtones)
   */
  createBody(time, freq, velocity) {
    // Multiple harmonics for body
    const harmonics = [2, 3, 4, 5];
    
    harmonics.forEach((harmonic, index) => {
      const osc = this.context.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * harmonic;
      
      // Filter
      const filter = this.context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq * harmonic;
      filter.Q.value = 3.0 + (index * 0.5);
      
      // Envelope (shorter for higher harmonics)
      const envelope = this.context.createGain();
      const harmonicDecay = this.params.decay * (1 - (index * 0.15));
      const harmonicLevel = velocity * this.params.body * (1 / (harmonic * 2));
      
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(harmonicLevel, time + this.params.attack);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + harmonicDecay);
      
      // Connect
      osc.connect(filter);
      filter.connect(envelope);
      envelope.connect(this.context.destination);
      
      // Start and stop
      osc.start(time);
      osc.stop(time + harmonicDecay);
    });
  }
  
  /**
   * Create punch/click (transient)
   */
  createPunch(time, velocity) {
    // Short noise burst
    const bufferSize = this.context.sampleRate * 0.01; // 10ms
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - (i / bufferSize));
    }
    
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    // High-pass filter for click
    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1.0;
    
    // Envelope
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(
      velocity * this.params.punch * 0.3,
      time + 0.001
    );
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    
    // Connect
    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.context.destination);
    
    // Start and stop
    noise.start(time);
    noise.stop(time + 0.02);
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
      pitch: {
        value: this.params.pitch,
        min: 36,
        max: 84,
        default: 60,
        unit: 'MIDI',
        label: 'Pitch'
      },
      decay: {
        value: this.params.decay,
        min: 0.1,
        max: 2.0,
        default: 0.4,
        unit: 's',
        label: 'Decay'
      },
      body: {
        value: this.params.body,
        min: 0.0,
        max: 1.0,
        default: 0.6,
        unit: '%',
        label: 'Body'
      },
      attack: {
        value: this.params.attack,
        min: 0.001,
        max: 0.05,
        default: 0.005,
        unit: 's',
        label: 'Attack'
      },
      tone: {
        value: this.params.tone,
        min: 0.0,
        max: 1.0,
        default: 0.5,
        unit: '%',
        label: 'Tone'
      },
      punch: {
        value: this.params.punch,
        min: 0.0,
        max: 1.0,
        default: 0.7,
        unit: '%',
        label: 'Punch'
      }
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LogDrumPlugin;
}

