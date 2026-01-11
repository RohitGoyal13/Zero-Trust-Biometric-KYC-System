import torch
from facenet_pytorch import MTCNN, InceptionResnetV1, fixed_image_standardization
from PIL import Image
from sklearn.metrics.pairwise import cosine_similarity
import os
import torchvision.transforms as transforms
import numpy as np

class FaceService:
    def __init__(self):
        print("⚡ Loading Advanced Face Model (FaceNet)...")
        try:
            # 1. MTCNN: Face Detector (Tune thresholds to be more sensitive)
            self.mtcnn = MTCNN(
                keep_all=False, 
                select_largest=True, 
                device='cpu',
                thresholds=[0.6, 0.7, 0.7] # Lower thresholds to detect blurry faces
            )
            
            # 2. InceptionResnet: The Recognizer
            self.resnet = InceptionResnetV1(pretrained='vggface2').eval()
            
            print("   ✅ FaceNet Model Loaded!")
            
        except Exception as e:
            print(f"❌ Critical Error Loading Face Model: {e}")
            raise e

    def get_embedding(self, image_path: str):
        try:
            filename = os.path.basename(image_path)
            print(f"🔍 Processing: {filename}...")
            
            # Load Image
            img = Image.open(image_path).convert('RGB')
            
            # 1. Try to detect face
            # We use save_path=None to get the tensor directly
            face_tensor = self.mtcnn(img)
            
            # 2. FALLBACK: If no face detected, force-process the whole image
            if face_tensor is None:
                print(f"   ⚠️ No face detected in {filename}. Using FALLBACK (Full Image).")
                
                # Resize to 160x160 (Required by FaceNet)
                img_resized = img.resize((160, 160))
                
                # Convert to Tensor (0-1 range)
                to_tensor = transforms.ToTensor()
                face_tensor = to_tensor(img_resized)
                
                # Scale to 0-255 roughly for standardization, then normalize
                # Formula: (x - 127.5) / 128.0
                face_tensor = (face_tensor * 255 - 127.5) / 128.0
            else:
                print(f"   ✅ Face Detected in {filename}!")

            # 3. Get Embedding
            # Add batch dimension (1, 3, 160, 160)
            if face_tensor.dim() == 3:
                face_tensor = face_tensor.unsqueeze(0)
                
            with torch.no_grad():
                embedding = self.resnet(face_tensor)
            
            return embedding.squeeze().numpy()

        except Exception as e:
            print(f"Error processing face: {e}")
            return None

    def verify_faces(self, id_card_path, selfie_path):
        vec1 = self.get_embedding(id_card_path)
        vec2 = self.get_embedding(selfie_path)

        if vec1 is None or vec2 is None:
            return {"match": False, "score": 0.0, "error": "Could not process image"}

        # Calculate Similarity
        raw_score = cosine_similarity(vec1.reshape(1, -1), vec2.reshape(1, -1))[0][0]
        score = float(raw_score) 
        match_percentage = round(score * 100, 2)
        
        print(f"📊 Match Score: {match_percentage}%")
        
        # Threshold
        is_match = match_percentage > 50.0 
        
        return {
            "match": is_match,
            "score": float(match_percentage),
            "error": None
        }

face_engine = FaceService()