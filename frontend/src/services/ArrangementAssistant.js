/**
 * Quick Arrangement Assistant
 * 
 * Intelligent arrangement tool for rapid track organization
 * Inspired by Trinity Tunez II's quick arrangement workflow
 * 
 * Features:
 * - Pattern-to-track splitting
 * - Arrangement templates (intro, verse, chorus, etc.)
 * - Intelligent track naming
 * - Color coding for track types
 * - Quick arrangement actions
 */

export class ArrangementAssistant {
  constructor() {
    // Arrangement templates for different song structures
    this.templates = {
      standard_amapiano: {
        name: 'Standard Amapiano',
        description: '8-bar sections with gradual build-up',
        structure: [
          { section: 'intro', bars: 8, instruments: ['log_drum', 'shakers'] },
          { section: 'verse1', bars: 16, instruments: ['log_drum', 'shakers', 'bass', 'chords'] },
          { section: 'buildup1', bars: 8, instruments: ['log_drum', 'shakers', 'bass', 'chords', 'vocals'] },
          { section: 'chorus1', bars: 16, instruments: ['all'] },
          { section: 'verse2', bars: 16, instruments: ['log_drum', 'shakers', 'bass', 'chords'] },
          { section: 'buildup2', bars: 8, instruments: ['all'] },
          { section: 'chorus2', bars: 16, instruments: ['all'] },
          { section: 'breakdown', bars: 8, instruments: ['bass', 'vocals'] },
          { section: 'outro', bars: 8, instruments: ['log_drum', 'shakers'] }
        ],
        totalBars: 104
      },
      blaq_diamond_style: {
        name: 'Blaq Diamond Style',
        description: 'Slow build with heavy percussion',
        structure: [
          { section: 'intro', bars: 8, instruments: ['percussion'] },
          { section: 'verse1', bars: 16, instruments: ['percussion', 'bass', 'log_drum'] },
          { section: 'pre_chorus', bars: 8, instruments: ['percussion', 'bass', 'log_drum', 'vocals'] },
          { section: 'chorus1', bars: 16, instruments: ['all'] },
          { section: 'verse2', bars: 16, instruments: ['percussion', 'bass', 'log_drum', 'chords'] },
          { section: 'chorus2', bars: 16, instruments: ['all'] },
          { section: 'bridge', bars: 8, instruments: ['vocals', 'chords'] },
          { section: 'chorus3', bars: 16, instruments: ['all'] },
          { section: 'outro', bars: 8, instruments: ['percussion', 'bass'] }
        ],
        totalBars: 112
      },
      deep_house: {
        name: 'Deep House',
        description: 'Minimal intro with gradual layering',
        structure: [
          { section: 'intro', bars: 16, instruments: ['kick', 'bass'] },
          { section: 'buildup1', bars: 8, instruments: ['kick', 'bass', 'hats'] },
          { section: 'drop1', bars: 16, instruments: ['all'] },
          { section: 'breakdown', bars: 16, instruments: ['bass', 'chords', 'vocals'] },
          { section: 'buildup2', bars: 8, instruments: ['kick', 'bass', 'hats', 'chords'] },
          { section: 'drop2', bars: 16, instruments: ['all'] },
          { section: 'outro', bars: 16, instruments: ['kick', 'bass'] }
        ],
        totalBars: 96
      },
      quick_demo: {
        name: 'Quick Demo',
        description: 'Short arrangement for quick demos',
        structure: [
          { section: 'intro', bars: 4, instruments: ['log_drum'] },
          { section: 'verse', bars: 8, instruments: ['log_drum', 'bass', 'chords'] },
          { section: 'chorus', bars: 8, instruments: ['all'] },
          { section: 'outro', bars: 4, instruments: ['log_drum'] }
        ],
        totalBars: 24
      }
    };

    // Track type definitions with colors
    this.trackTypes = {
      rhythm: {
        name: 'Rhythm',
        color: '#FF6B6B',
        instruments: ['kick', 'snare', 'hats', 'log_drum', 'percussion']
      },
      bass: {
        name: 'Bass',
        color: '#4ECDC4',
        instruments: ['bass', 'sub_bass']
      },
      harmony: {
        name: 'Harmony',
        color: '#45B7D1',
        instruments: ['chords', 'pads', 'keys', 'piano']
      },
      melody: {
        name: 'Melody',
        color: '#FFA07A',
        instruments: ['lead', 'synth', 'melody']
      },
      vocals: {
        name: 'Vocals',
        color: '#98D8C8',
        instruments: ['vocals', 'vocal_chops', 'voice']
      },
      fx: {
        name: 'FX',
        color: '#F7DC6F',
        instruments: ['fx', 'effects', 'atmosphere', 'ambient']
      }
    };
  }

  /**
   * Apply arrangement template to project
   * @param {string} templateName - Template to apply
   * @param {number} bpm - Project BPM
   * @returns {Object} Arrangement structure
   */
  applyTemplate(templateName, bpm = 115) {
    const template = this.templates[templateName];
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }

    const arrangement = {
      name: template.name,
      bpm,
      sections: [],
      totalDuration: 0
    };

    let currentTime = 0;
    const beatsPerBar = 4;
    const secondsPerBeat = 60 / bpm;

    for (const section of template.structure) {
      const duration = section.bars * beatsPerBar * secondsPerBeat;
      
      arrangement.sections.push({
        name: section.section,
        startTime: currentTime,
        endTime: currentTime + duration,
        bars: section.bars,
        instruments: section.instruments,
        color: this.getSectionColor(section.section)
      });

      currentTime += duration;
    }

    arrangement.totalDuration = currentTime;

    return arrangement;
  }

  /**
   * Get color for section type
   * @param {string} sectionName - Section name
   * @returns {string} Color hex code
   */
  getSectionColor(sectionName) {
    const colorMap = {
      intro: '#9B59B6',
      verse: '#3498DB',
      chorus: '#E74C3C',
      buildup: '#F39C12',
      breakdown: '#1ABC9C',
      bridge: '#34495E',
      outro: '#95A5A6',
      drop: '#E67E22',
      pre_chorus: '#D35400'
    };

    return colorMap[sectionName] || '#7F8C8D';
  }

  /**
   * Split pattern into individual tracks
   * @param {Object} pattern - Pattern with multiple instruments
   * @returns {Array} Array of individual tracks
   */
  splitPatternToTracks(pattern) {
    const tracks = [];
    const instrumentGroups = {};

    // Group notes by instrument
    pattern.notes.forEach(note => {
      const instrument = note.instrument || 'default';
      if (!instrumentGroups[instrument]) {
        instrumentGroups[instrument] = [];
      }
      instrumentGroups[instrument].push(note);
    });

    // Create track for each instrument
    for (const [instrument, notes] of Object.entries(instrumentGroups)) {
      const trackType = this.identifyTrackType(instrument);
      
      tracks.push({
        id: this.generateTrackId(),
        name: this.generateTrackName(instrument),
        instrument,
        type: trackType.name,
        color: trackType.color,
        notes,
        muted: false,
        solo: false,
        volume: 0.8,
        pan: 0
      });
    }

    return tracks;
  }

  /**
   * Identify track type from instrument name
   * @param {string} instrument - Instrument name
   * @returns {Object} Track type
   */
  identifyTrackType(instrument) {
    const instrumentLower = instrument.toLowerCase();
    
    for (const [typeKey, typeData] of Object.entries(this.trackTypes)) {
      if (typeData.instruments.some(inst => instrumentLower.includes(inst))) {
        return typeData;
      }
    }

    // Default to FX if no match
    return this.trackTypes.fx;
  }

  /**
   * Generate intelligent track name
   * @param {string} instrument - Instrument name
   * @returns {string} Track name
   */
  generateTrackName(instrument) {
    const nameMap = {
      kick: 'Kick Drum',
      snare: 'Snare',
      hats: 'Hi-Hats',
      log_drum: 'Log Drum',
      percussion: 'Percussion',
      shakers: 'Shakers',
      bongos: 'Bongos',
      cowbell: 'Cowbell',
      bass: 'Bass',
      sub_bass: 'Sub Bass',
      chords: 'Chords',
      pads: 'Pads',
      keys: 'Keys',
      piano: 'Piano',
      lead: 'Lead Synth',
      synth: 'Synth',
      vocals: 'Vocals',
      vocal_chops: 'Vocal Chops',
      fx: 'FX',
      atmosphere: 'Atmosphere'
    };

    return nameMap[instrument] || instrument.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate unique track ID
   * @returns {string} Track ID
   */
  generateTrackId() {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Organize tracks by type
   * @param {Array} tracks - Array of tracks
   * @returns {Object} Organized tracks
   */
  organizeTracks(tracks) {
    const organized = {
      rhythm: [],
      bass: [],
      harmony: [],
      melody: [],
      vocals: [],
      fx: []
    };

    tracks.forEach(track => {
      const typeLower = track.type.toLowerCase();
      if (organized[typeLower]) {
        organized[typeLower].push(track);
      } else {
        organized.fx.push(track);
      }
    });

    return organized;
  }

  /**
   * Create arrangement markers
   * @param {Object} arrangement - Arrangement structure
   * @returns {Array} Array of markers
   */
  createMarkers(arrangement) {
    const markers = [];

    arrangement.sections.forEach(section => {
      markers.push({
        time: section.startTime,
        name: section.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        color: section.color
      });
    });

    return markers;
  }

  /**
   * Suggest track arrangement order
   * @param {Array} tracks - Array of tracks
   * @returns {Array} Ordered tracks
   */
  suggestTrackOrder(tracks) {
    const typeOrder = ['rhythm', 'bass', 'harmony', 'melody', 'vocals', 'fx'];
    
    return tracks.sort((a, b) => {
      const aIndex = typeOrder.indexOf(a.type.toLowerCase());
      const bIndex = typeOrder.indexOf(b.type.toLowerCase());
      
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }
      
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Generate quick arrangement actions
   * @param {Object} project - Current project
   * @returns {Array} Array of quick actions
   */
  getQuickActions(project) {
    return [
      {
        id: 'split_to_tracks',
        name: 'Split to Tracks',
        description: 'Split current pattern into individual tracks',
        icon: 'split',
        action: () => this.splitPatternToTracks(project.currentPattern)
      },
      {
        id: 'apply_template',
        name: 'Apply Template',
        description: 'Apply arrangement template to project',
        icon: 'template',
        templates: Object.keys(this.templates)
      },
      {
        id: 'organize_tracks',
        name: 'Organize Tracks',
        description: 'Organize tracks by type',
        icon: 'organize',
        action: () => this.organizeTracks(project.tracks)
      },
      {
        id: 'color_code',
        name: 'Color Code',
        description: 'Apply color coding to tracks',
        icon: 'palette',
        action: () => this.applyColorCoding(project.tracks)
      },
      {
        id: 'create_markers',
        name: 'Create Markers',
        description: 'Create section markers',
        icon: 'bookmark',
        action: () => this.createMarkers(project.arrangement)
      }
    ];
  }

  /**
   * Apply color coding to tracks
   * @param {Array} tracks - Array of tracks
   * @returns {Array} Color-coded tracks
   */
  applyColorCoding(tracks) {
    return tracks.map(track => {
      const trackType = this.identifyTrackType(track.instrument);
      return {
        ...track,
        color: trackType.color,
        type: trackType.name
      };
    });
  }

  /**
   * Calculate arrangement statistics
   * @param {Object} arrangement - Arrangement structure
   * @returns {Object} Statistics
   */
  getStatistics(arrangement) {
    const sectionCounts = {};
    let totalBars = 0;

    arrangement.sections.forEach(section => {
      sectionCounts[section.name] = (sectionCounts[section.name] || 0) + 1;
      totalBars += section.bars;
    });

    return {
      totalSections: arrangement.sections.length,
      totalBars,
      totalDuration: arrangement.totalDuration,
      sectionCounts,
      averageSectionLength: totalBars / arrangement.sections.length
    };
  }

  /**
   * Get all templates
   * @returns {Object} All templates
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * Get template presets for UI
   * @returns {Array} Array of template objects
   */
  getPresets() {
    return Object.entries(this.templates).map(([key, template]) => ({
      id: key,
      name: template.name,
      description: template.description,
      totalBars: template.totalBars,
      sectionCount: template.structure.length
    }));
  }

  /**
   * Create custom template
   * @param {Object} params - Template parameters
   * @returns {Object} Custom template
   */
  createCustomTemplate(params) {
    return {
      name: params.name || 'Custom Template',
      description: params.description || 'Custom arrangement template',
      structure: params.structure || [],
      totalBars: params.structure.reduce((sum, section) => sum + section.bars, 0)
    };
  }

  /**
   * Duplicate section
   * @param {Object} arrangement - Arrangement structure
   * @param {number} sectionIndex - Index of section to duplicate
   * @returns {Object} Updated arrangement
   */
  duplicateSection(arrangement, sectionIndex) {
    const section = arrangement.sections[sectionIndex];
    if (!section) return arrangement;

    const newSection = {
      ...section,
      name: `${section.name}_copy`,
      startTime: section.endTime,
      endTime: section.endTime + (section.endTime - section.startTime)
    };

    const updatedSections = [
      ...arrangement.sections.slice(0, sectionIndex + 1),
      newSection,
      ...arrangement.sections.slice(sectionIndex + 1)
    ];

    // Recalculate times for subsequent sections
    for (let i = sectionIndex + 2; i < updatedSections.length; i++) {
      const duration = updatedSections[i].endTime - updatedSections[i].startTime;
      updatedSections[i].startTime = updatedSections[i - 1].endTime;
      updatedSections[i].endTime = updatedSections[i].startTime + duration;
    }

    return {
      ...arrangement,
      sections: updatedSections,
      totalDuration: updatedSections[updatedSections.length - 1].endTime
    };
  }

  /**
   * Remove section
   * @param {Object} arrangement - Arrangement structure
   * @param {number} sectionIndex - Index of section to remove
   * @returns {Object} Updated arrangement
   */
  removeSection(arrangement, sectionIndex) {
    if (sectionIndex < 0 || sectionIndex >= arrangement.sections.length) {
      return arrangement;
    }

    const updatedSections = arrangement.sections.filter((_, i) => i !== sectionIndex);

    // Recalculate times
    let currentTime = 0;
    updatedSections.forEach(section => {
      const duration = section.endTime - section.startTime;
      section.startTime = currentTime;
      section.endTime = currentTime + duration;
      currentTime += duration;
    });

    return {
      ...arrangement,
      sections: updatedSections,
      totalDuration: currentTime
    };
  }
}

// Export singleton instance
export default new ArrangementAssistant();

