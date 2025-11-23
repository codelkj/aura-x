"""
MusicGen REST API Endpoints
Production-ready API for music generation with full optimizations
"""

from flask import Blueprint, request, jsonify, send_file
from flask_cors import cross_origin
import asyncio
import os
import tempfile
import logging
from typing import Dict, Any

from app.services.research.musicgen_integration_production import (
    MusicGenIntegration,
    MusicGenConfig
)

logger = logging.getLogger(__name__)

# Create Blueprint
musicgen_bp = Blueprint('musicgen', __name__, url_prefix='/api/research/musicgen')

# Global integration instance (singleton pattern)
_integration_instance: MusicGenIntegration | None = None


def get_integration() -> MusicGenIntegration:
    """Get or create MusicGen integration instance"""
    global _integration_instance
    
    if _integration_instance is None:
        logger.info("Initializing MusicGen integration...")
        
        config = MusicGenConfig(
            model_size="small",
            use_frequency_aware_quantization=True,
            use_temporal_cache=True,
            use_cultural_validation=True,
            duration=10.0,
            device="cpu"
        )
        
        _integration_instance = MusicGenIntegration(config)
        
        # Load model
        if not _integration_instance.load_model():
            logger.error("Failed to load MusicGen model")
            raise RuntimeError("Failed to initialize MusicGen")
        
        # Apply optimizations
        _integration_instance.apply_frequency_aware_quantization()
        _integration_instance.enable_temporal_cache()
        _integration_instance.enable_cultural_validation()
        
        logger.info("MusicGen integration initialized successfully")
    
    return _integration_instance


@musicgen_bp.route('/generate', methods=['POST'])
@cross_origin()
def generate_music():
    """
    Generate music from text prompt
    
    Request Body:
    {
        "prompt": "Upbeat Amapiano with log drums and piano, 120 BPM",
        "duration": 10.0,
        "temperature": 1.0,
        "top_k": 250,
        "top_p": 0.0,
        "return_audio": true  # If false, returns metadata only
    }
    
    Response:
    {
        "success": true,
        "audio_url": "https://...",  # If return_audio=true
        "metadata": {
            "duration": 10.0,
            "sample_rate": 32000,
            "latency": 0.68,
            "quality_score": 96.5,
            "authenticity_score": 99.1,
            "cache_hit": false
        }
    }
    """
    try:
        # Parse request
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({
                "success": False,
                "error": "Missing required field: prompt"
            }), 400
        
        prompt = data['prompt']
        duration = data.get('duration')
        temperature = data.get('temperature')
        top_k = data.get('top_k')
        top_p = data.get('top_p')
        return_audio = data.get('return_audio', True)
        
        logger.info(f"Received generation request: {prompt[:100]}...")
        
        # Get integration instance
        integration = get_integration()
        
        # Generate music
        result = asyncio.run(integration.generate(
            prompt=prompt,
            duration=duration,
            temperature=temperature,
            top_k=top_k,
            top_p=top_p
        ))
        
        if not result['success']:
            return jsonify(result), 500
        
        # Save audio to temporary file
        if return_audio:
            with tempfile.NamedTemporaryFile(
                suffix='.wav',
                delete=False,
                dir='/tmp'
            ) as tmp_file:
                temp_path = tmp_file.name
            
            integration.save_audio(result['audio_data'], temp_path)
            
            # Return audio file
            return send_file(
                temp_path,
                mimetype='audio/wav',
                as_attachment=True,
                download_name='generated_music.wav'
            )
        else:
            # Return metadata only
            return jsonify({
                "success": True,
                "metadata": result['metadata']
            })
    
    except Exception as e:
        logger.error(f"Generation failed: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@musicgen_bp.route('/info', methods=['GET'])
@cross_origin()
def get_info():
    """
    Get model information and status
    
    Response:
    {
        "model_size": "small",
        "is_initialized": true,
        "quantization_enabled": true,
        "cache_enabled": true,
        "validation_enabled": true,
        "device": "cpu",
        "status": "ready",
        "performance_metrics": {
            "total_generations": 42,
            "cache_hit_rate": 0.73,
            "avg_latency": 0.72,
            "avg_quality": 96.2,
            "avg_authenticity": 99.2
        }
    }
    """
    try:
        integration = get_integration()
        info = integration.get_info()
        
        return jsonify(info)
    
    except Exception as e:
        logger.error(f"Failed to get info: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@musicgen_bp.route('/cache/clear', methods=['POST'])
@cross_origin()
def clear_cache():
    """
    Clear temporal cache
    
    Response:
    {
        "success": true,
        "message": "Cache cleared successfully",
        "entries_removed": 142,
        "memory_freed_mb": 38.5
    }
    """
    try:
        integration = get_integration()
        result = integration.clear_cache()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
    
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@musicgen_bp.route('/metrics', methods=['GET'])
@cross_origin()
def get_metrics():
    """
    Get detailed performance metrics
    
    Response:
    {
        "total_generations": 100,
        "cache_hit_rate": 0.73,
        "cache_hits": 73,
        "cache_misses": 27,
        "avg_latency": 0.72,
        "avg_quality": 96.2,
        "avg_authenticity": 99.2,
        "is_quantized": true,
        "cache_enabled": true,
        "validation_enabled": true
    }
    """
    try:
        integration = get_integration()
        metrics = integration.get_metrics()
        
        return jsonify(metrics)
    
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@musicgen_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """
    Health check endpoint
    
    Response:
    {
        "status": "healthy",
        "model_loaded": true,
        "timestamp": "2025-11-06T20:00:00Z"
    }
    """
    try:
        from datetime import datetime
        
        integration = get_integration()
        
        return jsonify({
            "status": "healthy",
            "model_loaded": integration.is_initialized,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
    
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


# Error handlers
@musicgen_bp.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404


@musicgen_bp.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "success": False,
        "error": "Method not allowed"
    }), 405


@musicgen_bp.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500


# Register blueprint in main app
def register_musicgen_routes(app):
    """Register MusicGen routes with Flask app"""
    app.register_blueprint(musicgen_bp)
    logger.info("MusicGen routes registered")

