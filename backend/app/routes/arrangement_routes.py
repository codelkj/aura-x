"""
AI Arrangement API Routes
Production-ready API endpoints for music structure analysis and arrangement
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import tempfile
import shutil
from pathlib import Path
import logging
import json

from ..services.ai_arrangement import AIArrangementService

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/audio/arrangement", tags=["AI Arrangement"])

# Global service instance
_service_instance = None


def get_service():
    """Get or create arrangement service instance"""
    global _service_instance
    if _service_instance is None:
        _service_instance = AIArrangementService()
    return _service_instance


class Section(BaseModel):
    """Music section model"""
    name: str
    start_time: float
    end_time: float
    duration: float
    confidence: float


class Instrument(BaseModel):
    """Detected instrument model"""
    name: str
    confidence: float
    presence: List[float]  # Time segments where instrument is present


class StructureAnalysisResponse(BaseModel):
    """Response model for structure analysis"""
    success: bool
    sections: Optional[List[Section]] = None
    total_duration: Optional[float] = None
    tempo: Optional[float] = None
    key: Optional[str] = None
    time_signature: Optional[str] = None
    error: Optional[str] = None


class InstrumentDetectionResponse(BaseModel):
    """Response model for instrument detection"""
    success: bool
    instruments: Optional[List[Instrument]] = None
    total_instruments: Optional[int] = None
    error: Optional[str] = None


class FullAnalysisResponse(BaseModel):
    """Response model for full arrangement analysis"""
    success: bool
    structure: Optional[Dict[str, Any]] = None
    instruments: Optional[List[Dict[str, Any]]] = None
    tempo: Optional[float] = None
    key: Optional[str] = None
    time_signature: Optional[str] = None
    total_duration: Optional[float] = None
    processing_time: Optional[float] = None
    error: Optional[str] = None


@router.post("/analyze-structure", response_model=StructureAnalysisResponse)
async def analyze_structure(file: UploadFile = File(...)):
    """
    Analyze musical structure of an audio file
    
    Args:
        file: Audio file (WAV, MP3, FLAC, M4A)
        
    Returns:
        Detected sections (intro, verse, chorus, bridge, outro, etc.)
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
        
        # Analyze structure
        result = service.analyze_structure(str(input_path))
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Structure analysis failed"))
        
        # Convert sections to Pydantic models
        sections = [
            Section(**section) for section in result.get("sections", [])
        ]
        
        return StructureAnalysisResponse(
            success=True,
            sections=sections,
            total_duration=result.get("total_duration"),
            tempo=result.get("tempo"),
            key=result.get("key"),
            time_signature=result.get("time_signature")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Structure analysis failed: {e}", exc_info=True)
        return StructureAnalysisResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup
        if temp_dir and temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


@router.post("/detect-instruments", response_model=InstrumentDetectionResponse)
async def detect_instruments(file: UploadFile = File(...)):
    """
    Detect instruments in an audio file
    
    Args:
        file: Audio file (WAV, MP3, FLAC, M4A)
        
    Returns:
        Detected instruments with confidence scores
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
        
        # Detect instruments
        result = service.detect_instruments(str(input_path))
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("error", "Instrument detection failed"))
        
        # Convert instruments to Pydantic models
        instruments = [
            Instrument(**inst) for inst in result.get("instruments", [])
        ]
        
        return InstrumentDetectionResponse(
            success=True,
            instruments=instruments,
            total_instruments=len(instruments)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Instrument detection failed: {e}", exc_info=True)
        return InstrumentDetectionResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup
        if temp_dir and temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


@router.post("/analyze-full", response_model=FullAnalysisResponse)
async def analyze_full(file: UploadFile = File(...)):
    """
    Perform full arrangement analysis (structure + instruments)
    
    Args:
        file: Audio file (WAV, MP3, FLAC, M4A)
        
    Returns:
        Complete arrangement analysis with structure and instruments
    """
    import time
    
    temp_dir = None
    start_time = time.time()
    
    try:
        service = get_service()
        
        # Create temp directory
        temp_dir = Path(tempfile.mkdtemp())
        input_path = temp_dir / file.filename
        
        # Save uploaded file
        with open(input_path, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        
        # Analyze structure
        structure_result = service.analyze_structure(str(input_path))
        if not structure_result["success"]:
            raise HTTPException(status_code=500, detail="Structure analysis failed")
        
        # Detect instruments
        instrument_result = service.detect_instruments(str(input_path))
        if not instrument_result["success"]:
            raise HTTPException(status_code=500, detail="Instrument detection failed")
        
        processing_time = time.time() - start_time
        
        return FullAnalysisResponse(
            success=True,
            structure={
                "sections": structure_result.get("sections", []),
                "total_duration": structure_result.get("total_duration")
            },
            instruments=instrument_result.get("instruments", []),
            tempo=structure_result.get("tempo"),
            key=structure_result.get("key"),
            time_signature=structure_result.get("time_signature"),
            total_duration=structure_result.get("total_duration"),
            processing_time=round(processing_time, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Full analysis failed: {e}", exc_info=True)
        return FullAnalysisResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup
        if temp_dir and temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        service = get_service()
        return {
            "status": "healthy",
            "service": "AI Arrangement Analysis",
            "features": ["Structure Analysis", "Instrument Detection", "Tempo/Key Detection"],
            "supported_formats": ["WAV", "MP3", "FLAC", "M4A"],
            "detectable_sections": ["intro", "verse", "chorus", "bridge", "outro", "breakdown", "drop"],
            "detectable_instruments": ["drums", "bass", "piano", "guitar", "synth", "vocals", "strings"]
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
    AI Arrangement API root endpoint
    """
    return {
        "service": "AI Arrangement Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "POST /analyze-structure": "Analyze musical structure and sections",
            "POST /detect-instruments": "Detect instruments in audio",
            "POST /analyze-full": "Full analysis (structure + instruments)",
            "GET /health": "Health check"
        },
        "documentation": "/docs"
    }

