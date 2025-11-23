"""
ML Humanization API Routes
Production-ready API endpoints for MIDI humanization and groove extraction
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import tempfile
import shutil
from pathlib import Path
import logging
import json

from ..services.ml_humanization import MLHumanizationService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/audio/humanization", tags=["ML Humanization"])

# Global service instance
_service_instance = None


def get_service():
    """Get or create humanization service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = MLHumanizationService()
    return _service_instance


class GrooveExtractionResponse(BaseModel):
    """Response model for groove extraction"""
    success: bool
    groove_pattern: Optional[Dict[str, Any]] = None
    tempo: Optional[float] = None
    swing_amount: Optional[float] = None
    velocity_curve: Optional[List[float]] = None
    error: Optional[str] = None


class HumanizationRequest(BaseModel):
    """Request model for MIDI humanization"""
    timing_variation: float = Field(0.02, description="Timing variation amount", ge=0.0, le=0.1)
    velocity_variation: float = Field(0.15, description="Velocity variation amount", ge=0.0, le=0.5)
    apply_swing: bool = Field(False, description="Apply swing to notes")
    swing_amount: float = Field(0.5, description="Swing amount", ge=0.0, le=1.0)
    preserve_quantization: bool = Field(False, description="Preserve quantization grid")


class HumanizationResponse(BaseModel):
    """Response model for MIDI humanization"""
    success: bool
    midi_url: Optional[str] = None
    session_id: Optional[str] = None
    filename: Optional[str] = None
    notes_processed: Optional[int] = None
    timing_adjustments: Optional[int] = None
    velocity_adjustments: Optional[int] = None
    processing_time: Optional[float] = None
    error: Optional[str] = None


@router.post("/extract-groove", response_model=GrooveExtractionResponse)
async def extract_groove(file: UploadFile = File(...)):
    """
    Extract groove pattern from audio file
    
    Args:
        file: Audio file (WAV, MP3, FLAC, M4A)
        
    Returns:
        Extracted groove pattern with tempo and swing information
    """
    temp_dir = None
    try:
        service = get_service()
        
        # Create temp directory
        temp_dir = Path(tempfile.mkdtemp())
        input_path = temp_dir / file.filename
        
        # Save uploaded file
        with open(input_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        
        # Extract groove
        result = service.extract_groove_from_audio(str(input_path))
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Groove extraction failed"))
        
        return GrooveExtractionResponse(
            success=True,
            groove_pattern=result.get("groove_pattern"),
            tempo=result.get("tempo"),
            swing_amount=result.get("swing_amount"),
            velocity_curve=result.get("velocity_curve", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Groove extraction failed: {e}", exc_info=True)
        return GrooveExtractionResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup
        if temp_dir and temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


@router.post("/humanize-midi", response_model=HumanizationResponse)
async def humanize_midi(
    file: UploadFile = File(...),
    timing_variation: float = Query(0.02),
    velocity_variation: float = Query(0.15),
    apply_swing: bool = Query(False),
    swing_amount: float = Query(0.5),
    preserve_quantization: bool = Query(False)
):
    """
    Humanize a MIDI file with ML-based variations
    
    Args:
        file: MIDI file to humanize
        timing_variation: Amount of timing variation (0.0-0.1)
        velocity_variation: Amount of velocity variation (0.0-0.5)
        apply_swing: Whether to apply swing
        swing_amount: Amount of swing (0.0-1.0)
        preserve_quantization: Keep notes on grid
        
    Returns:
        Humanized MIDI file
    """
    import time
    import uuid
    
    temp_dir = None
    start_time = time.time()
    
    try:
        service = get_service()
        
        # Validate MIDI file
        if not file.filename.lower().endswith(('.mid', '.midi')):
            raise HTTPException(status_code=400, detail="File must be a MIDI file (.mid or .midi)")
        
        # Create temp directory with session ID
        session_id = str(uuid.uuid4())
        temp_dir = Path(tempfile.gettempdir()) / session_id
        temp_dir.mkdir(exist_ok=True)
        
        input_path = temp_dir / file.filename
        output_filename = f"humanized_{file.filename}"
        output_path = temp_dir / output_filename
        
        # Save uploaded file
        with open(input_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        
        # Humanize MIDI
        humanize_result = service.humanize_midi(
            str(input_path),
            str(output_path),
            timing_variation=timing_variation,
            velocity_variation=velocity_variation,
            apply_swing=apply_swing,
            swing_amount=swing_amount,
            preserve_quantization=preserve_quantization
        )
        
        if not humanize_result["success"]:
            raise HTTPException(status_code=500, detail=humanize_result.get("error", "Humanization failed"))
        
        processing_time = time.time() - start_time
        
        # Generate download URL
        download_url = f"/api/audio/humanization/download/{session_id}/{output_filename}"
        
        return HumanizationResponse(
            success=True,
            midi_url=download_url,
            session_id=session_id,
            filename=output_filename,
            notes_processed=humanize_result.get("notes_processed", 0),
            timing_adjustments=humanize_result.get("timing_adjustments", 0),
            velocity_adjustments=humanize_result.get("velocity_adjustments", 0),
            processing_time=round(processing_time, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"MIDI humanization failed: {e}", exc_info=True)
        if temp_dir and temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)
        return HumanizationResponse(
            success=False,
            error=str(e)
        )


@router.get("/download/{session_id}/{filename}")
async def download_humanized_midi(session_id: str, filename: str):
    """
    Download humanized MIDI file
    
    Args:
        session_id: Session identifier
        filename: MIDI filename
        
    Returns:
        MIDI file
    """
    # Construct file path
    temp_dir = Path(tempfile.gettempdir()) / session_id
    midi_path = temp_dir / filename
    
    if not midi_path.exists():
        raise HTTPException(status_code=404, detail="MIDI file not found or session expired")
    
    # Read file
    with open(midi_path, 'rb') as f:
        midi_data = f.read()
    
    # Return with proper headers
    return Response(
        content=midi_data,
        media_type="audio/midi",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(midi_data)),
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*"
        }
    )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        service = get_service()
        return {
            "status": "healthy",
            "service": "ML Humanization",
            "features": ["Groove Extraction", "MIDI Humanization", "Swing Application"],
            "supported_input": ["MIDI files", "Audio files for groove extraction"],
            "parameters": {
                "timing_variation": "0.0-0.1",
                "velocity_variation": "0.0-0.5",
                "swing_amount": "0.0-1.0"
            }
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
    ML Humanization API root endpoint
    """
    return {
        "service": "ML Humanization API",
        "version": "1.0.0",
        "endpoints": {
            "POST /extract-groove": "Extract groove pattern from audio",
            "POST /humanize-midi": "Humanize MIDI file with ML variations",
            "GET /download/{session_id}/{filename}": "Download humanized MIDI",
            "GET /health": "Health check"
        },
        "documentation": "/docs"
    }

