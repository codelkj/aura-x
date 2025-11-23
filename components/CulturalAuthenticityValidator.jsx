import React, { useState } from 'react';

/**
 * Cultural Authenticity Validator Component
 * 
 * Validates cultural authenticity of Amapiano tracks using Essentia analysis.
 * Shows authenticity score, regional matching, and feature analysis.
 */
const CulturalAuthenticityValidator = ({ audioPath, onValidationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [authenticity, setAuthenticity] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('johannesburg');
  const [error, setError] = useState(null);

  const regions = [
    { id: 'johannesburg', name: 'Johannesburg', emoji: '🏙️' },
    { id: 'pretoria', name: 'Pretoria', emoji: '🏛️' },
    { id: 'durban', name: 'Durban', emoji: '🌊' },
    { id: 'cape_town', name: 'Cape Town', emoji: '🏔️' }
  ];

  const validateAuthenticity = async () => {
    if (!audioPath) {
      setError('No audio file specified');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/essentia/cultural-authenticity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_path: audioPath,
          region: selectedRegion
        })
      });

      const data = await response.json();

      if (data.success) {
        setAuthenticity(data.authenticity);
        if (onValidationComplete) {
          onValidationComplete(data.authenticity);
        }
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (err) {
      setError(`Failed to validate authenticity: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getAuthenticityColor = (score) => {
    if (score >= 0.95) return '#10b981'; // green
    if (score >= 0.90) return '#3b82f6'; // blue
    if (score >= 0.80) return '#f59e0b'; // yellow
    if (score >= 0.70) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getAuthenticityLabel = (score) => {
    if (score >= 0.95) return 'Highly Authentic';
    if (score >= 0.90) return 'Very Authentic';
    if (score >= 0.80) return 'Authentic';
    if (score >= 0.70) return 'Moderately Authentic';
    return 'Low Authenticity';
  };

  return (
    <div className="cultural-authenticity-validator" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '600' }}>
          🎭 Cultural Authenticity Validation
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>
          Validate Amapiano cultural authenticity using Essentia feature analysis
        </p>
      </div>

      {/* Region Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#cbd5e1' }}>
          Target Region
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
          {regions.map(region => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              style={{
                background: selectedRegion === region.id
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                  : 'rgba(30, 41, 59, 0.5)',
                border: selectedRegion === region.id ? '2px solid #a78bfa' : '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{region.emoji}</div>
              {region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Validate Button */}
      <button
        onClick={validateAuthenticity}
        disabled={loading || !audioPath}
        style={{
          width: '100%',
          background: loading ? '#64748b' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading || !audioPath ? 'not-allowed' : 'pointer',
          marginBottom: '20px',
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? '⏳ Validating...' : '🔍 Validate Authenticity'}
      </button>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}

      {authenticity && (
        <div>
          {/* Authenticity Score */}
          <div style={{
            background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              {authenticity.overall_authenticity >= 0.95 ? '🏆' : authenticity.overall_authenticity >= 0.90 ? '⭐' : authenticity.overall_authenticity >= 0.80 ? '✨' : '👍'}
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: getAuthenticityColor(authenticity.overall_authenticity),
              marginBottom: '8px'
            }}>
              {(authenticity.overall_authenticity * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '18px', color: '#cbd5e1', fontWeight: '500', marginBottom: '8px' }}>
              {getAuthenticityLabel(authenticity.overall_authenticity)}
            </div>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              Confidence: {(authenticity.confidence * 100).toFixed(1)}% • Region: {authenticity.region_match}
            </div>
          </div>

          {/* Feature Analysis */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#cbd5e1' }}>
              📊 Feature Analysis
            </h4>

            {/* Rhythm Patterns */}
            <FeatureGroup
              title="🥁 Rhythm Patterns"
              features={authenticity.feature_analysis.rhythm_patterns}
            />

            {/* Tonal Characteristics */}
            <FeatureGroup
              title="🎹 Tonal Characteristics"
              features={authenticity.feature_analysis.tonal_characteristics}
            />

            {/* Production Style */}
            <FeatureGroup
              title="🎚️ Production Style"
              features={authenticity.feature_analysis.production_style}
            />
          </div>

          {/* Recommendations */}
          {authenticity.recommendations && authenticity.recommendations.length > 0 && (
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#a78bfa' }}>
                💡 Recommendations
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1' }}>
                {authenticity.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', fontSize: '14px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!authenticity && !loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
          <p>Select a region and click "Validate Authenticity" to analyze cultural authenticity</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Powered by Essentia 2.1-beta6-dev • Expert-validated cultural analysis
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Feature Group Component
 * Displays a group of related features with progress bars
 */
const FeatureGroup = ({ title, features }) => {
  const getFeatureColor = (score) => {
    if (score >= 0.90) return '#10b981';
    if (score >= 0.80) return '#3b82f6';
    if (score >= 0.70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px'
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1' }}>
        {title}
      </div>
      {Object.entries(features).map(([key, value]) => (
        <div key={key} style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
            <span style={{ fontWeight: '600', color: getFeatureColor(value) }}>
              {(value * 100).toFixed(1)}%
            </span>
          </div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '4px',
            height: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: getFeatureColor(value),
              width: `${value * 100}%`,
              height: '100%',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CulturalAuthenticityValidator;

