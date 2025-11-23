"""
Real Batch Stem Processor
Processes multiple Amapiano samples through REAL stem separation
"""

import json
import time
from pathlib import Path
from typing import List, Dict
import logging
from datetime import datetime

from .real_stem_separator import RealStemSeparator
from .stem_quality_analyzer import StemQualityAnalyzer
from .stem_export_manager import StemExportManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RealBatchStemProcessor:
    """
    Batch processor for REAL stem separation of multiple audio samples.
    This version actually processes audio files - no simulation!
    """
    
    def __init__(self, output_base_dir: str = "/home/ubuntu/doctoral_thesis_stem_analysis_REAL"):
        self.output_base_dir = Path(output_base_dir)
        self.separator = RealStemSeparator()
        self.analyzer = StemQualityAnalyzer()
        self.exporter = StemExportManager(str(self.output_base_dir))
        
    def process_batch(self, sample_paths: List[str]) -> Dict:
        """
        Process a batch of audio samples through REAL stem separation.
        
        Args:
            sample_paths: List of paths to audio samples
            
        Returns:
            Dictionary containing batch processing results with REAL metrics
        """
        logger.info(f"Starting REAL batch processing of {len(sample_paths)} samples")
        start_time = time.time()
        
        # Create timestamped output directory
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        batch_dir = self.output_base_dir / f"batch_{timestamp}"
        batch_dir.mkdir(parents=True, exist_ok=True)
        
        results = {
            'timestamp': timestamp,
            'total_samples': len(sample_paths),
            'processed_samples': 0,
            'failed_samples': 0,
            'samples': [],
            'stem_type_stats': {},
            'processing_time_seconds': 0.0
        }
        
        for idx, sample_path in enumerate(sample_paths, 1):
            logger.info(f"\n{'='*60}")
            logger.info(f"Processing sample {idx}/{len(sample_paths)}: {Path(sample_path).name}")
            logger.info(f"{'='*60}")
            
            try:
                sample_result = self.process_single_sample(sample_path, batch_dir, idx)
                results['samples'].append(sample_result)
                results['processed_samples'] += 1
                logger.info(f"✓ Sample {idx} processed successfully")
                
            except Exception as e:
                logger.error(f"✗ Failed to process sample {idx}: {e}")
                results['failed_samples'] += 1
                results['samples'].append({
                    'sample_id': idx,
                    'sample_path': sample_path,
                    'status': 'failed',
                    'error': str(e)
                })
        
        # Calculate aggregate statistics
        results['processing_time_seconds'] = round(time.time() - start_time, 2)
        results['stem_type_stats'] = self._calculate_stem_statistics(results['samples'])
        
        # Save results
        self._save_batch_results(results, batch_dir)
        
        logger.info(f"\n{'='*60}")
        logger.info(f"REAL Batch Processing Complete!")
        logger.info(f"Processed: {results['processed_samples']}/{results['total_samples']}")
        logger.info(f"Failed: {results['failed_samples']}")
        logger.info(f"Total time: {results['processing_time_seconds']:.2f}s")
        logger.info(f"Average time per sample: {results['processing_time_seconds']/len(sample_paths):.2f}s")
        logger.info(f"{'='*60}\n")
        
        return results
    
    def process_single_sample(self, sample_path: str, batch_dir: Path, sample_id: int) -> Dict:
        """
        Process a single audio sample through REAL stem separation and analysis.
        
        Args:
            sample_path: Path to audio sample
            batch_dir: Batch output directory
            sample_id: Sample identifier
            
        Returns:
            Dictionary containing sample processing results with REAL metrics
        """
        sample_start_time = time.time()
        sample_name = Path(sample_path).stem
        
        # Create sample-specific directory
        sample_dir = batch_dir / f"sample_{sample_id:02d}_{sample_name}"
        stems_dir = sample_dir / "stems"
        stems_dir.mkdir(parents=True, exist_ok=True)
        
        # Step 1: REAL Stem Separation
        logger.info("Step 1/4: Performing REAL stem separation...")
        separated_stems = self.separator.separate_stems(sample_path, stems_dir)
        
        # Step 2: Calculate separation metrics
        logger.info("Step 2/4: Calculating separation metrics...")
        separation_metrics = self.separator.calculate_separation_metrics(sample_path, separated_stems)
        
        # Step 3: Quality Analysis
        logger.info("Step 3/4: Analyzing stem quality...")
        analysis_results = {}
        for stem_info in separated_stems:
            try:
                analysis = self.analyzer.analyze_stem(stem_info['audio_path'])
                analysis_results[stem_info['type']] = analysis
                logger.info(f"  - {stem_info['name']}: Quality={stem_info['quality_score']}, "
                          f"RMS={stem_info['rms_energy']:.4f}")
            except Exception as e:
                logger.warning(f"  - Failed to analyze {stem_info['name']}: {e}")
                analysis_results[stem_info['type']] = None
        
        # Step 4: Export stems
        logger.info("Step 4/4: Exporting stems...")
        export_result = self.exporter.export_batch(
            separated_stems,
            str(sample_dir / "export"),
            f"sample_{sample_id:02d}_{sample_name}"
        )
        
        processing_time = time.time() - sample_start_time
        
        result = {
            'sample_id': sample_id,
            'sample_name': sample_name,
            'sample_path': sample_path,
            'status': 'success',
            'processing_time_seconds': round(processing_time, 2),
            'stems': separated_stems,
            'separation_metrics': separation_metrics,
            'analysis': analysis_results,
            'export_path': export_result.get('archive_path'),
            'output_directory': str(sample_dir)
        }
        
        # Save individual sample results
        with open(sample_dir / "sample_results.json", 'w') as f:
            json.dump(result, f, indent=2)
        
        logger.info(f"Processing time: {processing_time:.2f}s")
        
        return result
    
    def _calculate_stem_statistics(self, samples: List[Dict]) -> Dict:
        """
        Calculate aggregate statistics across all stem types.
        
        Args:
            samples: List of sample results
            
        Returns:
            Dictionary with statistics for each stem type
        """
        stem_types = ['vocals', 'log_drums', 'piano', 'bass', 'percussion', 'synths', 'effects']
        stats = {}
        
        for stem_type in stem_types:
            qualities = []
            energies = []
            
            for sample in samples:
                if sample.get('status') != 'success':
                    continue
                    
                for stem in sample.get('stems', []):
                    if stem['type'] == stem_type:
                        qualities.append(stem['quality_value'])
                        energies.append(stem['rms_energy'])
            
            if qualities:
                stats[stem_type] = {
                    'mean_quality': round(sum(qualities) / len(qualities), 2),
                    'min_quality': round(min(qualities), 2),
                    'max_quality': round(max(qualities), 2),
                    'mean_rms_energy': round(sum(energies) / len(energies), 4),
                    'sample_count': len(qualities)
                }
            else:
                stats[stem_type] = {
                    'mean_quality': 0.0,
                    'min_quality': 0.0,
                    'max_quality': 0.0,
                    'mean_rms_energy': 0.0,
                    'sample_count': 0
                }
        
        return stats
    
    def _save_batch_results(self, results: Dict, batch_dir: Path):
        """
        Save batch processing results to files.
        
        Args:
            results: Batch processing results
            batch_dir: Batch output directory
        """
        # Save JSON summary
        summary_path = batch_dir / f"batch_summary_{results['timestamp']}.json"
        with open(summary_path, 'w') as f:
            json.dump(results, f, indent=2)
        logger.info(f"Saved batch summary to: {summary_path}")
        
        # Generate markdown report
        report_path = batch_dir / f"batch_report_{results['timestamp']}.md"
        self._generate_markdown_report(results, report_path)
        logger.info(f"Saved batch report to: {report_path}")
    
    def _generate_markdown_report(self, results: Dict, output_path: Path):
        """
        Generate a markdown report of batch processing results.
        
        Args:
            results: Batch processing results
            output_path: Output file path
        """
        report_lines = [
            f"# REAL Stem Separation Batch Processing Report",
            f"",
            f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"",
            f"## Summary",
            f"",
            f"- **Total Samples:** {results['total_samples']}",
            f"- **Processed Successfully:** {results['processed_samples']}",
            f"- **Failed:** {results['failed_samples']}",
            f"- **Total Processing Time:** {results['processing_time_seconds']:.2f}s",
            f"- **Average Time per Sample:** {results['processing_time_seconds']/results['total_samples']:.2f}s",
            f"",
            f"## Stem Type Statistics (REAL Metrics)",
            f"",
            f"| Stem Type | Mean Quality | Min Quality | Max Quality | Mean RMS Energy | Samples |",
            f"|-----------|--------------|-------------|-------------|-----------------|---------|"
        ]
        
        for stem_type, stats in results['stem_type_stats'].items():
            report_lines.append(
                f"| {stem_type.replace('_', ' ').title()} | "
                f"{stats['mean_quality']:.2f}% | "
                f"{stats['min_quality']:.2f}% | "
                f"{stats['max_quality']:.2f}% | "
                f"{stats['mean_rms_energy']:.4f} | "
                f"{stats['sample_count']} |"
            )
        
        report_lines.extend([
            f"",
            f"## Individual Sample Results",
            f""
        ])
        
        for sample in results['samples']:
            if sample.get('status') != 'success':
                report_lines.append(f"### Sample {sample['sample_id']}: {sample.get('sample_name', 'Unknown')} - FAILED")
                report_lines.append(f"**Error:** {sample.get('error', 'Unknown error')}")
                report_lines.append("")
                continue
            
            report_lines.extend([
                f"### Sample {sample['sample_id']}: {sample['sample_name']}",
                f"",
                f"- **Processing Time:** {sample['processing_time_seconds']:.2f}s",
                f"- **SDR:** {sample['separation_metrics']['sdr_db']:.2f}dB",
                f"- **Spectral Similarity:** {sample['separation_metrics']['spectral_similarity']:.2f}%",
                f"- **Reconstruction Quality:** {sample['separation_metrics']['reconstruction_quality']:.2f}%",
                f"",
                f"**Separated Stems:**",
                f""
            ])
            
            for stem in sample['stems']:
                report_lines.append(
                    f"- **{stem['name']}:** Quality={stem['quality_score']}, "
                    f"RMS={stem['rms_energy']:.4f}, "
                    f"Size={stem['file_size_mb']:.2f}MB"
                )
            
            report_lines.append("")
        
        with open(output_path, 'w') as f:
            f.write('\n'.join(report_lines))


def main():
    """
    Main function to run REAL batch stem separation on Amapiano samples.
    """
    # Find all generated Amapiano samples
    samples_dir = Path("/home/ubuntu/amapiano_samples_generated")
    sample_files = list(samples_dir.glob("amapiano_sample_*.wav"))
    
    if not sample_files:
        logger.error(f"No sample files found in {samples_dir}")
        return
    
    logger.info(f"Found {len(sample_files)} Amapiano samples")
    
    # Create batch processor
    processor = RealBatchStemProcessor()
    
    # Process all samples
    results = processor.process_batch([str(f) for f in sample_files])
    
    logger.info("\n" + "="*60)
    logger.info("REAL BATCH PROCESSING COMPLETE!")
    logger.info(f"Results saved to: {processor.output_base_dir}")
    logger.info("="*60 + "\n")


if __name__ == "__main__":
    main()

