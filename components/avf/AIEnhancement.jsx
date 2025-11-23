import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import {
  Brain,
  Sparkles,
  Target,
  Activity,
  Zap,
  Music,
  Waves,
  TrendingUp,
  Lock,
  Unlock,
  Download,
  Save,
  Share
} from 'lucide-react';

/**
 * AI Enhancement Mode Components
 * These components provide the advanced AI features that go beyond Dubler 2.0
 */

// Context-Locked Harmony Component
export const ContextLockedHarmony = ({ projectContext, isActive, onToggle }) => {
  const [harmonicSuggestions, setHarmonicSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  useEffect(() => {
    if (isActive) {
      // Simulate AI analysis
      setIsAnalyzing(true);
      setTimeout(() => {
        setHarmonicSuggestions([
          { note: 'C4', interval: 'Root', confidence: 98 },
          { note: 'Eb4', interval: 'Minor 3rd', confidence: 95 },
          { note: 'G4', interval: 'Perfect 5th', confidence: 97 },
          { note: 'Bb4', interval: 'Minor 7th', confidence: 92 }
        ]);
        setIsAnalyzing(false);
      }, 1000);
    }
  }, [isActive, projectContext]);
  
  return (
    <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Context-Locked Harmony
          </CardTitle>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={onToggle}
            className={isActive ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
          >
            {isActive ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            {isActive ? 'Active' : 'Inactive'}
          </Button>
        </div>
        <CardDescription>
          Auto-snap vocal input to project key and chord progression
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Context Display */}
        <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400">Current Project Context</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Key:</span>
              <span className="ml-2 text-white font-medium">{projectContext.key}</span>
            </div>
            <div>
              <span className="text-gray-400">BPM:</span>
              <span className="ml-2 text-white font-medium">{projectContext.bpm}</span>
            </div>
            <div>
              <span className="text-gray-400">Chord:</span>
              <span className="ml-2 text-white font-medium">{projectContext.currentChord}</span>
            </div>
            <div>
              <span className="text-gray-400">Time:</span>
              <span className="ml-2 text-white font-medium">{projectContext.timeSignature}</span>
            </div>
          </div>
        </div>
        
        {/* Harmonic Suggestions */}
        {isActive && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Harmonic Suggestions</span>
              {isAnalyzing && (
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {harmonicSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 bg-black/30 border border-cyan-500/20 rounded-lg hover:border-cyan-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold">{suggestion.note}</span>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.confidence}%
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">{suggestion.interval}</div>
                  <Progress value={suggestion.confidence} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* AI Status */}
        {isActive && (
          <div className="flex items-center gap-2 p-2 bg-cyan-900/10 rounded text-xs text-cyan-400">
            <Zap className="w-3 h-3" />
            <span>AI actively quantizing to {projectContext.currentChord}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Polyphonic Harmony Generator
export const PolyharmonicGenerator = ({ isActive, onToggle, onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedChords, setGeneratedChords] = useState([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate AI generation with progress
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
    
    setTimeout(() => {
      setGeneratedChords([
        {
          name: 'Cm7',
          notes: ['C4', 'Eb4', 'G4', 'Bb4'],
          type: 'Root Chord',
          quality: 96
        },
        {
          name: 'Fm7',
          notes: ['F4', 'Ab4', 'C5', 'Eb5'],
          type: 'Subdominant',
          quality: 94
        },
        {
          name: 'G7',
          notes: ['G4', 'B4', 'D5', 'F5'],
          type: 'Dominant',
          quality: 95
        }
      ]);
      setIsGenerating(false);
      onGenerate?.(generatedChords);
    }, 1500);
  };
  
  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Polyphonic Harmony Generation
          </CardTitle>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={onToggle}
            className={isActive ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Button>
        </div>
        <CardDescription>
          AI generates accompanying chords from monophonic melody
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Generation Controls */}
        <div className="space-y-3">
          <Button
            onClick={handleGenerate}
            disabled={!isActive || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Generating Harmony...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Harmony
              </>
            )}
          </Button>
          
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>AI Processing</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}
        </div>
        
        {/* Generated Chords Display */}
        {generatedChords.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Generated Progression</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm">
                  <Download className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Save className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {generatedChords.map((chord, index) => (
                <div
                  key={index}
                  className="p-3 bg-black/30 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white font-bold text-lg">{chord.name}</span>
                      <span className="ml-2 text-xs text-gray-400">{chord.type}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Quality: {chord.quality}%
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    {chord.notes.map((note, noteIndex) => (
                      <div
                        key={noteIndex}
                        className="flex-1 p-2 bg-purple-900/30 rounded text-center text-xs text-white"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Semantic Vibe Analysis
export const SemanticVibeAnalysis = ({ isActive, onToggle, vocalInput }) => {
  const [vibeData, setVibeData] = useState({
    timbre: 'neutral',
    emotion: 'calm',
    intensity: 50,
    breathiness: 30,
    vibrato: 20,
    articulation: 'smooth'
  });
  
  const [vibeParameters, setVibeParameters] = useState([]);
  
  useEffect(() => {
    if (isActive && vocalInput) {
      // Simulate real-time vibe analysis
      const interval = setInterval(() => {
        setVibeData({
          timbre: ['bright', 'dark', 'warm', 'cold'][Math.floor(Math.random() * 4)],
          emotion: ['calm', 'excited', 'melancholic', 'energetic'][Math.floor(Math.random() * 4)],
          intensity: Math.random() * 100,
          breathiness: Math.random() * 100,
          vibrato: Math.random() * 100,
          articulation: ['smooth', 'staccato', 'legato'][Math.floor(Math.random() * 3)]
        });
        
        // Generate synth parameters
        setVibeParameters([
          { name: 'Filter Cutoff', value: Math.random() * 127, cc: 74 },
          { name: 'Resonance', value: Math.random() * 127, cc: 71 },
          { name: 'Attack', value: Math.random() * 127, cc: 73 },
          { name: 'Release', value: Math.random() * 127, cc: 72 }
        ]);
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isActive, vocalInput]);
  
  return (
    <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-amber-400" />
            Semantic Vibe Analysis
          </CardTitle>
          <Button
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={onToggle}
            className={isActive ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Button>
        </div>
        <CardDescription>
          Analyze vocal timbre and emotion to control synthesis parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vibe Characteristics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-black/30 border border-amber-500/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Timbre</div>
            <div className="text-lg font-bold text-amber-400 capitalize">{vibeData.timbre}</div>
          </div>
          <div className="p-3 bg-black/30 border border-amber-500/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Emotion</div>
            <div className="text-lg font-bold text-amber-400 capitalize">{vibeData.emotion}</div>
          </div>
          <div className="p-3 bg-black/30 border border-amber-500/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Articulation</div>
            <div className="text-lg font-bold text-amber-400 capitalize">{vibeData.articulation}</div>
          </div>
          <div className="p-3 bg-black/30 border border-amber-500/20 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Intensity</div>
            <div className="text-lg font-bold text-amber-400">{Math.round(vibeData.intensity)}%</div>
          </div>
        </div>
        
        {/* Vibe Meters */}
        <div className="space-y-2">
          <VibeMeter label="Breathiness" value={vibeData.breathiness} />
          <VibeMeter label="Vibrato" value={vibeData.vibrato} />
        </div>
        
        {/* Generated Synth Parameters */}
        {isActive && vibeParameters.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-300">Generated Synth Parameters</div>
            {vibeParameters.map((param, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{param.name} (CC {param.cc})</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <Progress value={(param.value / 127) * 100} className="h-1 flex-1" />
                  <span className="text-gray-500 w-8">{Math.round(param.value)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {isActive && (
          <div className="flex items-center gap-2 p-2 bg-amber-900/10 rounded text-xs text-amber-400">
            <TrendingUp className="w-3 h-3" />
            <span>Real-time vibe analysis active</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Vibe Meter Component
const VibeMeter = ({ label, value }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
};

// Amapiano Pattern Recognition
export const AmapianoPatternsRecognition = ({ culturalMode, onModeChange, isActive }) => {
  const [recognizedPatterns, setRecognizedPatterns] = useState([]);
  const [instrumentMapping, setInstrumentMapping] = useState([]);
  
  const culturalModes = [
    {
      id: 'amapiano',
      name: 'Classic Amapiano',
      description: 'Traditional log drums, piano, and shakers',
      instruments: ['Log Drums', 'Piano', 'Shakers', 'Bass']
    },
    {
      id: 'private-school',
      name: 'Private School',
      description: 'Sophisticated with saxophone and strings',
      instruments: ['Piano', 'Saxophone', 'Strings', 'Synth Pads']
    },
    {
      id: 'sgija',
      name: 'Amapiano 3-Step (Sgija)',
      description: 'Fast-paced with complex percussion',
      instruments: ['Log Drums', 'Congas', 'Hi-Hats', '808 Bass']
    },
    {
      id: 'global',
      name: 'Global Fusion',
      description: 'Cross-cultural blend',
      instruments: ['All Instruments', 'World Percussion', 'Synths']
    }
  ];
  
  useEffect(() => {
    if (isActive) {
      const currentMode = culturalModes.find(m => m.id === culturalMode);
      setInstrumentMapping(currentMode?.instruments || []);
      
      // Simulate pattern recognition
      setRecognizedPatterns([
        { pattern: 'Log Drum Hit', confidence: 94, instrument: 'Log Drums' },
        { pattern: 'Piano Chord', confidence: 89, instrument: 'Piano' },
        { pattern: 'Shaker Loop', confidence: 92, instrument: 'Shakers' }
      ]);
    }
  }, [culturalMode, isActive]);
  
  return (
    <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5 text-orange-400" />
          Amapiano Pattern Recognition
        </CardTitle>
        <CardDescription>
          Genre-specific beatbox-to-instrument mapping
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cultural Mode Selection */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-3 block">Cultural Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {culturalModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`p-3 rounded-lg text-left transition-all ${
                  culturalMode === mode.id
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-2 border-orange-400'
                    : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-bold text-sm mb-1">{mode.name}</div>
                <div className="text-xs opacity-80">{mode.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Active Instrument Models */}
        <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
          <div className="text-sm font-medium text-orange-400 mb-2">Active Instrument Models</div>
          <div className="grid grid-cols-2 gap-2">
            {instrumentMapping.map((instrument, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-300">{instrument}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recognized Patterns */}
        {isActive && recognizedPatterns.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-300">Recognized Patterns</div>
            {recognizedPatterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-black/30 border border-orange-500/20 rounded"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-orange-400" />
                  <span className="text-sm text-white">{pattern.pattern}</span>
                  <span className="text-xs text-gray-500">→ {pattern.instrument}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {pattern.confidence}%
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default {
  ContextLockedHarmony,
  PolyharmonicGenerator,
  SemanticVibeAnalysis,
  AmapianoPatternsRecognition
};

