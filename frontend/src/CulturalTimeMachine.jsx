import React, { useState } from 'react';
import { Clock, Music, Play, Star } from 'lucide-react';

const CulturalTimeMachine = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1920s');
  const [selectedRegion, setSelectedRegion] = useState('Johannesburg');

  const historicalPeriods = {
    '1920s': {
      title: 'Jazz Fusion Era',
      years: '1920-1929',
      description: 'Marabi music emergence, jazz influences, and urban township sounds',
      color: '#DAA520',
      authenticity: 94.7
    },
    '1950s': {
      title: 'Kwela & Pennywhistle',
      years: '1950-1959',
      description: 'Kwela music boom, pennywhistle jive, and street corner harmonies',
      color: '#4169E1',
      authenticity: 92.3
    },
    '1980s': {
      title: 'Bubblegum Pop Era',
      years: '1980-1989',
      description: 'Electronic sounds, synthesizers, and dance floor hits',
      color: '#FF1493',
      authenticity: 89.5
    },
    '2000s': {
      title: 'Kwaito Revolution',
      years: '2000-2009',
      description: 'Post-apartheid urban sound, slow tempo house music',
      color: '#32CD32',
      authenticity: 91.8
    },
    '2010s': {
      title: 'Amapiano Birth',
      years: '2010-2019',
      description: 'The birth of Amapiano - deep house, jazz, and lounge fusion',
      color: '#9370DB',
      authenticity: 96.2
    }
  };

  const regions = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-10 h-10 text-amber-400" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Cultural Time Machine
            </h1>
            <p className="text-gray-400 mt-1">Journey through South African music history</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Period Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Music className="w-6 h-6 text-purple-400" />
              Select Historical Period
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(historicalPeriods).map(([period, data]) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedPeriod === period
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                  }`}
                  style={{
                    borderLeftColor: selectedPeriod === period ? data.color : undefined,
                    borderLeftWidth: selectedPeriod === period ? '4px' : undefined
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{data.title}</h3>
                      <p className="text-sm text-gray-400">{data.years}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{data.authenticity}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{data.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Period Details */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">
              {historicalPeriods[selectedPeriod].title} Details
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Time Period</p>
                  <p className="text-lg font-semibold">{historicalPeriods[selectedPeriod].years}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Authenticity Score</p>
                  <p className="text-lg font-semibold text-green-400">
                    {historicalPeriods[selectedPeriod].authenticity}%
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-gray-200">{historicalPeriods[selectedPeriod].description}</p>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all">
                <Play className="w-5 h-5" />
                Generate {selectedPeriod} Track
              </button>
            </div>
          </div>
        </div>

        {/* Region Selection & Settings */}
        <div className="space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Regional Style</h3>
            
            <div className="space-y-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedRegion === region
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Historical Accuracy</span>
                  <span className="text-green-400 font-semibold">
                    {historicalPeriods[selectedPeriod].authenticity}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${historicalPeriods[selectedPeriod].authenticity}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Cultural Authenticity</span>
                  <span className="text-purple-400 font-semibold">95%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full w-[95%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">AI Confidence</span>
                  <span className="text-blue-400 font-semibold">98%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-[98%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30">
            <h3 className="text-lg font-bold mb-2 text-amber-400">✨ Premium Feature</h3>
            <p className="text-sm text-gray-300 mb-4">
              Unlock advanced historical recreation with custom instrumentation and authentic vocal styles.
            </p>
            <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-all">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalTimeMachine;

