from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.face_service import face_engine
from app.services.ocr_service import ocr_engine
import shutil
import os
import uuid

router = APIRouter()

@router.post("/kyc/verify")
async def verify_kyc(id_card: UploadFile = File(...), selfie: UploadFile = File(...)):
    # 1. Save Files
    request_id = str(uuid.uuid4())
    print(f"🚀 Processing Request: {request_id}")
    
    id_path = f"uploads/id_cards/{request_id}_id.jpg"
    selfie_path = f"uploads/selfies/{request_id}_selfie.jpg"
    
    # Ensure directories exist
    os.makedirs("uploads/id_cards", exist_ok=True)
    os.makedirs("uploads/selfies", exist_ok=True)
    
    with open(id_path, "wb") as buffer:
        shutil.copyfileobj(id_card.file, buffer)
    with open(selfie_path, "wb") as buffer:
        shutil.copyfileobj(selfie.file, buffer)

    # 2. Run AI Models
    print(f"   running OCR...")
    ocr_data = ocr_engine.extract_text(id_path)
    
    print(f"   running Face Match...")
    face_result = face_engine.verify_faces(id_path, selfie_path)
    
    # 3. Decision Logic (Fixed)
    # If the face matches, we APPROVE, even if OCR struggled with the name.
    if face_result["match"]:
        final_decision = "APPROVED"
        # Risk score is basically the face match confidence
        risk_score = int(face_result["score"])
    else:
        final_decision = "REJECTED"
        risk_score = 0

    # 4. Construct Response
    # CRITICAL: We ensure 'face_match' is passed exactly as is.
    response_data = {
        "request_id": request_id,
        "final_decision": final_decision,
        "risk_score": risk_score,
        "ocr_data": ocr_data,
        "face_match": face_result  # This contains the 97.84% score
    }
    
    print(f"✅ Response Sent: {final_decision} (Score: {face_result['score']}%)")
    return response_data