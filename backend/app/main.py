from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router
from app.services.ocr_service import ocr_engine
from app.services.face_service import face_engine
import uvicorn
import os

app = FastAPI(title="AI KYC System")

# --- THIS IS THE FIX (CORS POLICY) ---
# It tells the backend: "Accept requests from the Frontend"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (simplest for local dev)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup_event():
    print("🚀 API Server Starting...")
    # Ensure upload directories exist
    os.makedirs("uploads/id_cards", exist_ok=True)
    os.makedirs("uploads/selfies", exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "✅ Zero-Trust KYC Engine is Running!"}

app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)