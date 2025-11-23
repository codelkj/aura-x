"""
Cultural Voice Studio - Text-to-Speech Service
Production-ready TTS with multiple engines and voice options
"""

import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
import tempfile
import uuid

logger = logging.getLogger(__name__)


class CulturalVoiceTTSService:
    """
    Professional TTS service with multiple engines
    Supports both offline (pyttsx3) and online (gTTS) synthesis
    """
    
    def __init__(self):
        self.engines = {}
        self._initialize_engines()
    
    def _initialize_engines(self):
        """Initialize available TTS engines"""
        # Try to initialize pyttsx3 (offline)
        try:
            import pyttsx3
            self.engines['pyttsx3'] = pyttsx3.init()
            logger.info("pyttsx3 engine initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize pyttsx3: {e}")
        
        # gTTS is always available (online, no initialization needed)
        self.engines['gtts'] = True
        logger.info("gTTS engine available")
    
    def get_available_voices(self, engine: str = "pyttsx3") -> List[Dict[str, Any]]:
        """
        Get list of available voices for an engine
        
        Args:
            engine: TTS engine ('pyttsx3' or 'gtts')
            
        Returns:
            List of voice dictionaries with id, name, language
        """
        if engine == "pyttsx3" and 'pyttsx3' in self.engines:
            try:
                voices = self.engines['pyttsx3'].getProperty('voices')
                return [
                    {
                        "id": voice.id,
                        "name": voice.name,
                        "languages": voice.languages,
                        "gender": getattr(voice, 'gender', 'unknown')
                    }
                    for voice in voices
                ]
            except Exception as e:
                logger.error(f"Failed to get pyttsx3 voices: {e}")
                return []
        
        elif engine == "gtts":
            # gTTS supports many languages
            return [
                {"id": "en", "name": "English", "language": "en", "gender": "neutral"},
                {"id": "af", "name": "Afrikaans", "language": "af", "gender": "neutral"},
                {"id": "zu", "name": "Zulu", "language": "zu", "gender": "neutral"},
                {"id": "xh", "name": "Xhosa", "language": "xh", "gender": "neutral"},
                {"id": "st", "name": "Sesotho", "language": "st", "gender": "neutral"},
                {"id": "tn", "name": "Setswana", "language": "tn", "gender": "neutral"},
                {"id": "es", "name": "Spanish", "language": "es", "gender": "neutral"},
                {"id": "fr", "name": "French", "language": "fr", "gender": "neutral"},
                {"id": "pt", "name": "Portuguese", "language": "pt", "gender": "neutral"},
            ]
        
        return []
    
    def synthesize_speech(
        self,
        text: str,
        output_path: str,
        engine: str = "gtts",
        voice_id: Optional[str] = None,
        rate: int = 150,
        volume: float = 1.0,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Synthesize speech from text
        
        Args:
            text: Text to synthesize
            output_path: Path to save audio file
            engine: TTS engine ('pyttsx3' or 'gtts')
            voice_id: Voice ID (optional)
            rate: Speech rate (words per minute)
            volume: Volume (0.0 to 1.0)
            language: Language code
            
        Returns:
            Result dictionary with success status and file info
        """
        try:
            if engine == "pyttsx3" and 'pyttsx3' in self.engines:
                return self._synthesize_pyttsx3(
                    text, output_path, voice_id, rate, volume
                )
            elif engine == "gtts":
                return self._synthesize_gtts(
                    text, output_path, language
                )
            else:
                return {
                    "success": False,
                    "error": f"Engine '{engine}' not available"
                }
        
        except Exception as e:
            logger.error(f"Speech synthesis failed: {e}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }
    
    def _synthesize_pyttsx3(
        self,
        text: str,
        output_path: str,
        voice_id: Optional[str],
        rate: int,
        volume: float
    ) -> Dict[str, Any]:
        """Synthesize using pyttsx3 (offline)"""
        engine = self.engines['pyttsx3']
        
        # Set voice
        if voice_id:
            engine.setProperty('voice', voice_id)
        
        # Set rate
        engine.setProperty('rate', rate)
        
        # Set volume
        engine.setProperty('volume', volume)
        
        # Synthesize to file
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        
        # Get file info
        file_size = Path(output_path).stat().st_size
        
        return {
            "success": True,
            "engine": "pyttsx3",
            "output_path": output_path,
            "file_size": file_size,
            "text_length": len(text),
            "rate": rate,
            "volume": volume
        }
    
    def _synthesize_gtts(
        self,
        text: str,
        output_path: str,
        language: str
    ) -> Dict[str, Any]:
        """Synthesize using gTTS (online)"""
        from gtts import gTTS
        
        # Create gTTS object
        tts = gTTS(text=text, lang=language, slow=False)
        
        # Save to file
        tts.save(output_path)
        
        # Get file info
        file_size = Path(output_path).stat().st_size
        
        return {
            "success": True,
            "engine": "gtts",
            "output_path": output_path,
            "file_size": file_size,
            "text_length": len(text),
            "language": language
        }
    
    def synthesize_with_emotion(
        self,
        text: str,
        output_path: str,
        emotion: str = "neutral",
        intensity: float = 0.5
    ) -> Dict[str, Any]:
        """
        Synthesize speech with emotional expression
        
        Args:
            text: Text to synthesize
            output_path: Output file path
            emotion: Emotion type (happy, sad, angry, neutral)
            intensity: Emotion intensity (0.0 to 1.0)
            
        Returns:
            Result dictionary
        """
        # Map emotions to voice parameters
        emotion_params = {
            "happy": {"rate": 180, "volume": 1.0},
            "sad": {"rate": 120, "volume": 0.7},
            "angry": {"rate": 200, "volume": 1.0},
            "neutral": {"rate": 150, "volume": 0.9},
            "excited": {"rate": 190, "volume": 1.0},
            "calm": {"rate": 130, "volume": 0.8}
        }
        
        params = emotion_params.get(emotion, emotion_params["neutral"])
        
        # Adjust intensity
        base_rate = 150
        params["rate"] = int(base_rate + (params["rate"] - base_rate) * intensity)
        
        return self.synthesize_speech(
            text=text,
            output_path=output_path,
            engine="gtts",  # Use gTTS for consistency
            rate=params["rate"],
            volume=params["volume"]
        )
    
    def synthesize_cultural_accent(
        self,
        text: str,
        output_path: str,
        accent: str = "south_african",
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Synthesize speech with cultural accent
        
        Args:
            text: Text to synthesize
            output_path: Output file path
            accent: Cultural accent type
            language: Base language
            
        Returns:
            Result dictionary
        """
        # Map accents to language codes
        accent_map = {
            "south_african": "en",  # South African English
            "nigerian": "en",       # Nigerian English
            "kenyan": "en",         # Kenyan English
            "ghanaian": "en",       # Ghanaian English
            "afrikaans": "af",      # Afrikaans
            "zulu": "zu",           # Zulu
            "xhosa": "xh",          # Xhosa
            "sesotho": "st",        # Sesotho
            "setswana": "tn"        # Setswana
        }
        
        lang = accent_map.get(accent, language)
        
        return self.synthesize_speech(
            text=text,
            output_path=output_path,
            engine="gtts",
            language=lang
        )
    
    def batch_synthesize(
        self,
        texts: List[str],
        output_dir: str,
        engine: str = "gtts",
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Batch synthesize multiple texts
        
        Args:
            texts: List of texts to synthesize
            output_dir: Output directory
            engine: TTS engine
            language: Language code
            
        Returns:
            Batch result with individual file info
        """
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        results = []
        for i, text in enumerate(texts):
            output_path = output_dir / f"speech_{i+1}.mp3"
            result = self.synthesize_speech(
                text=text,
                output_path=str(output_path),
                engine=engine,
                language=language
            )
            results.append({
                "index": i,
                "text": text[:50] + "..." if len(text) > 50 else text,
                "result": result
            })
        
        return {
            "success": True,
            "total_files": len(texts),
            "results": results
        }
    
    def get_engine_info(self) -> Dict[str, Any]:
        """Get information about available engines"""
        return {
            "available_engines": list(self.engines.keys()),
            "pyttsx3_available": 'pyttsx3' in self.engines,
            "gtts_available": 'gtts' in self.engines,
            "supported_languages": [
                "en", "af", "zu", "xh", "st", "tn", "es", "fr", "pt"
            ],
            "supported_emotions": [
                "happy", "sad", "angry", "neutral", "excited", "calm"
            ],
            "supported_accents": [
                "south_african", "nigerian", "kenyan", "ghanaian",
                "afrikaans", "zulu", "xhosa", "sesotho", "setswana"
            ]
        }

