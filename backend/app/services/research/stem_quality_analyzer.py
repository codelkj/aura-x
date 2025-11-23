"""
Stem Quality Analyzer for Doctoral Thesis Research
Provides detailed spectral analysis and quality metrics for separated audio stems

Author: AURA-X Research Team
Date: November 7, 2025
Purpose: Doctoral thesis Chapter 8 - Stem separation quality validation
"""

import numpy as np
import librosa
import librosa.display
import matplotlib.pyplot as plt
from scipy import signal
from scipy.stats import pearsonr
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class StemQualityAnalyzer:
    """
    Comprehensive stem quality analysis for AI-generated Amapiano music
    
    Analyzes:
    - Spectral characteristics (frequency distribution, spectral centroid, bandwidth)
    - Temporal characteristics (RMS energy, zero-crossing rate)
    - Separation quality (signal-to-distortion ratio, signal-to-interference ratio)
    - Cultural authenticity preservation (Amapiano-specific features)
    - Dynamic range and loudness metrics
    """
    
    def __init__(self, sample_rate: int = 32000):
        """
        Initialize the stem quality analyzer
        
        Args:
            sample_rate: Audio sample rate (default: 32000 Hz for MusicGen output)
        """
        self.sample_rate = sample_rate
        self.hop_length = 512
        self.n_fft = 2048
        self.n_mels = 128
        
        # Amapiano frequency ranges for cultural validation
        self.amapiano_ranges = {
            'sub_bass': (20, 60),
            'bass': (60, 200),
            'log_drums_body': (60, 200),
            'log_drums_attack': (2000, 8000),
            'piano_low': (27, 200),
            'piano_mid': (200, 2000),
            'piano_high': (2000, 4000),
            'vocals_fundamental': (200, 600),
            'vocals_formants': (800, 3000),
            'percussion_attack': (2000, 8000),
            'synth_pad': (100, 500),
            'effects_full': (50, 16000)
        }
    
    def load_audio(self, file_path: str) -> Tuple[np.ndarray, int]:
        """
        Load audio file and return audio data and sample rate
        
        Args:
            file_path: Path to audio file
            
        Returns:
            Tuple of (audio_data, sample_rate)
        """
        try:
            audio, sr = librosa.load(file_path, sr=self.sample_rate, mono=False)
            logger.info(f"Loaded audio: {file_path}, shape: {audio.shape}, sr: {sr}")
            return audio, sr
        except Exception as e:
            logger.error(f"Error loading audio file {file_path}: {e}")
            raise
    
    def compute_spectral_features(self, audio: np.ndarray) -> Dict[str, any]:
        """
        Compute comprehensive spectral features
        
        Args:
            audio: Audio signal (mono or stereo)
            
        Returns:
            Dictionary of spectral features
        """
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio_mono = librosa.to_mono(audio)
        else:
            audio_mono = audio
        
        # Compute STFT
        stft = librosa.stft(audio_mono, n_fft=self.n_fft, hop_length=self.hop_length)
        magnitude = np.abs(stft)
        
        # Spectral centroid (brightness)
        spectral_centroid = librosa.feature.spectral_centroid(
            y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length
        )[0]
        
        # Spectral bandwidth (spread)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(
            y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length
        )[0]
        
        # Spectral rolloff (high-frequency content)
        spectral_rolloff = librosa.feature.spectral_rolloff(
            y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length,
            roll_percent=0.85
        )[0]
        
        # Spectral contrast (peaks vs valleys)
        spectral_contrast = librosa.feature.spectral_contrast(
            y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length
        )
        
        # Spectral flatness (noisiness)
        spectral_flatness = librosa.feature.spectral_flatness(
            y=audio_mono, n_fft=self.n_fft, hop_length=self.hop_length
        )[0]
        
        # Mel-frequency cepstral coefficients (timbre)
        mfcc = librosa.feature.mfcc(
            y=audio_mono, sr=self.sample_rate, n_mfcc=13, n_fft=self.n_fft, hop_length=self.hop_length
        )
        
        # Chroma features (pitch content)
        chroma = librosa.feature.chroma_stft(
            y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length
        )
        
        return {
            'spectral_centroid_mean': float(np.mean(spectral_centroid)),
            'spectral_centroid_std': float(np.std(spectral_centroid)),
            'spectral_bandwidth_mean': float(np.mean(spectral_bandwidth)),
            'spectral_bandwidth_std': float(np.std(spectral_bandwidth)),
            'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
            'spectral_rolloff_std': float(np.std(spectral_rolloff)),
            'spectral_contrast_mean': float(np.mean(spectral_contrast)),
            'spectral_contrast_std': float(np.std(spectral_contrast)),
            'spectral_flatness_mean': float(np.mean(spectral_flatness)),
            'spectral_flatness_std': float(np.std(spectral_flatness)),
            'mfcc_mean': mfcc.mean(axis=1).tolist(),
            'mfcc_std': mfcc.std(axis=1).tolist(),
            'chroma_mean': chroma.mean(axis=1).tolist(),
            'chroma_std': chroma.std(axis=1).tolist()
        }
    
    def compute_temporal_features(self, audio: np.ndarray) -> Dict[str, float]:
        """
        Compute temporal features (energy, dynamics, rhythm)
        
        Args:
            audio: Audio signal (mono or stereo)
            
        Returns:
            Dictionary of temporal features
        """
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio_mono = librosa.to_mono(audio)
        else:
            audio_mono = audio
        
        # RMS energy
        rms = librosa.feature.rms(y=audio_mono, hop_length=self.hop_length)[0]
        
        # Zero-crossing rate
        zcr = librosa.feature.zero_crossing_rate(audio_mono, hop_length=self.hop_length)[0]
        
        # Onset strength (transient detection)
        onset_env = librosa.onset.onset_strength(y=audio_mono, sr=self.sample_rate, hop_length=self.hop_length)
        
        # Tempo estimation
        tempo, beats = librosa.beat.beat_track(y=audio_mono, sr=self.sample_rate, hop_length=self.hop_length)
        
        # Dynamic range
        dynamic_range = float(20 * np.log10(np.max(np.abs(audio_mono)) / (np.mean(np.abs(audio_mono)) + 1e-10)))
        
        # Crest factor (peak-to-RMS ratio)
        crest_factor = float(np.max(np.abs(audio_mono)) / (np.sqrt(np.mean(audio_mono**2)) + 1e-10))
        
        return {
            'rms_mean': float(np.mean(rms)),
            'rms_std': float(np.std(rms)),
            'rms_max': float(np.max(rms)),
            'rms_min': float(np.min(rms)),
            'zcr_mean': float(np.mean(zcr)),
            'zcr_std': float(np.std(zcr)),
            'onset_strength_mean': float(np.mean(onset_env)),
            'onset_strength_std': float(np.std(onset_env)),
            'tempo': float(tempo),
            'num_beats': int(len(beats)),
            'dynamic_range_db': dynamic_range,
            'crest_factor': crest_factor
        }
    
    def compute_frequency_distribution(self, audio: np.ndarray) -> Dict[str, float]:
        """
        Compute energy distribution across frequency bands
        
        Args:
            audio: Audio signal (mono or stereo)
            
        Returns:
            Dictionary of frequency band energies
        """
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio_mono = librosa.to_mono(audio)
        else:
            audio_mono = audio
        
        # Compute power spectral density
        frequencies, psd = signal.welch(audio_mono, fs=self.sample_rate, nperseg=self.n_fft)
        
        # Define frequency bands
        bands = {
            'sub_bass_20_60': (20, 60),
            'bass_60_200': (60, 200),
            'low_mid_200_500': (200, 500),
            'mid_500_2000': (500, 2000),
            'high_mid_2000_8000': (2000, 8000),
            'high_8000_16000': (8000, 16000)
        }
        
        # Calculate energy in each band
        band_energies = {}
        total_energy = np.sum(psd)
        
        for band_name, (low_freq, high_freq) in bands.items():
            # Find frequency indices
            low_idx = np.argmin(np.abs(frequencies - low_freq))
            high_idx = np.argmin(np.abs(frequencies - high_freq))
            
            # Calculate energy in band
            band_energy = np.sum(psd[low_idx:high_idx])
            band_energies[f'{band_name}_energy'] = float(band_energy)
            band_energies[f'{band_name}_percentage'] = float(100 * band_energy / (total_energy + 1e-10))
        
        return band_energies
    
    def compute_separation_quality(self, stem_audio: np.ndarray, reference_audio: Optional[np.ndarray] = None) -> Dict[str, float]:
        """
        Compute separation quality metrics
        
        Args:
            stem_audio: Separated stem audio
            reference_audio: Optional reference (ground truth) audio
            
        Returns:
            Dictionary of separation quality metrics
        """
        # Convert to mono if stereo
        if len(stem_audio.shape) > 1:
            stem_mono = librosa.to_mono(stem_audio)
        else:
            stem_mono = stem_audio
        
        # Compute SNR (signal-to-noise ratio)
        signal_power = np.mean(stem_mono**2)
        noise_floor = np.percentile(np.abs(stem_mono), 5)**2  # 5th percentile as noise estimate
        snr_db = float(10 * np.log10(signal_power / (noise_floor + 1e-10)))
        
        # Compute THD (total harmonic distortion) estimate
        # Using spectral flatness as a proxy
        spectral_flatness = librosa.feature.spectral_flatness(y=stem_mono, n_fft=self.n_fft, hop_length=self.hop_length)[0]
        thd_estimate = float(1.0 - np.mean(spectral_flatness))  # Higher flatness = lower distortion
        
        # Compute silence ratio (percentage of near-silent frames)
        rms = librosa.feature.rms(y=stem_mono, hop_length=self.hop_length)[0]
        silence_threshold = np.max(rms) * 0.01  # 1% of max RMS
        silence_ratio = float(np.sum(rms < silence_threshold) / len(rms))
        
        metrics = {
            'snr_db': snr_db,
            'thd_estimate': thd_estimate,
            'silence_ratio': silence_ratio,
            'signal_power': float(signal_power)
        }
        
        # If reference audio is provided, compute SDR (signal-to-distortion ratio)
        if reference_audio is not None:
            if len(reference_audio.shape) > 1:
                reference_mono = librosa.to_mono(reference_audio)
            else:
                reference_mono = reference_audio
            
            # Ensure same length
            min_len = min(len(stem_mono), len(reference_mono))
            stem_mono = stem_mono[:min_len]
            reference_mono = reference_mono[:min_len]
            
            # Compute SDR
            distortion = stem_mono - reference_mono
            sdr_db = float(10 * np.log10(np.sum(reference_mono**2) / (np.sum(distortion**2) + 1e-10)))
            
            # Compute correlation
            correlation, _ = pearsonr(stem_mono, reference_mono)
            
            metrics['sdr_db'] = sdr_db
            metrics['correlation'] = float(correlation)
            metrics['separation_accuracy_percent'] = float((1 - 10**(-sdr_db/20)) * 100)
        
        return metrics
    
    def analyze_amapiano_characteristics(self, audio: np.ndarray, stem_type: str) -> Dict[str, any]:
        """
        Analyze Amapiano-specific characteristics for cultural authenticity validation
        
        Args:
            audio: Audio signal
            stem_type: Type of stem ('vocals', 'log_drums', 'piano', 'bass', etc.)
            
        Returns:
            Dictionary of Amapiano-specific metrics
        """
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio_mono = librosa.to_mono(audio)
        else:
            audio_mono = audio
        
        # Estimate tempo
        tempo, beats = librosa.beat.beat_track(y=audio_mono, sr=self.sample_rate, hop_length=self.hop_length)
        
        # Check if tempo is in Amapiano range (105-125 BPM)
        tempo_in_range = 105 <= tempo <= 125
        tempo_score = 100.0 if tempo_in_range else max(0, 100 - abs(tempo - 115) * 2)
        
        # Compute frequency distribution
        frequencies, psd = signal.welch(audio_mono, fs=self.sample_rate, nperseg=self.n_fft)
        
        # Stem-specific analysis
        characteristics = {
            'tempo_bpm': float(tempo),
            'tempo_in_amapiano_range': tempo_in_range,
            'tempo_authenticity_score': float(tempo_score),
            'num_beats': int(len(beats))
        }
        
        if stem_type == 'log_drums':
            # Log drums should have strong energy in 60-200 Hz (body) and 2-8 kHz (attack)
            body_idx = np.where((frequencies >= 60) & (frequencies <= 200))[0]
            attack_idx = np.where((frequencies >= 2000) & (frequencies <= 8000))[0]
            
            body_energy = np.sum(psd[body_idx])
            attack_energy = np.sum(psd[attack_idx])
            total_energy = np.sum(psd)
            
            characteristics['log_drum_body_energy_percent'] = float(100 * body_energy / (total_energy + 1e-10))
            characteristics['log_drum_attack_energy_percent'] = float(100 * attack_energy / (total_energy + 1e-10))
            characteristics['log_drum_authenticity_score'] = float(min(100, (body_energy + attack_energy) / total_energy * 200))
        
        elif stem_type == 'bass':
            # Bass should have strong energy in 20-200 Hz
            bass_idx = np.where((frequencies >= 20) & (frequencies <= 200))[0]
            sub_bass_idx = np.where((frequencies >= 20) & (frequencies <= 60))[0]
            
            bass_energy = np.sum(psd[bass_idx])
            sub_bass_energy = np.sum(psd[sub_bass_idx])
            total_energy = np.sum(psd)
            
            characteristics['bass_energy_percent'] = float(100 * bass_energy / (total_energy + 1e-10))
            characteristics['sub_bass_energy_percent'] = float(100 * sub_bass_energy / (total_energy + 1e-10))
            characteristics['bass_authenticity_score'] = float(min(100, bass_energy / total_energy * 150))
        
        elif stem_type == 'piano':
            # Piano should have energy across 27-4000 Hz with emphasis on mid-range
            piano_idx = np.where((frequencies >= 200) & (frequencies <= 2000))[0]
            piano_energy = np.sum(psd[piano_idx])
            total_energy = np.sum(psd)
            
            # Check for harmonic content (chroma features)
            chroma = librosa.feature.chroma_stft(y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length)
            chroma_strength = np.mean(np.max(chroma, axis=0))
            
            characteristics['piano_mid_energy_percent'] = float(100 * piano_energy / (total_energy + 1e-10))
            characteristics['harmonic_strength'] = float(chroma_strength)
            characteristics['piano_authenticity_score'] = float(min(100, chroma_strength * 100))
        
        elif stem_type == 'vocals':
            # Vocals should have energy in 200-4000 Hz with formant structure
            vocal_idx = np.where((frequencies >= 200) & (frequencies <= 4000))[0]
            vocal_energy = np.sum(psd[vocal_idx])
            total_energy = np.sum(psd)
            
            # Check for formant-like structure using spectral contrast
            spectral_contrast = librosa.feature.spectral_contrast(
                y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length
            )
            formant_score = np.mean(spectral_contrast)
            
            characteristics['vocal_energy_percent'] = float(100 * vocal_energy / (total_energy + 1e-10))
            characteristics['formant_structure_score'] = float(formant_score)
            characteristics['vocal_authenticity_score'] = float(min(100, vocal_energy / total_energy * 120))
        
        return characteristics
    
    def generate_spectral_plot(self, audio: np.ndarray, stem_name: str, output_path: str):
        """
        Generate comprehensive spectral visualization
        
        Args:
            audio: Audio signal
            stem_name: Name of the stem
            output_path: Path to save the plot
        """
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio_mono = librosa.to_mono(audio)
        else:
            audio_mono = audio
        
        # Create figure with subplots
        fig, axes = plt.subplots(3, 2, figsize=(16, 12))
        fig.suptitle(f'Spectral Analysis: {stem_name}', fontsize=16, fontweight='bold')
        
        # 1. Waveform
        ax = axes[0, 0]
        times = np.arange(len(audio_mono)) / self.sample_rate
        ax.plot(times, audio_mono, linewidth=0.5, color='#2E86AB')
        ax.set_xlabel('Time (s)')
        ax.set_ylabel('Amplitude')
        ax.set_title('Waveform')
        ax.grid(True, alpha=0.3)
        
        # 2. Spectrogram
        ax = axes[0, 1]
        D = librosa.amplitude_to_db(np.abs(librosa.stft(audio_mono, n_fft=self.n_fft, hop_length=self.hop_length)), ref=np.max)
        img = librosa.display.specshow(D, sr=self.sample_rate, hop_length=self.hop_length, x_axis='time', y_axis='hz', ax=ax, cmap='viridis')
        ax.set_title('Spectrogram')
        fig.colorbar(img, ax=ax, format='%+2.0f dB')
        
        # 3. Mel Spectrogram
        ax = axes[1, 0]
        mel_spec = librosa.feature.melspectrogram(y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length, n_mels=self.n_mels)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        img = librosa.display.specshow(mel_spec_db, sr=self.sample_rate, hop_length=self.hop_length, x_axis='time', y_axis='mel', ax=ax, cmap='magma')
        ax.set_title('Mel Spectrogram')
        fig.colorbar(img, ax=ax, format='%+2.0f dB')
        
        # 4. Chromagram
        ax = axes[1, 1]
        chroma = librosa.feature.chroma_stft(y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length)
        img = librosa.display.specshow(chroma, sr=self.sample_rate, hop_length=self.hop_length, x_axis='time', y_axis='chroma', ax=ax, cmap='coolwarm')
        ax.set_title('Chromagram')
        fig.colorbar(img, ax=ax)
        
        # 5. Spectral Features Over Time
        ax = axes[2, 0]
        spectral_centroid = librosa.feature.spectral_centroid(y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio_mono, sr=self.sample_rate, n_fft=self.n_fft, hop_length=self.hop_length)[0]
        frames = np.arange(len(spectral_centroid))
        times = librosa.frames_to_time(frames, sr=self.sample_rate, hop_length=self.hop_length)
        ax.plot(times, spectral_centroid, label='Spectral Centroid', color='#A23B72', linewidth=1.5)
        ax.plot(times, spectral_rolloff, label='Spectral Rolloff', color='#F18F01', linewidth=1.5)
        ax.set_xlabel('Time (s)')
        ax.set_ylabel('Frequency (Hz)')
        ax.set_title('Spectral Features Over Time')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # 6. Power Spectral Density
        ax = axes[2, 1]
        frequencies, psd = signal.welch(audio_mono, fs=self.sample_rate, nperseg=self.n_fft)
        ax.semilogy(frequencies, psd, color='#6A4C93', linewidth=1.5)
        ax.set_xlabel('Frequency (Hz)')
        ax.set_ylabel('Power Spectral Density (V²/Hz)')
        ax.set_title('Power Spectral Density')
        ax.grid(True, alpha=0.3)
        ax.set_xlim([20, self.sample_rate // 2])
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Saved spectral plot to {output_path}")
    
    def analyze_stem(self, stem_path: str, stem_type: str, output_dir: str) -> Dict[str, any]:
        """
        Perform comprehensive analysis of a single stem
        
        Args:
            stem_path: Path to stem audio file
            stem_type: Type of stem (e.g., 'vocals', 'log_drums', 'piano', 'bass')
            output_dir: Directory to save analysis results
            
        Returns:
            Dictionary containing all analysis results
        """
        logger.info(f"Analyzing stem: {stem_path} (type: {stem_type})")
        
        # Load audio
        audio, sr = self.load_audio(stem_path)
        
        # Compute all features
        spectral_features = self.compute_spectral_features(audio)
        temporal_features = self.compute_temporal_features(audio)
        frequency_distribution = self.compute_frequency_distribution(audio)
        separation_quality = self.compute_separation_quality(audio)
        amapiano_characteristics = self.analyze_amapiano_characteristics(audio, stem_type)
        
        # Generate spectral plot
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        plot_path = output_path / f"{stem_type}_spectral_analysis.png"
        self.generate_spectral_plot(audio, stem_type.replace('_', ' ').title(), str(plot_path))
        
        # Compile results
        results = {
            'stem_path': stem_path,
            'stem_type': stem_type,
            'sample_rate': sr,
            'duration_seconds': float(len(audio[0] if len(audio.shape) > 1 else audio) / sr),
            'spectral_features': spectral_features,
            'temporal_features': temporal_features,
            'frequency_distribution': frequency_distribution,
            'separation_quality': separation_quality,
            'amapiano_characteristics': amapiano_characteristics,
            'spectral_plot_path': str(plot_path)
        }
        
        # Save results to JSON
        json_path = output_path / f"{stem_type}_analysis_results.json"
        with open(json_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Saved analysis results to {json_path}")
        
        return results
    
    def analyze_all_stems(self, stems_dir: str, output_dir: str) -> Dict[str, any]:
        """
        Analyze all stems in a directory and generate comparative report
        
        Args:
            stems_dir: Directory containing stem audio files
            output_dir: Directory to save analysis results
            
        Returns:
            Dictionary containing analysis results for all stems
        """
        stems_path = Path(stems_dir)
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Define expected stems
        stem_types = {
            'vocals_stem.wav': 'vocals',
            'drums_stem.wav': 'log_drums',
            'piano_stem.wav': 'piano',
            'bass_stem.wav': 'bass',
            'percussion_stem.wav': 'percussion',
            'synths_stem.wav': 'synths',
            'effects_stem.wav': 'effects'
        }
        
        all_results = {}
        
        for filename, stem_type in stem_types.items():
            stem_path = stems_path / filename
            if stem_path.exists():
                results = self.analyze_stem(str(stem_path), stem_type, output_dir)
                all_results[stem_type] = results
            else:
                logger.warning(f"Stem file not found: {stem_path}")
        
        # Generate comparative report
        self.generate_comparative_report(all_results, output_dir)
        
        # Save combined results
        combined_json_path = output_path / "all_stems_analysis.json"
        with open(combined_json_path, 'w') as f:
            json.dump(all_results, f, indent=2)
        
        logger.info(f"Saved combined analysis results to {combined_json_path}")
        
        return all_results
    
    def generate_comparative_report(self, all_results: Dict[str, any], output_dir: str):
        """
        Generate comparative analysis report for all stems
        
        Args:
            all_results: Dictionary of analysis results for all stems
            output_dir: Directory to save the report
        """
        output_path = Path(output_dir)
        
        # Create comparative visualizations
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle('Comparative Stem Analysis', fontsize=16, fontweight='bold')
        
        stem_names = list(all_results.keys())
        colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#ff9f43', '#26de81']
        
        # 1. Spectral Centroid Comparison
        ax = axes[0, 0]
        centroids = [all_results[stem]['spectral_features']['spectral_centroid_mean'] for stem in stem_names]
        ax.bar(stem_names, centroids, color=colors[:len(stem_names)])
        ax.set_ylabel('Frequency (Hz)')
        ax.set_title('Spectral Centroid (Brightness)')
        ax.tick_params(axis='x', rotation=45)
        ax.grid(True, alpha=0.3, axis='y')
        
        # 2. RMS Energy Comparison
        ax = axes[0, 1]
        rms_values = [all_results[stem]['temporal_features']['rms_mean'] for stem in stem_names]
        ax.bar(stem_names, rms_values, color=colors[:len(stem_names)])
        ax.set_ylabel('RMS Energy')
        ax.set_title('Average RMS Energy')
        ax.tick_params(axis='x', rotation=45)
        ax.grid(True, alpha=0.3, axis='y')
        
        # 3. Frequency Distribution
        ax = axes[1, 0]
        freq_bands = ['sub_bass_20_60', 'bass_60_200', 'low_mid_200_500', 'mid_500_2000', 'high_mid_2000_8000', 'high_8000_16000']
        band_labels = ['Sub\nBass', 'Bass', 'Low\nMid', 'Mid', 'High\nMid', 'High']
        
        for i, stem in enumerate(stem_names[:4]):  # Show first 4 stems for clarity
            percentages = [all_results[stem]['frequency_distribution'][f'{band}_percentage'] for band in freq_bands]
            ax.plot(band_labels, percentages, marker='o', label=stem.replace('_', ' ').title(), color=colors[i], linewidth=2)
        
        ax.set_ylabel('Energy (%)')
        ax.set_title('Frequency Distribution by Band')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # 4. SNR Comparison
        ax = axes[1, 1]
        snr_values = [all_results[stem]['separation_quality']['snr_db'] for stem in stem_names]
        ax.bar(stem_names, snr_values, color=colors[:len(stem_names)])
        ax.set_ylabel('SNR (dB)')
        ax.set_title('Signal-to-Noise Ratio')
        ax.tick_params(axis='x', rotation=45)
        ax.grid(True, alpha=0.3, axis='y')
        
        plt.tight_layout()
        plot_path = output_path / "comparative_stem_analysis.png"
        plt.savefig(plot_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Saved comparative analysis plot to {plot_path}")


def main():
    """
    Main function for command-line usage
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Analyze separated audio stems for doctoral thesis research')
    parser.add_argument('--stem', type=str, help='Path to single stem file')
    parser.add_argument('--stem-type', type=str, help='Type of stem (vocals, log_drums, piano, bass, etc.)')
    parser.add_argument('--stems-dir', type=str, help='Directory containing all stems')
    parser.add_argument('--output-dir', type=str, required=True, help='Output directory for analysis results')
    
    args = parser.parse_args()
    
    analyzer = StemQualityAnalyzer()
    
    if args.stem and args.stem_type:
        # Analyze single stem
        results = analyzer.analyze_stem(args.stem, args.stem_type, args.output_dir)
        print(f"\nAnalysis complete! Results saved to {args.output_dir}")
        print(f"SNR: {results['separation_quality']['snr_db']:.2f} dB")
        print(f"Spectral Centroid: {results['spectral_features']['spectral_centroid_mean']:.2f} Hz")
    
    elif args.stems_dir:
        # Analyze all stems
        results = analyzer.analyze_all_stems(args.stems_dir, args.output_dir)
        print(f"\nAnalysis complete! Results saved to {args.output_dir}")
        print(f"Analyzed {len(results)} stems")
    
    else:
        parser.print_help()


if __name__ == '__main__':
    main()

