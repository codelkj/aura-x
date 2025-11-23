import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import CulturalTimeMachine from './CulturalTimeMachineFixed.jsx'
import AuraVocalForge from './AuraVocalForge.jsx'
import TestingDashboard from './TestingDashboard.jsx'
import EssentiaQualityMetrics from './components/EssentiaQualityMetrics.jsx'
import CulturalAuthenticityValidator from './components/CulturalAuthenticityValidator.jsx'
import RealTimeQualityMonitor from './components/RealTimeQualityMonitor.jsx'
import { 
  Brain, 
  Heart, 
  Waves, 
  Zap, 
  Music, 
  Mic, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2,
  Settings,
  Users,
  Sparkles,
  Eye,
  Atom,
  Dna,
  Compass,
  Star,
  Moon,
  Sun,
  Headphones,
  Radio,
  Disc,
  Wand2,
  Lightbulb,
  Infinity,
  Orbit,
  Cpu,
  Network,
  Layers,
  Palette,
  Camera,
  Gamepad2,
  Trophy,
  Target,
  Rocket,
  Globe,
  Shield,
  Lock,
  Unlock,
  Key,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  MessageCircle,
  ThumbsUp,
  Repeat,
  Shuffle,
  MoreHorizontal,
  Plus,
  Minus,
  RotateCcw,
  Save,
  Folder,
  FileAudio,
  Sliders,
  Maximize,
  Minimize,
  Power,
  Wifi,
  Battery,
  Signal
} from 'lucide-react'
import './App.css'

// Import new services
import AIAssistantCommandHandler from './services/AIAssistantCommandHandler.js'
import DAWExportManager from './services/DAWExportManager.js'
import TrackManager from './services/TrackManager.js'

// Revolutionary Amapiano AI Studio - Consciousness-Based Music Creation Platform
function App() {
  // Initialize services
  const [aiAssistant] = useState(() => new AIAssistantCommandHandler({
    post: async (endpoint, data) => {
      // API client implementation
      return { data: { success: true } }
    }
  }))
  const [exportManager] = useState(() => new DAWExportManager())
  const [trackManager] = useState(() => new TrackManager())
  
  // Core state management
  const [activeTab, setActiveTab] = useState('consciousness')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [volume, setVolume] = useState(75)
  const [tempo, setTempo] = useState(115)
  const [isRecording, setIsRecording] = useState(false)
  const [isARActive, setIsARActive] = useState(false)
  const [isQuantumMode, setIsQuantumMode] = useState(false)
  
  // Biometric and consciousness state
  const [biometricData, setBiometricData] = useState({
    heartRate: 72,
    stressLevel: 0.3,
    emotionalState: 'calm',
    brainwavePattern: 'alpha',
    oxygenLevel: 98,
    bodyTemperature: 98.6
  })
  const [consciousnessLevel, setConsciousnessLevel] = useState(0.7)
  const [quantumState, setQuantumState] = useState('superposition')
  const [spiritualAlignment, setSpiritualAlignment] = useState(0.8)
  const [culturalConnection, setCulturalConnection] = useState(0.9)
  
  // Advanced AI state
  const [aiPersonality, setAiPersonality] = useState('AURA Consciousness Specialist v2.0')
  const [emotionalDNA, setEmotionalDNA] = useState('')
  const [quantumPrompt, setQuantumPrompt] = useState('')
  const [temporalSettings, setTemporalSettings] = useState({
    era: 'present',
    timeDialation: 1.0,
    culturalPeriod: 'modern-amapiano'
  })
  
  // Track and project management
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Log Drum', active: true, volume: 80, pan: 0, solo: false, mute: false, color: 'orange' },
    { id: 2, name: 'Piano', active: true, volume: 70, pan: -20, solo: false, mute: false, color: 'blue' },
    { id: 3, name: 'Saxophone', active: false, volume: 60, pan: 20, solo: false, mute: false, color: 'yellow' },
    { id: 4, name: 'Vocals', active: false, volume: 85, pan: 0, solo: false, mute: false, color: 'purple' }
  ])
  
  const [projects, setProjects] = useState([
    { id: 1, name: 'Amapiano Sunrise', date: '2025-09-17', tracks: 4, duration: '3:45' },
    { id: 2, name: 'Quantum Groove', date: '2025-09-16', tracks: 6, duration: '4:12' },
    { id: 3, name: 'Consciousness Flow', date: '2025-09-15', tracks: 8, duration: '5:30' }
  ])
  
  // User stats and gamification
  const [userStats, setUserStats] = useState({
    level: 42,
    xp: 15750,
    xpToNext: 2250,
    coins: 8420,
    gems: 156,
    tracksCreated: 89,
    collaborations: 23,
    achievements: 34
  })
  
  // Notifications and messages
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'achievement', message: 'New achievement unlocked: Quantum Producer!', time: '2 min ago' },
    { id: 2, type: 'collaboration', message: 'DJ Maphorisa wants to collaborate', time: '5 min ago' },
    { id: 3, type: 'system', message: 'Consciousness level increased to 73%', time: '10 min ago' }
  ])
  
  // Revolutionary tabs configuration
  const revolutionaryTabs = [
    { 
      id: 'consciousness', 
      name: 'Consciousness Studio', 
      icon: Brain, 
      color: 'from-purple-500 to-pink-600',
      description: 'Biometric-driven music creation'
    },
    { 
      id: 'quantum', 
      name: 'Quantum Intelligence', 
      icon: Atom, 
      color: 'from-blue-500 to-cyan-600',
      description: 'Parallel universe composition'
    },
    { 
      id: 'cultural', 
      name: 'Cultural Time Machine', 
      icon: Compass, 
      color: 'from-amber-500 to-orange-600',
      description: 'Historical music recreation'
    },
    { 
      id: 'vocal-forge', 
      name: 'Aura Vocal Forge', 
      icon: Mic, 
      color: 'from-purple-500 to-pink-600',
      description: 'Context-aware vocal-to-MIDI'
    },
    { 
      id: 'testing', 
      name: 'Testing Dashboard', 
      icon: Sparkles, 
      color: 'from-green-500 to-emerald-600',
      description: '81 automated tests'
    },
    { 
      id: 'holographic', 
      name: 'Holographic DAW', 
      icon: Layers, 
      color: 'from-green-500 to-teal-600',
      description: 'AR/VR music production'
    },
    { 
      id: 'community', 
      name: 'Collective Community', 
      icon: Users, 
      color: 'from-indigo-500 to-purple-600',
      description: 'Global consciousness network'
    },
    { 
      id: 'blockchain', 
      name: 'Blockchain Quantum', 
      icon: Shield, 
      color: 'from-emerald-500 to-green-600',
      description: 'NFT evolution & quantum mining'
    },
    { 
      id: 'spiritual', 
      name: 'Spiritual Alignment', 
      icon: Star, 
      color: 'from-violet-500 to-purple-600',
      description: 'Consciousness expansion tools'
    }
  ]

  // Biometric Engine Component
  const BiometricEngine = () => (
    <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          Biometric Consciousness Engine
        </CardTitle>
        <CardDescription>Real-time physiological monitoring for music creation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Heart Rate</span>
              <span className="text-sm font-mono">{biometricData.heartRate} BPM</span>
            </div>
            <Progress value={(biometricData.heartRate / 120) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Stress Level</span>
              <span className="text-sm font-mono">{Math.round(biometricData.stressLevel * 100)}%</span>
            </div>
            <Progress value={biometricData.stressLevel * 100} className="h-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Badge variant="outline" className="justify-center">
            <Waves className="w-3 h-3 mr-1" />
            {biometricData.brainwavePattern}
          </Badge>
          <Badge variant="outline" className="justify-center">
            <Heart className="w-3 h-3 mr-1" />
            {biometricData.emotionalState}
          </Badge>
          <Badge variant="outline" className="justify-center">
            <Zap className="w-3 h-3 mr-1" />
            {biometricData.oxygenLevel}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Consciousness Level</label>
          <div className="flex items-center gap-2">
            <Progress value={consciousnessLevel * 100} className="flex-1 h-3" />
            <span className="text-sm font-mono w-12">{Math.round(consciousnessLevel * 100)}%</span>
          </div>
        </div>
        
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Brain className="w-4 h-4 mr-2" />
          Sync Consciousness to Music
        </Button>
      </CardContent>
    </Card>
  )

  // Quantum Intelligence Component
  const QuantumIntelligence = () => (
    <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Atom className="w-5 h-5 text-blue-400" />
          Quantum Music Intelligence
        </CardTitle>
        <CardDescription>Parallel universe composition and quantum superposition</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantum State</label>
          <div className="flex gap-2">
            {['superposition', 'entangled', 'coherent', 'decoherent'].map((state) => (
              <Button
                key={state}
                variant={quantumState === state ? "default" : "outline"}
                size="sm"
                onClick={() => setQuantumState(state)}
                className="capitalize"
              >
                {state}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantum Prompt</label>
          <Textarea
            placeholder="Describe your musical vision across parallel dimensions..."
            value={quantumPrompt}
            onChange={(e) => setQuantumPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-sm">Quantum Coherence</span>
            <Progress value={85} className="h-2" />
          </div>
          <div className="space-y-2">
            <span className="text-sm">Parallel Tracks</span>
            <Progress value={67} className="h-2" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600">
            <Orbit className="w-4 h-4 mr-2" />
            Generate Quantum Track
          </Button>
          <Button variant="outline" size="icon">
            <Infinity className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Cultural Time Machine Preview Component
  const CulturalTimeMachinePreview = () => (
    <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          Cultural Time Machine
        </CardTitle>
        <CardDescription>Journey through Amapiano's rich musical heritage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Cultural Era</label>
          <div className="grid grid-cols-2 gap-2">
            {['1800s Ancestral', '1950s Jazz', '1990s Kwaito', '2010s House', '2020s Amapiano', 'Future Vision'].map((era) => (
              <Button
                key={era}
                variant={temporalSettings.culturalPeriod === era ? "default" : "outline"}
                size="sm"
                onClick={() => setTemporalSettings({...temporalSettings, culturalPeriod: era})}
                className="text-xs"
              >
                {era}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Cultural Authenticity</span>
            <span className="text-sm font-mono">{Math.round(culturalConnection * 100)}%</span>
          </div>
          <Progress value={culturalConnection * 100} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Time Dilation</span>
            <span className="text-sm font-mono">{temporalSettings.timeDialation}x</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="5.0"
            step="0.1"
            value={temporalSettings.timeDialation}
            onChange={(e) => setTemporalSettings({...temporalSettings, timeDialation: parseFloat(e.target.value)})}
            className="w-full"
          />
        </div>
        
        <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
          <Compass className="w-4 h-4 mr-2" />
          Travel Through Time
        </Button>
      </CardContent>
    </Card>
  )

  // Holographic DAW Component
  const HolographicDAW = () => (
    <Card className="bg-gradient-to-br from-green-900/20 to-teal-900/20 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-green-400" />
          Holographic DAW Studio
        </CardTitle>
        <CardDescription>AR/VR spatial music production environment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">AR Mode</span>
          <Button
            variant={isARActive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsARActive(!isARActive)}
          >
            <Camera className="w-4 h-4 mr-2" />
            {isARActive ? 'Active' : 'Inactive'}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="space-y-2 p-3 rounded-lg bg-black/20 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{track.name}</span>
                <div className={`w-3 h-3 rounded-full bg-${track.color}-500`}></div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Volume</span>
                  <span>{track.volume}%</span>
                </div>
                <Progress value={track.volume} className="h-1" />
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                  {track.solo ? 'S' : 'Solo'}
                </Button>
                <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                  {track.mute ? 'M' : 'Mute'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600">
          <Layers className="w-4 h-4 mr-2" />
          Enter Holographic Studio
        </Button>
      </CardContent>
    </Card>
  )

  // Main Transport Controls
  const TransportControls = () => (
    <Card className="bg-gradient-to-r from-gray-900/50 to-black/50 border-gray-700/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline">
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button size="icon" variant="outline">
              <SkipForward className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant={isRecording ? "destructive" : "outline"}
              onClick={() => setIsRecording(!isRecording)}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">BPM</span>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value))}
                className="w-16 px-2 py-1 text-sm bg-black/20 border border-white/20 rounded"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm w-8">{volume}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'consciousness':
        return <BiometricEngine />
      case 'quantum':
        return <QuantumIntelligence />
      case 'cultural':
        return <CulturalTimeMachine />
      
      case 'vocal-forge':
        return <AuraVocalForge />
      
      case 'testing':
        return <TestingDashboard />
      case 'blockchain':
        return (
          <Card className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Blockchain Quantum Mining
              </CardTitle>
              <CardDescription>NFT evolution and quantum rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">{userStats.coins}</div>
                    <div className="text-sm text-gray-400">AURA Coins</div>
                  </div>
                  <div className="text-center p-4 bg-black/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{userStats.gems}</div>
                    <div className="text-sm text-gray-400">Quantum Gems</div>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600">
                  <Shield className="w-4 h-4 mr-2" />
                  Mine Quantum NFTs
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      case 'spiritual':
        return (
          <Card className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-violet-400" />
                Spiritual Consciousness Expansion
              </CardTitle>
              <CardDescription>Chakra alignment and dimensional awareness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Spiritual Alignment</span>
                    <span className="text-sm font-mono">{Math.round(spiritualAlignment * 100)}%</span>
                  </div>
                  <Progress value={spiritualAlignment * 100} className="h-2" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Badge variant="outline" className="justify-center">
                    <Star className="w-3 h-3 mr-1" />
                    Chakra 7
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    <Moon className="w-3 h-3 mr-1" />
                    Lunar
                  </Badge>
                  <Badge variant="outline" className="justify-center">
                    <Sun className="w-3 h-3 mr-1" />
                    Solar
                  </Badge>
                </div>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600">
                  <Star className="w-4 h-4 mr-2" />
                  Expand Consciousness
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return <BiometricEngine />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  AURA-X Amapiano Studio
                </h1>
                <p className="text-sm text-gray-400">Revolutionary Consciousness-Based Music Creation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-900/20">
                  Level {userStats.level}
                </Badge>
                <Badge variant="outline" className="bg-blue-900/20">
                  {userStats.xp} XP
                </Badge>
              </div>
              <Button size="icon" variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Revolutionary Tabs */}
          <div className="col-span-3 space-y-2">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">REVOLUTIONARY FEATURES</h3>
            {revolutionaryTabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start h-auto p-3 ${
                    activeTab === tab.id 
                      ? `bg-gradient-to-r ${tab.color} text-white` 
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium text-sm">{tab.name}</div>
                      <div className="text-xs opacity-80">{tab.description}</div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Main Content Area */}
          <div className="col-span-6 space-y-6">
            {/* Transport Controls */}
            <TransportControls />
            
            {/* Active Tab Content */}
            {renderTabContent()}
            
            {/* AI Prompt Section */}
            <Card className="bg-gradient-to-r from-gray-900/50 to-black/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  AI Music Generation
                </CardTitle>
                <CardDescription>Describe your musical vision and let AURA-X create</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Create an uplifting Amapiano track with log drums, piano melodies, and saxophone solos that captures the essence of a South African sunrise..."
                  value={emotionalDNA}
                  onChange={(e) => setEmotionalDNA(e.target.value)}
                  className="min-h-[100px] bg-black/20 border-white/20"
                />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Track
                  </Button>
                  <Button variant="outline" size="icon">
                    <Lightbulb className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* User Stats */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Producer Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Level Progress</span>
                    <span>{userStats.xp}/{userStats.xp + userStats.xpToNext}</span>
                  </div>
                  <Progress value={(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-black/20 rounded">
                    <div className="text-lg font-bold text-purple-400">{userStats.tracksCreated}</div>
                    <div className="text-xs text-gray-400">Tracks</div>
                  </div>
                  <div className="p-2 bg-black/20 rounded">
                    <div className="text-lg font-bold text-blue-400">{userStats.achievements}</div>
                    <div className="text-xs text-gray-400">Achievements</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-blue-400" />
                  Recent Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{project.name}</div>
                        <div className="text-xs text-gray-400">{project.tracks} tracks • {project.duration}</div>
                      </div>
                      <div className="text-xs text-gray-500">{project.date}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="p-3 bg-black/20 rounded-lg">
                    <div className="text-sm">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Essentia Quality Monitor */}
            <RealTimeQualityMonitor />

            {/* Cultural Authenticity Validator */}
            <CulturalAuthenticityValidator />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
