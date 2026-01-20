import easyocr
import re

class OCRService:
    def __init__(self):
        print("⚡ Loading Intelligent OCR Model (EasyOCR)...")
        # 'en' for English. gpu=False for safety (set True if you have NVIDIA GPU)
        self.reader = easyocr.Reader(['en'], gpu=False) 
        print("   ✅ OCR Model Loaded!")

    def extract_text(self, image_path):
        try:
            print(f"📖 Reading text from: {image_path}")
            
            # detail=0 gives us simple list of strings
            results = self.reader.readtext(image_path, detail=0)
            print(f"   🔍 Raw Text Found: {results}")

            # Initialize Default Data
            extracted_data = {
                "name": "",
                "id_number": "",
                "dob": None,
                "address": "",       # <--- NEW FIELD
                "raw_text": " ".join(results) # <--- CRITICAL: Send Full Text to Backend
            }

            # 1. Join all text for Regex searching
            full_text = extracted_data["raw_text"]
            
            # 2. Find Aadhaar (4 digits space 4 digits space 4 digits)
            id_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', full_text)
            if id_match:
                extracted_data["id_number"] = id_match.group(0)

            # 3. Find Name using "Anchor Strategy" (Line before DOB)
            dob_index = -1
            for i, line in enumerate(results):
                if "DOB" in line.upper() or "YEAR OF BIRTH" in line.upper() or re.search(r'\d{2}/\d{2}/\d{4}', line):
                    dob_index = i
                    extracted_data["dob"] = line
                    break
            
            if dob_index > 0:
                # Look at the line immediately before DOB
                potential_name = results[dob_index - 1]
                # Cleanup special chars
                clean_name = ''.join(e for e in potential_name if e.isalpha() or e.isspace()).strip()
                
                # If that line is too short (e.g. "Name:"), look one line higher
                if len(clean_name) < 3 and dob_index > 1:
                    potential_name = results[dob_index - 2]
                    clean_name = ''.join(e for e in potential_name if e.isalpha() or e.isspace()).strip()
                
                extracted_data["name"] = clean_name

            # 4. Fallback Name Detection (If no DOB found)
            elif not extracted_data["name"]:
                 for word in results:
                    # Ignore common keywords
                    if word.isalpha() and len(word) > 3 and word.upper() not in ["GOVERNMENT", "INDIA", "MALE", "FEMALE", "AADHAAR"]:
                        extracted_data["name"] = word
                        break

            # 5. Simple Address Detection (Look for 'Address' keyword)
            # This helps populate the 'address' field specifically
            for i, line in enumerate(results):
                if "ADDRESS" in line.upper():
                    # Join the next 3 lines as the address
                    address_lines = results[i:i+4]
                    extracted_data["address"] = ", ".join(address_lines)
                    break

            return extracted_data

        except Exception as e:
            print(f"❌ OCR Error: {e}")
            return {"name": "Error", "id_number": "Error", "raw_text": ""}

ocr_engine = OCRService()