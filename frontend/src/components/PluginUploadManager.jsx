import React, { useState, useEffect, useRef } from 'react';

/**
 * Plugin Upload Manager
 * Upload, manage, and deploy plugins directly in the browser
 */
const PluginUploadManager = () => {
  const [plugins, setPlugins] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Get backend URL
  const getBackendUrl = () => {
    return window.location.origin.replace(/:\d+/, ':8000').replace(/^https:\/\/4173-/, 'https://8000-');
  };

  // Load existing plugins on mount
  useEffect(() => {
    loadPlugins();
  }, []);

  // Load plugins from backend
  const loadPlugins = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/plugins/list`);
      if (response.ok) {
        const data = await response.json();
        setPlugins(data.plugins || []);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadPlugin(files[0]);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadPlugin(e.dataTransfer.files[0]);
    }
  };

  // Upload plugin
  const uploadPlugin = async (file) => {
    if (!file.name.endsWith('.js')) {
      setUploadStatus('❌ Error: Only .js files are allowed');
      return;
    }

    setUploading(true);
    setUploadStatus('📤 Uploading plugin...');

    try {
      const formData = new FormData();
      formData.append('plugin', file);

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/plugins/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadStatus(`✅ Plugin "${result.name}" uploaded successfully!`);
      await loadPlugins();
      
      setTimeout(() => {
        setUploading(false);
        setUploadStatus('');
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setUploading(false);
    }
  };

  // Delete plugin
  const deletePlugin = async (pluginId) => {
    if (!confirm(`Delete plugin "${pluginId}"?`)) return;

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/plugins/${pluginId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUploadStatus(`✅ Plugin "${pluginId}" deleted`);
        await loadPlugins();
        setTimeout(() => setUploadStatus(''), 3000);
      }
    } catch (error) {
      console.error('Failed to delete plugin:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">📦 Plugin Upload Manager</h1>
          <p className="text-gray-300">Upload and manage plugins directly in your browser</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Upload Plugin</h2>
              
              {/* Drag & Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-600'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="text-6xl mb-4">📤</div>
                <p className="text-white font-semibold mb-2">Drag & Drop Plugin File</p>
                <p className="text-gray-400 text-sm mb-4">or click to browse</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  disabled={uploading}
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".js"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Status */}
              {uploadStatus && (
                <div className={`mt-4 p-3 rounded ${
                  uploadStatus.startsWith('✅') ? 'bg-green-500 bg-opacity-20 border border-green-500' :
                  uploadStatus.startsWith('❌') ? 'bg-red-500 bg-opacity-20 border border-red-500' :
                  'bg-blue-500 bg-opacity-20 border border-blue-500'
                }`}>
                  <p className="text-sm text-white">{uploadStatus}</p>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 p-4 bg-gray-700 bg-opacity-50 rounded">
                <h3 className="text-lg font-semibold text-white mb-3">📊 Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Plugins:</span>
                    <span className="text-white font-semibold">{plugins.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Enabled:</span>
                    <span className="text-green-400 font-semibold">
                      {plugins.filter(p => p.enabled).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Plugin List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                🎹 Installed Plugins ({plugins.length})
              </h2>

              {plugins.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-gray-400 mb-2">No plugins installed yet</p>
                  <p className="text-sm text-gray-500">Upload your first plugin to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {plugins.map((plugin) => (
                    <div
                      key={plugin.id}
                      className="p-4 rounded-lg border bg-gray-700 bg-opacity-50 border-gray-600"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{plugin.name}</h3>
                            {plugin.enabled && (
                              <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded">
                                ✓ Enabled
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{plugin.description || 'No description'}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>ID: {plugin.id}</span>
                            <span>Size: {(plugin.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>

                        <button
                          onClick={() => deletePlugin(plugin.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginUploadManager;

