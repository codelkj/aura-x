/**
 * MIDI Humanization Service
 * Frontend client for professional-grade Python backend
 * 
 * Features:
 * - ML-based humanization (95%+ quality)
 * - Regional groove libraries (Johannesburg, Pretoria, Durban)
 * - Groove extraction from audio
 * - Context-aware accents
 * - Musical intelligence
 */

const PYTHON_BACKEND_URL = 'https://8000-ineekhzy2e5v1nnwmj2jz-62cbba5f.manusvm.computer';

export class MIDIHumanizationService {
  constructor() {
    this.baseURL = PYTHON_BACKEND_URL;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.grooveLibrary = null;
  }

  /**
   * Humanize MIDI notes with ML-based processing
   * 
   * @param {Array} notes - Array of MIDI notes {time, pitch, velocity, duration}
   * @param {Object} options - Humanization options
   * @returns {Promise<Object>} Humanization result
   */
  async humanize(notes, options = {}) {
    const {
      grooveType = 'amapiano_johannesburg',
      amount = 0.7,
      learnFromReference = false,
      onProgress = null
    } = options;

    try {
      if (onProgress) onProgress({ status: 'processing', progress: 0 });

      const response = await this._fetchWithRetry(
        `${this.baseURL}/api/advanced/humanize/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            notes: notes,
            groove_type: grooveType,
            amount: amount,
            learn_from_reference: learnFromReference
          })
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || 'Humanization failed');
      }

      const result = await response.json();

      if (onProgress) onProgress({ status: 'complete', progress: 100 });

      return {
        success: result.success,
        humanizedNotes: result.humanized_notes,
        grooveProfile: result.groove_profile,
        qualityScore: result.quality_score,
        patternAnalysis: result.pattern_analysis
      };
    } catch (error) {
      console.error('Humanization error:', error);
      if (onProgress) onProgress({ status: 'error', progress: 0, error: error.message });
      throw error;
    }
  }

  /**
   * Extract groove profile from reference audio
   * 
   * @param {File} audioFile - Reference audio file
   * @param {Object} options - Extraction options
   * @returns {Promise<Object>} Extracted groove profile
   */
  async extractGroove(audioFile, options = {}) {
    const {
      onProgress = null
    } = options;

    try {
      if (onProgress) onProgress({ status: 'uploading', progress: 0 });

      const formData = new FormData();
      formData.append('file', audioFile);

      if (onProgress) onProgress({ status: 'analyzing', progress: 30 });

      const response = await this._fetchWithRetry(
        `${this.baseURL}/api/advanced/humanize/extract-groove`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || 'Groove extraction failed');
      }

      const grooveProfile = await response.json();

      if (onProgress) onProgress({ status: 'complete', progress: 100 });

      return {
        success: true,
        grooveProfile: grooveProfile
      };
    } catch (error) {
      console.error('Groove extraction error:', error);
      if (onProgress) onProgress({ status: 'error', progress: 0, error: error.message });
      throw error;
    }
  }

  /**
   * Get available groove library
   * 
   * @returns {Promise<Object>} Groove library
   */
  async getGrooveLibrary() {
    try {
      // Return cached library if available
      if (this.grooveLibrary) {
        return this.grooveLibrary;
      }

      const response = await this._fetchWithRetry(
        `${this.baseURL}/api/advanced/humanize/groove-library`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch groove library');
      }

      const data = await response.json();
      this.grooveLibrary = data;
      
      return data;
    } catch (error) {
      console.error('Groove library error:', error);
      throw error;
    }
  }

  /**
   * Get groove info by ID
   * 
   * @param {string} grooveId - Groove ID
   * @returns {Promise<Object>} Groove info
   */
  async getGrooveInfo(grooveId) {
    const library = await this.getGrooveLibrary();
    const groove = library.grooves.find(g => g.id === grooveId);
    
    if (!groove) {
      throw new Error(`Groove not found: ${grooveId}`);
    }

    return groove;
  }

  /**
   * Humanize pattern from MIDI track
   * 
   * @param {Object} midiTrack - MIDI track object
   * @param {Object} options - Humanization options
   * @returns {Promise<Object>} Humanized track
   */
  async humanizeTrack(midiTrack, options = {}) {
    // Convert MIDI track to notes array
    const notes = this._midiTrackToNotes(midiTrack);

    // Humanize
    const result = await this.humanize(notes, options);

    // Convert back to MIDI track format
    const humanizedTrack = this._notesToMidiTrack(result.humanizedNotes, midiTrack);

    return {
      ...result,
      humanizedTrack: humanizedTrack
    };
  }

  /**
   * Batch humanize multiple tracks
   * 
   * @param {Array} tracks - Array of MIDI tracks
   * @param {Object} options - Humanization options
   * @returns {Promise<Array>} Array of humanized tracks
   */
  async batchHumanize(tracks, options = {}) {
    const {
      onProgress = null,
      onTrackComplete = null
    } = options;

    const results = [];
    const total = tracks.length;

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];

      try {
        if (onProgress) {
          onProgress({
            status: 'processing',
            current: i + 1,
            total: total,
            trackName: track.name || `Track ${i + 1}`,
            progress: (i / total) * 100
          });
        }

        const result = await this.humanizeTrack(track, {
          ...options,
          onProgress: (trackProgress) => {
            if (onProgress) {
              onProgress({
                status: trackProgress.status,
                current: i + 1,
                total: total,
                trackName: track.name || `Track ${i + 1}`,
                progress: ((i + (trackProgress.progress / 100)) / total) * 100
              });
            }
          }
        });

        results.push({
          trackName: track.name || `Track ${i + 1}`,
          success: true,
          result: result
        });

        if (onTrackComplete) {
          onTrackComplete(track.name, result);
        }
      } catch (error) {
        results.push({
          trackName: track.name || `Track ${i + 1}`,
          success: false,
          error: error.message
        });

        if (onTrackComplete) {
          onTrackComplete(track.name, null, error);
        }
      }
    }

    if (onProgress) {
      onProgress({
        status: 'complete',
        current: total,
        total: total,
        progress: 100
      });
    }

    return results;
  }

  /**
   * Convert MIDI track to notes array
   * 
   * @private
   */
  _midiTrackToNotes(midiTrack) {
    // This is a simplified conversion
    // Actual implementation depends on your MIDI track format
    if (Array.isArray(midiTrack.notes)) {
      return midiTrack.notes.map(note => ({
        time: note.time || note.startTime || 0,
        pitch: note.pitch || note.note || 60,
        velocity: note.velocity || 100,
        duration: note.duration || 0.5
      }));
    }

    return [];
  }

  /**
   * Convert notes array back to MIDI track
   * 
   * @private
   */
  _notesToMidiTrack(notes, originalTrack) {
    // This is a simplified conversion
    // Actual implementation depends on your MIDI track format
    return {
      ...originalTrack,
      notes: notes.map(note => ({
        time: note.time,
        pitch: note.pitch,
        velocity: note.velocity,
        duration: note.duration
      }))
    };
  }

  /**
   * Fetch with retry logic
   * 
   * @private
   */
  async _fetchWithRetry(url, options, retryCount = 0) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`Retry ${retryCount + 1}/${this.maxRetries} for ${url}`);
        await this._sleep(this.retryDelay * (retryCount + 1));
        return this._fetchWithRetry(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Sleep utility
   * 
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate MIDI notes
   * 
   * @param {Array} notes - Notes array
   * @returns {Object} Validation result
   */
  validateNotes(notes) {
    if (!Array.isArray(notes)) {
      return { valid: false, error: 'Notes must be an array' };
    }

    if (notes.length === 0) {
      return { valid: false, error: 'Notes array is empty' };
    }

    if (notes.length > 10000) {
      return { valid: false, error: 'Too many notes (max: 10,000)' };
    }

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      
      if (typeof note.time !== 'number' || note.time < 0) {
        return { valid: false, error: `Invalid time at note ${i}` };
      }

      if (typeof note.pitch !== 'number' || note.pitch < 0 || note.pitch > 127) {
        return { valid: false, error: `Invalid pitch at note ${i} (must be 0-127)` };
      }

      if (typeof note.velocity !== 'number' || note.velocity < 1 || note.velocity > 127) {
        return { valid: false, error: `Invalid velocity at note ${i} (must be 1-127)` };
      }

      if (typeof note.duration !== 'number' || note.duration <= 0) {
        return { valid: false, error: `Invalid duration at note ${i}` };
      }
    }

    return { valid: true };
  }

  /**
   * Get groove type info
   * 
   * @param {string} grooveType - Groove type ID
   * @returns {Object} Groove info
   */
  getGrooveTypeInfo(grooveType) {
    const grooveTypes = {
      amapiano_johannesburg: {
        name: 'Amapiano (Johannesburg)',
        region: 'Johannesburg',
        description: '16% swing, 8ms microtiming, 75% tight',
        characteristics: {
          swing: 0.16,
          microtiming: 0.008,
          tightness: 0.75
        }
      },
      amapiano_pretoria: {
        name: 'Amapiano (Pretoria)',
        region: 'Pretoria',
        description: '18% swing, 10ms microtiming, 70% tight (more syncopation)',
        characteristics: {
          swing: 0.18,
          microtiming: 0.010,
          tightness: 0.70
        }
      },
      amapiano_durban: {
        name: 'Amapiano (Durban)',
        region: 'Durban',
        description: '14% swing, 7ms microtiming, 80% tight (tighter feel)',
        characteristics: {
          swing: 0.14,
          microtiming: 0.007,
          tightness: 0.80
        }
      },
      tight_studio: {
        name: 'Tight Studio',
        region: 'Universal',
        description: '5% swing, 3ms microtiming, 95% tight',
        characteristics: {
          swing: 0.05,
          microtiming: 0.003,
          tightness: 0.95
        }
      },
      loose_live: {
        name: 'Loose Live',
        region: 'Universal',
        description: '25% swing, 15ms microtiming, 50% tight',
        characteristics: {
          swing: 0.25,
          microtiming: 0.015,
          tightness: 0.50
        }
      }
    };

    return grooveTypes[grooveType] || grooveTypes.amapiano_johannesburg;
  }
}

export default MIDIHumanizationService;

