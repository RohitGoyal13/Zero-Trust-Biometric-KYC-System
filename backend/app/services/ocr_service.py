import easyocr
import re

class OCRService:
    def __init__(self):
        print("⚡ Loading Intelligent OCR Model (EasyOCR)...")
        # 'en' for English. gpu=False for safety.
        self.reader = easyocr.Reader(['en'], gpu=False) 
        print("   ✅ OCR Model Loaded!")

    def extract_text(self, image_path):
        try:
            print(f"📖 Reading text from: {image_path}")
            
            # detail=0 gives us simple list of strings
            results = self.reader.readtext(image_path, detail=0)
            print(f"   🔍 Raw Text Found: {results}")

            extracted_data = {
                "name": "Not Detected",
                "id_number": "---",
                "dob": None
            }

            # 1. Join all text to find the ID Number (regex works better on full text)
            full_text = " ".join(results)
            
            # Find Aadhaar (4 digits space 4 digits space 4 digits)
            id_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', full_text)
            if id_match:
                extracted_data["id_number"] = id_match.group(0)

            # 2. Find Name using "Anchor Strategy"
            # The Name is usually the line IMMEDIATELY BEFORE the Date of Birth (DOB)
            
            dob_index = -1
            
            # First, find which line has the DOB
            for i, line in enumerate(results):
                # Check for "DOB" keyword OR a date pattern like DD/MM/YYYY
                if "DOB" in line.upper() or re.search(r'\d{2}/\d{2}/\d{4}', line):
                    dob_index = i
                    extracted_data["dob"] = line # Store the raw DOB line
                    break
            
            # If we found the DOB line, the name is likely at (i - 1) or (i - 2)
            if dob_index > 0:
                # Look at the line before DOB
                potential_name = results[dob_index - 1]
                
                # Cleanup: specific fix for Aadhaar which often has "Father: xyz" or Hindi text
                # We filter to ensure it looks like a name (mostly letters)
                clean_name = ''.join(e for e in potential_name if e.isalpha() or e.isspace()).strip()
                
                # If the line before is just "Father" or empty, go up one more line
                if len(clean_name) < 3 and dob_index > 1:
                    potential_name = results[dob_index - 2]
                    clean_name = ''.join(e for e in potential_name if e.isalpha() or e.isspace()).strip()
                
                extracted_data["name"] = clean_name
                print(f"   🎯 Logic: Found DOB at line {dob_index}, inferred Name is '{clean_name}'")

            # Fallback: If no DOB anchor found, try the old heuristic
            elif extracted_data["name"] == "Not Detected":
                 for word in results:
                    if word.isalpha() and len(word) > 3 and word.upper() not in ["GOVERNMENT", "INDIA", "MALE", "FEMALE"]:
                        extracted_data["name"] = word
                        break

            return extracted_data

        except Exception as e:
            print(f"❌ OCR Error: {e}")
            return {"name": "Error", "id_number": "Error"}

ocr_engine = OCRService()