/**
 * Sample Browser Component
 * Browse, filter, search, and preview Amapiano samples
 * 
 * Features:
 * - Category filtering (log drums, bass, piano, synth, vocals, FX)
 * - Search functionality
 * - Audio preview with waveform
 * - Drag-and-drop to DAW
 * - Favorites system
 * - BPM and key filtering
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Progress } from '@/components/ui/progress.jsx';
import {
  Search,
  Filter,
  Play,
  Pause,
  Heart,
  Download,
  Music,
  Volume2,
  SkipForward,
  SkipBack,
  X
} from 'lucide-react';

const SampleBrowser = ({ onSampleSelect, onSampleDrop }) => {
  // State management
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBPM, setSelectedBPM] = useState('all');
  const [selectedKey, setSelectedKey] = useState('all');
  const [playingSample, setPlayingSample] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio player ref
  const audioRef = useRef(new Audio());
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  
  // Categories
  const categories = [
    { id: 'all', name: 'All Samples', icon: Music },
    { id: 'log_drum', name: 'Log Drums', icon: Music },
    { id: 'bass', name: 'Bass', icon: Music },
    { id: 'piano', name: 'Piano', icon: Music },
    { id: 'synth', name: 'Synth', icon: Music },
    { id: 'vocals', name: 'Vocals', icon: Music },
    { id: 'fx', name: 'FX', icon: Music }
  ];
  
  // BPM ranges
  const bpmRanges = [
    { id: 'all', label: 'All BPM' },
    { id: '105-110', label: '105-110 BPM' },
    { id: '110-115', label: '110-115 BPM' },
    { id: '115-120', label: '115-120 BPM' },
    { id: '120-125', label: '120-125 BPM' }
  ];
  
  // Musical keys
  const keys = [
    'all', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];
  
  // Load samples on mount
  useEffect(() => {
    loadSamples();
  }, []);
  
  // Filter samples when filters change
  useEffect(() => {
    filterSamples();
  }, [searchQuery, selectedCategory, selectedBPM, selectedKey, samples]);
  
  // Update audio volume
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);
  
  // Audio playback progress
  useEffect(() => {
    const audio = audioRef.current;
    
    const updateProgress = () => {
      if (audio.duration) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      setPlayingSample(null);
      setPlaybackProgress(0);
    });
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.pause();
    };
  }, []);
  
  /**
   * Load samples from API or local storage
   */
  const loadSamples = async () => {
    setIsLoading(true);
    
    try {
      // Mock data - replace with actual API call
      const mockSamples = [
        {
          id: 1,
          name: 'Deep Log Drum 1',
          category: 'log_drum',
          bpm: 115,
          key: 'C',
          duration: 2.5,
          url: '/samples/log_drum_1.wav',
          waveform: generateMockWaveform(),
          tags: ['deep', 'punchy', 'classic']
        },
        {
          id: 2,
          name: 'Amapiano Bass Loop',
          category: 'bass',
          bpm: 118,
          key: 'G',
          duration: 4.0,
          url: '/samples/bass_loop_1.wav',
          waveform: generateMockWaveform(),
          tags: ['groovy', 'deep', 'sub']
        },
        {
          id: 3,
          name: 'Piano Melody 1',
          category: 'piano',
          bpm: 112,
          key: 'A',
          duration: 8.0,
          url: '/samples/piano_1.wav',
          waveform: generateMockWaveform(),
          tags: ['melodic', 'smooth', 'jazzy']
        },
        {
          id: 4,
          name: 'Vocal Chop 1',
          category: 'vocals',
          bpm: 115,
          key: 'C',
          duration: 1.5,
          url: '/samples/vocal_chop_1.wav',
          waveform: generateMockWaveform(),
          tags: ['chopped', 'processed', 'catchy']
        },
        {
          id: 5,
          name: 'Synth Pad Warm',
          category: 'synth',
          bpm: 110,
          key: 'D',
          duration: 16.0,
          url: '/samples/synth_pad_1.wav',
          waveform: generateMockWaveform(),
          tags: ['atmospheric', 'warm', 'lush']
        }
      ];
      
      setSamples(mockSamples);
      setFilteredSamples(mockSamples);
      
    } catch (error) {
      console.error('Failed to load samples:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Filter samples based on current filters
   */
  const filterSamples = () => {
    let filtered = [...samples];
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    // BPM filter
    if (selectedBPM !== 'all') {
      const [min, max] = selectedBPM.split('-').map(Number);
      filtered = filtered.filter(s => s.bpm >= min && s.bpm <= max);
    }
    
    // Key filter
    if (selectedKey !== 'all') {
      filtered = filtered.filter(s => s.key === selectedKey);
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredSamples(filtered);
  };
  
  /**
   * Play/pause sample preview
   */
  const togglePlaySample = (sample) => {
    const audio = audioRef.current;
    
    if (playingSample?.id === sample.id) {
      // Pause current sample
      audio.pause();
      setPlayingSample(null);
    } else {
      // Play new sample
      audio.src = sample.url;
      audio.play();
      setPlayingSample(sample);
    }
  };
  
  /**
   * Toggle favorite
   */
  const toggleFavorite = (sampleId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sampleId)) {
      newFavorites.delete(sampleId);
    } else {
      newFavorites.add(sampleId);
    }
    setFavorites(newFavorites);
  };
  
  /**
   * Handle sample drag start
   */
  const handleDragStart = (e, sample) => {
    e.dataTransfer.setData('application/json', JSON.stringify(sample));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  /**
   * Handle sample selection
   */
  const handleSampleSelect = (sample) => {
    if (onSampleSelect) {
      onSampleSelect(sample);
    }
  };
  
  /**
   * Download sample
   */
  const downloadSample = async (sample) => {
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sample.name}.wav`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  return (
    <div className="sample-browser h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold mb-4">Sample Browser</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              <cat.icon size={16} className="mr-2" />
              {cat.name}
            </Button>
          ))}
        </div>
        
        {/* BPM and Key Filters */}
        <div className="flex gap-4">
          <select
            value={selectedBPM}
            onChange={(e) => setSelectedBPM(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {bpmRanges.map(range => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Keys</option>
            {keys.filter(k => k !== 'all').map(key => (
              <option key={key} value={key}>
                Key: {key}
              </option>
            ))}
          </select>
        </div>
        
        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredSamples.length} samples found
        </div>
      </div>
      
      {/* Sample List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8">Loading samples...</div>
        ) : filteredSamples.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No samples found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSamples.map(sample => (
              <Card
                key={sample.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                draggable
                onDragStart={(e) => handleDragStart(e, sample)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold">{sample.name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{sample.category}</Badge>
                        <Badge variant="outline">{sample.bpm} BPM</Badge>
                        <Badge variant="outline">Key: {sample.key}</Badge>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleFavorite(sample.id)}
                      className="ml-2"
                    >
                      <Heart
                        size={20}
                        className={favorites.has(sample.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                      />
                    </button>
                  </div>
                  
                  {/* Waveform */}
                  <div className="h-16 bg-gray-100 rounded-md mb-2 flex items-end gap-0.5 px-2 py-1">
                    {sample.waveform.map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500 rounded-t"
                        style={{ height: `${height * 100}%` }}
                      />
                    ))}
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePlaySample(sample)}
                    >
                      {playingSample?.id === sample.id ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <Progress value={playingSample?.id === sample.id ? playbackProgress : 0} />
                    </div>
                    
                    <span className="text-sm text-gray-600">
                      {sample.duration.toFixed(1)}s
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadSample(sample)}
                    >
                      <Download size={16} />
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleSampleSelect(sample)}
                    >
                      Add to DAW
                    </Button>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex gap-1 mt-2">
                    {sample.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-200 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Now Playing Bar */}
      {playingSample && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => togglePlaySample(playingSample)}
            >
              <Pause size={16} />
            </Button>
            
            <div className="flex-1">
              <div className="text-sm font-semibold mb-1">
                {playingSample.name}
              </div>
              <Progress value={playbackProgress} />
            </div>
            
            <div className="flex items-center gap-2">
              <Volume2 size={16} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Generate mock waveform data
 */
function generateMockWaveform(samples = 100) {
  return Array.from({ length: samples }, () => Math.random() * 0.8 + 0.2);
}

export default SampleBrowser;

