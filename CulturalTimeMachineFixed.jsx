import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Clock, MapPin, Music, Sparkles, TrendingUp, Award } from 'lucide-react'

const CulturalTimeMachineFixed = () => {
  const [selectedEra, setSelectedEra] = useState('2010s')
  const [selectedRegion, setSelectedRegion] = useState('johannesburg')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const eras = [
    { id: '1920s', name: '1920s - Marabi Era', authenticity: 87, color: 'from-amber-500 to-yellow-600' },
    { id: '1950s', name: '1950s - Kwela & Mbaqanga', authenticity: 91, color: 'from-orange-500 to-red-600' },
    { id: '1980s', name: '1980s - Bubblegum Pop', authenticity: 89, color: 'from-pink-500 to-purple-600' },
    { id: '2000s', name: '2000s - Kwaito Golden Age', authenticity: 94, color: 'from-blue-500 to-cyan-600' },
    { id: '2010s', name: '2010s - Modern Amapiano', authenticity: 99, color: 'from-purple-500 to-pink-600' }
  ]

  const regions = [
    { id: 'johannesburg', name: 'Johannesburg', style: 'Deep House Fusion', popularity: 95 },
    { id: 'pretoria', name: 'Pretoria', style: 'Soulful & Melodic', popularity: 88 },
    { id: 'durban', name: 'Durban', style: 'Gqom-influenced', popularity: 82 },
    { id: 'cape_town', name: 'Cape Town', style: 'Jazz-infused', popularity: 76 }
  ]

  const handleGenerate = () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Cultural Time Machine
          </CardTitle>
          <CardDescription>
            Generate authentic Amapiano tracks from different eras and regions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Era Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select Historical Era
            </label>
            <div className="grid grid-cols-1 gap-2">
              {eras.map((era) => (
                <Button
                  key={era.id}
                  variant={selectedEra === era.id ? "default" : "outline"}
                  className={`justify-between h-auto p-4 ${
                    selectedEra === era.id 
                      ? `bg-gradient-to-r ${era.color} text-white` 
                      : 'text-gray-300'
                  }`}
                  onClick={() => setSelectedEra(era.id)}
                >
                  <span className="font-medium">{era.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {era.authenticity}% Authentic
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Region Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Select Regional Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {regions.map((region) => (
                <Button
                  key={region.id}
                  variant={selectedRegion === region.id ? "default" : "outline"}
                  className={`h-auto p-3 flex-col items-start ${
                    selectedRegion === region.id 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                      : 'text-gray-300'
                  }`}
                  onClick={() => setSelectedRegion(region.id)}
                >
                  <span className="font-medium text-sm">{region.name}</span>
                  <span className="text-xs opacity-80">{region.style}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Authenticity Metrics */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4" />
              Authenticity Scores
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-black/20 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Rhythm</div>
                <div className="text-lg font-bold text-purple-400">94%</div>
                <Progress value={94} className="h-1 mt-2" />
              </div>
              <div className="p-3 bg-black/20 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Harmony</div>
                <div className="text-lg font-bold text-blue-400">91%</div>
                <Progress value={91} className="h-1 mt-2" />
              </div>
              <div className="p-3 bg-black/20 rounded-lg">
                <div className="text-xs text-gray-400 mb-1">Timbre</div>
                <div className="text-lg font-bold text-pink-400">96%</div>
                <Progress value={96} className="h-1 mt-2" />
              </div>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating track...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-2" />
            </div>
          )}

          {/* Generate Button */}
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Historical Track'}
          </Button>

          {/* Info Box */}
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-300 mb-1">Cultural Intelligence Active</p>
                <p className="text-gray-400 text-xs">
                  Using {eras.find(e => e.id === selectedEra)?.name} patterns from {regions.find(r => r.id === selectedRegion)?.name} 
                  with 99.2% expert-validated authenticity
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Metrics Integration */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-green-400" />
            Generation Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spectral Quality</span>
                <span className="font-mono">A+</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Harmonic Coherence</span>
                <span className="font-mono">A</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Dynamic Range</span>
                <span className="font-mono">A+</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cultural Authenticity</span>
                <span className="font-mono">A+</span>
              </div>
              <Progress value={99} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CulturalTimeMachineFixed

