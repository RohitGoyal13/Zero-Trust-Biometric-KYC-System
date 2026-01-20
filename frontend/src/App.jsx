import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { 
  Upload, Camera, CheckCircle, XCircle, ShieldCheck, Activity, 
  RefreshCw, Image as ImageIcon, Menu, Github, Twitter, Linkedin, 
  Lock, LayoutDashboard, History, Settings, LogOut, ChevronRight,
  ChevronLeft, Users, AlertTriangle, PieChart, Check
} from "lucide-react";

// --- COMPONENT: STATS CARD (New Feature) ---
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
    <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-xs text-purple-200/60 uppercase tracking-wider">{label}</p>
      <h3 className="text-xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

// --- COMPONENT: SIDEBAR ---
const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Verification' },
    { id: 'history', icon: History, label: 'Records' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div 
      className={`${isOpen ? 'w-72' : 'w-24'} bg-[#0F1623] border-r border-white/5 flex flex-col transition-all duration-300 relative h-full`}
    >
      {/* Logo Area */}
      <div className={`h-24 flex items-center ${isOpen ? 'px-8' : 'justify-center'} border-b border-white/5`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="animate-fade-in">
              <span className="text-lg font-bold text-white tracking-tight block">SecureKYC</span>
              <span className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">Enterprise</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-8 px-4 space-y-3">
        <p className={`text-xs font-bold text-gray-500 uppercase px-4 mb-2 ${!isOpen && 'hidden'}`}>Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center'} py-3.5 rounded-xl transition-all duration-300 group relative ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            {isOpen && <span className="font-medium text-sm">{item.label}</span>}
            {!isOpen && (
              <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {item.label}
              </div>
            )}
            {isOpen && activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>
        ))}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-28 bg-indigo-600 text-white p-1 rounded-full shadow-lg border border-indigo-500 hover:bg-indigo-500 transition-colors z-50"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* User Profile */}
      <div className="p-6 border-t border-white/5">
        <div className={`flex items-center ${isOpen ? 'gap-4' : 'justify-center'} p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            RG
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">Rohit Goyal</h4>
              <p className="text-xs text-gray-400 truncate">Admin Access</p>
            </div>
          )}
          {isOpen && <LogOut className="w-4 h-4 text-gray-400 hover:text-white" />}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: VERIFICATION FLOW ---

// --- COMPONENT: VERIFICATION FLOW ---
const VerificationView = () => {
  const [step, setStep] = useState(1);
  
  const [idFileFront, setIdFileFront] = useState(null);
  const [idFileBack, setIdFileBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Appointment Form State
  const [appointment, setAppointment] = useState({ name: "", date: "", phone: "" });
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  
  const webcamRef = useRef(null);
  const [stats, setStats] = useState({ total_verified: 0, success_rate: 0, status: "Offline" });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/v1/kyc/stats");
      setStats(res.data);
    } catch (error) { console.error(error); }
  };

  const handleFileSelect = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'front') { setIdFileFront(file); setStep(2); }
      else if (type === 'back') { setIdFileBack(file); setStep(3); }
    }
  };

  const captureSelfie = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    fetch(imageSrc).then((res) => res.blob()).then((blob) => {
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        setSelfie(file);
        submitKYC(idFileFront, idFileBack, file);
      });
  }, [webcamRef, idFileFront, idFileBack]);

  const submitKYC = async (front, back, selfieImg) => {
    setStep(4); setLoading(true); setResult(null); setAppointmentBooked(false);
    
    const formData = new FormData();
    formData.append("id_card_front", front);
    formData.append("id_card_back", back);
    formData.append("selfie", selfieImg);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/v1/kyc/verify", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
      fetchStats(); 
    } catch (error) {
      alert("Verification Failed! Check backend console.");
      setStep(1);
    } finally { setLoading(false); }
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    // In a real app, send this to backend
    setTimeout(() => setAppointmentBooked(true), 1000);
  };

  // LOGIC: Is the user Safe?
  // Safe if: Decision is APPROVED (Face Match > 50) AND Risk Score is LOW (< 50)
  const isSafe = () => {
    if (!result) return false;
    const faceOk = result.face_match.score >= 50;
    const riskOk = result.regional_risk.score <= 50;
    return faceOk && riskOk;
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in">
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={Users} label="Total Verified" value={stats.total_verified} color="bg-indigo-500 text-indigo-400" />
        <StatCard icon={CheckCircle} label="Success Rate" value={`${stats.success_rate}%`} color="bg-emerald-500 text-emerald-400" />
        <StatCard icon={Activity} label="System Status" value={stats.status} color="bg-blue-500 text-blue-400" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* 2. MAIN CARD */}
        <div className="flex-1 w-full bg-[#131B2C] rounded-3xl shadow-2xl border border-white/5 p-8 relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Identity Verification</h1>
              <p className="text-gray-400 text-sm mt-1">AI-Powered Biometric Authentication</p>
            </div>
            <div className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
               <span className="text-xs font-mono text-indigo-400 flex items-center gap-2">
                 <Lock className="w-3 h-3" /> SECURE MODE
               </span>
            </div>
          </div>

          <div className="flex mb-10 items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 rounded-full flex-1 transition-all duration-500 ${step >= s ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/5'}`} />
            ))}
          </div>

          {/* STEP 1: Upload FRONT */}
          {step === 1 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-24 h-24 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                <Upload className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Upload ID Front Side</h2>
              <label className="w-full flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                <ImageIcon className="w-10 h-10 text-gray-500 mb-4 group-hover:text-indigo-400 transition-colors" />
                <p className="text-sm text-gray-300 font-medium">Click to upload Front Side</p>
                <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'front')} accept="image/*" />
              </label>
            </div>
          )}

          {/* STEP 2: Upload BACK */}
          {step === 2 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-24 h-24 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                <RefreshCw className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Upload ID Back Side</h2>
              <label className="w-full flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                <ImageIcon className="w-10 h-10 text-gray-500 mb-4 group-hover:text-purple-400 transition-colors" />
                <p className="text-sm text-gray-300 font-medium">Click to upload Back Side</p>
                <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'back')} accept="image/*" />
              </label>
            </div>
          )}

          {/* STEP 3: Selfie */}
          {step === 3 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-6">Biometric Liveness Check</h2>
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black mb-8 aspect-video shadow-2xl mx-auto max-w-md">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover opacity-90" videoConstraints={{ facingMode: "user" }} />
                <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl pointer-events-none"></div>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={captureSelfie} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Capture & Verify
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Results */}
          {step === 4 && (
            <div className="text-center py-6">
              {loading ? (
                <div className="py-12">
                  <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-bold text-white">Verifying Identity...</h3>
                  <p className="text-gray-400 text-sm mt-2">Running Fraud Detection Algorithms...</p>
                </div>
              ) : result && (
                <div className="animate-fade-in max-w-md mx-auto">
                  {/* Result Header */}
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(0,0,0,0.3)] ${isSafe() ? 'bg-gradient-to-tr from-emerald-500 to-green-600' : 'bg-gradient-to-tr from-red-500 to-rose-600'}`}>
                    {isSafe() ? <CheckCircle className="w-12 h-12 text-white" /> : <AlertTriangle className="w-12 h-12 text-white" />}
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2">{isSafe() ? "Verified Successfully" : "Action Required"}</h2>
                  <p className="text-gray-400 mb-8">Transaction ID: <span className="font-mono text-gray-300">#{result.request_id.slice(0,8)}</span></p>

                  {/* Details Card */}
                  <div className="bg-[#0B0F19] rounded-2xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-gray-500 text-sm">Government ID</span>
                      <span className="font-mono text-white tracking-wider">{result.ocr_data?.id_number || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Face Match</span>
                      <div className="flex items-center gap-2">
                         <span className={`font-bold ${result.face_match.score >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{result.face_match.score}%</span>
                      </div>
                    </div>
                    {result.face_match.score < 50 && (
                        <p className="text-xs text-red-400 text-right mt-1">⚠️ Low Match Score</p>
                    )}
                  </div>

                  {/* Big Data Widget */}
                  {result?.regional_risk && (
                    <div className={`mt-6 border rounded-2xl p-5 relative overflow-hidden text-left ${result.regional_risk.score > 50 ? 'bg-red-500/10 border-red-500/50' : 'bg-[#0B0F19] border-white/10'}`}>
                      <div className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 text-white rounded-bl-xl shadow-lg ${result.regional_risk.score > 50 ? 'bg-red-600' : 'bg-indigo-600'}`}>
                        {result.regional_risk.score > 50 ? 'HIGH RISK' : 'LOW RISK'}
                      </div>
                      
                      <div className="flex items-start gap-4 relative z-10">
                        <div className={`p-3 rounded-xl border ${result.regional_risk.score > 50 ? 'bg-red-500/20 border-red-500/30' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
                           {result.regional_risk.score > 50 ? <AlertTriangle className="w-6 h-6 text-red-400" /> : <ShieldCheck className="w-6 h-6 text-indigo-400" />}
                        </div>
                        <div className="flex-1">
                           <h4 className="text-white font-bold text-sm">Geo-Spatial Risk</h4>
                           <div className="grid grid-cols-2 gap-4 mt-3 bg-white/5 rounded-xl p-3 border border-white/5">
                             <div>
                                <p className="text-[10px] text-gray-500 uppercase">Region</p>
                                <p className="text-white font-mono text-sm truncate">{result.regional_risk.district}</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-500 uppercase">Score</p>
                                <span className={`text-sm font-bold ${result.regional_risk.score > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                                     {result.regional_risk.score}/100
                                </span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- CONDITIONAL ACTION: BOOK APPOINTMENT --- */}
                  {!isSafe() && (
                    <div className="mt-8 animate-fade-in">
                       {!appointmentBooked ? (
                           <div className="bg-white/5 border border-red-500/30 rounded-2xl p-6">
                              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Users className="w-5 h-5 text-red-400" /> Physical Verification Required
                              </h3>
                              <p className="text-gray-400 text-sm mb-4">
                                Due to low confidence or high regional risk, you must verify your identity at a government center.
                              </p>
                              <form onSubmit={handleBookAppointment} className="space-y-3">
                                <input required type="text" placeholder="Full Name" className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none" 
                                    onChange={e => setAppointment({...appointment, name: e.target.value})} />
                                <input required type="date" className="w-full bg-[#0B0F19] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none" 
                                    onChange={e => setAppointment({...appointment, date: e.target.value})} />
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                                   Book Appointment Now
                                </button>
                              </form>
                           </div>
                       ) : (
                           <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <CheckCircle className="w-8 h-8 text-emerald-400" />
                              </div>
                              <h3 className="text-white font-bold text-lg">Appointment Confirmed!</h3>
                              <p className="text-emerald-200/70 text-sm mt-2">
                                 Your token number is <span className="font-mono font-bold text-white">TK-{Math.floor(Math.random()*9000)+1000}</span>.
                                 <br/>Please visit the center on {appointment.date}.
                              </p>
                              <button onClick={() => setStep(1)} className="mt-6 text-sm text-gray-400 hover:text-white underline">
                                Return to Home
                              </button>
                           </div>
                       )}
                    </div>
                  )}

                  {/* Standard Continue Button (Only if Safe) */}
                  {isSafe() && (
                    <button onClick={() => setStep(1)} className="mt-8 w-full py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-bold transition-all shadow-lg">
                      Process Next User
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. RIGHT SIDE INFO */}
        <div className="hidden lg:block w-80 space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
             <p className="text-indigo-100 text-sm mb-6">Get access to global ID checks, AML screening, and API access.</p>
             <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">View Plans</button>
           </div>
           
           <div className="bg-[#131B2C] rounded-3xl border border-white/5 p-6">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Activity</h3>
             <div className="space-y-4">
                {[1,2,3].map((i) => (
                   <div key={i} className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                         <p className="text-sm text-white font-medium">KYC Approved</p>
                         <p className="text-xs text-gray-500">Just now</p>
                      </div>
                   </div>
                ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

// --- COMPONENT: HISTORY TABLE ---
const HistoryView = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/v1/kyc/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error("Failed to fetch history", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-2xl font-bold text-white">Verification Records</h1>
         <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Upload className="w-4 h-4" /> Export CSV
         </button>
      </div>
      
      <div className="bg-[#131B2C] rounded-3xl shadow-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading records...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0B0F19] border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">ID Number</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                             {record.name?.[0] || "?"}
                          </div>
                          <span className="font-medium text-white text-sm">{record.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-400">{record.id_number}</td>
                    <td className="px-6 py-4">
                       <div className="w-16 bg-gray-700 rounded-full h-1.5 mt-1">
                          <div className={`h-1.5 rounded-full ${record.match_score > 80 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${record.match_score}%`}}></div>
                       </div>
                       <span className="text-xs text-gray-500 mt-1 block">{record.match_score}% Match</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        record.decision === "APPROVED" 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {record.decision}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(record.timestamp).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP LAYOUT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen bg-[#0B0F19] flex font-sans overflow-hidden text-slate-300">
      
      {/* Sidebar (Full Height) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto relative bg-[#0B0F19]">
        
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10 p-8 md:p-12">
          {activeTab === 'dashboard' && <VerificationView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'analytics' && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <PieChart className="w-16 h-16 text-indigo-500 mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
                <p className="text-gray-500 mt-2">Charts and graphs coming soon in v2.0</p>
             </div>
          )}
          {activeTab === 'settings' && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Settings className="w-16 h-16 text-indigo-500 mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-white">System Settings</h2>
                <p className="text-gray-500 mt-2">API Keys and Security Config</p>
             </div>
          )}
        </div>
      </main>

    </div>
  );
}