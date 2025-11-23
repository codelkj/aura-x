/**
 * MCP (Model Context Protocol) Integration Service
 * Provides real-time DAW context to the Aura Vocal Forge
 * 
 * This service connects to the local MCP servers to pull:
 * - Project BPM
 * - Current key/scale
 * - Active chord progression
 * - Time signature
 * - Audio region analysis
 */

class MCPIntegrationService {
  constructor() {
    this.isConnected = false;
    this.projectContext = {
      bpm: 115,
      key: 'C Minor',
      scale: 'Minor',
      currentChord: 'Cm7',
      timeSignature: '4/4',
      playheadPosition: 0,
      isPlaying: false
    };
    
    this.audioContext = {
      activeRegions: [],
      currentHarmony: [],
      spectralAnalysis: null
    };
    
    this.updateInterval = null;
    this.listeners = [];
  }
  
  /**
   * Initialize connection to MCP servers
   */
  async connect() {
    try {
      console.log('[MCP] Connecting to MCP servers...');
      
      // Simulate MCP server connection
      // In production, this would connect to actual MCP endpoints
      await this.simulateConnection();
      
      this.isConnected = true;
      this.startContextPolling();
      
      console.log('[MCP] Connected successfully');
      return true;
    } catch (error) {
      console.error('[MCP] Connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }
  
  /**
   * Disconnect from MCP servers
   */
  disconnect() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isConnected = false;
    console.log('[MCP] Disconnected');
  }
  
  /**
   * Get current project context
   */
  getProjectContext() {
    return { ...this.projectContext };
  }
  
  /**
   * Get current audio context
   */
  getAudioContext() {
    return { ...this.audioContext };
  }
  
  /**
   * Get BPM from project
   */
  async getBPM() {
    // Simulates: project_server.mcp.get_bpm()
    return this.projectContext.bpm;
  }
  
  /**
   * Get key from project
   */
  async getKey() {
    // Simulates: project_server.mcp.get_key()
    return {
      root: this.projectContext.key.split(' ')[0],
      scale: this.projectContext.scale
    };
  }
  
  /**
   * Get current chord at playhead position
   */
  async getCurrentChord() {
    // Simulates: project_server.mcp.get_current_chord()
    return this.projectContext.currentChord;
  }
  
  /**
   * Analyze audio region for harmony
   */
  async analyzeAudioRegion(regionId) {
    // Simulates: audio_server.mcp.analyze_audio_region(harmony)
    return {
      chords: ['Cm7', 'Fm7', 'G7', 'Cm7'],
      key: 'C Minor',
      confidence: 0.94,
      spectralData: this.generateSpectralData()
    };
  }
  
  /**
   * Get scale notes for current key
   */
  async getScaleNotes() {
    const { root, scale } = await this.getKey();
    return this.calculateScaleNotes(root, scale);
  }
  
  /**
   * Get valid notes for current chord
   */
  async getChordNotes() {
    const chord = await this.getCurrentChord();
    return this.parseChordNotes(chord);
  }
  
  /**
   * Quantize MIDI note to current key/scale
   */
  async quantizeToKey(midiNote) {
    const scaleNotes = await this.getScaleNotes();
    return this.findNearestScaleNote(midiNote, scaleNotes);
  }
  
  /**
   * Quantize MIDI note to current chord
   */
  async quantizeToChord(midiNote) {
    const chordNotes = await this.getChordNotes();
    return this.findNearestChordNote(midiNote, chordNotes);
  }
  
  /**
   * Subscribe to context updates
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify all listeners of context update
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        project: this.projectContext,
        audio: this.audioContext
      });
    });
  }
  
  /**
   * Start polling for context updates
   */
  startContextPolling() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      this.updateContext();
    }, 100); // Update every 100ms for real-time feel
  }
  
  /**
   * Update context from MCP servers
   */
  async updateContext() {
    if (!this.isConnected) return;
    
    // Simulate context updates
    // In production, this would query actual MCP servers
    
    // Simulate playhead movement
    if (this.projectContext.isPlaying) {
      this.projectContext.playheadPosition += 0.1;
      
      // Simulate chord changes every 4 beats
      const beatPosition = (this.projectContext.playheadPosition * this.projectContext.bpm) / 60;
      const chordIndex = Math.floor(beatPosition / 4) % 4;
      const chords = ['Cm7', 'Fm7', 'G7', 'Cm7'];
      this.projectContext.currentChord = chords[chordIndex];
    }
    
    // Notify listeners
    this.notifyListeners();
  }
  
  /**
   * Simulate MCP server connection
   */
  async simulateConnection() {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Initialize with default context
        this.projectContext = {
          bpm: 115,
          key: 'C Minor',
          scale: 'Minor',
          currentChord: 'Cm7',
          timeSignature: '4/4',
          playheadPosition: 0,
          isPlaying: false
        };
        
        resolve();
      }, 500);
    });
  }
  
  /**
   * Calculate scale notes from root and scale type
   */
  calculateScaleNotes(root, scaleType) {
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = allNotes.indexOf(root);
    
    const scalePatterns = {
      'Major': [0, 2, 4, 5, 7, 9, 11],
      'Minor': [0, 2, 3, 5, 7, 8, 10],
      'Dorian': [0, 2, 3, 5, 7, 9, 10],
      'Phrygian': [0, 1, 3, 5, 7, 8, 10],
      'Lydian': [0, 2, 4, 6, 7, 9, 11],
      'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
      'Pentatonic': [0, 2, 4, 7, 9]
    };
    
    const pattern = scalePatterns[scaleType] || scalePatterns['Minor'];
    
    return pattern.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return allNotes[noteIndex];
    });
  }
  
  /**
   * Parse chord symbol to get constituent notes
   */
  parseChordNotes(chordSymbol) {
    // Simplified chord parsing
    // In production, this would use a comprehensive chord library
    
    const root = chordSymbol.match(/^[A-G][#b]?/)?.[0] || 'C';
    const quality = chordSymbol.replace(root, '');
    
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const rootIndex = allNotes.indexOf(root);
    
    // Basic chord formulas
    const chordFormulas = {
      '': [0, 4, 7], // Major
      'm': [0, 3, 7], // Minor
      '7': [0, 4, 7, 10], // Dominant 7
      'm7': [0, 3, 7, 10], // Minor 7
      'maj7': [0, 4, 7, 11], // Major 7
      'dim': [0, 3, 6], // Diminished
      'aug': [0, 4, 8] // Augmented
    };
    
    const formula = chordFormulas[quality] || chordFormulas['m7'];
    
    return formula.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      return allNotes[noteIndex];
    });
  }
  
  /**
   * Find nearest note in scale
   */
  findNearestScaleNote(midiNote, scaleNotes) {
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12);
    const noteIndex = midiNote % 12;
    const noteName = allNotes[noteIndex];
    
    // If already in scale, return as is
    if (scaleNotes.includes(noteName)) {
      return midiNote;
    }
    
    // Find nearest scale note
    let minDistance = 12;
    let nearestNote = midiNote;
    
    for (let offset = -6; offset <= 6; offset++) {
      const testNote = midiNote + offset;
      const testNoteName = allNotes[testNote % 12];
      
      if (scaleNotes.includes(testNoteName) && Math.abs(offset) < minDistance) {
        minDistance = Math.abs(offset);
        nearestNote = testNote;
      }
    }
    
    return nearestNote;
  }
  
  /**
   * Find nearest note in chord
   */
  findNearestChordNote(midiNote, chordNotes) {
    const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = midiNote % 12;
    const noteName = allNotes[noteIndex];
    
    // If already in chord, return as is
    if (chordNotes.includes(noteName)) {
      return midiNote;
    }
    
    // Find nearest chord note
    let minDistance = 12;
    let nearestNote = midiNote;
    
    for (let offset = -6; offset <= 6; offset++) {
      const testNote = midiNote + offset;
      const testNoteName = allNotes[testNote % 12];
      
      if (chordNotes.includes(testNoteName) && Math.abs(offset) < minDistance) {
        minDistance = Math.abs(offset);
        nearestNote = testNote;
      }
    }
    
    return nearestNote;
  }
  
  /**
   * Generate spectral analysis data
   */
  generateSpectralData() {
    // Simulate spectral analysis
    return {
      fundamentalFrequency: 261.63, // C4
      harmonics: [
        { frequency: 261.63, amplitude: 1.0 },
        { frequency: 523.26, amplitude: 0.5 },
        { frequency: 784.89, amplitude: 0.25 }
      ],
      spectralCentroid: 1200,
      spectralRolloff: 5000
    };
  }
  
  /**
   * Set project BPM (for testing)
   */
  setBPM(bpm) {
    this.projectContext.bpm = bpm;
    this.notifyListeners();
  }
  
  /**
   * Set project key (for testing)
   */
  setKey(key, scale) {
    this.projectContext.key = `${key} ${scale}`;
    this.projectContext.scale = scale;
    this.notifyListeners();
  }
  
  /**
   * Toggle playback (for testing)
   */
  togglePlayback() {
    this.projectContext.isPlaying = !this.projectContext.isPlaying;
    this.notifyListeners();
  }
}

// Create singleton instance
const mcpService = new MCPIntegrationService();

export default mcpService;

// Export class for testing
export { MCPIntegrationService };

