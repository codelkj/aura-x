# AURA-X Backend

FastAPI-based backend for the AURA-X platform.

## Features

- Text-to-Speech API (gTTS)
- Stem Separation API (Demucs v4)
- Cultural Authenticity Scoring
- Temporal Caching
- Plugin Management

## Tech Stack

- FastAPI
- Python 3.11
- gTTS (Text-to-Speech)
- Demucs v4 (Stem Separation)
- PyTorch

## Getting Started

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API documentation
# http://localhost:8000/docs
```

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI application
│   ├── services/         # Business logic
│   │   ├── tts_service.py
│   │   └── stem_service.py
│   └── routes/           # API endpoints
│       ├── tts_routes.py
│       └── stem_routes.py
├── requirements.txt
└── README.md
```

## API Endpoints

### Text-to-Speech

- `POST /api/tts/generate` - Generate voice from text
- `GET /api/tts/download/{filename}` - Download generated voice

### Stem Separation

- `POST /api/stem/separate` - Separate audio into stems
- `GET /api/stem/download/{filename}` - Download separated stems

## License

MIT License - see LICENSE file in root directory

