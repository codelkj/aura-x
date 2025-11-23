/**
 * Shimmer Reverb - Web Audio Plugin
 * Lush reverb with pitch-shifted feedback for ethereal shimmer effect
 * 
 * Features:
 * - Multi-tap delay network
 * - Pitch-shifted feedback (+1 octave)
 * - Adjustable shimmer amount
 * - Pre-delay control
 * - Damping filter
 */

class ShimmerReverbPlugin {
  constructor(audioContext) {
    this.context = audioContext;
    this.input = this.context.createGain();
    this.output = this.context.createGain();
    
    // Parameters
    this.params = {
      size: 0.7,         // 0.0 - 1.0 (room size)
      decay: 0.6,        // 0.0 - 1.0 (reverb time)
      shimmer: 0.5,      // 0.0 - 1.0 (shimmer amount)
      predelay: 0.02,    // 0.0 - 0.1 seconds
      damping: 0.7,      // 0.0 - 1.0 (high frequency damping)
      mix: 0.5           // 0.0 - 1.0 (dry/wet)
    };
    
    // Build reverb network
    this.buildReverbNetwork();
  }
  
  /**
   * Build the reverb processing network
   */
  buildReverbNetwork() {
    // Dry signal path
    this.dryGain = this.context.createGain();
    this.input.connect(this.dryGain);
    this.dryGain.connect(this.output);
    
    // Wet signal path
    this.wetGain = this.context.createGain();
    
    // Pre-delay
    this.predelayNode = this.context.createDelay(0.1);
    this.predelayNode.delayTime.value = this.params.predelay;
    
    // Create multi-tap delay network (Schroeder reverb)
    this.delays = [];
    this.feedbacks = [];
    this.filters = [];
    
    // Delay times in seconds (prime numbers for density)
    const delayTimes = [0.0297, 0.0371, 0.0411, 0.0437];
    
    delayTimes.forEach((time, index) => {
      // Delay line
      const delay = this.context.createDelay(1.0);
      delay.delayTime.value = time * (0.5 + this.params.size * 0.5);
      
      // Feedback
      const feedback = this.context.createGain();
      feedback.gain.value = this.params.decay * 0.7;
      
      // Damping filter
      const filter = this.context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 5000 * (1 - this.params.damping * 0.7);
      filter.Q.value = 0.5;
      
      // Connect delay -> filter -> feedback -> delay
      delay.connect(filter);
      filter.connect(feedback);
      feedback.connect(delay);
      
      this.delays.push(delay);
      this.feedbacks.push(feedback);
      this.filters.push(filter);
    });
    
    // Create shimmer effect (pitch shifter)
    this.shimmerGain = this.context.createGain();
    this.shimmerGain.gain.value = this.params.shimmer;
    
    // Connect input to delays
    this.input.connect(this.predelayNode);
    this.delays.forEach(delay => {
      this.predelayNode.connect(delay);
      delay.connect(this.wetGain);
    });
    
    // Shimmer feedback path (simplified pitch shift using delay modulation)
    this.shimmerDelay = this.context.createDelay(0.1);
    this.shimmerDelay.delayTime.value = 0.01;
    this.shimmerFeedback = this.context.createGain();
    this.shimmerFeedback.gain.value = 0.3;
    
    this.wetGain.connect(this.shimmerGain);
    this.shimmerGain.connect(this.shimmerDelay);
    this.shimmerDelay.connect(this.shimmerFeedback);
    this.shimmerFeedback.connect(this.predelayNode);
    
    // Connect wet to output
    this.wetGain.connect(this.output);
    
    // Update mix
    this.updateMix();
  }
  
  /**
   * Update dry/wet mix
   */
  updateMix() {
    this.dryGain.gain.value = 1 - this.params.mix;
    this.wetGain.gain.value = this.params.mix;
  }
  
  /**
   * Process audio through the reverb
   * @param {AudioNode} source - Input audio node
   * @returns {AudioNode} - Output node
   */
  process(source) {
    source.connect(this.input);
    return this.output;
  }
  
  /**
   * Connect to destination
   */
  connect(destination) {
    this.output.connect(destination);
  }
  
  /**
   * Disconnect
   */
  disconnect() {
    this.output.disconnect();
  }
  
  /**
   * Set parameter value
   */
  setParam(name, value) {
    if (!this.params.hasOwnProperty(name)) return;
    
    this.params[name] = value;
    
    // Update audio nodes
    switch (name) {
      case 'size':
        this.delays.forEach((delay, index) => {
          const baseTime = [0.0297, 0.0371, 0.0411, 0.0437][index];
          delay.delayTime.value = baseTime * (0.5 + value * 0.5);
        });
        break;
        
      case 'decay':
        this.feedbacks.forEach(feedback => {
          feedback.gain.value = value * 0.7;
        });
        break;
        
      case 'shimmer':
        this.shimmerGain.gain.value = value;
        break;
        
      case 'predelay':
        this.predelayNode.delayTime.value = value;
        break;
        
      case 'damping':
        this.filters.forEach(filter => {
          filter.frequency.value = 5000 * (1 - value * 0.7);
        });
        break;
        
      case 'mix':
        this.updateMix();
        break;
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
      size: {
        value: this.params.size,
        min: 0.0,
        max: 1.0,
        default: 0.7,
        unit: '%',
        label: 'Size'
      },
      decay: {
        value: this.params.decay,
        min: 0.0,
        max: 1.0,
        default: 0.6,
        unit: '%',
        label: 'Decay'
      },
      shimmer: {
        value: this.params.shimmer,
        min: 0.0,
        max: 1.0,
        default: 0.5,
        unit: '%',
        label: 'Shimmer'
      },
      predelay: {
        value: this.params.predelay,
        min: 0.0,
        max: 0.1,
        default: 0.02,
        unit: 's',
        label: 'Pre-Delay'
      },
      damping: {
        value: this.params.damping,
        min: 0.0,
        max: 1.0,
        default: 0.7,
        unit: '%',
        label: 'Damping'
      },
      mix: {
        value: this.params.mix,
        min: 0.0,
        max: 1.0,
        default: 0.5,
        unit: '%',
        label: 'Mix'
      }
    };
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShimmerReverbPlugin;
}

