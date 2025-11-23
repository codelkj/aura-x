/**
 * AI Assistant Command Handler
 * Handles natural language processing for Amapiano-specific music generation commands
 * 
 * Features:
 * - Command parsing and parameter extraction
 * - Amapiano terminology recognition
 * - API endpoint mapping
 * - Context-aware responses
 */

class AIAssistantCommandHandler {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.context = {
      lastCommand: null,
      lastParameters: null,
      conversationHistory: []
    };
    
    // Amapiano-specific terminology patterns
    this.patterns = {
      // Artist styles
      artists: {
        'kabza': { style: 'kabza_de_small', bpm: 118, energy: 'high' },
        'kelvin momo': { style: 'kelvin_momo', bpm: 110, energy: 'deep' },
        'private school': { style: 'private_school', bpm: 112, energy: 'smooth' },
        'mfr souls': { style: 'mfr_souls', bpm: 115, energy: 'soulful' },
        'vigro deep': { style: 'vigro_deep', bpm: 116, energy: 'melodic' }
      },
      
      // BPM patterns
      bpm: /(\d{2,3})\s*(?:bpm|beats|tempo)/i,
      
      // Instruments
      instruments: {
        'log drum': ['log_drum', 'percussion'],
        'piano': ['piano', 'keys', 'melody'],
        'bass': ['bass', 'sub_bass', 'bassline'],
        'synth': ['synth', 'pad', 'atmosphere'],
        'vocals': ['vocals', 'voice', 'singing']
      },
      
      // Moods/Vibes
      moods: {
        'upbeat': { energy: 0.8, valence: 0.7 },
        'chill': { energy: 0.4, valence: 0.6 },
        'deep': { energy: 0.5, valence: 0.4 },
        'energetic': { energy: 0.9, valence: 0.8 },
        'soulful': { energy: 0.6, valence: 0.5 },
        'smooth': { energy: 0.5, valence: 0.7 },
        'dark': { energy: 0.6, valence: 0.3 },
        'happy': { energy: 0.7, valence: 0.9 }
      },
      
      // Commands
      commands: {
        generate: /(?:generate|create|make|produce|build)\s+(?:a|an|some)?\s*(.*)/i,
        modify: /(?:modify|change|adjust|alter|update)\s+(.*)/i,
        analyze: /(?:analyze|check|inspect|evaluate)\s+(.*)/i,
        export: /(?:export|save|download)\s+(.*)/i,
        help: /(?:help|how|what|explain)/i
      }
    };
  }
  
  /**
   * Main command processing entry point
   */
  async processCommand(userInput) {
    try {
      // Add to conversation history
      this.context.conversationHistory.push({
        role: 'user',
        content: userInput,
        timestamp: new Date()
      });
      
      // Parse command type
      const commandType = this.identifyCommandType(userInput);
      
      // Extract parameters
      const parameters = this.extractParameters(userInput, commandType);
      
      // Execute command
      const result = await this.executeCommand(commandType, parameters);
      
      // Store context
      this.context.lastCommand = commandType;
      this.context.lastParameters = parameters;
      
      // Add response to history
      this.context.conversationHistory.push({
        role: 'assistant',
        content: result.message,
        timestamp: new Date(),
        data: result.data
      });
      
      return result;
      
    } catch (error) {
      console.error('Command processing error:', error);
      return {
        success: false,
        message: `I encountered an error: ${error.message}. Could you rephrase your request?`,
        error: error.message
      };
    }
  }
  
  /**
   * Identify the type of command from user input
   */
  identifyCommandType(input) {
    const lowerInput = input.toLowerCase();
    
    if (this.patterns.commands.generate.test(lowerInput)) {
      return 'generate';
    } else if (this.patterns.commands.modify.test(lowerInput)) {
      return 'modify';
    } else if (this.patterns.commands.analyze.test(lowerInput)) {
      return 'analyze';
    } else if (this.patterns.commands.export.test(lowerInput)) {
      return 'export';
    } else if (this.patterns.commands.help.test(lowerInput)) {
      return 'help';
    } else {
      return 'general';
    }
  }
  
  /**
   * Extract parameters from user input based on command type
   */
  extractParameters(input, commandType) {
    const params = {
      style: null,
      bpm: null,
      instruments: [],
      mood: null,
      duration: 30,
      energy: null,
      valence: null
    };
    
    const lowerInput = input.toLowerCase();
    
    // Extract artist style
    for (const [keyword, styleData] of Object.entries(this.patterns.artists)) {
      if (lowerInput.includes(keyword)) {
        params.style = styleData.style;
        params.bpm = params.bpm || styleData.bpm;
        params.energy = styleData.energy;
        break;
      }
    }
    
    // Extract BPM
    const bpmMatch = input.match(this.patterns.bpm);
    if (bpmMatch) {
      params.bpm = parseInt(bpmMatch[1]);
    }
    
    // Extract instruments
    for (const [keyword, instrumentList] of Object.entries(this.patterns.instruments)) {
      if (lowerInput.includes(keyword)) {
        params.instruments.push(...instrumentList);
      }
    }
    
    // Extract mood
    for (const [keyword, moodData] of Object.entries(this.patterns.moods)) {
      if (lowerInput.includes(keyword)) {
        params.mood = keyword;
        params.energy = moodData.energy;
        params.valence = moodData.valence;
        break;
      }
    }
    
    // Extract duration (if specified)
    const durationMatch = input.match(/(\d+)\s*(?:seconds?|secs?|s)/i);
    if (durationMatch) {
      params.duration = parseInt(durationMatch[1]);
    }
    
    return params;
  }
  
  /**
   * Execute the identified command with extracted parameters
   */
  async executeCommand(commandType, parameters) {
    switch (commandType) {
      case 'generate':
        return await this.handleGenerate(parameters);
        
      case 'modify':
        return await this.handleModify(parameters);
        
      case 'analyze':
        return await this.handleAnalyze(parameters);
        
      case 'export':
        return await this.handleExport(parameters);
        
      case 'help':
        return this.handleHelp();
        
      default:
        return this.handleGeneral(parameters);
    }
  }
  
  /**
   * Handle music generation commands
   */
  async handleGenerate(params) {
    try {
      // Build generation prompt
      const prompt = this.buildGenerationPrompt(params);
      
      // Call generation API
      const response = await this.apiClient.post('/api/generate', {
        prompt: prompt,
        bpm: params.bpm || 115,
        duration: params.duration || 30,
        style: params.style || 'classic_amapiano',
        instruments: params.instruments,
        energy: params.energy,
        valence: params.valence
      });
      
      return {
        success: true,
        message: `🎵 Generated ${params.style || 'Amapiano'} track at ${params.bpm || 115} BPM! ${params.mood ? `Mood: ${params.mood}` : ''}`,
        data: response.data,
        action: 'generation_complete'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to generate music: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Build natural language prompt from parameters
   */
  buildGenerationPrompt(params) {
    let prompt = '';
    
    if (params.mood) {
      prompt += `${params.mood.charAt(0).toUpperCase() + params.mood.slice(1)} `;
    }
    
    prompt += 'Amapiano music';
    
    if (params.instruments.length > 0) {
      prompt += ` with ${params.instruments.join(', ')}`;
    }
    
    if (params.bpm) {
      prompt += ` at ${params.bpm} BPM`;
    }
    
    if (params.style) {
      prompt += ` in ${params.style.replace(/_/g, ' ')} style`;
    }
    
    return prompt;
  }
  
  /**
   * Handle modification commands
   */
  async handleModify(params) {
    if (!this.context.lastCommand || this.context.lastCommand !== 'generate') {
      return {
        success: false,
        message: "I don't have a track to modify. Please generate a track first!"
      };
    }
    
    try {
      // Call modification API
      const response = await this.apiClient.post('/api/modify', {
        trackId: this.context.lastParameters.trackId,
        modifications: params
      });
      
      return {
        success: true,
        message: `✨ Modified track with your changes!`,
        data: response.data,
        action: 'modification_complete'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to modify track: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Handle analysis commands
   */
  async handleAnalyze(params) {
    try {
      const response = await this.apiClient.post('/api/analyze', params);
      
      return {
        success: true,
        message: `📊 Analysis complete! Here's what I found:`,
        data: response.data,
        action: 'analysis_complete'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to analyze: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Handle export commands
   */
  async handleExport(params) {
    try {
      const response = await this.apiClient.post('/api/export', {
        format: params.format || 'wav',
        quality: params.quality || 'high'
      });
      
      return {
        success: true,
        message: `💾 Export ready! Your track is being downloaded.`,
        data: response.data,
        action: 'export_complete'
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to export: ${error.message}`,
        error: error.message
      };
    }
  }
  
  /**
   * Handle help commands
   */
  handleHelp() {
    return {
      success: true,
      message: `🎵 **Amapiano AI Assistant Help**

I can help you with:

**Generate Music:**
- "Generate a Kabza De Small style beat at 118 BPM"
- "Create an upbeat Amapiano track with log drums and piano"
- "Make a deep Kelvin Momo style track"

**Modify Tracks:**
- "Make it faster"
- "Add more bass"
- "Change the mood to energetic"

**Analyze Music:**
- "Analyze this track"
- "Check the quality"
- "What's the BPM?"

**Export:**
- "Export as WAV"
- "Save to DAW"
- "Download this track"

**Tips:**
- Mention artist names (Kabza, Kelvin Momo, etc.) for style
- Specify BPM (105-125 typical for Amapiano)
- Describe mood (upbeat, chill, deep, energetic)
- List instruments (log drum, piano, bass, synth)

Try saying: "Generate an upbeat Amapiano track with log drums at 118 BPM"`,
      action: 'help_displayed'
    };
  }
  
  /**
   * Handle general conversation
   */
  handleGeneral(params) {
    return {
      success: true,
      message: `I'm your Amapiano AI Assistant! I can help you generate, modify, and analyze Amapiano music. 

Try commands like:
- "Generate a Kabza style beat at 118 BPM"
- "Create an upbeat track with log drums"
- "Make it more energetic"

Type "help" for more examples!`,
      action: 'general_response'
    };
  }
  
  /**
   * Get conversation history
   */
  getHistory() {
    return this.context.conversationHistory;
  }
  
  /**
   * Clear conversation history
   */
  clearHistory() {
    this.context.conversationHistory = [];
    this.context.lastCommand = null;
    this.context.lastParameters = null;
  }
}

export default AIAssistantCommandHandler;

