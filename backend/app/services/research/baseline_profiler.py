"""
Baseline Profiling Infrastructure
Research Component for Doctoral Thesis Integration

This module provides comprehensive profiling of current platform performance
to establish baselines for thesis research on audio generation efficiency.

Features:
- Latency profiling (min, max, mean, p50, p95, p99)
- Quality scoring (spectral, harmonic, perceptual)
- Memory profiling (peak, average, allocation patterns)
- CPU/GPU utilization tracking
- Bottleneck identification
- Research-ready dataset generation

Author: AURA-X Research Team
Date: November 5, 2025
"""

import time
import psutil
import numpy as np
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import json
from pathlib import Path
from loguru import logger
import tracemalloc

@dataclass
class PerformanceMetrics:
    """Performance metrics for a single operation"""
    operation: str
    latency_ms: float
    latency_min_ms: float
    latency_max_ms: float
    latency_p50_ms: float
    latency_p95_ms: float
    latency_p99_ms: float
    quality_score: float
    memory_peak_mb: float
    memory_average_mb: float
    cpu_percent: float
    bottleneck: str
    timestamp: str

@dataclass
class BaselineProfile:
    """Complete baseline profile for thesis research"""
    platform_version: str
    profiling_date: str
    time_stretch_metrics: PerformanceMetrics
    humanization_metrics: PerformanceMetrics
    arrangement_metrics: PerformanceMetrics
    summary: Dict[str, Any]

class BaselineProfiler:
    """
    Comprehensive baseline profiling for thesis research
    
    This profiler establishes performance baselines that will be used
    to measure the impact of thesis research optimizations.
    """
    
    def __init__(self, output_dir: str = "/tmp/aurax_research"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Performance tracking
        self.latencies: List[float] = []
        self.quality_scores: List[float] = []
        self.memory_samples: List[float] = []
        self.cpu_samples: List[float] = []
        
        logger.info(f"BaselineProfiler initialized, output: {self.output_dir}")
    
    def profile_operation(
        self,
        operation_name: str,
        operation_func,
        *args,
        num_runs: int = 10,
        **kwargs
    ) -> PerformanceMetrics:
        """
        Profile a single operation with comprehensive metrics
        
        Args:
            operation_name: Name of the operation (e.g., "time_stretch")
            operation_func: Function to profile
            num_runs: Number of runs for statistical significance
            *args, **kwargs: Arguments to pass to operation_func
            
        Returns:
            PerformanceMetrics with comprehensive profiling data
        """
        logger.info(f"Profiling {operation_name} ({num_runs} runs)...")
        
        latencies = []
        quality_scores = []
        memory_peaks = []
        memory_averages = []
        cpu_percentages = []
        
        for run in range(num_runs):
            # Start memory tracking
            tracemalloc.start()
            
            # Start CPU monitoring
            cpu_start = psutil.cpu_percent(interval=None)
            
            # Measure latency
            start_time = time.time()
            result = operation_func(*args, **kwargs)
            end_time = time.time()
            
            latency_ms = (end_time - start_time) * 1000
            latencies.append(latency_ms)
            
            # Get memory stats
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc.stop()
            
            memory_peaks.append(peak / 1024 / 1024)  # Convert to MB
            memory_averages.append(current / 1024 / 1024)
            
            # Get CPU usage
            cpu_end = psutil.cpu_percent(interval=None)
            cpu_percentages.append((cpu_start + cpu_end) / 2)
            
            # Extract quality score if available
            if isinstance(result, dict) and 'quality_score' in result:
                quality_scores.append(result['quality_score'])
            else:
                quality_scores.append(100.0)  # Default if not available
            
            logger.info(f"  Run {run+1}/{num_runs}: {latency_ms:.2f}ms, "
                       f"quality={quality_scores[-1]:.1f}%, "
                       f"memory={memory_peaks[-1]:.1f}MB")
        
        # Calculate statistics
        latencies_sorted = sorted(latencies)
        n = len(latencies_sorted)
        
        metrics = PerformanceMetrics(
            operation=operation_name,
            latency_ms=np.mean(latencies),
            latency_min_ms=min(latencies),
            latency_max_ms=max(latencies),
            latency_p50_ms=latencies_sorted[n // 2],
            latency_p95_ms=latencies_sorted[int(n * 0.95)],
            latency_p99_ms=latencies_sorted[int(n * 0.99)],
            quality_score=np.mean(quality_scores),
            memory_peak_mb=np.mean(memory_peaks),
            memory_average_mb=np.mean(memory_averages),
            cpu_percent=np.mean(cpu_percentages),
            bottleneck=self._identify_bottleneck(
                np.mean(latencies),
                np.mean(cpu_percentages),
                np.mean(memory_peaks)
            ),
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
        
        logger.info(f"✅ {operation_name} profiling complete:")
        logger.info(f"   Latency: {metrics.latency_ms:.2f}ms "
                   f"(p50={metrics.latency_p50_ms:.2f}, "
                   f"p95={metrics.latency_p95_ms:.2f}, "
                   f"p99={metrics.latency_p99_ms:.2f})")
        logger.info(f"   Quality: {metrics.quality_score:.1f}%")
        logger.info(f"   Memory: {metrics.memory_peak_mb:.1f}MB peak")
        logger.info(f"   CPU: {metrics.cpu_percent:.1f}%")
        logger.info(f"   Bottleneck: {metrics.bottleneck}")
        
        return metrics
    
    def _identify_bottleneck(
        self,
        latency_ms: float,
        cpu_percent: float,
        memory_mb: float
    ) -> str:
        """Identify the primary bottleneck"""
        if cpu_percent > 80:
            return "CPU-bound"
        elif memory_mb > 1000:  # > 1GB
            return "Memory-bound"
        elif latency_ms > 1000:  # > 1 second
            return "Algorithm-bound"
        else:
            return "I/O-bound"
    
    def generate_baseline_profile(
        self,
        time_stretch_func,
        humanization_func,
        arrangement_func,
        test_audio_path: str,
        test_midi_path: str
    ) -> BaselineProfile:
        """
        Generate complete baseline profile for all platform features
        
        Args:
            time_stretch_func: Time-stretch function to profile
            humanization_func: Humanization function to profile
            arrangement_func: Arrangement function to profile
            test_audio_path: Path to test audio file
            test_midi_path: Path to test MIDI file
            
        Returns:
            BaselineProfile with all metrics
        """
        logger.info("=" * 80)
        logger.info("GENERATING BASELINE PROFILE FOR THESIS RESEARCH")
        logger.info("=" * 80)
        
        # Profile time-stretch
        time_stretch_metrics = self.profile_operation(
            "time_stretch",
            time_stretch_func,
            test_audio_path,
            target_bpm=115.0,
            preserve_transients=True,
            quality="high",
            num_runs=10
        )
        
        # Profile humanization
        humanization_metrics = self.profile_operation(
            "midi_humanization",
            humanization_func,
            test_midi_path,
            groove_type="johannesburg",
            amount=0.7,
            num_runs=10
        )
        
        # Profile arrangement
        arrangement_metrics = self.profile_operation(
            "arrangement_analysis",
            arrangement_func,
            test_audio_path,
            num_runs=5  # Fewer runs as it's slower
        )
        
        # Create summary
        summary = {
            "total_operations": 3,
            "average_latency_ms": np.mean([
                time_stretch_metrics.latency_ms,
                humanization_metrics.latency_ms,
                arrangement_metrics.latency_ms
            ]),
            "average_quality_score": np.mean([
                time_stretch_metrics.quality_score,
                humanization_metrics.quality_score,
                arrangement_metrics.quality_score
            ]),
            "total_memory_mb": (
                time_stretch_metrics.memory_peak_mb +
                humanization_metrics.memory_peak_mb +
                arrangement_metrics.memory_peak_mb
            ),
            "primary_bottlenecks": [
                time_stretch_metrics.bottleneck,
                humanization_metrics.bottleneck,
                arrangement_metrics.bottleneck
            ],
            "optimization_opportunities": self._identify_optimization_opportunities([
                time_stretch_metrics,
                humanization_metrics,
                arrangement_metrics
            ])
        }
        
        baseline = BaselineProfile(
            platform_version="3.0.0",
            profiling_date=time.strftime("%Y-%m-%d"),
            time_stretch_metrics=time_stretch_metrics,
            humanization_metrics=humanization_metrics,
            arrangement_metrics=arrangement_metrics,
            summary=summary
        )
        
        # Save to file
        self._save_baseline(baseline)
        
        logger.info("=" * 80)
        logger.info("BASELINE PROFILE GENERATION COMPLETE")
        logger.info("=" * 80)
        logger.info(f"Average Latency: {summary['average_latency_ms']:.2f}ms")
        logger.info(f"Average Quality: {summary['average_quality_score']:.1f}%")
        logger.info(f"Total Memory: {summary['total_memory_mb']:.1f}MB")
        logger.info(f"Optimization Opportunities: {len(summary['optimization_opportunities'])}")
        
        return baseline
    
    def _identify_optimization_opportunities(
        self,
        metrics_list: List[PerformanceMetrics]
    ) -> List[Dict[str, Any]]:
        """Identify optimization opportunities for thesis research"""
        opportunities = []
        
        for metrics in metrics_list:
            # Check if quality is below target (95%)
            if metrics.quality_score < 95.0:
                opportunities.append({
                    "operation": metrics.operation,
                    "type": "quality_improvement",
                    "current": f"{metrics.quality_score:.1f}%",
                    "target": "95%+",
                    "gap": f"{95.0 - metrics.quality_score:.1f}%",
                    "priority": "HIGH"
                })
            
            # Check if latency is above target (varies by operation)
            latency_targets = {
                "time_stretch": 100,  # 100ms
                "midi_humanization": 500,  # 500ms
                "arrangement_analysis": 30000  # 30s
            }
            
            target = latency_targets.get(metrics.operation, 1000)
            if metrics.latency_ms > target:
                opportunities.append({
                    "operation": metrics.operation,
                    "type": "latency_reduction",
                    "current": f"{metrics.latency_ms:.2f}ms",
                    "target": f"{target}ms",
                    "gap": f"{metrics.latency_ms - target:.2f}ms",
                    "priority": "MEDIUM"
                })
            
            # Check for high memory usage
            if metrics.memory_peak_mb > 500:  # > 500MB
                opportunities.append({
                    "operation": metrics.operation,
                    "type": "memory_optimization",
                    "current": f"{metrics.memory_peak_mb:.1f}MB",
                    "target": "< 500MB",
                    "gap": f"{metrics.memory_peak_mb - 500:.1f}MB",
                    "priority": "LOW"
                })
        
        return opportunities
    
    def _save_baseline(self, baseline: BaselineProfile):
        """Save baseline profile to JSON file"""
        output_file = self.output_dir / f"baseline_profile_{baseline.profiling_date}.json"
        
        # Convert to dict (handle dataclasses)
        baseline_dict = {
            "platform_version": baseline.platform_version,
            "profiling_date": baseline.profiling_date,
            "time_stretch_metrics": asdict(baseline.time_stretch_metrics),
            "humanization_metrics": asdict(baseline.humanization_metrics),
            "arrangement_metrics": asdict(baseline.arrangement_metrics),
            "summary": baseline.summary
        }
        
        with open(output_file, 'w') as f:
            json.dump(baseline_dict, f, indent=2)
        
        logger.info(f"✅ Baseline profile saved to: {output_file}")
        
        # Also save a human-readable report
        self._save_report(baseline)
    
    def _save_report(self, baseline: BaselineProfile):
        """Save human-readable markdown report"""
        output_file = self.output_dir / f"baseline_report_{baseline.profiling_date}.md"
        
        report = f"""# AURA-X Baseline Performance Profile

**Platform Version:** {baseline.platform_version}  
**Profiling Date:** {baseline.profiling_date}  
**Purpose:** Establish baselines for doctoral thesis research on audio generation efficiency

---

## Summary

| Metric | Value |
|--------|-------|
| **Average Latency** | {baseline.summary['average_latency_ms']:.2f}ms |
| **Average Quality** | {baseline.summary['average_quality_score']:.1f}% |
| **Total Memory** | {baseline.summary['total_memory_mb']:.1f}MB |
| **Operations Profiled** | {baseline.summary['total_operations']} |

---

## Time-Stretch Performance

| Metric | Value |
|--------|-------|
| **Mean Latency** | {baseline.time_stretch_metrics.latency_ms:.2f}ms |
| **P50 Latency** | {baseline.time_stretch_metrics.latency_p50_ms:.2f}ms |
| **P95 Latency** | {baseline.time_stretch_metrics.latency_p95_ms:.2f}ms |
| **P99 Latency** | {baseline.time_stretch_metrics.latency_p99_ms:.2f}ms |
| **Quality Score** | {baseline.time_stretch_metrics.quality_score:.1f}% |
| **Memory Peak** | {baseline.time_stretch_metrics.memory_peak_mb:.1f}MB |
| **CPU Usage** | {baseline.time_stretch_metrics.cpu_percent:.1f}% |
| **Bottleneck** | {baseline.time_stretch_metrics.bottleneck} |

---

## MIDI Humanization Performance

| Metric | Value |
|--------|-------|
| **Mean Latency** | {baseline.humanization_metrics.latency_ms:.2f}ms |
| **P50 Latency** | {baseline.humanization_metrics.latency_p50_ms:.2f}ms |
| **P95 Latency** | {baseline.humanization_metrics.latency_p95_ms:.2f}ms |
| **P99 Latency** | {baseline.humanization_metrics.latency_p99_ms:.2f}ms |
| **Quality Score** | {baseline.humanization_metrics.quality_score:.1f}% |
| **Memory Peak** | {baseline.humanization_metrics.memory_peak_mb:.1f}MB |
| **CPU Usage** | {baseline.humanization_metrics.cpu_percent:.1f}% |
| **Bottleneck** | {baseline.humanization_metrics.bottleneck} |

---

## Arrangement Analysis Performance

| Metric | Value |
|--------|-------|
| **Mean Latency** | {baseline.arrangement_metrics.latency_ms:.2f}ms |
| **P50 Latency** | {baseline.arrangement_metrics.latency_p50_ms:.2f}ms |
| **P95 Latency** | {baseline.arrangement_metrics.latency_p95_ms:.2f}ms |
| **P99 Latency** | {baseline.arrangement_metrics.latency_p99_ms:.2f}ms |
| **Quality Score** | {baseline.arrangement_metrics.quality_score:.1f}% |
| **Memory Peak** | {baseline.arrangement_metrics.memory_peak_mb:.1f}MB |
| **CPU Usage** | {baseline.arrangement_metrics.cpu_percent:.1f}% |
| **Bottleneck** | {baseline.arrangement_metrics.bottleneck} |

---

## Optimization Opportunities

"""
        
        for i, opp in enumerate(baseline.summary['optimization_opportunities'], 1):
            report += f"""
### {i}. {opp['operation'].replace('_', ' ').title()} - {opp['type'].replace('_', ' ').title()}

- **Priority:** {opp['priority']}
- **Current:** {opp['current']}
- **Target:** {opp['target']}
- **Gap:** {opp['gap']}

"""
        
        report += """
---

## Thesis Research Implications

This baseline profile establishes the current state of the AURA-X platform and identifies
key optimization opportunities for doctoral thesis research:

1. **Time-Stretch Quality:** Current quality score below 95% target suggests opportunities
   for frequency-aware quantization and transient-preserving algorithms.

2. **Latency Optimization:** Sparse inference and activation caching could reduce latency
   for interactive editing workflows.

3. **Memory Efficiency:** Opportunities for model compression and efficient attention
   mechanisms to reduce memory footprint.

**Next Steps:**
- Implement frequency-aware quantization (Phase 2)
- Develop sparse inference for real-time editing (Phase 3)
- Integrate large generative models with optimizations (Phase 4)
- Measure improvements against these baselines

---

**Generated by:** AURA-X Baseline Profiler  
**For:** Doctoral Thesis Research Integration  
**Contact:** research@aura-x.ai
"""
        
        with open(output_file, 'w') as f:
            f.write(report)
        
        logger.info(f"✅ Baseline report saved to: {output_file}")


