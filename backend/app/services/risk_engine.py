from app.core.config import settings

class RiskEngine:
    def calculate_risk(self, ocr_data, face_result):
        """
        Combines multiple signals to generate a Final Fraud Score.
        0 = High Risk (Fraud), 100 = Low Risk (Trustworthy)
        """
        
        # 1. Normalize Scores
        # Face score is already 0-100
        face_score = face_result.get("score", 0)
        
        # OCR Confidence is usually 0.0 to 1.0 -> Convert to 0-100
        ocr_confidence_score = ocr_data.get("avg_confidence", 0) * 100
        
        # 2. Define Weights (Banking Standard)
        # Face Match is critical: 50% weight
        # Document Clarity (OCR) is important: 30% weight
        # Metadata/Format Check: 20% weight (Bonus)
        
        w_face = 0.5
        w_ocr = 0.3
        w_meta = 0.2
        
        # Calculate Weighted Sum
        # Note: If face didn't match (low score), this will drag the total down heavily.
        total_score = (face_score * w_face) + (ocr_confidence_score * w_ocr)
        
        # Bonus: Did we detect a valid ID number?
        if ocr_data.get("id_number"):
            total_score += (100 * w_meta)
        else:
            total_score += (0 * w_meta)

        # 3. Determine Risk Level
        risk_level = "HIGH"
        if total_score >= settings.RISK_HIGH_THRESHOLD: # e.g. > 80
            risk_level = "LOW"
        elif total_score >= settings.RISK_MEDIUM_THRESHOLD: # e.g. > 40
            risk_level = "MEDIUM"

        return {
            "total_score": round(total_score, 2),
            "risk_level": risk_level,
            "breakdown": {
                "face_score": face_score,
                "ocr_score": round(ocr_confidence_score, 2),
                "id_detected": bool(ocr_data.get("id_number"))
            }
        }

risk_engine = RiskEngine()