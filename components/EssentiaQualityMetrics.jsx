import React, { useState, useEffect } from 'react';

/**
 * Essentia Quality Metrics Component
 * 
 * Displays comprehensive audio quality assessment results from Essentia analysis.
 * Shows overall score, detailed metrics, and recommendations.
 */
const EssentiaQualityMetrics = ({ audioPath, onAnalysisComplete }) => {
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);

  const analyzeQuality = async () => {
    if (!audioPath) {
      setError('No audio file specified');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/essentia/quality-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_path: audioPath })
      });

      const data = await response.json();

      if (data.success) {
        setAssessment(data.assessment);
        if (onAnalysisComplete) {
          onAnalysisComplete(data.assessment);
        }
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(`Failed to analyze audio: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 80) return '#3b82f6'; // blue
    if (score >= 70) return '#f59e0b'; // yellow
    if (score >= 60) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getGradeEmoji = (grade) => {
    if (grade.startsWith('A')) return '🏆';
    if (grade.startsWith('B')) return '⭐';
    if (grade.startsWith('C')) return '👍';
    if (grade.startsWith('D')) return '⚠️';
    return '❌';
  };

  return (
    <div className="essentia-quality-metrics" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      padding: '24px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
          🎵 Audio Quality Assessment
        </h3>
        <button
          onClick={analyzeQuality}
          disabled={loading || !audioPath}
          style={{
            background: loading ? '#64748b' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading || !audioPath ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? '⏳ Analyzing...' : '▶️ Analyze Quality'}
        </button>
      </div>

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

      {assessment && (
        <div>
          {/* Overall Score Card */}
          <div style={{
            background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>
              {getGradeEmoji(assessment.quality_grade)}
            </div>
            <div style={{
              fontSize: '48px',
              fontWeight: '700',
              color: getScoreColor(assessment.overall_score),
              marginBottom: '8px'
            }}>
              {assessment.overall_score}/100
            </div>
            <div style={{ fontSize: '18px', color: '#cbd5e1', fontWeight: '500' }}>
              {assessment.quality_grade}
            </div>
          </div>

          {/* Detailed Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Spectral Quality */}
            <MetricCard
              title="🌈 Spectral Quality"
              score={assessment.spectral_quality.score}
              assessment={assessment.spectral_quality.assessment}
              details={[
                { label: 'Complexity', value: assessment.spectral_quality.complexity.toFixed(3) },
                { label: 'Contrast', value: assessment.spectral_quality.contrast.toFixed(2) }
              ]}
            />

            {/* Harmonic Quality */}
            <MetricCard
              title="🎼 Harmonic Quality"
              score={assessment.harmonic_quality.score}
              assessment={assessment.harmonic_quality.assessment}
              details={[
                { label: 'Inharmonicity', value: assessment.harmonic_quality.inharmonicity.toFixed(3) },
                { label: 'Dissonance', value: assessment.harmonic_quality.dissonance.toFixed(2) }
              ]}
            />

            {/* Dynamic Quality */}
            <MetricCard
              title="📊 Dynamic Quality"
              score={assessment.dynamic_quality.score}
              assessment={assessment.dynamic_quality.assessment}
              details={[
                { label: 'Loudness', value: `${assessment.dynamic_quality.loudness_lufs.toFixed(1)} LUFS` },
                { label: 'Range', value: `${assessment.dynamic_quality.loudness_range_lu.toFixed(1)} LU` }
              ]}
            />

            {/* Artifact Score */}
            <MetricCard
              title="✨ Artifact Detection"
              score={assessment.artifact_score.score}
              assessment={assessment.artifact_score.assessment}
              details={[
                { label: 'Artifact Level', value: assessment.artifact_score.artifact_level },
                { label: 'Spectral Flatness', value: assessment.artifact_score.spectral_flatness.toFixed(3) }
              ]}
            />
          </div>

          {/* Recommendations */}
          {assessment.recommendations && assessment.recommendations.length > 0 && (
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
                {assessment.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', fontSize: '14px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!assessment && !loading && !error && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎵</div>
          <p>Click "Analyze Quality" to assess audio quality using Essentia</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Powered by Essentia 2.1-beta6-dev • 200+ audio analysis algorithms
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Metric Card Component
 * Displays individual quality metric with score and details
 */
const MetricCard = ({ title, score, assessment, details }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      borderRadius: '8px',
      padding: '16px'
    }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1' }}>
        {title}
      </div>
      <div style={{
        fontSize: '32px',
        fontWeight: '700',
        color: getScoreColor(score),
        marginBottom: '8px'
      }}>
        {score.toFixed(1)}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#94a3b8',
        textTransform: 'capitalize',
        marginBottom: '12px'
      }}>
        {assessment.replace(/_/g, ' ')}
      </div>
      {details && details.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '12px' }}>
          {details.map((detail, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#94a3b8',
              marginBottom: '4px'
            }}>
              <span>{detail.label}:</span>
              <span style={{ fontWeight: '500', color: '#cbd5e1' }}>{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EssentiaQualityMetrics;

