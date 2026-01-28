# Health Track ML Microservice

A FastAPI-based machine learning microservice for health predictions, diagnostics, and analysis.

## Architecture

```
Frontend (React) 
    ↓
Express.js Backend (Port 5000)
    ↓ HTTP Requests
ML Microservice (FastAPI, Port 8000)
```

## Features

1. **Health Prediction** - Predict health risks based on patient data
2. **Diagnostic Assistance** - Get diagnostic suggestions based on symptoms
3. **Prescription Analysis** - Analyze prescriptions for drug interactions
4. **Report Analysis** - Analyze medical reports and identify abnormalities
5. **Health Recommendations** - Generate personalized health recommendations

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd ml-microservice
pip install -r requirements.txt
```

### 2. Configure Environment

Copy and configure the `.env` file:

```bash
# Already configured with default values
# Update if needed
```

Key environment variables:
- `PORT`: ML service port (default: 8000)
- `BACKEND_SERVICE_URL`: Express backend URL
- `ALLOWED_ORIGINS`: CORS allowed origins

### 3. Start the ML Microservice

```bash
# From ml-microservice directory
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs (Swagger UI)
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Health Prediction
```
POST /api/v1/health-prediction/predict
```
Predict health risks based on patient data.

### Diagnostic Assistance
```
POST /api/v1/diagnostic/diagnose
```
Get diagnostic suggestions based on symptoms.

### Prescription Analysis
```
POST /api/v1/prescription/analyze
```
Analyze prescriptions for interactions and safety.

### Report Analysis
```
POST /api/v1/report/analyze
```
Analyze medical reports and identify abnormalities.

### Health Recommendations
```
POST /api/v1/recommendations/generate
```
Generate personalized health recommendations.

### Health Check
```
GET /health
```
Check service health and available features.

## Integration with Express Backend

The Express.js backend communicates with this ML microservice through `/api/ai/*` routes.

Example flow:
1. Frontend sends request to Express backend: `POST /api/ai/health-prediction`
2. Express backend forwards to ML service: `POST http://localhost:8000/api/v1/health-prediction/predict`
3. ML service processes and returns results
4. Express backend returns results to frontend

## Development

### Project Structure
```
ml-microservice/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                   # Environment configuration
├── app/
│   ├── api/
│   │   ├── schemas.py     # Pydantic models
│   │   └── v1/
│   │       ├── router.py  # API router
│   │       └── endpoints/ # API endpoints
│   ├── core/
│   │   ├── config.py      # Configuration
│   │   └── logger.py      # Logging setup
│   └── services/
│       └── ml_service.py  # ML business logic
├── models/                # ML model files (add your trained models here)
└── logs/                  # Application logs
```

### Adding Custom ML Models

1. Place your trained model files in the `models/` directory
2. Update `ml_service.py` to load and use your models
3. Modify prediction methods to use actual ML inference

### Testing

View API documentation and test endpoints:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Production Considerations

1. **Security**
   - Enable API key authentication (configure `API_KEYS` in .env)
   - Use HTTPS in production
   - Restrict CORS origins

2. **Performance**
   - Implement model caching
   - Use async operations
   - Add request rate limiting

3. **Monitoring**
   - Check logs in `logs/` directory
   - Implement health checks
   - Monitor response times

4. **Deployment**
   - Use production ASGI server (gunicorn with uvicorn workers)
   - Set up proper logging and monitoring
   - Configure proper error handling

## Troubleshooting

### Service won't start
- Check if port 8000 is available
- Verify Python dependencies are installed
- Check `.env` configuration

### Backend can't connect to ML service
- Ensure ML service is running on port 8000
- Verify `ML_SERVICE_URL` in backend `.env`
- Check firewall settings

### Model predictions failing
- Verify model files are in `models/` directory
- Check model file paths in configuration
- Review logs in `logs/` directory
