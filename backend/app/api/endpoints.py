from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.services.face_service import face_engine
from app.services.ocr_service import ocr_engine
from app.database import SessionLocal, KYCRecord
import shutil
import os
import uuid

router = APIRouter()

# Helper to talk to the DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/kyc/verify")
async def verify_kyc(
    id_card: UploadFile = File(...), 
    selfie: UploadFile = File(...),
    db: Session = Depends(get_db) # <--- This injects the database connection
):
    # 1. Save Images
    request_id = str(uuid.uuid4())
    print(f"🚀 Processing Request: {request_id}")
    
    os.makedirs("uploads/id_cards", exist_ok=True)
    os.makedirs("uploads/selfies", exist_ok=True)
    
    id_path = f"uploads/id_cards/{request_id}_id.jpg"
    selfie_path = f"uploads/selfies/{request_id}_selfie.jpg"
    
    with open(id_path, "wb") as buffer:
        shutil.copyfileobj(id_card.file, buffer)
    with open(selfie_path, "wb") as buffer:
        shutil.copyfileobj(selfie.file, buffer)

    # 2. Run AI
    ocr_data = ocr_engine.extract_text(id_path)
    face_result = face_engine.verify_faces(id_path, selfie_path)
    
    # 3. Decision
    if face_result["match"]:
        final_decision = "APPROVED"
    else:
        final_decision = "REJECTED"

    # 4. SAVE TO DATABASE (The New Part)
    new_record = KYCRecord(
        request_id=request_id,
        name=ocr_data["name"],
        id_number=ocr_data["id_number"],
        match_score=face_result["score"],
        decision=final_decision
    )
    db.add(new_record)
    db.commit()
    print(f"💾 Data Saved to kyc.db for {ocr_data['name']}")

    # 5. Respond
    return {
        "request_id": request_id,
        "final_decision": final_decision,
        "risk_score": int(face_result["score"]),
        "ocr_data": ocr_data,
        "face_match": face_result
    }

# New Endpoint: View History
@router.get("/kyc/history")
async def get_history(db: Session = Depends(get_db)):
    # Get last 10 records
    return db.query(KYCRecord).order_by(KYCRecord.id.desc()).limit(10).all()

# --- ADD THIS NEW ENDPOINT ---
@router.get("/kyc/stats")
async def get_stats(db: Session = Depends(get_db)):
    # 1. Count Total Records
    total_verified = db.query(KYCRecord).count()
    
    # 2. Count Approved Records to calculate Success Rate
    approved_count = db.query(KYCRecord).filter(KYCRecord.decision == "APPROVED").count()
    
    # 3. Calculate Percentage
    success_rate = 0
    if total_verified > 0:
        success_rate = round((approved_count / total_verified) * 100, 1)

    return {
        "total_verified": total_verified,
        "success_rate": success_rate,
        "status": "Online"
    }