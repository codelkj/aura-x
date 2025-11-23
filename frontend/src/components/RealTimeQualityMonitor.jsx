import React, { useState, useEffect, useRef } from 'react';

/**
 * Real-Time Quality Monitor Component
 * 
 * Monitors audio quality in real-time during generation/playback.
 * Shows live metrics, alerts, and performance indicators.
 */
const RealTimeQualityMonitor = ({ isActive, audioSource, updateInterval = 1000 }) => {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && audioSource) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => stopMonitoring();
  }, [isActive, audioSource]);

  const startMonitoring = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start periodic monitoring
    intervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:3000/api/essentia/quality-assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio_path: audioSource })
        });

        const data = await response.json();

        if (data.success) {
          const newMetrics = {
            timestamp: Date.now(),
            overall_score: data.assessment.overall_score,
            spectral: data.assessment.spectral_quality.score,
            harmonic: data.assessment.harmonic_quality.score,
            dynamic: data.assessment.dynamic_quality.score,
            artifacts: data.assessment.artifact_score.score
          };

          setMetrics(newMetrics);

          // Update history (keep last 30 data points)
          setHistory(prev => [...prev.slice(-29), newMetrics]);

          // Check for alerts
          checkAlerts(data.assessment);
        }
      } catch (err) {
        console.error('Monitoring error:', err);
      }
    }, updateInterval);
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const checkAlerts = (assessment) => {
    const newAlerts = [];

    if (assessment.overall_score < 70) {
      newAlerts.push({
        id: Date.now(),
        level: 'warning',
        message: 'Overall quality below threshold (70)',
        timestamp: Date.now()
      });
    }

    if (assessment.artifact_score.score < 80) {
      newAlerts.push({
        id: Date.now() + 1,
        level: 'error',
        message: 'High artifact level detected',
        timestamp: Date.now()
      });
    }

    if (assessment.dynamic_quality.loudness_lufs < -23 || assessment.dynamic_quality.loudness_lufs > -13) {
      newAlerts.push({
        id: Date.now() + 2,
        level: 'info',
        message: 'Loudness outside recommended range (-23 to -13 LUFS)',
        timestamp: Date.now()
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 10)); // Keep last 10 alerts
    }
  };

  const getStatusColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const getAlertColor = (level) => {
    if (level === 'error') return '#ef4444';
    if (level === 'warning') return '#f59e0b';
    return '#3b82f6';
  };

  return (
    <div className="realtime-quality-monitor" style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      padding: '20px',
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
          📡 Real-Time Quality Monitor
        </h4>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isActive ? '#10b981' : '#64748b',
            animation: isActive ? 'pulse 2s infinite' : 'none'
          }} />
          {isActive ? 'Monitoring Active' : 'Monitoring Paused'}
        </div>
      </div>

      {metrics ? (
        <div>
          {/* Current Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <MetricCard
              label="Overall"
              value={metrics.overall_score}
              unit="/100"
              color={getStatusColor(metrics.overall_score)}
            />
            <MetricCard
              label="Spectral"
              value={metrics.spectral}
              unit="/100"
              color={getStatusColor(metrics.spectral)}
            />
            <MetricCard
              label="Harmonic"
              value={metrics.harmonic}
              unit="/100"
              color={getStatusColor(metrics.harmonic)}
            />
            <MetricCard
              label="Dynamic"
              value={metrics.dynamic}
              unit="/100"
              color={getStatusColor(metrics.dynamic)}
            />
            <MetricCard
              label="Artifacts"
              value={metrics.artifacts}
              unit="/100"
              color={getStatusColor(metrics.artifacts)}
            />
          </div>

          {/* Historical Chart */}
          {history.length > 1 && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1' }}>
                📈 Quality Trend (Last {history.length} samples)
              </div>
              <MiniChart data={history} />
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#cbd5e1' }}>
                🚨 Recent Alerts
              </div>
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      marginBottom: '8px',
                      background: `${getAlertColor(alert.level)}20`,
                      border: `1px solid ${getAlertColor(alert.level)}40`,
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: getAlertColor(alert.level),
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1, color: '#cbd5e1' }}>{alert.message}</div>
                    <div style={{ color: '#64748b', fontSize: '10px' }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📡</div>
          <p>{isActive ? 'Waiting for audio data...' : 'Start monitoring to see real-time metrics'}</p>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

/**
 * Metric Card Component
 */
const MetricCard = ({ label, value, unit, color }) => (
  <div style={{
    background: 'rgba(30, 41, 59, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ fontSize: '20px', fontWeight: '700', color, marginBottom: '2px' }}>
      {value.toFixed(1)}
    </div>
    <div style={{ fontSize: '10px', color: '#64748b' }}>
      {unit}
    </div>
  </div>
);

/**
 * Mini Chart Component
 * Displays a simple line chart of historical data
 */
const MiniChart = ({ data }) => {
  const width = 100;
  const height = 60;
  const padding = 5;

  // Calculate min/max for scaling
  const values = data.map(d => d.overall_score);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  // Generate SVG path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
    const y = height - padding - ((d.overall_score - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - padding - ((d.overall_score - min) / range) * (height - 2 * padding);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill="#a78bfa"
          />
        );
      })}
    </svg>
  );
};

export default RealTimeQualityMonitor;

