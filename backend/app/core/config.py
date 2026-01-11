import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Zero-Trust AI KYC Engine"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_FOR_JWT_SIGNING"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File Uploads (Uses absolute path to avoid errors)
    UPLOAD_FOLDER: str = os.path.join(os.getcwd(), "uploads")
    MAX_FILE_SIZE_MB: int = 5
    
    # AI Thresholds
    FACE_MATCH_THRESHOLD: float = 0.60
    OCR_CONFIDENCE_THRESHOLD: float = 0.50
    RISK_HIGH_THRESHOLD: int = 80
    RISK_MEDIUM_THRESHOLD: int = 40

    # Pydantic V2 Config
    model_config = {"case_sensitive": True}

# --- THIS LINE IS CRITICAL ---
# It creates the object that other files import
settings = Settings()

# Ensure upload folder exists immediately
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)