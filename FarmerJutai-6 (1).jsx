import React, { useState, useMemo, useId } from "react";
import {
  Tractor, Phone, ShieldCheck, User, MapPin, Upload, Camera, FileText,
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, LogOut, Home as HomeIcon,
  ClipboardList, Users, BarChart3, Bell, IndianRupee, Sprout, Lock,
  AlertCircle, Calendar, PenLine, Trash2, Eye, Wallet, TrendingUp, Send, MessageCircle
} from "lucide-react";

/* ---------------------------------- THEME ---------------------------------- */
const C = {
  deep: "#122E1F",
  deep2: "#0C2116",
  mid: "#2D6A4F",
  gold: "#D9A441",
  goldLight: "#F0C879",
  cream: "#FAF6EC",
  card: "#FFFFFF",
  soil: "#5C4433",
  soilLight: "#8A7160",
  red: "#B3261E",
  line: "#E7E0D2",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');`;
const fBody = { fontFamily: "'Noto Sans Devanagari','Poppins',sans-serif" };
const fDisplay = { fontFamily: "'Poppins','Noto Sans Devanagari',sans-serif" };

const furrowBg = {
  backgroundColor: C.deep,
  backgroundImage: `repeating-linear-gradient(115deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 2px, transparent 2px, transparent 26px)`,
};

/* ---------------------------------- DATA ---------------------------------- */
const SERVICES = [
  { id: "s1", name: "🌾 कश्या निकालना & जमा करना", normal: 820, subscription: 410 },
  { id: "s2", name: "🌱 पंजी मारना", normal: 820, subscription: 410 },
  { id: "s3", name: "🌿 फास मारना", normal: 820, subscription: 410 },
  { id: "s4", name: "🚜 नांगर्णी", normal: 1620, subscription: 810 },
  { id: "s5", name: "🌱 कल्टीवेटर", normal: 820, subscription: 410 },
  { id: "s6", name: "🌾 बेड मेकर", normal: 1220, subscription: 610 },
  { id: "s7", name: "🚜 रोटावेटर", normal: 1420, subscription: 710 },
];

const SUBSCRIPTION_RATE_PER_ACRE = 550;
const VILLAGES = ["रामपुर", "शिवपुर", "गणेशपुर", "कृष्णानगर"];
const ADMIN_PASSWORD = "admin@123";
const MOCK_OTP = "1234";

const seedFarmers = {
  "9876500001": {
    mobile: "9876500001", name: "सुरेश पाटील", address: "मुख्य रस्ता, रामपुर",
    village: "रामपुर", khet: "गट नं. 45, रामपुर शिवार", acres: "6",
    aadharFront: null, aadharBack: null, sevenTwelveList: [],
    docsStatus: "Approved", isSubscribed: true, subscriptionAmount: 6 * 550, joined: "2026-05-02",
  },
  "9876500002": {
    mobile: "9876500002", name: "विजय शिंदे", address: "स्टेशन रोड, शिवपुर",
    village: "शिवपुर", khet: "गट नं. 12, शिवपुर शिवार", acres: "3.5",
    aadharFront: null, aadharBack: null, sevenTwelveList: [],
    docsStatus: "Pending", isSubscribed: false, subscriptionAmount: 0, joined: "2026-06-10",
  },
};

const seedDrivers = {
  "9123400001": {
    mobile: "9123400001", name: "राहुल जाधव", address: "बाजारपेठ, रामपुर",
    village: "रामपुर", aadharFront: null, aadharBack: null, rcBook: null, license: null,
    docsStatus: "Approved", joined: "2026-04-18",
  },
  "9123400002": {
    mobile: "9123400002", name: "अमोल कदम", address: "गांधी चौक, गणेशपुर",
    village: "गणेशपुर", aadharFront: null, aadharBack: null, rcBook: null, license: null,
    docsStatus: "Approved", joined: "2026-05-27",
  },
};

const seedBookings = [
  { id: "b1", farmerMobile: "9876500001", farmerName: "सुरेश पाटील", village: "रामपुर", serviceId: "s4", serviceName: "🚜 नांगर्णी", price: 810, date: "2026-07-10", notes: "सकाळी लवकर या", status: "Completed", driverName: "राहुल जाधव" },
  { id: "b2", farmerMobile: "9876500001", farmerName: "सुरेश पाटील", village: "रामपुर", serviceId: "s7", serviceName: "🚜 रोटावेटर", price: 710, date: "2026-07-12", notes: "", status: "Accepted", driverName: "राहुल जाधव" },
  { id: "b3", farmerMobile: "9876500002", farmerName: "विजय शिंदे", village: "शिवपुर", serviceId: "s1", serviceName: "🌾 कश्या निकालना & जमा करना", price: 820, date: "2026-07-13", notes: "पाणी जास्त आहे", status: "Pending", driverName: null },
];

const uid = () => Math.random().toString(36).slice(2, 10);
const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
const nowStr = () => new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const seedNotifications = [
  { id: "n1", target: "all_farmers", targetLabel: "सर्व शेतकरी", title: "🎉 नवीन सवलत", message: "यंदाच्या हंगामात Subscription वर 50% सूट सुरू आहे. आजच Subscribe करा!", from: "admin", time: "10 Jul, 09:00" },
  { id: "n2", target: "all_drivers", targetLabel: "सर्व ड्रायव्हर", title: "📢 सूचना", message: "सर्व ड्रायव्हरांनी कृपया वेळेवर बुकिंग स्वीकारा/नकार द्या जेणेकरून शेतकऱ्यांना लवकर सेवा मिळेल.", from: "admin", time: "11 Jul, 18:30" },
];

/* ---------------------------------- SMALL UI PARTS ---------------------------------- */
function GoldBadge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${className}`}
      style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.deep2 }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-lg active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100 ${className}`}
      style={{ background: disabled ? "#B7B7B7" : `linear-gradient(135deg, ${C.mid}, ${C.deep})`, color: "#fff", ...fDisplay }}
    >
      {children}
    </button>
  );
}

function GoldButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-lg active:scale-[0.98] transition ${className}`}
      style={{ background: `linear-gradient(135deg, ${C.gold}, #C6893A)`, color: C.deep2, ...fDisplay }}
    >
      {children}
    </button>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5" style={{ color: C.soil }}>
        {Icon && <Icon size={15} />} {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-xl border outline-none text-[15px] bg-white focus:ring-2 transition";
const inputStyle = { borderColor: C.line, color: C.deep2 };

function StatusPill({ status }) {
  const map = {
    Pending: { bg: "#FDF1DC", fg: "#8A5A00" },
    "Documents Baaki": { bg: "#F1EDE0", fg: C.soilLight },
    Accepted: { bg: "#DDEEE4", fg: C.mid },
    Completed: { bg: "#DCEBFF", fg: "#1D4E89" },
    Rejected: { bg: "#FBE3E1", fg: C.red },
    Approved: { bg: "#DDEEE4", fg: C.mid },
  };
  const s = map[status] || map.Pending;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.fg }}>
      {status}
    </span>
  );
}

function DocUploader({ label, file, onChange }) {
  const rid = useId();
  const camId = "cam-" + rid;
  const galId = "gal-" + rid;
  const isPdf = file && file.type === "application/pdf";
  return (
    <div className="mb-4 p-3 rounded-xl border-2 border-dashed" style={{ borderColor: C.line, background: "#FCFAF4" }}>
      <p className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: C.soil }}>
        <FileText size={15} /> {label}
      </p>
      {file ? (
        <div className="flex items-center gap-3 mb-2">
          {isPdf ? (
            <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ background: C.deep }}>
              <FileText size={26} color="#fff" />
            </div>
          ) : (
            <img src={file.url} alt={label} className="w-16 h-16 rounded-lg object-cover border" style={{ borderColor: C.line }} />
          )}
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: C.mid }}>✓ अपलोड झाले</p>
            <p className="text-xs truncate" style={{ color: C.soilLight, maxWidth: 160 }}>{file.name}</p>
          </div>
          <button onClick={() => onChange(null)} className="p-2 rounded-lg" style={{ background: "#FBE3E1" }}>
            <Trash2 size={15} color={C.red} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <label htmlFor={camId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold" style={{ background: C.deep, color: "#fff" }}>
            <Camera size={18} /> कैमरा
          </label>
          <input id={camId} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files[0]; if (f) onChange({ name: f.name, type: f.type, url: URL.createObjectURL(f) }); e.target.value = ""; }} />
          <label htmlFor={galId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold border" style={{ borderColor: C.line, color: C.deep2 }}>
            <Upload size={18} /> गैलरी / PDF
          </label>
          <input id={galId} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={(e) => { const f = e.target.files[0]; if (f) onChange({ name: f.name, type: f.type, url: URL.createObjectURL(f) }); e.target.value = ""; }} />
        </div>
      )}
    </div>
  );
}

function MultiDocUploader({ label, files, onChange }) {
  const rid = useId();
  const camId = "mcam-" + rid;
  const galId = "mgal-" + rid;
  const addFile = (f) => onChange([...files, { ...f, _id: uid() }]);
  const removeFile = (id) => onChange(files.filter((f) => f._id !== id));
  return (
    <div className="mb-4 p-3 rounded-xl border-2 border-dashed" style={{ borderColor: C.line, background: "#FCFAF4" }}>
      <p className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: C.soil }}>
        <FileText size={15} /> {label} {files.length > 0 && <span className="font-normal" style={{ color: C.soilLight }}>({files.length})</span>}
      </p>
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {files.map((f) => (
            <div key={f._id} className="relative">
              {f.type === "application/pdf" ? (
                <div className="w-full h-14 rounded-lg flex items-center justify-center" style={{ background: C.deep }}>
                  <FileText size={20} color="#fff" />
                </div>
              ) : (
                <img src={f.url} alt={label} className="w-full h-14 rounded-lg object-cover border" style={{ borderColor: C.line }} />
              )}
              <button onClick={() => removeFile(f._id)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow" style={{ background: C.red }}>
                <Trash2 size={10} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <label htmlFor={camId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold" style={{ background: C.deep, color: "#fff" }}>
          <Camera size={18} /> कैमरा
        </label>
        <input id={camId} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={(e) => { const f = e.target.files[0]; if (f) addFile({ name: f.name, type: f.type, url: URL.createObjectURL(f) }); e.target.value = ""; }} />
        <label htmlFor={galId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold border" style={{ borderColor: C.line, color: C.deep2 }}>
          <Upload size={18} /> {files.length > 0 ? "अजून जोडा" : "गैलरी / PDF"}
        </label>
        <input id={galId} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={(e) => { const f = e.target.files[0]; if (f) addFile({ name: f.name, type: f.type, url: URL.createObjectURL(f) }); e.target.value = ""; }} />
      </div>
      <p className="text-[11px] mt-2" style={{ color: C.soilLight }}>जितके प्लॉट/गट नं. आहेत तितके 7/12 उतारे इथे जोडा</p>
    </div>
  );
}

function NotificationList({ items }) {
  if (items.length === 0) {
    return <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm" style={{ color: C.soilLight }}>अजून कोणतीही सूचना नाही</p></div>;
  }
  return (
    <div className="space-y-3">
      {items.slice().reverse().map((n) => (
        <div key={n.id} className="bg-white rounded-2xl p-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: n.from === "system" ? "#EAF3EC" : "#FCF6E8" }}>
              <Bell size={16} color={n.from === "system" ? C.mid : C.gold} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: C.deep2 }}>{n.title}</p>
              <p className="text-xs mt-0.5" style={{ color: C.soil }}>{n.message}</p>
              <p className="text-[11px] mt-1.5" style={{ color: C.soilLight }}>{n.time}{n.targetLabel ? ` • ${n.targetLabel}` : ""}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BottomNav({ items, active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex border-t bg-white z-30" style={{ borderColor: C.line }}>
      {items.map((it) => (
        <button key={it.key} onClick={() => onChange(it.key)} className="flex-1 flex flex-col items-center gap-1 py-2.5">
          <it.icon size={20} color={active === it.key ? C.mid : C.soilLight} />
          <span className="text-[11px] font-semibold" style={{ color: active === it.key ? C.mid : C.soilLight }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function TopHeader({ title, subtitle, onLogout }) {
  return (
    <div className="px-5 pt-6 pb-8 rounded-b-3xl relative overflow-hidden" style={furrowBg}>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` }}>
            <Tractor size={20} color={C.deep2} />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none" style={fDisplay}>Farmer Jutai</p>
            <p className="text-[11px]" style={{ color: "#BFD8CB" }}>{subtitle}</p>
          </div>
        </div>
        {onLogout && (
          <button onClick={onLogout} className="p-2 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
            <LogOut size={17} color="#fff" />
          </button>
        )}
      </div>
      {title && <p className="text-white/90 text-sm mt-4 relative z-10">{title}</p>}
    </div>
  );
}

/* ---------------------------------- AUTH FLOW ---------------------------------- */
function RoleSelect({ onPick }) {
  const roles = [
    { key: "farmer", label: "शेतकरी", sub: "Farmer — services बुक करा", icon: Sprout },
    { key: "driver", label: "ड्रायव्हर", sub: "Driver — jobs स्वीकारा", icon: Tractor },
    { key: "admin", label: "Admin", sub: "व्यवस्थापन नियंत्रण", icon: ShieldCheck },
  ];
  return (
    <div className="min-h-screen" style={{ background: C.cream, ...fBody }}>
      <div className="px-6 pt-16 pb-10 relative overflow-hidden" style={furrowBg}>
        <div className="flex flex-col items-center relative z-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl" style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})` }}>
            <Tractor size={38} color={C.deep2} />
          </div>
          <h1 className="text-white text-2xl font-extrabold" style={fDisplay}>Farmer Jutai</h1>
          <p className="text-sm mt-1" style={{ color: "#BFD8CB" }}>शेत सेवा, एका क्लिकवर</p>
        </div>
      </div>
      <div className="px-5 -mt-6 relative z-20 space-y-3">
        {roles.map((r) => (
          <button key={r.key} onClick={() => onPick(r.key)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white shadow-lg active:scale-[0.98] transition">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#EAF3EC" }}>
              <r.icon size={22} color={C.mid} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-[15px]" style={{ color: C.deep2 }}>{r.label}</p>
              <p className="text-xs" style={{ color: C.soilLight }}>{r.sub}</p>
            </div>
            <ChevronRight size={18} color={C.soilLight} />
          </button>
        ))}
      </div>
      <p className="text-center text-xs mt-8" style={{ color: C.soilLight }}>Premium Farm Services App • v1.0</p>
    </div>
  );
}

function MobileEntry({ role, onBack, onSent }) {
  const [mobile, setMobile] = useState("");
  const valid = /^[6-9]\d{9}$/.test(mobile);
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream, ...fBody }}>
      <TopHeader subtitle={role === "farmer" ? "शेतकरी लॉगिन" : "ड्रायव्हर लॉगिन"} />
      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold mb-4" style={{ color: C.soilLight }}>
            <ChevronLeft size={14} /> मागे
          </button>
          <p className="font-bold text-lg mb-1" style={{ color: C.deep2 }}>मोबाईल नंबर टाका</p>
          <p className="text-xs mb-4" style={{ color: C.soilLight }}>आम्ही OTP पाठवू verification साठी</p>
          <Field label="मोबाईल नंबर" icon={Phone}>
            <input value={mobile} maxLength={10} inputMode="numeric"
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="9876543210" className={inputCls} style={inputStyle} />
          </Field>
          <PrimaryButton disabled={!valid} onClick={() => onSent(mobile)}>OTP पाठवा</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function OtpEntry({ mobile, onBack, onVerified }) {
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream, ...fBody }}>
      <TopHeader subtitle="OTP Verification" />
      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold mb-4" style={{ color: C.soilLight }}>
            <ChevronLeft size={14} /> मागे
          </button>
          <p className="font-bold text-lg mb-1" style={{ color: C.deep2 }}>OTP टाका</p>
          <p className="text-xs mb-4" style={{ color: C.soilLight }}>+91 {mobile} वर पाठवला (डेमो OTP: {MOCK_OTP})</p>
          <Field label="4 अंकी OTP">
            <input value={otp} maxLength={4} inputMode="numeric"
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErr(""); }}
              placeholder="1234" className={inputCls + " text-center tracking-[10px] text-xl font-bold"} style={inputStyle} />
          </Field>
          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1" style={{ color: C.red }}><AlertCircle size={13} /> {err}</p>}
          <PrimaryButton disabled={otp.length !== 4} onClick={() => { otp === MOCK_OTP ? onVerified() : setErr("चुकीचा OTP, पुन्हा प्रयत्न करा"); }}>
            Verify करा
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onBack, onVerified }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream, ...fBody }}>
      <TopHeader subtitle="Admin Login" />
      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold mb-4" style={{ color: C.soilLight }}>
            <ChevronLeft size={14} /> मागे
          </button>
          <p className="font-bold text-lg mb-1" style={{ color: C.deep2 }}>Admin Password</p>
          <p className="text-xs mb-4" style={{ color: C.soilLight }}>डेमो पासवर्ड: {ADMIN_PASSWORD}</p>
          <Field label="Password" icon={Lock}>
            <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }}
              className={inputCls} style={inputStyle} placeholder="••••••••" />
          </Field>
          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1" style={{ color: C.red }}><AlertCircle size={13} /> {err}</p>}
          <PrimaryButton onClick={() => (pw === ADMIN_PASSWORD ? onVerified() : setErr("चुकीचा पासवर्ड"))}>Login करा</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- REGISTRATION ---------------------------------- */
function FarmerRegister({ mobile, onDone, onBack }) {
  const [f, setF] = useState({ name: "", address: "", village: VILLAGES[0], khet: "", acres: "", aadharFront: null, aadharBack: null, sevenTwelveList: [] });
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.name || !f.address || !f.khet || !f.acres) return setErr("कृपया नाव, पत्ता, शेत व एकर भरा");
    setErr("");
    const status = (f.aadharFront && f.aadharBack && f.sevenTwelveList.length > 0) ? "Pending" : "Documents Baaki";
    onDone({ ...f, mobile, docsStatus: status, isSubscribed: false, subscriptionAmount: 0, joined: new Date().toISOString().slice(0, 10) });
  };
  return (
    <div className="min-h-screen pb-8" style={{ background: C.cream, ...fBody }}>
      <TopHeader subtitle="शेतकरी नोंदणी" />
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold mb-4" style={{ color: C.soilLight }}>
            <ChevronLeft size={14} /> मागे
          </button>
          <p className="font-bold text-lg mb-4" style={{ color: C.deep2 }}>तुमची माहिती भरा</p>
          <Field label="पूर्ण नाव" icon={User}><input value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} style={inputStyle} placeholder="उदा. रमेश पाटील" /></Field>
          <Field label="पत्ता" icon={MapPin}><input value={f.address} onChange={(e) => set("address", e.target.value)} className={inputCls} style={inputStyle} placeholder="घर नं, गल्ली, तालुका" /></Field>
          <Field label="गाव" icon={MapPin}>
            <select value={f.village} onChange={(e) => set("village", e.target.value)} className={inputCls} style={inputStyle}>
              {VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="शेताचा पत्ता (गट नं.)" icon={MapPin}><input value={f.khet} onChange={(e) => set("khet", e.target.value)} className={inputCls} style={inputStyle} placeholder="गट नं. 45, शिवार" /></Field>
          <Field label="एकूण क्षेत्र (एकर)"><input value={f.acres} inputMode="decimal" onChange={(e) => set("acres", e.target.value.replace(/[^0-9.]/g, ""))} className={inputCls} style={inputStyle} placeholder="उदा. 4.5" /></Field>

          <p className="text-xs mb-3 px-1" style={{ color: C.soilLight }}>📎 कागदपत्रे आत्ता उपलब्ध नसतील तर नंतरही अपलोड करू शकता — नोंदणी अडणार नाही.</p>
          <DocUploader label="आधार कार्ड (समोर)" file={f.aadharFront} onChange={(v) => set("aadharFront", v)} />
          <DocUploader label="आधार कार्ड (मागे)" file={f.aadharBack} onChange={(v) => set("aadharBack", v)} />
          <MultiDocUploader label="7/12 उतारे" files={f.sevenTwelveList} onChange={(v) => set("sevenTwelveList", v)} />

          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1" style={{ color: C.red }}><AlertCircle size={13} /> {err}</p>}
          <PrimaryButton onClick={submit}>नोंदणी पूर्ण करा</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function DriverRegister({ mobile, onDone, onBack }) {
  const [f, setF] = useState({ name: "", address: "", village: VILLAGES[0], aadharFront: null, aadharBack: null, rcBook: null, license: null });
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.name || !f.address) return setErr("कृपया नाव व पत्ता भरा");
    setErr("");
    const status = (f.aadharFront && f.aadharBack && f.rcBook && f.license) ? "Pending" : "Documents Baaki";
    onDone({ ...f, mobile, docsStatus: status, joined: new Date().toISOString().slice(0, 10) });
  };
  return (
    <div className="min-h-screen pb-8" style={{ background: C.cream, ...fBody }}>
      <TopHeader subtitle="ड्रायव्हर नोंदणी" />
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold mb-4" style={{ color: C.soilLight }}>
            <ChevronLeft size={14} /> मागे
          </button>
          <p className="font-bold text-lg mb-4" style={{ color: C.deep2 }}>तुमची माहिती भरा</p>
          <Field label="पूर्ण नाव" icon={User}><input value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} style={inputStyle} placeholder="उदा. संदीप जाधव" /></Field>
          <Field label="पत्ता" icon={MapPin}><input value={f.address} onChange={(e) => set("address", e.target.value)} className={inputCls} style={inputStyle} placeholder="घर नं, गल्ली, तालुका" /></Field>
          <Field label="गाव" icon={MapPin}>
            <select value={f.village} onChange={(e) => set("village", e.target.value)} className={inputCls} style={inputStyle}>
              {VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </Field>
          <p className="text-xs mb-3 px-1" style={{ color: C.soilLight }}>📎 कागदपत्रे आत्ता उपलब्ध नसतील तर नंतरही अपलोड करू शकता — नोंदणी अडणार नाही.</p>
          <DocUploader label="आधार कार्ड (समोर)" file={f.aadharFront} onChange={(v) => set("aadharFront", v)} />
          <DocUploader label="आधार कार्ड (मागे)" file={f.aadharBack} onChange={(v) => set("aadharBack", v)} />
          <DocUploader label="RC Book" file={f.rcBook} onChange={(v) => set("rcBook", v)} />
          <DocUploader label="Driving License" file={f.license} onChange={(v) => set("license", v)} />
          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1" style={{ color: C.red }}><AlertCircle size={13} /> {err}</p>}
          <PrimaryButton onClick={submit}>नोंदणी पूर्ण करा</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- FARMER HOME ---------------------------------- */
function SubscribeBanner({ subscribed, acres, amount, onOpen }) {
  const price = SUBSCRIPTION_RATE_PER_ACRE * Number(acres || 0);
  return (
    <div className="mx-5 -mt-4 relative z-10 rounded-2xl p-4 shadow-xl overflow-hidden relative"
      style={{ background: `linear-gradient(120deg, ${C.gold}, #C6893A)` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-extrabold text-lg" style={{ color: C.deep2, ...fDisplay }}>50% OFF</p>
          <p className="text-xs font-semibold" style={{ color: "#3E2A0B" }}>
            {subscribed ? `₹${SUBSCRIPTION_RATE_PER_ACRE}/एकर/वर्ष सबस्क्रिप्शन ॲक्टिव्ह` : `फक्त ₹${SUBSCRIPTION_RATE_PER_ACRE}/एकर/वर्ष मध्ये सर्व services स्वस्त!`}
          </p>
        </div>
        {subscribed ? (
          <GoldBadge className="!bg-white/90"><CheckCircle2 size={13} /> Subscribed</GoldBadge>
        ) : (
          <button onClick={onOpen} className="px-4 py-2 rounded-xl text-sm font-bold shadow" style={{ background: C.deep2, color: "#fff" }}>
            Subscribe ₹{price}/yr
          </button>
        )}
      </div>
    </div>
  );
}

function SubscribeModal({ acres, onClose, onConfirm }) {
  const price = SUBSCRIPTION_RATE_PER_ACRE * Number(acres || 0);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(10,20,14,0.55)" }}>
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-7" style={fBody}>
        <div className="w-10 h-1.5 rounded-full mx-auto mb-4" style={{ background: C.line }} />
        <p className="font-bold text-lg mb-1" style={{ color: C.deep2 }}>Yearly Subscription घ्या</p>
        <p className="text-xs mb-4" style={{ color: C.soilLight }}>दर ₹{SUBSCRIPTION_RATE_PER_ACRE} प्रति एकर प्रति वर्ष</p>
        <div className="rounded-2xl p-4 mb-4" style={{ background: "#FCF6E8" }}>
          <div className="flex justify-between text-sm mb-1"><span style={{ color: C.soil }}>तुमचे क्षेत्र</span><span className="font-bold" style={{ color: C.deep2 }}>{acres} एकर</span></div>
          <div className="flex justify-between text-sm mb-1"><span style={{ color: C.soil }}>दर</span><span className="font-bold" style={{ color: C.deep2 }}>₹{SUBSCRIPTION_RATE_PER_ACRE} / एकर / वर्ष</span></div>
          <div className="h-px my-2" style={{ background: C.line }} />
          <div className="flex justify-between"><span className="font-bold" style={{ color: C.deep2 }}>वार्षिक एकूण</span><span className="font-extrabold text-lg" style={{ color: C.mid }}>{money(price)}/yr</span></div>
        </div>
        <p className="text-xs mb-4" style={{ color: C.soilLight }}>Subscribe केल्यावर पुढील 1 वर्षासाठी सर्व services वर 50% सवलत मिळेल.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold border" style={{ borderColor: C.line, color: C.deep2 }}>रद्द करा</button>
          <button onClick={() => onConfirm(price)} className="flex-1 py-3 rounded-2xl font-bold shadow" style={{ background: `linear-gradient(135deg, ${C.gold}, #C6893A)`, color: C.deep2 }}>
            {money(price)} भरा
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ svc, subscribed, onBook }) {
  const price = subscribed ? svc.subscription : svc.normal;
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-between mb-3">
      <div className="flex-1">
        <p className="font-bold text-[15px] mb-1" style={{ color: C.deep2 }}>{svc.name}</p>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg" style={{ color: C.mid }}>{money(price)}</span>
          {subscribed && <span className="text-xs line-through" style={{ color: C.soilLight }}>{money(svc.normal)}</span>}
          {!subscribed && <GoldBadge>50% OFF सह {money(svc.subscription)}</GoldBadge>}
        </div>
      </div>
      <button onClick={() => onBook(svc)} className="px-4 py-2.5 rounded-xl font-bold text-sm shadow"
        style={{ background: `linear-gradient(135deg, ${C.mid}, ${C.deep})`, color: "#fff" }}>
        Book करा
      </button>
    </div>
  );
}

function BookingModal({ svc, subscribed, onClose, onConfirm }) {
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const price = subscribed ? svc.subscription : svc.normal;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(10,20,14,0.55)" }}>
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-7" style={fBody}>
        <div className="w-10 h-1.5 rounded-full mx-auto mb-4" style={{ background: C.line }} />
        <p className="font-bold text-lg mb-1" style={{ color: C.deep2 }}>{svc.name}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-extrabold text-xl" style={{ color: C.mid }}>{money(price)}</span>
          {subscribed && <GoldBadge>Subscriber Rate</GoldBadge>}
        </div>
        <Field label="Booking Date" icon={Calendar}>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} style={inputStyle} />
        </Field>
        <Field label="Notes (ऐच्छिक)" icon={PenLine}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} style={inputStyle} placeholder="विशेष सूचना असल्यास लिहा..." />
        </Field>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold border" style={{ borderColor: C.line, color: C.deep2 }}>रद्द करा</button>
          <button disabled={!date} onClick={() => onConfirm(date, notes, price)} className="flex-1 py-3 rounded-2xl font-bold shadow disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${C.mid}, ${C.deep})`, color: "#fff" }}>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

function FarmerHome({ farmer, bookings, notifications, onSubscribe, onBook, onLogout }) {
  const [tab, setTab] = useState("home");
  const [modalSvc, setModalSvc] = useState(null);
  const [subModal, setSubModal] = useState(false);
  const [toast, setToast] = useState("");
  const myBookings = bookings.filter((b) => b.farmerMobile === farmer.mobile).slice().reverse();
  const myNotifs = notifications.filter((n) =>
    n.target === "all_farmers" ||
    (n.target === "village" && n.targetVillage === farmer.village) ||
    (n.target === "farmer" && n.targetMobile === farmer.mobile)
  );

  const confirm = (date, notes, price) => {
    onBook({ svc: modalSvc, date, notes, price });
    setModalSvc(null);
    setToast("✅ Booking Confirm! नजदीकच्या ड्रायव्हरला सूचना पाठवली गेली आहे.");
    setTimeout(() => setToast(""), 3200);
    setTab("bookings");
  };

  const confirmSub = (price) => {
    onSubscribe(price);
    setSubModal(false);
    setToast(`✅ Subscription ॲक्टिव्ह! ${money(price)} भरले गेले.`);
    setTimeout(() => setToast(""), 3200);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: C.cream, ...fBody }}>
      {tab === "home" && (
        <>
          <TopHeader subtitle={`नमस्कार, ${farmer.name.split(" ")[0]} 🙏`} title={`📍 ${farmer.village} • ${farmer.acres} एकर`} onLogout={onLogout} />
          <SubscribeBanner subscribed={farmer.isSubscribed} acres={farmer.acres} onOpen={() => setSubModal(true)} />
          <div className="px-5 mt-5">
            <p className="font-bold mb-3 flex items-center gap-1.5" style={{ color: C.deep2 }}><Tractor size={16} /> उपलब्ध Services</p>
            {SERVICES.map((s) => <ServiceCard key={s.id} svc={s} subscribed={farmer.isSubscribed} onBook={setModalSvc} />)}
          </div>
        </>
      )}

      {tab === "bookings" && (
        <>
          <TopHeader subtitle="माझ्या Bookings" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10 space-y-3">
            {myBookings.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center shadow">
                <p className="text-sm" style={{ color: C.soilLight }}>अजून कोणतीही booking नाही</p>
              </div>
            )}
            {myBookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-sm" style={{ color: C.deep2 }}>{b.serviceName}</p>
                  <StatusPill status={b.status} />
                </div>
                <p className="text-xs mb-1" style={{ color: C.soilLight }}>📅 {b.date} • {money(b.price)}</p>
                {b.driverName && <p className="text-xs mb-1" style={{ color: C.soilLight }}>🚜 ड्रायव्हर: {b.driverName}</p>}
                {b.notes && <p className="text-xs italic" style={{ color: C.soilLight }}>"{b.notes}"</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "notify" && (
        <>
          <TopHeader subtitle="सूचना" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10">
            <NotificationList items={myNotifs} />
          </div>
        </>
      )}

      {tab === "profile" && (
        <>
          <TopHeader subtitle="माझी प्रोफाईल" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10">
            <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
              <Row icon={User} label="नाव" value={farmer.name} />
              <Row icon={Phone} label="मोबाईल" value={farmer.mobile} />
              <Row icon={MapPin} label="पत्ता" value={farmer.address} />
              <Row icon={MapPin} label="गाव" value={farmer.village} />
              <Row icon={Sprout} label="शेत" value={farmer.khet} />
              <Row icon={ClipboardList} label="क्षेत्र" value={farmer.acres + " एकर"} />
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: C.soil }}>Documents Status</span>
                <StatusPill status={farmer.docsStatus} />
              </div>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 rounded-xl p-3 shadow-2xl text-sm font-semibold text-white flex items-center gap-2" style={{ background: C.mid }}>
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {modalSvc && <BookingModal svc={modalSvc} subscribed={farmer.isSubscribed} onClose={() => setModalSvc(null)} onConfirm={confirm} />}
      {subModal && <SubscribeModal acres={farmer.acres} onClose={() => setSubModal(false)} onConfirm={confirmSub} />}

      <BottomNav active={tab} onChange={setTab} items={[
        { key: "home", label: "Home", icon: HomeIcon },
        { key: "bookings", label: "Bookings", icon: ClipboardList },
        { key: "notify", label: "सूचना", icon: Bell },
        { key: "profile", label: "Profile", icon: User },
      ]} />
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#EAF3EC" }}>
        <Icon size={14} color={C.mid} />
      </div>
      <div>
        <p className="text-[11px]" style={{ color: C.soilLight }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: C.deep2 }}>{value}</p>
      </div>
    </div>
  );
}

/* ---------------------------------- DRIVER HOME ---------------------------------- */
function DriverHome({ driver, bookings, notifications, onRespond, onLogout }) {
  const [tab, setTab] = useState("jobs");
  const villageJobs = bookings.filter((b) => b.village === driver.village && b.status === "Pending").slice().reverse();
  const myJobs = bookings.filter((b) => b.driverName === driver.name).slice().reverse();
  const myNotifs = notifications.filter((n) =>
    n.target === "all_drivers" ||
    (n.target === "village" && n.targetVillage === driver.village) ||
    (n.target === "driver" && n.targetMobile === driver.mobile)
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: C.cream, ...fBody }}>
      {tab === "jobs" && (
        <>
          <TopHeader subtitle={`नमस्कार, ${driver.name.split(" ")[0]} 🚜`} title={`📍 ${driver.village}`} onLogout={onLogout} />
          <div className="mx-5 -mt-4 relative z-10 rounded-2xl p-4 shadow-xl" style={{ background: `linear-gradient(120deg, ${C.gold}, #C6893A)` }}>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} color={C.deep2} />
              <p className="font-extrabold" style={{ color: C.deep2 }}>₹2.5 करोड़ Incentive Budget</p>
            </div>
            <p className="text-xs font-semibold" style={{ color: "#3E2A0B" }}>प्रत्येक स्वीकारलेल्या बुकिंगवर तुम्हाला बोनस इंसेंटिव्ह मिळेल!</p>
          </div>
          <div className="px-5 mt-5">
            <p className="font-bold mb-3 flex items-center gap-1.5" style={{ color: C.deep2 }}><Bell size={16} /> नवीन Booking Requests</p>
            {villageJobs.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center shadow">
                <p className="text-sm" style={{ color: C.soilLight }}>सध्या तुमच्या गावात नवीन request नाही</p>
              </div>
            )}
            {villageJobs.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md mb-3">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-bold text-sm" style={{ color: C.deep2 }}>{b.serviceName}</p>
                  <span className="font-extrabold text-sm" style={{ color: C.mid }}>{money(b.price)}</span>
                </div>
                <p className="text-xs mb-1" style={{ color: C.soilLight }}>👤 {b.farmerName} • 📅 {b.date}</p>
                {b.notes && <p className="text-xs italic mb-2" style={{ color: C.soilLight }}>"{b.notes}"</p>}
                <p className="text-[11px] font-bold mb-2" style={{ color: C.gold }}>+ ₹150 इंसेंटिव्ह या job वर</p>
                <div className="flex gap-2">
                  <button onClick={() => onRespond(b.id, "Rejected")} className="flex-1 py-2.5 rounded-xl font-bold text-sm border" style={{ borderColor: C.line, color: C.red }}>नकार</button>
                  <button onClick={() => onRespond(b.id, "Accepted", driver.name, driver.mobile)} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: C.mid }}>स्वीकार</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "myjobs" && (
        <>
          <TopHeader subtitle="माझी कामे" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10 space-y-3">
            {myJobs.length === 0 && <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm" style={{ color: C.soilLight }}>अजून कोणतेही काम नाही</p></div>}
            {myJobs.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-bold text-sm" style={{ color: C.deep2 }}>{b.serviceName}</p>
                  <StatusPill status={b.status} />
                </div>
                <p className="text-xs" style={{ color: C.soilLight }}>👤 {b.farmerName} • 📅 {b.date} • {money(b.price)}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "notify" && (
        <>
          <TopHeader subtitle="सूचना" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10">
            <NotificationList items={myNotifs} />
          </div>
        </>
      )}

      {tab === "profile" && (
        <>
          <TopHeader subtitle="माझी प्रोफाईल" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10">
            <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
              <Row icon={User} label="नाव" value={driver.name} />
              <Row icon={Phone} label="मोबाईल" value={driver.mobile} />
              <Row icon={MapPin} label="पत्ता" value={driver.address} />
              <Row icon={MapPin} label="गाव" value={driver.village} />
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: C.soil }}>Documents Status</span>
                <StatusPill status={driver.docsStatus} />
              </div>
            </div>
          </div>
        </>
      )}

      <BottomNav active={tab} onChange={setTab} items={[
        { key: "jobs", label: "Requests", icon: Bell },
        { key: "myjobs", label: "My Jobs", icon: ClipboardList },
        { key: "notify", label: "सूचना", icon: MessageCircle },
        { key: "profile", label: "Profile", icon: User },
      ]} />
    </div>
  );
}

/* ---------------------------------- ADMIN DASHBOARD ---------------------------------- */
function AdminDashboard({ farmers, drivers, bookings, notifications, onDocAction, onSendNotification, onLogout }) {
  const [tab, setTab] = useState("overview");

  const totalRevenue = bookings.reduce((s, b) => s + b.price, 0);
  const subscriptionRevenue = Object.values(farmers).reduce((s, f) => s + (f.isSubscribed ? Number(f.subscriptionAmount || 0) : 0), 0);
  const subscribedCount = Object.values(farmers).filter((f) => f.isSubscribed).length;
  const byService = useMemo(() => {
    const m = {};
    bookings.forEach((b) => { m[b.serviceName] = (m[b.serviceName] || 0) + b.price; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [bookings]);
  const byVillage = useMemo(() => {
    const m = {};
    bookings.forEach((b) => { m[b.village] = m[b.village] || { revenue: 0, count: 0 }; m[b.village].revenue += b.price; m[b.village].count += 1; });
    return Object.entries(m).sort((a, b) => b[1].revenue - a[1].revenue);
  }, [bookings]);
  const maxServiceRev = Math.max(1, ...byService.map((x) => x[1]));
  const maxVillageRev = Math.max(1, ...byVillage.map((x) => x[1].revenue));

  return (
    <div className="min-h-screen pb-24" style={{ background: C.cream, ...fBody }}>
      <TopHeader subtitle="Admin Dashboard" title="सर्व villages, services व documents नियंत्रित करा" onLogout={onLogout} />

      {tab === "overview" && (
        <div className="px-5 -mt-4 relative z-10 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <IndianRupee size={18} color={C.mid} />
              <p className="font-extrabold text-xl mt-1" style={{ color: C.deep2 }}>{money(totalRevenue)}</p>
              <p className="text-xs" style={{ color: C.soilLight }}>Booking Revenue</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <Wallet size={18} color={C.gold} />
              <p className="font-extrabold text-xl mt-1" style={{ color: C.deep2 }}>{money(subscriptionRevenue)}</p>
              <p className="text-xs" style={{ color: C.soilLight }}>Subscription Revenue ({subscribedCount})</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <ClipboardList size={18} color={C.gold} />
              <p className="font-extrabold text-xl mt-1" style={{ color: C.deep2 }}>{bookings.length}</p>
              <p className="text-xs" style={{ color: C.soilLight }}>एकूण Bookings</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <Sprout size={18} color={C.mid} />
              <p className="font-extrabold text-xl mt-1" style={{ color: C.deep2 }}>{Object.keys(farmers).length}</p>
              <p className="text-xs" style={{ color: C.soilLight }}>शेतकरी</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md">
            <p className="font-bold mb-3 flex items-center gap-1.5" style={{ color: C.deep2 }}><BarChart3 size={16} /> Service-wise Revenue</p>
            {byService.map(([name, rev]) => (
              <div key={name} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: C.soil }}>{name}</span>
                  <span className="font-bold" style={{ color: C.deep2 }}>{money(rev)}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: C.line }}>
                  <div className="h-2 rounded-full" style={{ width: `${(rev / maxServiceRev) * 100}%`, background: `linear-gradient(90deg, ${C.mid}, ${C.gold})` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md">
            <p className="font-bold mb-3 flex items-center gap-1.5" style={{ color: C.deep2 }}><TrendingUp size={16} /> Village-wise Revenue</p>
            {byVillage.map(([name, d]) => (
              <div key={name} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: C.soil }}>{name} <span style={{ color: C.soilLight }}>({d.count} bookings)</span></span>
                  <span className="font-bold" style={{ color: C.deep2 }}>{money(d.revenue)}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: C.line }}>
                  <div className="h-2 rounded-full" style={{ width: `${(d.revenue / maxVillageRev) * 100}%`, background: `linear-gradient(90deg, ${C.deep}, ${C.mid})` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="px-5 -mt-4 relative z-10 space-y-3">
          {bookings.slice().reverse().map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-1">
                <p className="font-bold text-sm" style={{ color: C.deep2 }}>{b.serviceName}</p>
                <StatusPill status={b.status} />
              </div>
              <p className="text-xs" style={{ color: C.soilLight }}>👤 {b.farmerName} • 📍 {b.village}</p>
              <p className="text-xs" style={{ color: C.soilLight }}>📅 {b.date} • {money(b.price)} {b.driverName && `• 🚜 ${b.driverName}`}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "farmers" && (
        <div className="px-5 -mt-4 relative z-10 space-y-3">
          {Object.values(farmers).map((f) => (
            <PersonDocCard key={f.mobile} person={f} kind="farmer" onDocAction={onDocAction} />
          ))}
        </div>
      )}

      {tab === "drivers" && (
        <div className="px-5 -mt-4 relative z-10 space-y-3">
          {Object.values(drivers).map((d) => (
            <PersonDocCard key={d.mobile} person={d} kind="driver" onDocAction={onDocAction} />
          ))}
        </div>
      )}

      {tab === "notify" && (
        <div className="px-5 -mt-4 relative z-10">
          <AdminNotifyForm farmers={farmers} drivers={drivers} onSend={onSendNotification} />
          <p className="font-bold mb-3 mt-5 flex items-center gap-1.5" style={{ color: C.deep2 }}><Bell size={16} /> पाठवलेल्या सूचना</p>
          <NotificationList items={notifications} />
        </div>
      )}

      <BottomNav active={tab} onChange={setTab} items={[
        { key: "overview", label: "Overview", icon: BarChart3 },
        { key: "bookings", label: "Bookings", icon: ClipboardList },
        { key: "farmers", label: "Farmers", icon: Sprout },
        { key: "drivers", label: "Drivers", icon: Tractor },
        { key: "notify", label: "Notify", icon: Send },
      ]} />
    </div>
  );
}

function AdminNotifyForm({ farmers, drivers, onSend }) {
  const [target, setTarget] = useState("all_farmers");
  const [village, setVillage] = useState(VILLAGES[0]);
  const [person, setPerson] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState("");

  const targets = [
    { key: "all_farmers", label: "सर्व शेतकरी" },
    { key: "all_drivers", label: "सर्व ड्रायव्हर" },
    { key: "village", label: "विशिष्ट गाव" },
    { key: "farmer", label: "विशिष्ट शेतकरी" },
    { key: "driver", label: "विशिष्ट ड्रायव्हर" },
  ];

  const send = () => {
    if (!title || !message) return;
    let payload = { target, title, message };
    if (target === "village") { payload.targetVillage = village; payload.targetLabel = "गाव: " + village; }
    if (target === "farmer") { const p = farmers[person]; if (!p) return; payload.targetMobile = person; payload.targetLabel = "शेतकरी: " + p.name; }
    if (target === "driver") { const p = drivers[person]; if (!p) return; payload.targetMobile = person; payload.targetLabel = "ड्रायव्हर: " + p.name; }
    if (target === "all_farmers") payload.targetLabel = "सर्व शेतकरी";
    if (target === "all_drivers") payload.targetLabel = "सर्व ड्रायव्हर";
    onSend(payload);
    setTitle(""); setMessage("");
    setSent("✅ सूचना पाठवली गेली!");
    setTimeout(() => setSent(""), 2500);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <p className="font-bold mb-3 flex items-center gap-1.5" style={{ color: C.deep2 }}><Send size={16} /> नवीन सूचना पाठवा</p>
      <Field label="कोणाला पाठवायचे?">
        <select value={target} onChange={(e) => { setTarget(e.target.value); setPerson(""); }} className={inputCls} style={inputStyle}>
          {targets.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </Field>
      {target === "village" && (
        <Field label="गाव निवडा">
          <select value={village} onChange={(e) => setVillage(e.target.value)} className={inputCls} style={inputStyle}>
            {VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
      )}
      {target === "farmer" && (
        <Field label="शेतकरी निवडा">
          <select value={person} onChange={(e) => setPerson(e.target.value)} className={inputCls} style={inputStyle}>
            <option value="">-- निवडा --</option>
            {Object.values(farmers).map((f) => <option key={f.mobile} value={f.mobile}>{f.name} ({f.mobile})</option>)}
          </select>
        </Field>
      )}
      {target === "driver" && (
        <Field label="ड्रायव्हर निवडा">
          <select value={person} onChange={(e) => setPerson(e.target.value)} className={inputCls} style={inputStyle}>
            <option value="">-- निवडा --</option>
            {Object.values(drivers).map((d) => <option key={d.mobile} value={d.mobile}>{d.name} ({d.mobile})</option>)}
          </select>
        </Field>
      )}
      <Field label="शीर्षक"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} style={inputStyle} placeholder="उदा. नवीन सवलत" /></Field>
      <Field label="मेसेज"><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} style={inputStyle} placeholder="सूचनेचा मजकूर लिहा..." /></Field>
      {sent && <p className="text-xs font-semibold mb-2" style={{ color: C.mid }}>{sent}</p>}
      <PrimaryButton disabled={!title || !message} onClick={send}>सूचना पाठवा</PrimaryButton>
    </div>
  );
}

function DocThumb({ label, file }) {
  return (
    <div className="text-center">
      {file ? (
        file.type === "application/pdf" ? (
          <div className="w-full h-16 rounded-lg flex items-center justify-center" style={{ background: C.deep }}>
            <FileText size={22} color="#fff" />
          </div>
        ) : (
          <img src={file.url} className="w-full h-16 rounded-lg object-cover" />
        )
      ) : (
        <div className="w-full h-16 rounded-lg flex items-center justify-center" style={{ background: "#F1EDE0" }}>
          <FileText size={18} color={C.soilLight} />
        </div>
      )}
      <p className="text-[10px] mt-1" style={{ color: C.soilLight }}>{label}</p>
    </div>
  );
}

function PersonDocCard({ person, kind, onDocAction }) {
  const fixedDocs = kind === "farmer"
    ? [["आधार समोर", person.aadharFront], ["आधार मागे", person.aadharBack]]
    : [["आधार समोर", person.aadharFront], ["आधार मागे", person.aadharBack], ["RC Book", person.rcBook], ["License", person.license]];
  const sevenTwelveDocs = kind === "farmer" ? (person.sevenTwelveList || []).map((f, i) => [`7/12 #${i + 1}`, f]) : [];
  const docs = [...fixedDocs, ...sevenTwelveDocs];
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bold text-sm" style={{ color: C.deep2 }}>{person.name}</p>
          <p className="text-xs" style={{ color: C.soilLight }}>📱 {person.mobile} • 📍 {person.village}</p>
          {kind === "farmer" && person.isSubscribed && <p className="text-xs font-semibold" style={{ color: C.gold }}>⭐ Subscribed • {money(person.subscriptionAmount || 0)}/yr</p>}
        </div>
        <StatusPill status={person.docsStatus} />
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {docs.map(([label, file], i) => <DocThumb key={label + i} label={label} file={file} />)}
      </div>
      {person.docsStatus !== "Approved" && (
        <div className="flex gap-2">
          <button onClick={() => onDocAction(kind, person.mobile, "Rejected")} className="flex-1 py-2 rounded-xl font-bold text-xs border flex items-center justify-center gap-1" style={{ borderColor: C.line, color: C.red }}>
            <XCircle size={14} /> Reject
          </button>
          <button onClick={() => onDocAction(kind, person.mobile, "Approved")} className="flex-1 py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1" style={{ background: C.mid }}>
            <CheckCircle2 size={14} /> Approve
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- ROOT APP ---------------------------------- */
export default function App() {
  const [screen, setScreen] = useState("role");
  const [role, setRole] = useState(null);
  const [mobile, setMobile] = useState("");
  const [farmers, setFarmers] = useState(seedFarmers);
  const [drivers, setDrivers] = useState(seedDrivers);
  const [bookings, setBookings] = useState(seedBookings);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [currentFarmer, setCurrentFarmer] = useState(null);
  const [currentDriver, setCurrentDriver] = useState(null);

  const reset = () => { setScreen("role"); setRole(null); setMobile(""); setCurrentFarmer(null); setCurrentDriver(null); };

  const handleRolePick = (r) => { setRole(r); setScreen(r === "admin" ? "adminLogin" : "mobile"); };

  const handleOtpVerified = () => {
    if (role === "farmer") {
      if (farmers[mobile]) { setCurrentFarmer(farmers[mobile]); setScreen("farmerHome"); }
      else setScreen("farmerRegister");
    } else {
      if (drivers[mobile]) { setCurrentDriver(drivers[mobile]); setScreen("driverHome"); }
      else setScreen("driverRegister");
    }
  };

  const finishFarmerReg = (data) => {
    setFarmers((p) => ({ ...p, [mobile]: data }));
    setCurrentFarmer(data);
    setScreen("farmerHome");
  };
  const finishDriverReg = (data) => {
    setDrivers((p) => ({ ...p, [mobile]: data }));
    setCurrentDriver(data);
    setScreen("driverHome");
  };

  const subscribeFarmer = (price) => {
    setFarmers((p) => { const u = { ...p[currentFarmer.mobile], isSubscribed: true, subscriptionAmount: price }; return { ...p, [currentFarmer.mobile]: u }; });
    setCurrentFarmer((p) => ({ ...p, isSubscribed: true, subscriptionAmount: price }));
  };

  const makeBooking = ({ svc, date, notes, price }) => {
    const b = { id: uid(), farmerMobile: currentFarmer.mobile, farmerName: currentFarmer.name, village: currentFarmer.village, serviceId: svc.id, serviceName: svc.name, price, date, notes, status: "Pending", driverName: null };
    setBookings((p) => [...p, b]);
  };

  const respondBooking = (id, status, driverName, driverMobile) => {
    setBookings((p) => p.map((b) => (b.id === id ? { ...b, status, driverName: driverName || b.driverName, driverMobile: driverMobile || b.driverMobile } : b)));
    if (status === "Accepted") {
      const b = bookings.find((x) => x.id === id);
      if (b) {
        const n = {
          id: uid(), target: "farmer", targetMobile: b.farmerMobile, targetLabel: "बुकिंग अपडेट",
          title: "🚜 ड्रायव्हर असाइन झाला!", from: "system", time: nowStr(),
          message: `तुमची "${b.serviceName}" बुकिंग स्वीकारली गेली आहे. ड्रायव्हर: ${driverName}, नंबर: ${driverMobile}`,
        };
        setNotifications((p) => [...p, n]);
      }
    }
  };

  const sendNotification = (payload) => {
    setNotifications((p) => [...p, { id: uid(), from: "admin", time: nowStr(), ...payload }]);
  };

  const docAction = (kind, mob, status) => {
    if (kind === "farmer") setFarmers((p) => ({ ...p, [mob]: { ...p[mob], docsStatus: status } }));
    else setDrivers((p) => ({ ...p, [mob]: { ...p[mob], docsStatus: status } }));
  };

  return (
    <div className="w-full min-h-screen flex justify-center" style={{ background: "#00000010" }}>
      <style>{FONT_IMPORT}</style>
      <div className="w-full max-w-md relative" style={{ background: C.cream }}>
        {screen === "role" && <RoleSelect onPick={handleRolePick} />}
        {screen === "mobile" && (
          <MobileEntry role={role} onBack={reset} onSent={(m) => { setMobile(m); setScreen("otp"); }} />
        )}
        {screen === "otp" && (
          <OtpEntry mobile={mobile} onBack={() => setScreen("mobile")} onVerified={handleOtpVerified} />
        )}
        {screen === "adminLogin" && (
          <AdminLogin onBack={reset} onVerified={() => setScreen("adminHome")} />
        )}
        {screen === "farmerRegister" && (
          <FarmerRegister mobile={mobile} onBack={() => setScreen("otp")} onDone={finishFarmerReg} />
        )}
        {screen === "driverRegister" && (
          <DriverRegister mobile={mobile} onBack={() => setScreen("otp")} onDone={finishDriverReg} />
        )}
        {screen === "farmerHome" && currentFarmer && (
          <FarmerHome farmer={currentFarmer} bookings={bookings} notifications={notifications} onSubscribe={subscribeFarmer} onBook={makeBooking} onLogout={reset} />
        )}
        {screen === "driverHome" && currentDriver && (
          <DriverHome driver={currentDriver} bookings={bookings} notifications={notifications} onRespond={respondBooking} onLogout={reset} />
        )}
        {screen === "adminHome" && (
          <AdminDashboard farmers={farmers} drivers={drivers} bookings={bookings} notifications={notifications} onDocAction={docAction} onSendNotification={sendNotification} onLogout={reset} />
        )}
      </div>
    </div>
  );
}
