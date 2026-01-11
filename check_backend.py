import os
import easyocr
import torch
from torchvision import models

print("\n🔍 STARTING BACKEND DIAGNOSIS...")
print("-" * 40)

# 1. CHECK OCR MODEL
print("1️⃣  Testing OCR Model (EasyOCR)...")
try:
    # gpu=False ensures it runs on CPU
    reader = easyocr.Reader(['en'], gpu=False) 
    print("   ✅ OCR Model Loaded Successfully! (Files found)")
except Exception as e:
    print(f"   ❌ OCR Failed: {e}")

print("-" * 40)

# 2. CHECK FACE MODEL
print("2️⃣  Testing Face Model (ResNet-18)...")
try:
    # This will look for the file in .cache/torch/hub/checkpoints
    resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    print("   ✅ Face Model Loaded Successfully! (File found)")
except Exception as e:
    print(f"   ❌ Face Model Failed: {e}")

print("-" * 40)