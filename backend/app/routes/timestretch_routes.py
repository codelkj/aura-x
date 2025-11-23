"""
Time Stretch API Routes
Production-ready API endpoints for BPM analysis and time stretching
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import tempfile
import shutil
from pathlib import Path
import logging

from ..services.advanced_timestretch import AdvancedTimeStretchService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/audio/timestretch", tags=["Time Stretch"])

# Global service instance
_service_instance = None


def get_service():
    """Get or create time stretch service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = AdvancedTimeStretchService()
    return _service_instance


class BPMAnalysisResponse(BaseModel):
    """Response model for BPM analysis"""
    success: bool
    bpm: Optional[float] = None
    confidence: Optional[float] = None
    beats: Optional[list] = None
    error: Optional[str] = None


class TimeStretchRequest(BaseModel):
    """Request model for time stretching"""
    target_bpm: float = Field(..., description="Target BPM", gt=20, lt=300)
    preserve_pitch: bool = Field(True, description="Preserve pitch while stretching")
    quality: str = Field("high", description="Quality preset: low, medium, high")


class TimeStretchResponse(BaseModel):
    """Response model for time stretching"""
    success: bool
    audio_url: Optional[str] = None
    session_id: Optional[str] = None
    filename: Optional[str] = None
    original_bpm: Optional[float] = None
    target_bpm: Optional[float] = None
    stretch_ratio: Optional[float] = None
    processing_time: Optional[float] = None
    error: Optional[str] = None


@router.post("/analyze-bpm", response_model=BPMAnalysisResponse)
async def analyze_bpm(file: UploadFile = File(...)):
    """
    Analyze BPM of an audio file
    
    Args:
        file: Audio file (WAV, MP3, FLAC, M4A)
        
    Returns:
        BPM analysis results with confidence score
    """
    temp_dir = None
    try:
        service = get_service()
        
        # Validate file
        validation = service.validate_audio_file(file)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["error"])
        
        # Create temp directory
        temp_dir = Path(tempfile.mkdtemp())
        input_path = temp_dir / file.filename
        
        # Save uploaded file
        with open(input_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        
        # Analyze BPM
        result = service.analyze_bpm(str(input_path))
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "BPM analysis failed"))
        
        return BPMAnalysisResponse(
            success=True,
            bpm=result["bpm"],
            confidence=result.get("confidence"),
            beats=result.get("beats", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"BPM analysis failed: {e}", exc_info=True)
        return BPMAnalysisResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup
        if temp_dir and temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


@router.post("/stretch", response_model=TimeStretchResponse)
async def time_stretch(
    file: UploadFile = File(...),
    target_bpm: float = Query(..., gt=20, lt=300),
    preserve_pitch: bool = Query(True),
    quality: str = Query("high")
):
    """
    Time-stretch an audio file to target BPM
    
    Args:
        file: Audio file to stretch
        target_bpm: Target BPM
        preserve_pitch: Whether to preserve pitch
        quality: Quality preset (low, medium, high)
        
    Returns:
        Time-stretched audio file
    """
    import time
    import uuid
    
    temp_dir = None
    start_time = time.time()
    
    try:
        service = get_service()
        
        # Validate file
        validation = service.validate_audio_file(file)
        if not validation["valid"]:
            raise HTTPException(status_code=400, detail=validation["error"])
        
        # Create temp directory with session ID
        session_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.gettempdir()) / session_id
        temp_dir.mkdir(exist_ok=True)
        
        input_path = temp_dir / file.filename
        output_filename = f"stretched_{file.filename}"
        output_path = temp_dir / output_filename
        
        # Save uploaded file
        with open(input_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        
        # Analyze BPM first
        bpm_result = service.analyze_bpm(str(input_path))
        if not bpm_result["success"]:
            raise HTTPException(status_code=500, detail="Failed to analyze BPM")
        
        original_bpm = bpm_result["bpm"]
        
        # Perform time stretch
        stretch_result = service.time_stretch(
            str(input_path),
            str(output_path),
            original_bpm,
            target_bpm,
            preserve_pitch=preserve_pitch,
            quality=quality
        )
        
        if not stretch_result["success"]:
            raise HTTPException(status_code=500, detail=stretch_result.get("error", "Time stretch failed"))
        
        processing_time = time.time() - start_time
        
        # Generate download URL
        download_url = f"/api/audio/timestretch/download/{session_id}/{output_filename}"
        
        return TimeStretchResponse(
            success=True,
            audio_url=download_url,
            session_id=session_id,
            filename=output_filename,
            original_bpm=original_bpm,
            target_bpm=target_bpm,
            stretch_ratio=target_bpm / original_bpm,
            processing_time=round(processing_time, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Time stretch failed: {e}", exc_info=True)
        if temp_dir and temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)
        return TimeStretchResponse(
            success=False,
            error=str(e)
        )


@router.get("/download/{session_id}/{filename}")
async def download_stretched_audio(session_id: str, filename: str):
    """
    Download time-stretched audio file
    
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
    
    # Return with proper headers
    return Response(
        content=audio_data,
        media_type="audio/wav",
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
        return {
            "status": "healthy",
            "service": "Advanced Time Stretch",
            "features": ["BPM Analysis", "Time Stretching", "Pitch Preservation"],
            "supported_formats": ["WAV", "MP3", "FLAC", "M4A"],
            "quality_presets": ["low", "medium", "high"]
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
    Time Stretch API root endpoint
    """
    return {
        "service": "Advanced Time Stretch API",
        "version": "1.0.0",
        "endpoints": {
            "POST /analyze-bpm": "Analyze BPM of audio file",
            "POST /stretch": "Time-stretch audio to target BPM",
            "GET /download/{session_id}/{filename}": "Download stretched audio",
            "GET /health": "Health check"
        },
        "documentation": "/docs"
    }

