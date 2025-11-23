import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import { Slider } from '@/components/ui/slider.jsx';
import { 
  Mic, 
  Music, 
  Settings, 
  Zap, 
  Brain,
  Sparkles,
  Play,
  Pause,
  Volume2,
  Disc,
  Radio,
  Waves,
  Activity,
  Target,
  Sliders,
  Power,
  Lock,
  Unlock,
  Download,
  Upload,
  Save,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Circle,
  Square
} from 'lucide-react';

/**
 * Aura Vocal Forge (AVF) - Context-Aware Vocal-to-MIDI Interface
 * 
 * Two Modes:
 * 1. Foundation Mode: Exact Dubler 2.0 replica for familiar workflow
 * 2. Enhancement Mode: AI-powered context-aware translation with Amapiano intelligence
 * 
 * Architecture:
 * - Frontend: React/TypeScript UI (this component)
 * - Audio Engine: C++/JUCE for low-latency pitch tracking
 * - AI Engine: Cloud-based AuraAIAgent for intelligent translation
 * - Context: MCP Protocol for real-time DAW state
 */

const AuraVocalForge = () => {
  // Mode state
  const [mode, setMode] = useState('foundation'); // 'foundation' or 'enhancement'
  const [activeTab, setActiveTab] = useState('play');
  
  // Audio state
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const [micGain, setMicGain] = useState(0.75);
  
  // Foundation Mode parameters (Dubler replica)
  const [sensitivity, setSensitivity] = useState(0.5);
  const [stickiness, setStickiness] = useState(100); // ms
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('Minor');
  const [currentNote, setCurrentNote] = useState(null);
  const [currentPitch, setCurrentPitch] = useState(0);
  
  // Enhancement Mode parameters (AI features)
  const [contextLocked, setContextLocked] = useState(false);
  const [harmonicMode, setHarmonicMode] = useState(false);
  const [vibeAnalysis, setVibeAnalysis] = useState(false);
  const [culturalMode, setCulturalMode] = useState('amapiano');
  
  // MCP Context (pulled from DAW)
  const [projectContext, setProjectContext] = useState({
    bpm: 115,
    key: 'C Minor',
    currentChord: 'Cm7',
    timeSignature: '4/4'
  });
  
  // Trigger pads state
  const [triggerPads, setTriggerPads] = useState([
    { id: 1, name: 'Log Drum', midiNote: 36, active: false, color: 'orange' },
    { id: 2, name: 'Kick', midiNote: 35, active: false, color: 'blue' },
    { id: 3, name: 'Snare', midiNote: 38, active: false, color: 'red' },
    { id: 4, name: 'Hi-Hat', midiNote: 42, active: false, color: 'yellow' }
  ]);
  
  // Vowel/CC tracking
  const [vowelTracking, setVowelTracking] = useState({
    a: 0,
    e: 0,
    o: 0,
    envelope: 0
  });
  
  // AI-generated suggestions
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [generatedHarmony, setGeneratedHarmony] = useState([]);
  
  // Audio visualization
  const [waveformData, setWaveformData] = useState(new Array(64).fill(0));
  const [pitchHistory, setPitchHistory] = useState(new Array(100).fill(0));
  
  // Simulated audio input monitoring
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        // Simulate input level
        setInputLevel(Math.random() * 100);
        
        // Simulate pitch detection
        if (Math.random() > 0.7) {
          const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
          setCurrentNote(notes[Math.floor(Math.random() * notes.length)]);
          setCurrentPitch(Math.random() * 127);
        }
        
        // Simulate waveform
        setWaveformData(prev => {
          const newData = [...prev];
          newData.shift();
          newData.push(Math.random() * 100);
          return newData;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isListening]);
  
  // Toggle listening state
  const toggleListening = () => {
    setIsListening(!isListening);
  };
  
  // Toggle mode
  const toggleMode = () => {
    setMode(mode === 'foundation' ? 'enhancement' : 'foundation');
  };
  
  // Simulate AI harmony generation
  const generateHarmony = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setGeneratedHarmony([
        { note: 'C4', type: 'root' },
        { note: 'Eb4', type: 'third' },
        { note: 'G4', type: 'fifth' }
      ]);
      setIsProcessing(false);
    }, 1500);
  };
  
  // Keys and scales
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const scales = ['Major', 'Minor', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Pentatonic'];
  
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Aura Vocal Forge
              </h1>
              <p className="text-sm text-gray-400">Context-Aware Vocal-to-MIDI Interface</p>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-3">
            <Badge variant={mode === 'foundation' ? 'default' : 'outline'} className="text-xs">
              Foundation Mode
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMode}
              className="relative"
            >
              {mode === 'foundation' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
            <Badge variant={mode === 'enhancement' ? 'default' : 'outline'} className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600">
              AI Enhancement
            </Badge>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-300">{isListening ? 'Listening' : 'Standby'}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <Progress value={inputLevel} className="h-2 flex-1" />
              <span className="text-xs text-gray-400 w-12">{Math.round(inputLevel)}%</span>
            </div>
          </div>
          
          {mode === 'enhancement' && (
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400">AI Active</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Music className="w-4 h-4" />
            <span>{projectContext.bpm} BPM • {projectContext.key}</span>
          </div>
        </div>
      </div>
      
      {/* Main Content - Tabbed Interface */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-700 pb-2">
          {['play', 'triggers', 'key', 'assign', 'advanced'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'play' && (
            <PlayTab
              isListening={isListening}
              toggleListening={toggleListening}
              currentNote={currentNote}
              currentPitch={currentPitch}
              selectedKey={selectedKey}
              selectedScale={selectedScale}
              micGain={micGain}
              setMicGain={setMicGain}
              stickiness={stickiness}
              setStickiness={setStickiness}
              waveformData={waveformData}
              vowelTracking={vowelTracking}
              mode={mode}
              projectContext={projectContext}
            />
          )}
          
          {activeTab === 'triggers' && (
            <TriggersTab
              triggerPads={triggerPads}
              setTriggerPads={setTriggerPads}
              sensitivity={sensitivity}
              setSensitivity={setSensitivity}
              isListening={isListening}
              mode={mode}
            />
          )}
          
          {activeTab === 'key' && (
            <KeyTab
              selectedKey={selectedKey}
              setSelectedKey={setSelectedKey}
              selectedScale={selectedScale}
              setSelectedScale={setSelectedScale}
              keys={keys}
              scales={scales}
              projectContext={projectContext}
              mode={mode}
            />
          )}
          
          {activeTab === 'assign' && (
            <AssignTab
              vowelTracking={vowelTracking}
              setVowelTracking={setVowelTracking}
              mode={mode}
            />
          )}
          
          {activeTab === 'advanced' && (
            <AdvancedTab
              mode={mode}
              contextLocked={contextLocked}
              setContextLocked={setContextLocked}
              harmonicMode={harmonicMode}
              setHarmonicMode={setHarmonicMode}
              vibeAnalysis={vibeAnalysis}
              setVibeAnalysis={setVibeAnalysis}
              culturalMode={culturalMode}
              setCulturalMode={setCulturalMode}
              generateHarmony={generateHarmony}
              generatedHarmony={generatedHarmony}
              isProcessing={isProcessing}
              projectContext={projectContext}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Play Tab Component
const PlayTab = ({ 
  isListening, 
  toggleListening, 
  currentNote, 
  currentPitch,
  selectedKey,
  selectedScale,
  micGain,
  setMicGain,
  stickiness,
  setStickiness,
  waveformData,
  vowelTracking,
  mode,
  projectContext
}) => {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left Panel - Controls */}
      <div className="col-span-3 space-y-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm">Input Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mic Gain */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Input Level</label>
              <Slider
                value={[micGain * 100]}
                onValueChange={(value) => setMicGain(value[0] / 100)}
                max={100}
                step={1}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{Math.round(micGain * 100)}%</span>
            </div>
            
            {/* Stickiness */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Stickiness (ms)</label>
              <Slider
                value={[stickiness]}
                onValueChange={(value) => setStickiness(value[0])}
                max={1000}
                step={10}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{stickiness}ms</span>
            </div>
            
            {/* Listen Button */}
            <Button
              onClick={toggleListening}
              className={`w-full ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isListening ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Waveform Visualization */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm">Input Waveform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end gap-0.5">
              {waveformData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t"
                  style={{ height: `${value}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Center Panel - Pitch Wheel */}
      <div className="col-span-6">
        <Card className="bg-gray-800/50 border-gray-700 h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pitch Detection</span>
              {mode === 'enhancement' && (
                <Badge className="bg-cyan-600">
                  <Brain className="w-3 h-3 mr-1" />
                  Context-Locked to {projectContext.currentChord}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PitchWheel 
              currentNote={currentNote} 
              currentPitch={currentPitch}
              selectedKey={selectedKey}
              selectedScale={selectedScale}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Right Panel - Vowel Tracking */}
      <div className="col-span-3 space-y-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm">Vowel Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(vowelTracking).map(([vowel, value]) => (
              <div key={vowel}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 uppercase">{vowel}</span>
                  <span className="text-xs text-gray-500">{Math.round(value)}</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Pitch Wheel Component
const PitchWheel = ({ currentNote, currentPitch, selectedKey, selectedScale }) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Outer ring - scale notes */}
      <div className="absolute inset-0 rounded-full border-4 border-purple-500/30">
        {notes.map((note, index) => {
          const angle = (index * 30) - 90; // 30 degrees per note, start at top
          const radian = (angle * Math.PI) / 180;
          const radius = 45; // percentage
          const x = 50 + radius * Math.cos(radian);
          const y = 50 + radius * Math.sin(radian);
          
          const isActive = note === currentNote;
          const isInScale = true; // Simplified - would check against selectedScale
          
          return (
            <div
              key={note}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-125 shadow-lg'
                    : isInScale
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-800 text-gray-600'
                }`}
              >
                {note}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Center display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {currentNote || '--'}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {selectedKey} {selectedScale}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            MIDI: {Math.round(currentPitch)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Triggers Tab Component (will be implemented next)
const TriggersTab = ({ triggerPads, setTriggerPads, sensitivity, setSensitivity, isListening, mode }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Beatbox Triggers</CardTitle>
          <CardDescription>
            {mode === 'foundation' 
              ? 'Map vocal sounds to MIDI triggers' 
              : 'AI-powered Amapiano pattern recognition'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {triggerPads.map((pad) => (
              <TriggerPad key={pad.id} pad={pad} isListening={isListening} />
            ))}
          </div>
          
          <div className="space-y-3">
            <label className="text-sm text-gray-400">Sensitivity</label>
            <Slider
              value={[sensitivity * 100]}
              onValueChange={(value) => setSensitivity(value[0] / 100)}
              max={100}
              step={1}
            />
            <span className="text-xs text-gray-500">{Math.round(sensitivity * 100)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Trigger Pad Component
const TriggerPad = ({ pad, isListening }) => {
  const [isTriggered, setIsTriggered] = useState(false);
  
  useEffect(() => {
    if (isListening && Math.random() > 0.95) {
      setIsTriggered(true);
      setTimeout(() => setIsTriggered(false), 100);
    }
  }, [isListening]);
  
  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
        isTriggered
          ? `bg-${pad.color}-600 border-${pad.color}-400 scale-95 shadow-lg`
          : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
      }`}
    >
      <div className="text-center">
        <div className="text-lg font-bold text-white mb-1">{pad.name}</div>
        <div className="text-xs text-gray-400">MIDI: {pad.midiNote}</div>
      </div>
    </div>
  );
};

// Key Tab Component
const KeyTab = ({ selectedKey, setSelectedKey, selectedScale, setSelectedScale, keys, scales, projectContext, mode }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Key & Scale Restriction</CardTitle>
          <CardDescription>
            {mode === 'enhancement' 
              ? `Auto-synced to project: ${projectContext.key}` 
              : 'Manually set key and scale'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Root Key</label>
            <div className="grid grid-cols-6 gap-2">
              {keys.map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`p-3 rounded-lg font-bold transition-all ${
                    selectedKey === key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
          
          {/* Scale Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-3 block">Scale Type</label>
            <div className="grid grid-cols-3 gap-2">
              {scales.map((scale) => (
                <button
                  key={scale}
                  onClick={() => setSelectedScale(scale)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    selectedScale === scale
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {scale}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Assign Tab Component
const AssignTab = ({ vowelTracking, setVowelTracking, mode }) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Vocal Expression Mapping</CardTitle>
          <CardDescription>Map vowel sounds and dynamics to MIDI CC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Vowel Meters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-purple-400">Vowel Detection</h3>
              {Object.entries(vowelTracking).map(([vowel, value]) => (
                <VowelMeter key={vowel} vowel={vowel} value={value} />
              ))}
            </div>
            
            {/* Right: CC Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-purple-400">MIDI CC Output</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-400">Target CC Number</label>
                  <select className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded">
                    <option>74 - Filter Cutoff</option>
                    <option>71 - Resonance</option>
                    <option>91 - Reverb</option>
                    <option>93 - Chorus</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400">Output Range</label>
                  <div className="flex gap-2 mt-1">
                    <input type="number" placeholder="Min" className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded" defaultValue="0" />
                    <input type="number" placeholder="Max" className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded" defaultValue="127" />
                  </div>
                </div>
                
                {mode === 'enhancement' && (
                  <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Optimize Mapping
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Vowel Meter Component
const VowelMeter = ({ vowel, value }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 flex items-center justify-center relative">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
          style={{
            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((value * 3.6 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((value * 3.6 - 90) * Math.PI / 180)}%, 50% 50%)`
          }}
        />
        <span className="relative z-10 text-lg font-bold text-white uppercase">{vowel}</span>
      </div>
      <div className="flex-1">
        <Progress value={value} className="h-3" />
        <span className="text-xs text-gray-500 mt-1">{Math.round(value)}</span>
      </div>
    </div>
  );
};

// Advanced Tab Component
const AdvancedTab = ({
  mode,
  contextLocked,
  setContextLocked,
  harmonicMode,
  setHarmonicMode,
  vibeAnalysis,
  setVibeAnalysis,
  culturalMode,
  setCulturalMode,
  generateHarmony,
  generatedHarmony,
  isProcessing,
  projectContext
}) => {
  if (mode === 'foundation') {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="py-12 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Advanced Features Locked</h3>
          <p className="text-gray-500 mb-4">Switch to AI Enhancement Mode to access advanced features</p>
          <Button variant="outline">
            <Unlock className="w-4 h-4 mr-2" />
            Enable AI Enhancement
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* AI Features */}
      <Card className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            AI Enhancement Features
          </CardTitle>
          <CardDescription>Context-aware intelligent translation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context-Locked Harmony */}
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <div className="font-medium">Context-Locked Harmony</div>
              <div className="text-xs text-gray-400">Auto-snap to project key and chord progression</div>
            </div>
            <Button
              variant={contextLocked ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContextLocked(!contextLocked)}
            >
              {contextLocked ? 'Active' : 'Inactive'}
            </Button>
          </div>
          
          {contextLocked && (
            <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-cyan-400">Current Context</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Key:</span>
                  <span className="ml-2 text-white">{projectContext.key}</span>
                </div>
                <div>
                  <span className="text-gray-400">Chord:</span>
                  <span className="ml-2 text-white">{projectContext.currentChord}</span>
                </div>
                <div>
                  <span className="text-gray-400">BPM:</span>
                  <span className="ml-2 text-white">{projectContext.bpm}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Polyphonic Harmony */}
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <div className="font-medium">Polyphonic Harmony Generation</div>
              <div className="text-xs text-gray-400">AI generates accompanying chords from melody</div>
            </div>
            <Button
              variant={harmonicMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHarmonicMode(!harmonicMode)}
            >
              {harmonicMode ? 'Active' : 'Inactive'}
            </Button>
          </div>
          
          {harmonicMode && (
            <div className="space-y-2">
              <Button
                onClick={generateHarmony}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isProcessing ? (
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
              
              {generatedHarmony.length > 0 && (
                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-2">Generated Harmony:</div>
                  <div className="flex gap-2">
                    {generatedHarmony.map((note, index) => (
                      <div key={index} className="flex-1 p-2 bg-black/30 rounded text-center">
                        <div className="text-sm font-bold text-white">{note.note}</div>
                        <div className="text-xs text-gray-400">{note.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Vibe Analysis */}
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <div className="font-medium">Semantic Vibe Analysis</div>
              <div className="text-xs text-gray-400">Analyze vocal timbre and emotion</div>
            </div>
            <Button
              variant={vibeAnalysis ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVibeAnalysis(!vibeAnalysis)}
            >
              {vibeAnalysis ? 'Active' : 'Inactive'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Cultural Mode */}
      <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-orange-400" />
            Cultural Pattern Recognition
          </CardTitle>
          <CardDescription>Genre-specific instrument mapping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Cultural Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {['amapiano', 'private-school', 'sgija', 'global'].map((cmode) => (
                <button
                  key={cmode}
                  onClick={() => setCulturalMode(cmode)}
                  className={`p-3 rounded-lg font-medium capitalize transition-all ${
                    culturalMode === cmode
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cmode.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg text-sm">
            <div className="font-medium mb-2">Active Instrument Models:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {['Log Drums', 'Piano', 'Saxophone', '808 Bass', 'Shakers', 'Strings'].map((instrument) => (
                <div key={instrument} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{instrument}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuraVocalForge;

