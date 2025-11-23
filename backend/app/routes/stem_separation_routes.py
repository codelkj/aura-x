"""
Real Stem Separation API Routes
FastAPI endpoints for REAL audio stem separation
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from pathlib import Path
import logging
import tempfile
import shutil
import os

from ..services.research.real_stem_separator import RealStemSeparator

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/research/stem-separation", tags=["Stem Separation"])

# Global separator instance
_separator_instance = None

def get_separator():
    """Get or create separator instance"""
    global _separator_instance
    if _separator_instance is None:
        _separator_instance = RealStemSeparator()
        logger.info("Real stem separator initialized")
    return _separator_instance


class SeparationResponse(BaseModel):
    """Response model for stem separation"""
    success: bool
    message: str
    stems: List[Dict]
    separation_metrics: Dict
    processing_time_seconds: float


class StemDownloadRequest(BaseModel):
    """Request model for stem download"""
    stem_type: str
    session_id: str


@router.post("/separate", response_model=SeparationResponse)
async def separate_audio(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Perform REAL stem separation on uploaded audio file.
    
    Args:
        file: Audio file to separate (WAV, MP3, FLAC, etc.)
        
    Returns:
        SeparationResponse with separated stems information
    """
    import time
    start_time = time.time()
    
    # Validate file type
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ['.wav', '.mp3', '.flac', '.m4a', '.ogg']:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: {file_ext}. Supported: WAV, MP3, FLAC, M4A, OGG"
        )
    
    # Create temporary directory for this separation session
    temp_dir = Path(tempfile.mkdtemp(prefix="stem_separation_"))
    input_path = temp_dir / f"input{file_ext}"
    output_dir = temp_dir / "stems"
    output_dir.mkdir(exist_ok=True)
    
    try:
        # Save uploaded file
        logger.info(f"Saving uploaded file: {file.filename}")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Perform REAL stem separation
        logger.info(f"Starting REAL stem separation for: {file.filename}")
        separator = get_separator()
        stems_info = separator.separate_stems(str(input_path), output_dir)
        
        # Calculate separation metrics
        logger.info("Calculating separation metrics...")
        metrics = separator.calculate_separation_metrics(str(input_path), stems_info)
        
        processing_time = time.time() - start_time
        
        # Update stem paths to be accessible via API
        session_id = temp_dir.name
        for stem in stems_info:
            stem['download_url'] = f"/api/research/stem-separation/download/{session_id}/{stem['filename']}"
            stem['session_id'] = session_id
        
        logger.info(f"Separation complete in {processing_time:.2f}s")
        
        # Schedule cleanup after 1 hour
        if background_tasks:
            background_tasks.add_task(cleanup_session, temp_dir, delay=3600)
        
        return SeparationResponse(
            success=True,
            message=f"Successfully separated {len(stems_info)} stems",
            stems=stems_info,
            separation_metrics=metrics,
            processing_time_seconds=round(processing_time, 2)
        )
        
    except Exception as e:
        logger.error(f"Stem separation failed: {e}", exc_info=True)
        # Cleanup on error
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Stem separation failed: {str(e)}")


@router.get("/download/{session_id}/{filename}")
async def download_stem(session_id: str, filename: str, background_tasks: BackgroundTasks):
    """
    Download a separated stem file.
    
    Args:
        session_id: Session identifier
        filename: Stem filename
        
    Returns:
        FileResponse with the stem audio file
    """
    from fastapi.responses import Response
    import os
    
    # Construct file path
    temp_dir = Path(tempfile.gettempdir()) / session_id
    stem_path = temp_dir / "stems" / filename
    
    if not stem_path.exists():
        raise HTTPException(status_code=404, detail="Stem file not found or session expired")
    
    # Read the entire file
    with open(stem_path, 'rb') as f:
        audio_data = f.read()
    
    # Return with proper headers for browser audio playback
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
        separator = get_separator()
        return {
            "status": "healthy",
            "service": "Real Stem Separation",
            "sample_rate": separator.sample_rate,
            "stem_types": list(separator.freq_ranges.keys())
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def cleanup_session(temp_dir: Path, delay: int = 0):
    """
    Clean up temporary session directory.
    
    Args:
        temp_dir: Directory to clean up
        delay: Delay in seconds before cleanup
    """
    import asyncio
    if delay > 0:
        await asyncio.sleep(delay)
    
    try:
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
            logger.info(f"Cleaned up session directory: {temp_dir.name}")
    except Exception as e:
        logger.error(f"Failed to cleanup session directory: {e}")


@router.get("/")
async def root():
    """
    Stem Separation API root endpoint
    """
    return {
        "service": "Real Stem Separation API",
        "version": "1.0.0",
        "description": "REAL audio stem separation using frequency-based filtering and harmonic-percussive separation",
        "endpoints": {
            "POST /separate": "Separate audio file into stems",
            "GET /download/{session_id}/{filename}": "Download separated stem",
            "GET /health": "Health check"
        },
        "supported_formats": ["WAV", "MP3", "FLAC", "M4A", "OGG"],
        "stem_types": ["vocals", "log_drums", "piano", "bass", "percussion", "synths", "effects"]
    }

