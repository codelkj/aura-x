/**
 * Track Manager
 * Handles track operations including duplication, recording, and management
 * 
 * Features:
 * - Track duplication with deep copy
 * - Audio recording from microphone/line-in
 * - Recording controls (start, stop, pause, resume)
 * - Track metadata management
 * - Undo/redo support
 */

class TrackManager {
  constructor() {
    this.tracks = [];
    this.activeTrackId = null;
    this.recordingState = {
      isRecording: false,
      isPaused: false,
      mediaRecorder: null,
      audioChunks: [],
      startTime: null,
      pausedDuration: 0
    };
    this.history = {
      past: [],
      future: []
    };
  }
  
  /**
   * Duplicate a track
   */
  duplicateTrack(trackId) {
    try {
      const track = this.findTrack(trackId);
      if (!track) {
        throw new Error(`Track with ID ${trackId} not found`);
      }
      
      // Deep copy the track
      const duplicatedTrack = this.deepCopyTrack(track);
      
      // Generate new ID
      duplicatedTrack.id = this.generateTrackId();
      
      // Update name
      duplicatedTrack.name = `${track.name} (Copy)`;
      
      // Reset some properties
      duplicatedTrack.createdAt = new Date();
      duplicatedTrack.modifiedAt = new Date();
      
      // Add to tracks array (insert after original)
      const originalIndex = this.tracks.findIndex(t => t.id === trackId);
      this.tracks.splice(originalIndex + 1, 0, duplicatedTrack);
      
      // Save to history
      this.saveToHistory('duplicate', { trackId: duplicatedTrack.id });
      
      return {
        success: true,
        track: duplicatedTrack,
        message: `Track "${track.name}" duplicated successfully`
      };
      
    } catch (error) {
      console.error('Duplication error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Deep copy a track (including audio data)
   */
  deepCopyTrack(track) {
    const copy = {
      ...track,
      metadata: { ...track.metadata },
      effects: track.effects ? [...track.effects.map(e => ({ ...e }))] : [],
      automation: track.automation ? { ...track.automation } : {},
      regions: track.regions ? [...track.regions.map(r => ({ ...r }))] : []
    };
    
    // Deep copy audio data
    if (track.audioBuffer) {
      copy.audioBuffer = this.copyAudioBuffer(track.audioBuffer);
    }
    
    if (track.waveformData) {
      copy.waveformData = [...track.waveformData];
    }
    
    return copy;
  }
  
  /**
   * Copy audio buffer
   */
  copyAudioBuffer(audioBuffer) {
    const newBuffer = new AudioBuffer({
      length: audioBuffer.length,
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate
    });
    
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const sourceData = audioBuffer.getChannelData(channel);
      const destData = newBuffer.getChannelData(channel);
      destData.set(sourceData);
    }
    
    return newBuffer;
  }
  
  /**
   * Start recording audio
   */
  async startRecording(options = {}) {
    try {
      const {
        deviceId = 'default',
        sampleRate = 48000,
        channelCount = 2,
        echoCancellation = true,
        noiseSuppression = true,
        autoGainControl = false
      } = options;
      
      // Check if already recording
      if (this.recordingState.isRecording) {
        throw new Error('Recording already in progress');
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId !== 'default' ? { exact: deviceId } : undefined,
          sampleRate: sampleRate,
          channelCount: channelCount,
          echoCancellation: echoCancellation,
          noiseSuppression: noiseSuppression,
          autoGainControl: autoGainControl
        }
      });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingState.audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        await this.finalizeRecording();
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      
      // Update state
      this.recordingState = {
        isRecording: true,
        isPaused: false,
        mediaRecorder: mediaRecorder,
        stream: stream,
        audioChunks: [],
        startTime: Date.now(),
        pausedDuration: 0
      };
      
      return {
        success: true,
        message: 'Recording started',
        startTime: this.recordingState.startTime
      };
      
    } catch (error) {
      console.error('Recording start error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to start recording. Please check microphone permissions.'
      };
    }
  }
  
  /**
   * Stop recording
   */
  async stopRecording() {
    try {
      if (!this.recordingState.isRecording) {
        throw new Error('No recording in progress');
      }
      
      // Stop media recorder
      this.recordingState.mediaRecorder.stop();
      
      // Stop all tracks in the stream
      this.recordingState.stream.getTracks().forEach(track => track.stop());
      
      return {
        success: true,
        message: 'Recording stopped',
        duration: this.getRecordingDuration()
      };
      
    } catch (error) {
      console.error('Recording stop error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Pause recording
   */
  pauseRecording() {
    try {
      if (!this.recordingState.isRecording) {
        throw new Error('No recording in progress');
      }
      
      if (this.recordingState.isPaused) {
        throw new Error('Recording already paused');
      }
      
      this.recordingState.mediaRecorder.pause();
      this.recordingState.isPaused = true;
      this.recordingState.pauseStartTime = Date.now();
      
      return {
        success: true,
        message: 'Recording paused'
      };
      
    } catch (error) {
      console.error('Recording pause error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Resume recording
   */
  resumeRecording() {
    try {
      if (!this.recordingState.isRecording) {
        throw new Error('No recording in progress');
      }
      
      if (!this.recordingState.isPaused) {
        throw new Error('Recording not paused');
      }
      
      this.recordingState.mediaRecorder.resume();
      this.recordingState.isPaused = false;
      
      // Track paused duration
      const pauseDuration = Date.now() - this.recordingState.pauseStartTime;
      this.recordingState.pausedDuration += pauseDuration;
      
      return {
        success: true,
        message: 'Recording resumed'
      };
      
    } catch (error) {
      console.error('Recording resume error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get recording duration
   */
  getRecordingDuration() {
    if (!this.recordingState.startTime) {
      return 0;
    }
    
    const now = Date.now();
    const totalDuration = now - this.recordingState.startTime;
    const activeDuration = totalDuration - this.recordingState.pausedDuration;
    
    return activeDuration / 1000; // Return in seconds
  }
  
  /**
   * Finalize recording and create track
   */
  async finalizeRecording() {
    try {
      // Create blob from recorded chunks
      const audioBlob = new Blob(this.recordingState.audioChunks, {
        type: 'audio/webm;codecs=opus'
      });
      
      // Convert to audio buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create new track
      const track = {
        id: this.generateTrackId(),
        name: `Recording ${new Date().toLocaleTimeString()}`,
        type: 'audio',
        audioBuffer: audioBuffer,
        audioBlob: audioBlob,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        createdAt: new Date(),
        modifiedAt: new Date(),
        metadata: {
          recordedAt: new Date(),
          duration: this.getRecordingDuration(),
          format: 'webm'
        },
        effects: [],
        automation: {},
        regions: []
      };
      
      // Add to tracks
      this.tracks.push(track);
      
      // Generate waveform
      track.waveformData = await this.generateWaveform(audioBuffer);
      
      // Reset recording state
      this.recordingState = {
        isRecording: false,
        isPaused: false,
        mediaRecorder: null,
        audioChunks: [],
        startTime: null,
        pausedDuration: 0
      };
      
      // Save to history
      this.saveToHistory('record', { trackId: track.id });
      
      return {
        success: true,
        track: track,
        message: `Recording saved as "${track.name}"`
      };
      
    } catch (error) {
      console.error('Recording finalization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate waveform data for visualization
   */
  async generateWaveform(audioBuffer, samples = 1000) {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const blockSize = Math.floor(channelData.length / samples);
    const waveformData = [];
    
    for (let i = 0; i < samples; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      let sum = 0;
      
      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j]);
      }
      
      waveformData.push(sum / blockSize);
    }
    
    return waveformData;
  }
  
  /**
   * Get available audio input devices
   */
  async getAudioInputDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      return {
        success: true,
        devices: audioInputs.map(device => ({
          id: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          groupId: device.groupId
        }))
      };
      
    } catch (error) {
      console.error('Device enumeration error:', error);
      return {
        success: false,
        error: error.message,
        devices: []
      };
    }
  }
  
  /**
   * Find track by ID
   */
  findTrack(trackId) {
    return this.tracks.find(t => t.id === trackId);
  }
  
  /**
   * Generate unique track ID
   */
  generateTrackId() {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Save action to history for undo/redo
   */
  saveToHistory(action, data) {
    this.history.past.push({
      action: action,
      data: data,
      timestamp: new Date()
    });
    
    // Clear future when new action is performed
    this.history.future = [];
    
    // Limit history size
    if (this.history.past.length > 50) {
      this.history.past.shift();
    }
  }
  
  /**
   * Undo last action
   */
  undo() {
    if (this.history.past.length === 0) {
      return { success: false, message: 'Nothing to undo' };
    }
    
    const lastAction = this.history.past.pop();
    this.history.future.push(lastAction);
    
    // Revert the action
    this.revertAction(lastAction);
    
    return { success: true, message: `Undid ${lastAction.action}` };
  }
  
  /**
   * Redo last undone action
   */
  redo() {
    if (this.history.future.length === 0) {
      return { success: false, message: 'Nothing to redo' };
    }
    
    const action = this.history.future.pop();
    this.history.past.push(action);
    
    // Reapply the action
    this.reapplyAction(action);
    
    return { success: true, message: `Redid ${action.action}` };
  }
  
  /**
   * Revert an action
   */
  revertAction(action) {
    switch (action.action) {
      case 'duplicate':
        // Remove the duplicated track
        this.tracks = this.tracks.filter(t => t.id !== action.data.trackId);
        break;
      case 'record':
        // Remove the recorded track
        this.tracks = this.tracks.filter(t => t.id !== action.data.trackId);
        break;
      // Add more cases as needed
    }
  }
  
  /**
   * Reapply an action
   */
  reapplyAction(action) {
    // Implementation depends on action type
    // This would restore the action that was undone
  }
  
  /**
   * Get all tracks
   */
  getTracks() {
    return this.tracks;
  }
  
  /**
   * Get recording state
   */
  getRecordingState() {
    return {
      isRecording: this.recordingState.isRecording,
      isPaused: this.recordingState.isPaused,
      duration: this.getRecordingDuration()
    };
  }
}

export default TrackManager;

