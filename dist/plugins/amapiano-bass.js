/**
 * Amapiano Bass Synth - Web Audio Plugin
 * Deep, rolling bass characteristic of Amapiano music
 * 
 * Features:
 * - Sub-bass oscillator with harmonics
 * - Filter envelope for movement
 * - Portamento (glide) between notes
 * - Drive/saturation control
 */

class AmapianoBassPlugin {
  constructor(audioContext) {
    this.context = audioContext;
    
    // Parameters
    this.params = {
      cutoff: 200,       // 50 - 1000 Hz (filter cutoff)
      resonance: 8.0,    // 0.1 - 15.0 (filter Q)
      envelope: 0.6,     // 0.0 - 1.0 (filter envelope amount)
      attack: 0.01,      // 0.001 - 0.1 seconds
      decay: 0.3,        // 0.1 - 2.0 seconds
      sustain: 0.7,      // 0.0 - 1.0
      release: 0.2,      // 0.01 - 1.0 seconds
      drive: 0.3,        // 0.0 - 1.0 (saturation)
      sub: 0.6,          // 0.0 - 1.0 (sub-bass level)
      glide: 0.05        // 0.0 - 0.5 seconds (portamento)
    };
    
    this.currentNote = null;
    this.activeVoices = [];
  }
  
  /**
   * Convert MIDI note to frequency
   */
  midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }
  
  /**
   * Trigger bass note
   * @param {number} note - MIDI note number
   * @param {number} velocity - 0.0 to 1.0
   * @param {number} duration - Note duration in seconds (0 = infinite)
   */
  noteOn(note, velocity = 1.0, duration = 0) {
    const now = this.context.currentTime;
    const freq = this.midiToFreq(note);
    
    // Create voice
    const voice = this.createVoice(freq, velocity, now);
    this.activeVoices.push(voice);
    
    // Auto release if duration specified
    if (duration > 0) {
      setTimeout(() => {
        this.noteOff(voice);
      }, duration * 1000);
    }
    
    this.currentNote = note;
    return voice;
  }
  
  /**
   * Release bass note
   */
  noteOff(voice) {
    if (!voice) return;
    
    const now = this.context.currentTime;
    
    // Release envelope
    voice.ampEnv.gain.cancelScheduledValues(now);
    voice.ampEnv.gain.setValueAtTime(voice.ampEnv.gain.value, now);
    voice.ampEnv.gain.exponentialRampToValueAtTime(0.001, now + this.params.release);
    
    // Stop oscillators after release
    setTimeout(() => {
      voice.osc1.stop();
      voice.osc2.stop();
      voice.subOsc.stop();
      
      // Remove from active voices
      const index = this.activeVoices.indexOf(voice);
      if (index > -1) {
        this.activeVoices.splice(index, 1);
      }
    }, this.params.release * 1000 + 100);
  }
  
  /**
   * Create a voice (oscillators + envelopes + filter)
   */
  createVoice(freq, velocity, startTime) {
    // Main oscillator (sawtooth for harmonics)
    const osc1 = this.context.createOscillator();
    osc1.type = 'sawtooth';
    
    // Detuned oscillator for thickness
    const osc2 = this.context.createOscillator();
    osc2.type = 'sawtooth';
    osc2.detune.value = -7; // Slightly detuned
    
    // Sub-bass oscillator (sine wave, -1 octave)
    const subOsc = this.context.createOscillator();
    subOsc.type = 'sine';
    
    // Set frequencies with glide
    if (this.currentNote !== null && this.params.glide > 0) {
      const prevFreq = this.midiToFreq(this.currentNote);
      osc1.frequency.setValueAtTime(prevFreq, startTime);
      osc1.frequency.exponentialRampToValueAtTime(freq, startTime + this.params.glide);
      osc2.frequency.setValueAtTime(prevFreq, startTime);
      osc2.frequency.exponentialRampToValueAtTime(freq, startTime + this.params.glide);
      subOsc.frequency.setValueAtTime(prevFreq / 2, startTime);
      subOsc.frequency.exponentialRampToValueAtTime(freq / 2, startTime + this.params.glide);
    } else {
      osc1.frequency.value = freq;
      osc2.frequency.value = freq;
      subOsc.frequency.value = freq / 2;
    }
    
    // Mix oscillators
    const oscMix = this.context.createGain();
    const subGain = this.context.createGain();
    subGain.gain.value = this.params.sub;
    
    osc1.connect(oscMix);
    osc2.connect(oscMix);
    subOsc.connect(subGain);
    subGain.connect(oscMix);
    
    // Filter (lowpass with resonance)
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.params.cutoff;
    filter.Q.value = this.params.resonance;
    
    // Filter envelope
    const filterEnvAmount = this.params.envelope * 2000; // Up to 2kHz modulation
    filter.frequency.setValueAtTime(this.params.cutoff, startTime);
    filter.frequency.exponentialRampToValueAtTime(
      this.params.cutoff + filterEnvAmount,
      startTime + this.params.attack
    );
    filter.frequency.exponentialRampToValueAtTime(
      this.params.cutoff + (filterEnvAmount * this.params.sustain),
      startTime + this.params.attack + this.params.decay
    );
    
    // Drive/saturation (waveshaper)
    const drive = this.context.createWaveShaper();
    drive.curve = this.makeDistortionCurve(this.params.drive * 50);
    drive.oversample = '2x';
    
    // Amplitude envelope
    const ampEnv = this.context.createGain();
    ampEnv.gain.setValueAtTime(0, startTime);
    ampEnv.gain.linearRampToValueAtTime(velocity, startTime + this.params.attack);
    ampEnv.gain.exponentialRampToValueAtTime(
      velocity * this.params.sustain,
      startTime + this.params.attack + this.params.decay
    );
    
    // Connect signal chain
    oscMix.connect(filter);
    filter.connect(drive);
    drive.connect(ampEnv);
    ampEnv.connect(this.context.destination);
    
    // Start oscillators
    osc1.start(startTime);
    osc2.start(startTime);
    subOsc.start(startTime);
    
    return { osc1, osc2, subOsc, filter, ampEnv, startTime };
  }
  
  /**
   * Create distortion curve for waveshaper
   */
  makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve;
  }
  
  /**
   * Stop all active notes
   */
  allNotesOff() {
    this.activeVoices.forEach(voice => this.noteOff(voice));
  }
  
  /**
   * Set parameter value
   */
  setParam(name, value) {
    if (this.params.hasOwnProperty(name)) {
      this.params[name] = value;
      
      // Update active voices if needed
      if (name === 'cutoff' || name === 'resonance') {
        this.activeVoices.forEach(voice => {
          if (name === 'cutoff') {
            voice.filter.frequency.value = value;
          } else if (name === 'resonance') {
            voice.filter.Q.value = value;
          }
        });
      }
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
      cutoff: {
        value: this.params.cutoff,
        min: 50,
        max: 1000,
        default: 200,
        unit: 'Hz',
        label: 'Cutoff'
      },
      resonance: {
        value: this.params.resonance,
        min: 0.1,
        max: 15.0,
        default: 8.0,
        unit: '',
        label: 'Resonance'
      },
      envelope: {
        value: this.params.envelope,
        min: 0.0,
        max: 1.0,
        default: 0.6,
        unit: '%',
        label: 'Envelope'
      },
      attack: {
        value: this.params.attack,
        min: 0.001,
        max: 0.1,
        default: 0.01,
        unit: 's',
        label: 'Attack'
      },
      decay: {
        value: this.params.decay,
        min: 0.1,
        max: 2.0,
        default: 0.3,
        unit: 's',
        label: 'Decay'
      },
      sustain: {
        value: this.params.sustain,
        min: 0.0,
        max: 1.0,
        default: 0.7,
        unit: '%',
        label: 'Sustain'
      },
      release: {
        value: this.params.release,
        min: 0.01,
        max: 1.0,
        default: 0.2,
        unit: 's',
        label: 'Release'
      },
      drive: {
        value: this.params.drive,
        min: 0.0,
        max: 1.0,
        default: 0.3,
        unit: '%',
        label: 'Drive'
      },
      sub: {
        value: this.params.sub,
        min: 0.0,
        max: 1.0,
        default: 0.6,
        unit: '%',
        label: 'Sub'
      },
      glide: {
        value: this.params.glide,
        min: 0.0,
        max: 0.5,
        default: 0.05,
        unit: 's',
        label: 'Glide'
      }
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AmapianoBassPlugin;
}

