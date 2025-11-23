"""
Cultural Voice Studio API Routes
Production-ready TTS endpoints with cultural accent support
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import tempfile
import shutil
from pathlib import Path
import logging
import uuid

from ..services.cultural_voice_tts import CulturalVoiceTTSService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/voice/cultural", tags=["Cultural Voice Studio"])

# Global service instance
_service_instance = None


def get_service():
    """Get or create TTS service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = CulturalVoiceTTSService()
    return _service_instance


class TTSRequest(BaseModel):
    """Request model for text-to-speech"""
    text: str = Field(..., description="Text to synthesize", min_length=1, max_length=5000)
    engine: str = Field("gtts", description="TTS engine (pyttsx3 or gtts)")
    language: str = Field("en", description="Language code")
    voice_id: Optional[str] = Field(None, description="Voice ID (for pyttsx3)")
    rate: int = Field(150, description="Speech rate (words per minute)", ge=50, le=300)
    volume: float = Field(1.0, description="Volume (0.0 to 1.0)", ge=0.0, le=1.0)


class EmotionalTTSRequest(BaseModel):
    """Request model for emotional TTS"""
    text: str = Field(..., description="Text to synthesize", min_length=1, max_length=5000)
    emotion: str = Field("neutral", description="Emotion (happy, sad, angry, neutral, excited, calm)")
    intensity: float = Field(0.5, description="Emotion intensity (0.0 to 1.0)", ge=0.0, le=1.0)


class CulturalAccentRequest(BaseModel):
    """Request model for cultural accent TTS"""
    text: str = Field(..., description="Text to synthesize", min_length=1, max_length=5000)
    accent: str = Field("south_african", description="Cultural accent")
    language: str = Field("en", description="Base language")


class BatchTTSRequest(BaseModel):
    """Request model for batch TTS"""
    texts: List[str] = Field(..., description="List of texts to synthesize")
    engine: str = Field("gtts", description="TTS engine")
    language: str = Field("en", description="Language code")


class TTSResponse(BaseModel):
    """Response model for TTS"""
    success: bool
    audio_url: Optional[str] = None
    session_id: Optional[str] = None
    filename: Optional[str] = None
    engine: Optional[str] = None
    file_size: Optional[int] = None
    text_length: Optional[int] = None
    error: Optional[str] = None


class VoiceListResponse(BaseModel):
    """Response model for voice list"""
    success: bool
    voices: Optional[List[Dict[str, Any]]] = None
    total_voices: Optional[int] = None
    engine: Optional[str] = None
    error: Optional[str] = None


class EngineInfoResponse(BaseModel):
    """Response model for engine info"""
    available_engines: List[str]
    pyttsx3_available: bool
    gtts_available: bool
    supported_languages: List[str]
    supported_emotions: List[str]
    supported_accents: List[str]


@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_speech(request: TTSRequest):
    """
    Synthesize speech from text
    
    Args:
        request: TTS request with text and parameters
        
    Returns:
        Audio file URL
    """
    try:
        service = get_service()
        
        # Create session directory
        session_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.gettempdir()) / session_id
        temp_dir.mkdir(exist_ok=True)
        
        # Generate output filename
        extension = "mp3" if request.engine == "gtts" else "wav"
        filename = f"speech_{session_id}.{extension}"
        output_path = temp_dir / filename
        
        # Synthesize speech
        result = service.synthesize_speech(
            text=request.text,
            output_path=str(output_path),
            engine=request.engine,
            voice_id=request.voice_id,
            rate=request.rate,
            volume=request.volume,
            language=request.language
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Synthesis failed"))
        
        # Generate download URL
        download_url = f"/api/voice/cultural/download/{session_id}/{filename}"
        
        return TTSResponse(
            success=True,
            audio_url=download_url,
            session_id=session_id,
            filename=filename,
            engine=result.get("engine"),
            file_size=result.get("file_size"),
            text_length=result.get("text_length")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Speech synthesis failed: {e}", exc_info=True)
        return TTSResponse(
            success=False,
            error=str(e)
        )


@router.post("/synthesize-emotional", response_model=TTSResponse)
async def synthesize_emotional_speech(request: EmotionalTTSRequest):
    """
    Synthesize speech with emotional expression
    
    Args:
        request: Emotional TTS request
        
    Returns:
        Audio file URL with emotional expression
    """
    try:
        service = get_service()
        
        # Create session directory
        session_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.gettempdir()) / session_id
        temp_dir.mkdir(exist_ok=True)
        
        # Generate output filename
        filename = f"emotional_speech_{session_id}.mp3"
        output_path = temp_dir / filename
        
        # Synthesize with emotion
        result = service.synthesize_with_emotion(
            text=request.text,
            output_path=str(output_path),
            emotion=request.emotion,
            intensity=request.intensity
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Emotional synthesis failed"))
        
        # Generate download URL
        download_url = f"/api/voice/cultural/download/{session_id}/{filename}"
        
        return TTSResponse(
            success=True,
            audio_url=download_url,
            session_id=session_id,
            filename=filename,
            engine=result.get("engine"),
            file_size=result.get("file_size"),
            text_length=result.get("text_length")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Emotional synthesis failed: {e}", exc_info=True)
        return TTSResponse(
            success=False,
            error=str(e)
        )


@router.post("/synthesize-accent", response_model=TTSResponse)
async def synthesize_cultural_accent(request: CulturalAccentRequest):
    """
    Synthesize speech with cultural accent
    
    Args:
        request: Cultural accent TTS request
        
    Returns:
        Audio file URL with cultural accent
    """
    try:
        service = get_service()
        
        # Create session directory
        session_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.gettempdir()) / session_id
        temp_dir.mkdir(exist_ok=True)
        
        # Generate output filename
        filename = f"accent_speech_{session_id}.mp3"
        output_path = temp_dir / filename
        
        # Synthesize with accent
        result = service.synthesize_cultural_accent(
            text=request.text,
            output_path=str(output_path),
            accent=request.accent,
            language=request.language
        )
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Accent synthesis failed"))
        
        # Generate download URL
        download_url = f"/api/voice/cultural/download/{session_id}/{filename}"
        
        return TTSResponse(
            success=True,
            audio_url=download_url,
            session_id=session_id,
            filename=filename,
            engine=result.get("engine"),
            file_size=result.get("file_size"),
            text_length=result.get("text_length")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Accent synthesis failed: {e}", exc_info=True)
        return TTSResponse(
            success=False,
            error=str(e)
        )


@router.get("/voices", response_model=VoiceListResponse)
async def get_voices(engine: str = Query("gtts", description="TTS engine")):
    """
    Get list of available voices
    
    Args:
        engine: TTS engine (pyttsx3 or gtts)
        
    Returns:
        List of available voices
    """
    try:
        service = get_service()
        voices = service.get_available_voices(engine)
        
        return VoiceListResponse(
            success=True,
            voices=voices,
            total_voices=len(voices),
            engine=engine
        )
        
    except Exception as e:
        logger.error(f"Failed to get voices: {e}", exc_info=True)
        return VoiceListResponse(
            success=False,
            error=str(e)
        )


@router.get("/engine-info", response_model=EngineInfoResponse)
async def get_engine_info():
    """Get information about available TTS engines"""
    try:
        service = get_service()
        info = service.get_engine_info()
        return EngineInfoResponse(**info)
        
    except Exception as e:
        logger.error(f"Failed to get engine info: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{session_id}/{filename}")
async def download_speech(session_id: str, filename: str):
    """
    Download synthesized speech file
    
    Args:
        session_id: Session identifier
        filename: Audio filename
        
    Returns:
        Audio file
    """
    # Construct file path
    temp_dir = Path(tempfile.gettempdir()) / session_id
    audio_path = temp_dir / filename
    
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found or session expired")
    
    # Read file
    with open(audio_path, 'rb') as f:
        audio_data = f.read()
    
    # Determine media type
    media_type = "audio/mpeg" if filename.endswith(".mp3") else "audio/wav"
    
    # Return with proper headers
    return Response(
        content=audio_data,
        media_type=media_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Accept-Ranges": "bytes",
            "Content-Length": str(len(audio_data)),
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "Content-Length, Accept-Ranges"
        }
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        service = get_service()
        info = service.get_engine_info()
        
        return {
            "status": "healthy",
            "service": "Cultural Voice Studio",
            "features": ["Text-to-Speech", "Emotional Expression", "Cultural Accents"],
            "engines": info["available_engines"],
            "supported_languages": info["supported_languages"],
            "supported_emotions": info["supported_emotions"],
            "supported_accents": info["supported_accents"]
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get("/")
async def root():
    """
    Cultural Voice Studio API root endpoint
    """
    return {
        "service": "Cultural Voice Studio API",
        "version": "1.0.0",
        "endpoints": {
            "POST /synthesize": "Synthesize speech from text",
            "POST /synthesize-emotional": "Synthesize with emotional expression",
            "POST /synthesize-accent": "Synthesize with cultural accent",
            "GET /voices": "Get available voices",
            "GET /engine-info": "Get engine information",
            "GET /download/{session_id}/{filename}": "Download synthesized speech",
            "GET /health": "Health check"
        },
        "documentation": "/docs"
    }

