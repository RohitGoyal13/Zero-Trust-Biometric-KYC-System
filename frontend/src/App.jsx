import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { 
  Upload, Camera, CheckCircle, XCircle, ShieldCheck, Activity, 
  RefreshCw, Image as ImageIcon, Menu, Github, Twitter, Linkedin, 
  Lock, LayoutDashboard, History, Settings, LogOut, ChevronRight,
  ChevronLeft, Users, AlertTriangle, PieChart, Check
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, darkMode }) => (
  <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-lg'} backdrop-blur-md border p-4 rounded-2xl flex items-center gap-4 transition-all`}>
    <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className={`text-xs uppercase tracking-wider ${darkMode ? 'text-purple-200/60' : 'text-gray-500'}`}>{label}</p>
      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
    </div>
  </div>
);

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, darkMode }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Verification' },
    { id: 'history', icon: History, label: 'Records' },
    { id: 'analytics', icon: PieChart, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className={`${isOpen ? 'w-72' : 'w-24'} flex flex-col transition-all duration-300 relative h-full shrink-0 border-r ${darkMode ? 'bg-[#0F1623] border-white/5' : 'bg-white border-gray-200'}`}>
      
      {/* Logo Area */}
      <div className={`h-24 flex items-center ${isOpen ? 'px-8' : 'justify-center'} border-b ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="animate-fade-in">
              <span className={`text-lg font-bold tracking-tight block ${darkMode ? 'text-white' : 'text-gray-900'}`}>SecureKYC</span>
              <span className="text-[10px] text-indigo-500 font-medium tracking-widest uppercase">Enterprise</span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-8 px-4 space-y-3">
        <p className={`text-xs font-bold uppercase px-4 mb-2 ${!isOpen && 'hidden'} ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center ${isOpen ? 'gap-4 px-4' : 'justify-center'} py-3.5 rounded-xl transition-all duration-300 group relative ${
              activeTab === item.id 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30' 
                : `${darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-indigo-600'}`
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'currentColor'}`} />
            {isOpen && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="absolute -right-3 top-28 bg-indigo-600 text-white p-1 rounded-full shadow-lg border border-indigo-500 hover:bg-indigo-700 transition-colors z-50"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* User Profile */}
      <div className={`p-6 border-t ${darkMode ? 'border-white/5' : 'border-gray-100'}`}>
        <div className={`flex items-center ${isOpen ? 'gap-4' : 'justify-center'} p-3 rounded-2xl border cursor-pointer transition-colors ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">RG</div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>Rohit Goyal</h4>
              <p className="text-xs text-gray-400 truncate">Admin Access</p>
            </div>
          )}
          {isOpen && <LogOut className={`w-4 h-4 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-red-500'}`} />}
        </div>
      </div>
    </div>
  );
};

const VerificationView = ({ darkMode }) => {
  const [step, setStep] = useState(1);
  const [idFileFront, setIdFileFront] = useState(null);
  const [idFileBack, setIdFileBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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
      alert("Verification Failed. Check backend connection.");
      setStep(1);
    } finally { setLoading(false); }
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    setTimeout(() => setAppointmentBooked(true), 1000);
  };

  const isSafe = () => {
    if (!result) return false;
    const faceOk = result.face_match.score >= 50;
    const riskOk = result.regional_risk.score <= 50;
    return faceOk && riskOk;
  };

  return (
    <div className="max-w-5xl mx-auto w-full animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard darkMode={darkMode} icon={Users} label="Total Verified" value={stats.total_verified} color="bg-indigo-500 text-indigo-400" />
        <StatCard darkMode={darkMode} icon={CheckCircle} label="Success Rate" value={`${stats.success_rate}%`} color="bg-emerald-500 text-emerald-400" />
        <StatCard darkMode={darkMode} icon={Activity} label="System Status" value={stats.status} color="bg-blue-500 text-blue-400" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className={`flex-1 w-full rounded-3xl shadow-xl border p-8 relative overflow-hidden transition-colors ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Identity Verification</h1>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI-Powered Biometric Authentication</p>
            </div>
            <div className={`px-3 py-1 rounded-full border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-indigo-50 border-indigo-100'}`}>
               <span className="text-xs font-mono text-indigo-500 flex items-center gap-2">
                 <Lock className="w-3 h-3" /> SECURE MODE
               </span>
            </div>
          </div>

          <div className="flex mb-10 items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 rounded-full flex-1 transition-all duration-500 ${step >= s ? 'bg-indigo-500 shadow-md' : darkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="text-center py-8 animate-fade-in">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border ${darkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                <Upload className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upload ID Front Side</h2>
              <label className={`w-full flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${darkMode ? 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5' : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'}`}>
                <ImageIcon className="w-10 h-10 text-gray-400 mb-4 group-hover:text-indigo-500 transition-colors" />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click to upload Front Side</p>
                <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'front')} accept="image/*" />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="text-center py-8 animate-fade-in">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 border ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
                <RefreshCw className="w-10 h-10 text-purple-500" />
              </div>
              <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Upload ID Back Side</h2>
              <label className={`w-full flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all group ${darkMode ? 'border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5' : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'}`}>
                <ImageIcon className="w-10 h-10 text-gray-400 mb-4 group-hover:text-purple-500 transition-colors" />
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Click to upload Back Side</p>
                <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'back')} accept="image/*" />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-fade-in">
              <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Biometric Liveness Check</h2>
              <div className="relative rounded-2xl overflow-hidden border bg-black mb-8 aspect-video shadow-2xl mx-auto max-w-md">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover opacity-90" videoConstraints={{ facingMode: "user" }} />
                <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-2xl pointer-events-none"></div>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={captureSelfie} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                  <Camera className="w-5 h-5" /> Capture & Verify
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              {loading ? (
                <div className="py-12">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Verifying Identity...</h3>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Running Fraud Detection Algorithms...</p>
                </div>
              ) : result && (
                <div className="animate-fade-in max-w-md mx-auto">
                  <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 shadow-xl ${isSafe() ? 'bg-gradient-to-tr from-emerald-500 to-green-600' : 'bg-gradient-to-tr from-red-500 to-rose-600'}`}>
                    {isSafe() ? <CheckCircle className="w-12 h-12 text-white" /> : <AlertTriangle className="w-12 h-12 text-white" />}
                  </div>
                  
                  <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{isSafe() ? "Verified Successfully" : "Action Required"}</h2>
                  <p className="text-gray-400 mb-8">Transaction ID: <span className={`font-mono ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>#{result.request_id.slice(0,8)}</span></p>

                  <div className={`rounded-2xl p-6 border space-y-4 text-left ${darkMode ? 'bg-[#0B0F19] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`flex justify-between items-center pb-4 border-b ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
                      <span className="text-gray-500 text-sm">Government ID</span>
                      <span className={`font-mono tracking-wider ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.ocr_data?.id_number || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Face Match</span>
                      <span className={`font-bold ${result.face_match.score >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>{result.face_match.score}%</span>
                    </div>
                  </div>

                  {result?.regional_risk && (
                    <div className={`mt-6 border rounded-2xl p-5 relative overflow-hidden text-left ${
                      result.regional_risk.score > 50 
                        ? (darkMode ? 'bg-red-500/10 border-red-500/50' : 'bg-red-50 border-red-200') 
                        : (darkMode ? 'bg-[#0B0F19] border-white/10' : 'bg-gray-50 border-gray-200')
                    }`}>
                      <div className={`absolute top-0 right-0 text-[10px] font-bold px-3 py-1 text-white rounded-bl-xl shadow-lg ${result.regional_risk.score > 50 ? 'bg-red-600' : 'bg-indigo-600'}`}>
                        {result.regional_risk.score > 50 ? 'HIGH RISK' : 'LOW RISK'}
                      </div>
                      
                      <div className="flex items-start gap-4 relative z-10">
                        <div className={`p-3 rounded-xl border ${
                           result.regional_risk.score > 50 
                             ? (darkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200') 
                             : (darkMode ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200')
                        }`}>
                           {result.regional_risk.score > 50 ? <AlertTriangle className="w-6 h-6 text-red-500" /> : <ShieldCheck className="w-6 h-6 text-indigo-500" />}
                        </div>
                        <div className="flex-1">
                           <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Geo-Spatial Risk</h4>
                           <div className={`grid grid-cols-2 gap-4 mt-3 rounded-xl p-3 border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                             <div>
                                <p className="text-[10px] text-gray-500 uppercase">Region</p>
                                <p className={`font-mono text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{result.regional_risk.district}</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-gray-500 uppercase">Score</p>
                                <span className={`text-sm font-bold ${result.regional_risk.score > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                                     {result.regional_risk.score}/100
                                </span>
                             </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isSafe() && (
                    <div className="mt-8 animate-fade-in">
                       {!appointmentBooked ? (
                           <div className={`border rounded-2xl p-6 ${darkMode ? 'bg-white/5 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
                              <h3 className={`font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                <Users className="w-5 h-5 text-red-500" /> Physical Verification Required
                              </h3>
                              <p className="text-gray-500 text-sm mb-4">
                                Due to low confidence or high regional risk, you must verify your identity at a government center.
                              </p>
                              <form onSubmit={handleBookAppointment} className="space-y-3">
                                <input required type="text" placeholder="Full Name" className={`w-full border rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none ${darkMode ? 'bg-[#0B0F19] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
                                    onChange={e => setAppointment({...appointment, name: e.target.value})} />
                                <input required type="date" className={`w-full border rounded-lg px-4 py-3 text-sm focus:border-indigo-500 outline-none ${darkMode ? 'bg-[#0B0F19] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                                    onChange={e => setAppointment({...appointment, date: e.target.value})} />
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg">
                                   Book Appointment Now
                                </button>
                              </form>
                           </div>
                       ) : (
                           <div className={`border rounded-2xl p-6 text-center ${darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                 <CheckCircle className="w-8 h-8 text-emerald-500" />
                              </div>
                              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appointment Confirmed!</h3>
                              <p className="text-gray-500 text-sm mt-2">
                                 Your token number is <span className={`font-mono font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>TK-{Math.floor(Math.random()*9000)+1000}</span>.
                                 <br/>Please visit the center on {appointment.date}.
                              </p>
                              <button onClick={() => setStep(1)} className="mt-6 text-sm text-indigo-500 hover:underline">
                                Return to Home
                              </button>
                           </div>
                       )}
                    </div>
                  )}

                  {isSafe() && (
                    <button onClick={() => setStep(1)} className={`mt-8 w-full py-4 rounded-xl font-bold transition-all shadow-lg ${darkMode ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                      Process Next User
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden lg:block w-80 space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
             <p className="text-indigo-100 text-sm mb-6">Get access to global ID checks, AML screening, and API access.</p>
             <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg">View Plans</button>
           </div>
           
           <div className={`rounded-3xl border p-6 ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-lg'}`}>
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Activity</h3>
             <div className="space-y-4">
                {[1,2,3].map((i) => (
                   <div key={i} className="flex gap-3 items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                         <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                         <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>KYC Approved</p>
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

const HistoryView = ({ darkMode }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/v1/kyc/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in">
      <div className="flex justify-between items-center mb-8">
         <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Verification Records</h1>
         <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Upload className="w-4 h-4" /> Export CSV
         </button>
      </div>
      
      <div className={`rounded-3xl shadow-xl border overflow-hidden ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200'}`}>
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading records...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`border-b ${darkMode ? 'bg-[#0B0F19] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <tr>
                  {['User', 'ID Number', 'Risk Score', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-100'}`}>
                {history.map((record) => (
                  <tr key={record.id} className={`transition-colors ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                             {record.name?.[0] || "?"}
                          </div>
                          <span className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{record.name}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">{record.id_number}</td>
                    <td className="px-6 py-4">
                       <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1 dark:bg-gray-700">
                          <div className={`h-1.5 rounded-full ${record.match_score > 80 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${record.match_score}%`}}></div>
                       </div>
                       <span className="text-xs text-gray-500 mt-1 block">{record.match_score}% Match</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        record.decision === "APPROVED" 
                        ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                        : (darkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')
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

const AnalyticsView = ({ darkMode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/v1/kyc/analytics-dashboard")
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading Intelligence Data...</div>;

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Fraud Intelligence Center</h1>
           <p className="text-gray-500 text-sm mt-1">Real-time surveillance of identity verification attempts.</p>
        </div>
        <div className={`border px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-100'}`}>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Live Monitoring</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className={`border p-6 rounded-2xl relative overflow-hidden ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-lg'}`}>
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-2">Total Scans</h3>
            <p className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{data.verifications.total}</p>
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-6 -mb-6"></div>
         </div>
         <div className={`border p-6 rounded-2xl relative overflow-hidden ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-lg'}`}>
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-2">Identity Theft Attempts</h3>
            <p className="text-4xl font-bold text-red-500">{data.verifications.rejected}</p>
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -mr-6 -mb-6"></div>
         </div>
         <div className={`border p-6 rounded-2xl relative overflow-hidden ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-lg'}`}>
            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-2">Safe Clearance Rate</h3>
            <p className="text-4xl font-bold text-emerald-500">
               {data.verifications.total > 0 ? ((data.verifications.approved / data.verifications.total) * 100).toFixed(1) : 0}%
            </p>
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mb-6"></div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`border rounded-3xl p-8 ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-xl'}`}>
           <h3 className={`font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
             <AlertTriangle className="w-5 h-5 text-amber-500" /> High-Risk Districts
           </h3>
           <div className="space-y-5">
             {data.hotspots.map((district, i) => (
               <div key={i}>
                 <div className="flex justify-between text-sm mb-2">
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{district.name}, <span className="text-gray-500">{district.state}</span></span>
                    <span className="text-red-500 font-bold">{district.score}/100</span>
                 </div>
                 <div className={`h-2 w-full rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="h-full bg-gradient-to-r from-red-600 to-amber-600" style={{width: `${district.score}%`}}></div>
                 </div>
               </div>
             ))}
           </div>
        </div>

        <div className={`border rounded-3xl p-8 ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-xl'}`}>
           <h3 className={`font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
             <Activity className="w-5 h-5 text-indigo-500" /> Recent Security Alerts
           </h3>
           <div className="space-y-4">
             {data.recent_alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No security alerts yet.</p>
             ) : (
                data.recent_alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-center gap-4 p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
                        <XCircle className="w-5 h-5 text-red-500" />
                     </div>
                     <div>
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{alert.name}</p>
                        <p className="text-gray-500 text-xs">ID: {alert.id_number}</p>
                     </div>
                     <div className="ml-auto text-right">
                        <p className="text-red-500 font-bold text-sm">REJECTED</p>
                        <p className="text-gray-500 text-[10px]">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                     </div>
                  </div>
                ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ darkMode, setDarkMode }) => {
  const [riskThreshold, setRiskThreshold] = useState(80);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="max-w-4xl mx-auto w-full animate-fade-in">
      <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>System Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Manage display preferences and security configurations.</p>

      <div className="space-y-6">
        <div className={`border rounded-2xl p-6 ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-lg'}`}>
           <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-full ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
                    {darkMode ? <div className="w-6 h-6">🌙</div> : <div className="w-6 h-6">☀️</div>}
                 </div>
                 <div>
                    <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Interface Theme</p>
                    <p className="text-sm text-gray-500">Select your preferred color mode.</p>
                 </div>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
           </div>
        </div>

        <div className={`border rounded-2xl p-6 ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-lg'}`}>
           <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Security & Access</h3>
           <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">API Secret Key</label>
              <div className="flex gap-2">
                 <input disabled value="sk_live_51Mzxxxxxxxxxxxxxxxx" className={`flex-1 px-4 py-3 rounded-xl border font-mono text-sm ${darkMode ? 'bg-[#0B0F19] border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`} />
                 <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700">Regenerate</button>
              </div>
           </div>

           <div className={`flex items-center justify-between py-4 border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
              <div className="flex items-center gap-3">
                 <Lock className="w-5 h-5 text-gray-400" />
                 <div>
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security.</p>
                 </div>
              </div>
              <button 
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-11 h-6 rounded-full p-1 transition-all ${twoFactor ? 'bg-emerald-500' : 'bg-gray-400'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${twoFactor ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
           </div>
        </div>

        <div className={`border rounded-2xl p-6 ${darkMode ? 'bg-[#131B2C] border-white/5' : 'bg-white border-gray-200 shadow-lg'}`}>
           <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Risk Configuration</h3>
           <p className="text-sm text-gray-500 mb-6">Set the anomaly score threshold for auto-rejection.</p>
           <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                 <span className="text-emerald-500">Strict (Low)</span>
                 <span className="text-amber-500">{riskThreshold}%</span>
                 <span className="text-red-500">Lenient (High)</span>
              </div>
              <input type="range" min="0" max="100" value={riskThreshold} onChange={(e) => setRiskThreshold(e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`h-screen flex font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#0B0F19] text-slate-300' : 'bg-gray-50 text-gray-700'}`}>
      
      {/* UPDATE THIS LINE BELOW */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        darkMode={darkMode}  // <--- This was missing!
      />

      <main className="flex-1 h-full overflow-y-auto relative">
        <div className={`absolute top-0 left-0 w-full h-96 bg-gradient-to-b pointer-events-none ${darkMode ? 'from-indigo-900/20' : 'from-blue-200/40'} to-transparent`}></div>
        <div className="relative z-10 p-8 md:p-12">
          {activeTab === 'dashboard' && <VerificationView darkMode={darkMode} />}
          {activeTab === 'history' && <HistoryView darkMode={darkMode} />}
          {activeTab === 'analytics' && <AnalyticsView darkMode={darkMode} />}
          {activeTab === 'settings' && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />}
        </div>
      </main>
    </div>
  );
}