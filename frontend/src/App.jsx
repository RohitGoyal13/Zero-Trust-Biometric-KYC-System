import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Upload, Camera, CheckCircle, XCircle, ShieldCheck, Activity, RefreshCw, Image as ImageIcon } from "lucide-react";

export default function App() {
  const [step, setStep] = useState(1);
  const [idFile, setIdFile] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const webcamRef = useRef(null);

  // Helper to handle file selection
  const handleFileSelect = (e, isIdCard) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isIdCard) {
        setIdFile(file);
        setStep(2);
      } else {
        setSelfie(file);
        submitKYC(idFile, file); // Submit immediately after uploading selfie
      }
    }
  };

  const captureSelfie = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSelfie(file);
        submitKYC(idFile, file);
      });
  }, [webcamRef, idFile]);

  const submitKYC = async (idCard, selfieImg) => {
    setStep(3);
    setLoading(true);
    setResult(null); 
    
    const formData = new FormData();
    formData.append("id_card", idCard);
    formData.append("selfie", selfieImg);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/kyc/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (error) {
      console.error("KYC Error:", error);
      alert("Verification Failed! Check backend console.");
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const getMatchScore = () => result?.face_match?.score || 0;
  const isApproved = () => result?.final_decision === "APPROVED";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans text-gray-800">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-indigo-700">
          <ShieldCheck className="w-8 h-8" /> Zero-Trust AI KYC
        </h1>
        <p className="text-gray-500 mt-2">Banking-Grade Identity Verification System</p>
      </div>

      {/* Main Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 min-h-[400px] flex flex-col justify-center">
        
        {/* STEP 1: Upload ID */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="bg-indigo-50 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
              <Upload className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold">Upload Government ID</h2>
            <p className="text-sm text-gray-400">Aadhaar, PAN, or Driving License</p>
            
            <label className="block w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200">
              <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, true)} accept="image/*" />
              <span>Select ID Card Image</span>
            </label>
          </div>
        )}

        {/* STEP 2: Verify Face (Camera OR Upload) */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <h2 className="text-xl font-semibold">Verify Your Face</h2>
            
            {/* Camera View */}
            <div className="relative rounded-xl overflow-hidden border-4 border-indigo-100 shadow-inner bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-64 object-cover"
                videoConstraints={{ facingMode: "user" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Option A: Capture from Camera */}
              <button
                onClick={captureSelfie}
                className="bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Camera className="w-5 h-5" /> Snap Photo
              </button>

              {/* Option B: Upload File (For Testing) */}
              <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all">
                <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, false)} accept="image/*" />
                <ImageIcon className="w-5 h-5" /> Upload File
              </label>
            </div>
            <p className="text-xs text-gray-400">Use "Upload File" to test exact match</p>
          </div>
        )}

        {/* STEP 3: Loading */}
        {step === 3 && loading && (
          <div className="text-center py-10 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-pulse"></div>
              <Activity className="w-10 h-10 text-indigo-600 absolute inset-0 m-auto animate-spin" />
            </div>
            <div>
              <p className="text-lg font-medium text-indigo-900">Analyzing Biometrics...</p>
              <p className="text-xs text-gray-400 mt-1">Extracting OCR • Matching Face Embeddings</p>
            </div>
          </div>
        )}

        {/* STEP 3: Results */}
        {step === 3 && !loading && result && (
          <div className="text-center animate-fade-in">
            {isApproved() ? (
              <div className="mb-6 bg-green-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            ) : (
              <div className="mb-6 bg-red-50 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
            )}
            
            <h2 className={`text-2xl font-bold mb-1 ${isApproved() ? 'text-green-700' : 'text-red-600'}`}>
              KYC {result?.final_decision || "FAILED"}
            </h2>
            <p className="text-sm text-gray-500 mb-6">Risk Score: {result?.risk_score || 0}/100</p>

            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-500">Name (OCR):</span>
                <span className="font-medium text-gray-900">{result?.ocr_data?.name || "Not Detected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Face Match:</span>
                <span className={`font-medium ${getMatchScore() > 60 ? 'text-green-600' : 'text-red-500'}`}>
                  {getMatchScore()}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ID Number:</span>
                <span className="font-medium text-gray-900">{result?.ocr_data?.id_number || "---"}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(1)}
              className="mt-8 flex items-center justify-center gap-2 w-full text-indigo-600 font-medium hover:bg-indigo-50 p-3 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Verify Another User
            </button>
          </div>
        )}
      </div>
    </div>
  );
}