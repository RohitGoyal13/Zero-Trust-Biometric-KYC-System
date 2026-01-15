# 🛡️ Zero-Trust Biometric KYC System

<div align="center">

![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Banking-Grade Identity Verification powered by Local Deep Learning**

[Features](#-features) • [Installation](#-quick-start) • [Architecture](#-architecture) • [API Docs](#-api-documentation)

</div>

---

## 🎯 What is This?

A **privacy-first KYC (Know Your Customer) verification system** that processes identity documents and biometric data **100% locally** — no cloud APIs, no third-party services, no data leaks.

**Perfect for:**
- FinTech applications requiring GDPR/DPDP compliance
- Banking systems that need data sovereignty
- Governments and organizations with strict privacy policies
- Anyone who doesn't want to pay AWS Rekognition $1 per face match

---

## ✨ Features

### 🧠 **AI-Powered Verification**
- **FaceNet Deep Learning**: Generates 128-dimensional face embeddings using InceptionResnetV1
- **MTCNN Face Detection**: Multi-task cascaded convolutional networks for precise face alignment
- **EasyOCR**: Extracts text from ID cards (supports 80+ languages)
- **Liveness Detection**: Compares selfie vs ID photo using cosine similarity (>50% threshold)

### 🎨 **Modern Frontend**
- React 18 + Vite for blazing-fast performance
- Tailwind CSS with glassmorphism design
- Real-time webcam capture
- Live verification status updates
- Responsive mobile-first design

### ⚡ **Robust Backend**
- FastAPI async REST API
- SQLite database with SQLAlchemy ORM
- Image preprocessing and validation
- Risk scoring algorithm
- Verification history tracking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│              React + Vite + Tailwind CSS                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP POST (multipart/form-data)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Validate   │→ │  Preprocess  │→ │   AI Engine  │          │
│  │    Images    │  │    Images    │  │              │          │
│  └──────────────┘  └──────────────┘  └───────┬──────┘          │
│                                               │                  │
│  ┌──────────────────────────────────────────┼──────────────┐   │
│  │           AI PROCESSING LAYER            │              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────▼────────┐     │   │
│  │  │ MTCNN    │→ │ FaceNet  │→ │ Cosine Similarity │     │   │
│  │  │ Detector │  │ Encoder  │  │   Calculation     │     │   │
│  │  └──────────┘  └──────────┘  └───────────────────┘     │   │
│  │  ┌──────────┐                                           │   │
│  │  │ EasyOCR  │→ Extract Name + ID Number                 │   │
│  │  └──────────┘                                           │   │
│  └─────────────────────────────┬────────────────────────────┘  │
│                                 │                                │
│                                 ▼                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         RESULT: Match Score + OCR Data + Decision        │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ SQLite Database │
                    │  (Persistence)  │
                    └─────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisites**
- Python 3.9 or higher
- Node.js 16 or higher
- 4GB RAM minimum (8GB recommended for model loading)

### **Step 1: Clone Repository**
```bash
git clone https://github.com/yourusername/zero-trust-kyc.git
cd zero-trust-kyc
```

### **Step 2: Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Wait for:** `✅ FaceNet Model Loaded Successfully!`

### **Step 3: Frontend Setup**
```bash
# Open NEW terminal
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Open browser:** `http://localhost:5173`

---

## 📦 Dependencies

### **Backend** (`requirements.txt`)
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
python-multipart==0.0.6
torch==2.1.0
torchvision==0.16.0
facenet-pytorch==2.5.3
easyocr==1.7.1
numpy==1.24.3
opencv-python-headless==4.8.1.78
Pillow==10.1.0
```

### **Frontend** (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "react-webcam": "^7.2.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.5"
  }
}
```

---

## 🔌 API Documentation

### **Base URL:** `http://localhost:8000`

### **1. Verify KYC**
```http
POST /api/v1/kyc/verify
Content-Type: multipart/form-data

Parameters:
  - id_card: File (JPEG/PNG, max 10MB)
  - selfie: File (JPEG/PNG, max 10MB)

Response:
{
  "success": true,
  "decision": "APPROVED",
  "confidence": 87.5,
  "match_score": 0.8234,
  "ocr_data": {
    "name": "JOHN DOE",
    "id_number": "AB123456"
  },
  "risk_level": "LOW",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### **2. Get Verification History**
```http
GET /api/v1/kyc/history?limit=50

Response:
{
  "total": 127,
  "records": [
    {
      "id": 1,
      "name": "JOHN DOE",
      "decision": "APPROVED",
      "match_score": 0.82,
      "timestamp": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### **3. Get System Stats**
```http
GET /api/v1/kyc/stats

Response:
{
  "total_verifications": 1247,
  "approved": 1089,
  "rejected": 158,
  "success_rate": 87.3,
  "avg_confidence": 82.1
}
```

---

## 🧪 How It Works

### **1. Face Matching Pipeline**
```python
# User uploads ID card + selfie
id_card = preprocess_image(id_card_file)
selfie = preprocess_image(selfie_file)

# Detect faces using MTCNN
id_face = mtcnn(id_card)
selfie_face = mtcnn(selfie)

# Generate embeddings using FaceNet
id_embedding = facenet(id_face)  # 128-dimensional vector
selfie_embedding = facenet(selfie_face)

# Calculate cosine similarity
similarity = cosine_similarity(id_embedding, selfie_embedding)

# Decision logic
if similarity > 0.50:
    decision = "APPROVED"
elif similarity > 0.35:
    decision = "MANUAL_REVIEW"
else:
    decision = "REJECTED"
```

### **2. OCR Text Extraction**
```python
# Extract text from ID card
reader = easyocr.Reader(['en'])
results = reader.readtext(id_card)

# Parse name and ID number using regex
name = extract_name(results)
id_number = extract_id(results)
```

---

## 🛠️ Configuration

Create `.env` file in backend folder:
```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# Database
DATABASE_URL=sqlite:///./kyc_database.db

# AI Models
FACE_MATCH_THRESHOLD=0.50
OCR_LANGUAGES=en

# Security
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=jpg,jpeg,png
```

---

## 🔐 Security Features

- ✅ Image validation (file type, size, dimensions)
- ✅ No data sent to external APIs
- ✅ Encrypted database storage option
- ✅ Rate limiting on API endpoints
- ✅ CORS protection
- ✅ Input sanitization

---

## 🚧 Roadmap

- [ ] Active liveness detection (blink, turn head)
- [ ] Multi-language OCR support
- [ ] Admin dashboard with analytics
- [ ] Export verification reports (PDF)
- [ ] Webhook support for real-time notifications
- [ ] GPU acceleration support

---

## 🐛 Troubleshooting

**Model loading fails:**
```bash
# Clear PyTorch cache
rm -rf ~/.cache/torch
```

**CUDA out of memory:**
```bash
# Force CPU mode
export CUDA_VISIBLE_DEVICES=""
```

**Port already in use:**
```bash
# Backend
uvicorn app.main:app --port 8001

# Frontend
npm run dev -- --port 5174
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [FaceNet PyTorch](https://github.com/timesler/facenet-pytorch) - Face recognition models
- [EasyOCR](https://github.com/JaidedAI/EasyOCR) - OCR engine
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework

---

<div align="center">

**Made with ❤️ for Privacy-First Identity Verification**

[Report Bug](https://github.com/yourusername/zero-trust-kyc/issues) • [Request Feature](https://github.com/yourusername/zero-trust-kyc/issues)

</div>