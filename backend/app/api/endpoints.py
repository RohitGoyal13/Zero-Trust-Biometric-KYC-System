from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.face_service import face_engine
from app.services.ocr_service import ocr_engine
from app.database import SessionLocal, KYCRecord
import shutil
import os
import uuid
import re

router = APIRouter()

# Global Cache
KNOWN_DISTRICTS = set()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def ensure_districts_loaded(db: Session):
    if not KNOWN_DISTRICTS:
        results = db.execute(text("SELECT DISTINCT District FROM uidai_regional_risk")).fetchall()
        for row in results:
            if row[0]:
                KNOWN_DISTRICTS.add(row[0].strip().upper())

@router.post("/kyc/verify")
async def verify_kyc(
    id_card_front: UploadFile = File(...),  # <--- Renamed
    id_card_back: UploadFile = File(...),   # <--- NEW INPUT
    selfie: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    ensure_districts_loaded(db)

    request_id = str(uuid.uuid4())
    print(f"🚀 Processing Request: {request_id}")

    os.makedirs("uploads/id_cards", exist_ok=True)
    os.makedirs("uploads/selfies", exist_ok=True)
    
    # Save all 3 files
    front_path = f"uploads/id_cards/{request_id}_front.jpg"
    back_path = f"uploads/id_cards/{request_id}_back.jpg"
    selfie_path = f"uploads/selfies/{request_id}_selfie.jpg"
    
    with open(front_path, "wb") as buffer:
        shutil.copyfileobj(id_card_front.file, buffer)
    with open(back_path, "wb") as buffer:
        shutil.copyfileobj(id_card_back.file, buffer)
    with open(selfie_path, "wb") as buffer:
        shutil.copyfileobj(selfie.file, buffer)

    # 1. AI TASKS
    # Face Match: Uses Front + Selfie
    face_result = face_engine.verify_faces(front_path, selfie_path)
    
    # OCR: Extract text from BOTH sides
    ocr_front = ocr_engine.extract_text(front_path)
    ocr_back = ocr_engine.extract_text(back_path)
    
    # Merge OCR Data
    # We use Front for Name/ID and Back for Address
    combined_ocr = {
        "name": ocr_front.get("name"),
        "id_number": ocr_front.get("id_number"),
        "address_front": ocr_front.get("address", ""),
        "address_back": ocr_back.get("address", ""), # This usually contains the PIN
        "raw_text_back": ocr_back.get("raw_text", "") # Full text scan of back
    }

    final_decision = "APPROVED" if face_result["match"] else "REJECTED"

    # 2. SMART LOCATION DETECTION (Using Back Side Text)
    detected_location = "Unknown"
    regional_risk = 0
    
    # Scan the BACK side text for PIN Codes or District Names
    full_back_text = f"{combined_ocr['address_back']} {combined_ocr['raw_text_back']}"
    
    # STRATEGY A: Find 6-Digit PIN Code on Back
    pin_matches = re.findall(r'\b[1-9][0-9]{5}\b', full_back_text)
    
    found = False
    if pin_matches:
        for pin in pin_matches:
            query = text("SELECT District, Risk_Score FROM uidai_regional_risk WHERE Pincode = :pin LIMIT 1")
            result = db.execute(query, {"pin": pin}).fetchone()
            if result:
                detected_location = result[0]
                regional_risk = int(result[1])
                found = True
                print(f"📍 Found Location via PIN {pin}: {detected_location}")
                break
    
    # STRATEGY B: Fallback to District Name Search
    if not found:
        print("⚠️ No PIN found, checking District names...")
        text_upper = full_back_text.upper()
        for district in KNOWN_DISTRICTS:
            if f" {district} " in text_upper:
                detected_location = district
                res = db.execute(text("SELECT Risk_Score FROM uidai_regional_risk WHERE District = :dist LIMIT 1"), {"dist": district}).fetchone()
                if res:
                    regional_risk = int(res[0])
                break

    # 3. Save Record
    new_record = KYCRecord(
        request_id=request_id,
        name=combined_ocr["name"],
        id_number=combined_ocr["id_number"],
        match_score=face_result["score"],
        decision=final_decision
    )
    db.add(new_record)
    db.commit()

    return {
        "request_id": request_id,
        "final_decision": final_decision,
        "risk_score": int(face_result["score"]),
        "ocr_data": combined_ocr,
        "face_match": face_result,
        "regional_risk": {
            "district": detected_location.title(),
            "score": regional_risk,
            "level": "High" if regional_risk > 50 else "Low"
        }
    }

# Keep existing history/stats endpoints...
@router.get("/kyc/history")
async def get_history(db: Session = Depends(get_db)):
    return db.query(KYCRecord).order_by(KYCRecord.id.desc()).limit(10).all()

@router.get("/kyc/stats")
async def get_stats(db: Session = Depends(get_db)):
    total = db.query(KYCRecord).count()
    approved = db.query(KYCRecord).filter(KYCRecord.decision == "APPROVED").count()
    rate = round((approved / total) * 100, 1) if total > 0 else 0
    return {"total_verified": total, "success_rate": rate, "status": "Online"}

# --- ANALYTICS DASHBOARD ENDPOINT ---
@router.get("/kyc/analytics-dashboard")
async def get_analytics_dashboard(db: Session = Depends(get_db)):
    # 1. Verification Stats
    total = db.query(KYCRecord).count()
    approved = db.query(KYCRecord).filter(KYCRecord.decision == "APPROVED").count()
    rejected = total - approved
    
    # 2. Top 5 Riskiest Districts (From your Big Data Table)
    # We query the Static Risk Table for the highest scores
    top_risky = db.execute(text(
        "SELECT DISTINCT District, Risk_Score, State FROM uidai_regional_risk ORDER BY Risk_Score DESC LIMIT 5"
    )).fetchall()
    
    risky_districts = [
        {"name": row[0], "score": int(row[1]), "state": row[2]} 
        for row in top_risky
    ]

    # 3. Recent Fraud Attempts (Live Feed)
    recent_failures = db.query(KYCRecord).filter(KYCRecord.decision == "REJECTED").order_by(KYCRecord.timestamp.desc()).limit(5).all()

    return {
        "verifications": {
            "total": total,
            "approved": approved,
            "rejected": rejected
        },
        "hotspots": risky_districts,
        "recent_alerts": recent_failures
    }