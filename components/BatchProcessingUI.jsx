import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Upload, Play, Pause, CheckCircle, XCircle, Clock, FileAudio, Download } from 'lucide-react'

const BatchProcessingUI = () => {
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFile, setCurrentFile] = useState(0)

  // Sample batch processing data
  const [batchJobs] = useState([
    {
      id: 'batch_001',
      name: 'Library Quality Analysis',
      filesCount: 127,
      completed: 127,
      status: 'completed',
      avgQuality: 87.3,
      startTime: '2024-10-31 14:23',
      duration: '8m 34s'
    },
    {
      id: 'batch_002',
      name: 'Cultural Validation Batch',
      filesCount: 45,
      completed: 32,
      status: 'processing',
      avgQuality: 91.2,
      startTime: '2024-10-31 15:12',
      duration: '4m 12s'
    },
    {
      id: 'batch_003',
      name: 'Stem Separation Queue',
      filesCount: 89,
      completed: 0,
      status: 'queued',
      avgQuality: 0,
      startTime: '-',
      duration: '-'
    }
  ])

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files)
    setFiles(uploadedFiles.map((file, idx) => ({
      id: `file_${idx}`,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      status: 'pending',
      progress: 0,
      quality: null
    })))
  }

  const startBatchProcessing = () => {
    setIsProcessing(true)
    setCurrentFile(0)
    
    // Simulate batch processing
    const interval = setInterval(() => {
      setCurrentFile(prev => {
        if (prev >= files.length - 1) {
          clearInterval(interval)
          setIsProcessing(false)
          return prev
        }
        
        // Update current file status
        setFiles(prevFiles => prevFiles.map((file, idx) => {
          if (idx === prev) {
            return { ...file, status: 'completed', progress: 100, quality: 85 + Math.random() * 10 }
          }
          if (idx === prev + 1) {
            return { ...file, status: 'processing', progress: 0 }
          }
          return file
        }))
        
        return prev + 1
      })
    }, 2000)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-400 animate-spin" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <FileAudio className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/20 border-green-500/30'
      case 'processing':
        return 'bg-blue-900/20 border-blue-500/30'
      case 'queued':
        return 'bg-yellow-900/20 border-yellow-500/30'
      default:
        return 'bg-gray-900/20 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Batch Processing
          </CardTitle>
          <CardDescription>
            Process multiple tracks for quality analysis, cultural validation, or stem separation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-3">
            <label className="block">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-300 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">WAV, MP3, FLAC (max 100 files)</p>
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </label>
          </div>

          {/* Processing Options */}
          {files.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Processing Options</label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  Quality Analysis
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Cultural Validation
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Stem Separation
                </Button>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <div key={file.id} className="p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getStatusIcon(file.status)}
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{file.size}</span>
                      {file.quality && (
                        <Badge variant="outline" className="text-xs">
                          {file.quality.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  {file.status === 'processing' && (
                    <Progress value={file.progress} className="h-1" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Control Buttons */}
          {files.length > 0 && (
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                onClick={startBatchProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Batch
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            </div>
          )}

          {/* Progress Summary */}
          {isProcessing && (
            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{currentFile + 1} / {files.length} files</span>
              </div>
              <Progress value={((currentFile + 1) / files.length) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Job History */}
      <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Batch Job History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {batchJobs.map((job) => (
            <div key={job.id} className={`p-4 rounded-lg border ${getStatusColor(job.status)}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">{job.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {job.filesCount} files • Started {job.startTime}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {job.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <div className="text-xs text-gray-400">Progress</div>
                  <div className="text-sm font-mono">{job.completed}/{job.filesCount}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Avg Quality</div>
                  <div className="text-sm font-mono">{job.avgQuality.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Duration</div>
                  <div className="text-sm font-mono">{job.duration}</div>
                </div>
              </div>
              
              {job.status === 'processing' && (
                <Progress value={(job.completed / job.filesCount) * 100} className="h-1 mt-3" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default BatchProcessingUI

