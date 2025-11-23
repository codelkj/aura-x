/**
 * MIDI Humanization System
 * 
 * Adds natural human feel to quantized MIDI patterns
 * Inspired by Jay B MusiQ's humanization techniques
 * 
 * Features:
 * - Velocity randomization
 * - Timing offset (microsecond-level)
 * - Genre-specific groove templates
 * - Adjustable humanization amount
 */

export class MIDIHumanization {
  constructor() {
    // Genre-specific groove templates
    this.grooveTemplates = {
      amapiano: {
        swing: 0.15, // 15% swing
        velocityVariation: 0.12, // 12% velocity variation
        timingVariation: 0.008, // 8ms timing variation
        accentPattern: [1.0, 0.7, 0.8, 0.6], // Accent pattern for 16th notes
        description: 'Classic Amapiano groove with moderate swing'
      },
      tight: {
        swing: 0.05,
        velocityVariation: 0.05,
        timingVariation: 0.003,
        accentPattern: [1.0, 0.9, 0.95, 0.85],
        description: 'Tight, precise feel with minimal variation'
      },
      loose: {
        swing: 0.25,
        velocityVariation: 0.20,
        timingVariation: 0.015,
        accentPattern: [1.0, 0.6, 0.75, 0.5],
        description: 'Loose, laid-back feel with maximum variation'
      },
      deep_house: {
        swing: 0.10,
        velocityVariation: 0.10,
        timingVariation: 0.006,
        accentPattern: [1.0, 0.75, 0.85, 0.7],
        description: 'Deep house groove with subtle swing'
      },
      afrotech: {
        swing: 0.18,
        velocityVariation: 0.15,
        timingVariation: 0.010,
        accentPattern: [1.0, 0.65, 0.8, 0.55],
        description: 'Afro-tech groove with pronounced swing'
      }
    };
  }

  /**
   * Humanize MIDI notes
   * @param {Array} notes - Array of MIDI note objects {time, pitch, velocity, duration}
   * @param {string} grooveType - Groove template to use
   * @param {number} amount - Humanization amount (0.0-1.0)
   * @returns {Array} Humanized MIDI notes
   */
  humanize(notes, grooveType = 'amapiano', amount = 0.7) {
    const groove = this.grooveTemplates[grooveType] || this.grooveTemplates.amapiano;
    const humanizedNotes = [];
    
    for (let i = 0; i < notes.length; i++) {
      const note = { ...notes[i] };
      
      // Apply timing variation
      note.time = this.applyTimingVariation(
        note.time,
        groove.timingVariation * amount,
        i
      );
      
      // Apply swing
      note.time = this.applySwing(
        note.time,
        groove.swing * amount,
        i
      );
      
      // Apply velocity variation
      note.velocity = this.applyVelocityVariation(
        note.velocity,
        groove.velocityVariation * amount,
        groove.accentPattern,
        i
      );
      
      // Ensure values are within valid ranges
      note.time = Math.max(0, note.time);
      note.velocity = Math.max(0, Math.min(127, note.velocity));
      
      humanizedNotes.push(note);
    }
    
    // Sort by time (may have changed due to humanization)
    return humanizedNotes.sort((a, b) => a.time - b.time);
  }

  /**
   * Apply timing variation
   * @param {number} time - Original time
   * @param {number} variation - Variation amount in seconds
   * @param {number} index - Note index
   * @returns {number} Adjusted time
   */
  applyTimingVariation(time, variation, index) {
    // Use seeded random for consistent results
    const random = this.seededRandom(index * 1000);
    const offset = (random - 0.5) * 2 * variation;
    return time + offset;
  }

  /**
   * Apply swing to timing
   * @param {number} time - Original time
   * @param {number} swing - Swing amount (0.0-1.0)
   * @param {number} index - Note index
   * @returns {number} Adjusted time
   */
  applySwing(time, swing, index) {
    // Apply swing to off-beat notes (odd indices)
    if (index % 2 === 1) {
      // Calculate beat duration (assuming 16th notes)
      const beatDuration = 0.125; // 1/8 second for 120 BPM 16th notes
      return time + (beatDuration * swing * 0.5);
    }
    return time;
  }

  /**
   * Apply velocity variation
   * @param {number} velocity - Original velocity (0-127)
   * @param {number} variation - Variation amount (0.0-1.0)
   * @param {Array} accentPattern - Accent pattern
   * @param {number} index - Note index
   * @returns {number} Adjusted velocity
   */
  applyVelocityVariation(velocity, variation, accentPattern, index) {
    // Apply accent pattern
    const patternIndex = index % accentPattern.length;
    const accentMultiplier = accentPattern[patternIndex];
    
    // Apply random variation
    const random = this.seededRandom(index * 2000);
    const randomVariation = (random - 0.5) * 2 * variation;
    
    // Combine accent and random variation
    const adjustedVelocity = velocity * accentMultiplier * (1 + randomVariation);
    
    return Math.round(adjustedVelocity);
  }

  /**
   * Seeded random number generator for consistent results
   * @param {number} seed - Seed value
   * @returns {number} Random number between 0 and 1
   */
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Humanize drum pattern
   * @param {Array} pattern - Drum pattern with multiple instruments
   * @param {string} grooveType - Groove template
   * @param {number} amount - Humanization amount
   * @returns {Array} Humanized drum pattern
   */
  humanizeDrumPattern(pattern, grooveType = 'amapiano', amount = 0.7) {
    const humanizedPattern = [];
    
    // Group notes by instrument
    const instrumentGroups = {};
    pattern.forEach((note, index) => {
      const instrument = note.instrument || 'default';
      if (!instrumentGroups[instrument]) {
        instrumentGroups[instrument] = [];
      }
      instrumentGroups[instrument].push({ ...note, originalIndex: index });
    });
    
    // Humanize each instrument group
    for (const [instrument, notes] of Object.entries(instrumentGroups)) {
      const humanizedNotes = this.humanize(notes, grooveType, amount);
      humanizedPattern.push(...humanizedNotes);
    }
    
    // Sort by time
    return humanizedPattern.sort((a, b) => a.time - b.time);
  }

  /**
   * Create custom groove template
   * @param {Object} params - Groove parameters
   * @returns {Object} Custom groove template
   */
  createCustomGroove(params) {
    return {
      swing: params.swing || 0.15,
      velocityVariation: params.velocityVariation || 0.12,
      timingVariation: params.timingVariation || 0.008,
      accentPattern: params.accentPattern || [1.0, 0.7, 0.8, 0.6],
      description: params.description || 'Custom groove'
    };
  }

  /**
   * Analyze MIDI pattern for humanization opportunities
   * @param {Array} notes - MIDI notes
   * @returns {Object} Analysis results
   */
  analyzePattern(notes) {
    if (notes.length === 0) {
      return {
        isQuantized: false,
        velocityVariation: 0,
        timingVariation: 0,
        recommendation: 'No notes to analyze'
      };
    }
    
    // Calculate velocity variation
    const velocities = notes.map(n => n.velocity);
    const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const velocityStdDev = Math.sqrt(
      velocities.reduce((sum, v) => sum + (v - avgVelocity) ** 2, 0) / velocities.length
    );
    const velocityVariation = velocityStdDev / avgVelocity;
    
    // Calculate timing variation
    if (notes.length < 2) {
      return {
        isQuantized: true,
        velocityVariation,
        timingVariation: 0,
        recommendation: 'Apply humanization for more natural feel'
      };
    }
    
    const intervals = [];
    for (let i = 1; i < notes.length; i++) {
      intervals.push(notes[i].time - notes[i - 1].time);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const timingStdDev = Math.sqrt(
      intervals.reduce((sum, interval) => sum + (interval - avgInterval) ** 2, 0) / intervals.length
    );
    const timingVariation = timingStdDev / avgInterval;
    
    // Determine if pattern is quantized
    const isQuantized = velocityVariation < 0.05 && timingVariation < 0.01;
    
    let recommendation = '';
    if (isQuantized) {
      recommendation = 'Pattern appears quantized - humanization recommended';
    } else if (velocityVariation < 0.10 && timingVariation < 0.02) {
      recommendation = 'Pattern has minimal variation - light humanization recommended';
    } else {
      recommendation = 'Pattern already has natural variation - humanization optional';
    }
    
    return {
      isQuantized,
      velocityVariation,
      timingVariation,
      recommendation,
      noteCount: notes.length,
      averageVelocity: Math.round(avgVelocity),
      averageInterval: avgInterval.toFixed(3)
    };
  }

  /**
   * Get all groove templates
   * @returns {Object} All groove templates
   */
  getGrooveTemplates() {
    return this.grooveTemplates;
  }

  /**
   * Get groove presets for UI
   * @returns {Array} Array of preset objects
   */
  getPresets() {
    return Object.entries(this.grooveTemplates).map(([key, groove]) => ({
      id: key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      ...groove
    }));
  }

  /**
   * Apply progressive humanization
   * @param {Array} notes - MIDI notes
   * @param {string} grooveType - Groove template
   * @param {number} startAmount - Starting humanization amount
   * @param {number} endAmount - Ending humanization amount
   * @returns {Array} Progressively humanized notes
   */
  applyProgressiveHumanization(notes, grooveType, startAmount, endAmount) {
    const humanizedNotes = [];
    const amountRange = endAmount - startAmount;
    
    for (let i = 0; i < notes.length; i++) {
      const progress = i / (notes.length - 1);
      const amount = startAmount + (amountRange * progress);
      
      // Humanize single note
      const singleNote = [notes[i]];
      const humanized = this.humanize(singleNote, grooveType, amount);
      humanizedNotes.push(humanized[0]);
    }
    
    return humanizedNotes.sort((a, b) => a.time - b.time);
  }

  /**
   * Convert MIDI notes to Web MIDI API format
   * @param {Array} notes - MIDI notes
   * @returns {Array} Web MIDI API messages
   */
  toWebMIDI(notes) {
    const messages = [];
    
    for (const note of notes) {
      // Note On message
      messages.push({
        time: note.time,
        message: [0x90, note.pitch, note.velocity] // Note On, channel 1
      });
      
      // Note Off message
      messages.push({
        time: note.time + note.duration,
        message: [0x80, note.pitch, 0] // Note Off, channel 1
      });
    }
    
    return messages.sort((a, b) => a.time - b.time);
  }

  /**
   * Export humanized pattern as MIDI file (simplified)
   * @param {Array} notes - MIDI notes
   * @param {number} bpm - Tempo in BPM
   * @returns {Object} MIDI file data
   */
  exportToMIDI(notes, bpm = 120) {
    // This is a simplified representation
    // In production, use a proper MIDI library like midi-writer-js
    return {
      format: 1,
      tracks: [
        {
          name: 'Humanized Track',
          notes: notes.map(note => ({
            time: note.time,
            pitch: note.pitch,
            velocity: note.velocity,
            duration: note.duration
          }))
        }
      ],
      bpm,
      timeSignature: [4, 4]
    };
  }
}

// Export singleton instance
export default new MIDIHumanization();

