"use client";

import React, { useState, useEffect, useId, useMemo, useCallback } from "react";
import {
  Tractor, Phone, ShieldCheck, User, MapPin, Upload, Camera, FileText,
  CheckCircle2, XCircle, ChevronRight, ChevronLeft, LogOut, Home as HomeIcon,
  ClipboardList, BarChart3, Bell, IndianRupee, Sprout, Lock, Plus,
  AlertCircle, Calendar, PenLine, Trash2, Wallet, TrendingUp, Send, MessageCircle, History, RefreshCw
} from "lucide-react";
import {
  SERVICES, VILLAGES, SUBSCRIPTION_RATE_PER_ACRE, DRIVER_INCENTIVE_PER_JOB,
  DRIVER_INCENTIVE_BUDGET_LABEL, ADMIN_PASSWORD, MOCK_OTP, money, uid, generateOtp4,
} from "../lib/constants";
import {
  uploadDoc, getFarmerByMobile, getAllFarmers, createFarmer, updateFarmer,
  getDriverByMobile, getAllDrivers, createDriver, updateDriver,
  getBookingsForFarmer, getPendingBookingsForVillage, getBookingsForDriver, getAllBookings,
  createBooking, respondToBooking, completeBooking, getNotificationsFor, getAllNotifications, createNotification,
  setFarmerAadharStatus, setFarmerPlotStatus,
} from "../lib/db";

/* ============================== SMALL UI ATOMS ============================== */
const inputCls = "w-full px-4 py-3 rounded-xl border border-stone-200 bg-white outline-none text-[15px] text-emerald-950 focus:ring-2 focus:ring-emerald-400 transition";

function Field({ label, icon: Icon, children }) {
  return (
    <div className="mb-4">
      <label className="flex items-center gap-1.5 text-sm font-semibold mb-1.5 text-stone-600">
        {Icon && <Icon size={15} />} {label}
      </label>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-premium active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100 text-white bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 font-display ${className}`}>
      {children}
    </button>
  );
}

function GoldBadge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-sm text-orange-950 bg-gradient-to-r from-amber-300 to-orange-400 ${className}`}>
      {children}
    </span>
  );
}

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-700",
  "Documents Baaki": "bg-stone-100 text-stone-500",
  Accepted: "bg-emerald-100 text-emerald-700",
  Completed: "bg-sky-100 text-sky-700",
  Rejected: "bg-rose-100 text-rose-700",
  Approved: "bg-emerald-100 text-emerald-700",
};
function StatusPill({ status }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>{status}</span>;
}

function UploadSlot({ label, fileUrl, fileName, onUpload, onRemove, compact }) {
  const camId = useId(), galId = useId();
  const [busy, setBusy] = useState(false);
  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try { await onUpload(file); } catch (e) { alert("अपलोड अयशस्वी: " + (e.message || e)); }
    setBusy(false);
  };
  return (
    <div className={`p-3 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 ${compact ? "" : "mb-4"}`}>
      <p className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-stone-600"><FileText size={15} /> {label}</p>
      {busy ? (
        <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold py-3"><RefreshCw size={14} className="animate-spin" /> अपलोड होत आहे...</div>
      ) : fileUrl ? (
        <div className="flex items-center gap-3">
          {fileName?.toLowerCase().endsWith(".pdf") ? (
            <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-emerald-800"><FileText size={22} color="#fff" /></div>
          ) : (
            <img src={fileUrl} alt={label} className="w-14 h-14 rounded-lg object-cover border border-stone-200" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-700">✓ अपलोड झाले</p>
            <p className="text-xs truncate text-stone-400">{fileName}</p>
          </div>
          {onRemove && <button onClick={onRemove} className="p-2 rounded-lg bg-rose-50"><Trash2 size={15} className="text-rose-600" /></button>}
        </div>
      ) : (
        <div className="flex gap-2">
          <label htmlFor={camId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold text-white bg-emerald-800"><Camera size={18} /> कैमरा</label>
          <input id={camId} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ""; pick(f); }} />
          <label htmlFor={galId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold border border-stone-200 text-emerald-950"><Upload size={18} /> गैलरी/PDF</label>
          <input id={galId} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ""; pick(f); }} />
        </div>
      )}
    </div>
  );
}

function TopHeader({ title, subtitle, onLogout }) {
  return (
    <div className="px-5 pt-6 pb-8 rounded-b-3xl relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 bg-furrow">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-300 to-orange-400 shadow">
            <Tractor size={20} className="text-emerald-950" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none font-display">Farmer Jutai</p>
            <p className="text-[11px] text-emerald-100">{subtitle}</p>
          </div>
        </div>
        {onLogout && <button onClick={onLogout} className="p-2 rounded-full bg-white/15"><LogOut size={17} color="#fff" /></button>}
      </div>
      {title && <p className="text-emerald-50/90 text-sm mt-4 relative z-10">{title}</p>}
    </div>
  );
}

function BottomNav({ items, active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex border-t border-stone-200 bg-white z-30">
      {items.map((it) => (
        <button key={it.key} onClick={() => onChange(it.key)} className="flex-1 flex flex-col items-center gap-1 py-2.5">
          <it.icon size={20} className={active === it.key ? "text-emerald-700" : "text-stone-400"} />
          <span className={`text-[11px] font-semibold ${active === it.key ? "text-emerald-700" : "text-stone-400"}`}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function Toast({ text }) {
  if (!text) return null;
  return (
    <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 rounded-xl p-3 shadow-2xl text-sm font-semibold text-white flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600">
      <CheckCircle2 size={16} /> {text}
    </div>
  );
}

function CallButton({ number, label, className = "" }) {
  if (!number) return null;
  return (
    <a href={`tel:${number}`} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-500 shadow ${className}`}>
      <Phone size={13} /> {label || "Call करा"}
    </a>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-50"><Icon size={14} className="text-emerald-700" /></div>
      <div><p className="text-[11px] text-stone-400">{label}</p><p className="text-sm font-semibold text-emerald-950">{value}</p></div>
    </div>
  );
}

/* ============================== AUTH SCREENS ============================== */
function RoleSelect({ onPick }) {
  const roles = [
    { key: "farmer", label: "शेतकरी", sub: "Farmer — services बुक करा", icon: Sprout },
    { key: "driver", label: "ड्रायव्हर", sub: "Driver — jobs स्वीकारा", icon: Tractor },
    { key: "admin", label: "Admin", sub: "व्यवस्थापन नियंत्रण", icon: ShieldCheck },
  ];
  return (
    <div className="min-h-screen">
      <div className="px-6 pt-16 pb-10 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 bg-furrow">
        <div className="flex flex-col items-center relative z-10">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl bg-gradient-to-br from-amber-300 to-orange-400">
            <Tractor size={38} className="text-emerald-950" />
          </div>
          <h1 className="text-white text-2xl font-extrabold font-display">Farmer Jutai</h1>
          <p className="text-sm mt-1 text-emerald-100">शेत सेवा, एका क्लिकवर</p>
        </div>
      </div>
      <div className="px-5 -mt-6 relative z-20 space-y-3">
        {roles.map((r) => (
          <button key={r.key} onClick={() => onPick(r.key)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white shadow-lg active:scale-[0.98] transition">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50"><r.icon size={22} className="text-emerald-700" /></div>
            <div className="text-left flex-1"><p className="font-bold text-[15px] text-emerald-950">{r.label}</p><p className="text-xs text-stone-400">{r.sub}</p></div>
            <ChevronRight size={18} className="text-stone-400" />
          </button>
        ))}
      </div>
      <p className="text-center text-xs mt-8 text-stone-400">Premium Farm Services App • v2.0</p>
    </div>
  );
}

function BackBtn({ onBack }) {
  return <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold mb-4 text-stone-400"><ChevronLeft size={14} /> मागे</button>;
}

function MobileEntry({ role, onBack, onSent }) {
  const [mobile, setMobile] = useState("");
  const valid = /^[6-9]\d{9}$/.test(mobile);
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader subtitle={role === "farmer" ? "शेतकरी लॉगिन" : "ड्रायव्हर लॉगिन"} />
      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <BackBtn onBack={onBack} />
          <p className="font-bold text-lg mb-1 text-emerald-950">मोबाईल नंबर टाका</p>
          <p className="text-xs mb-4 text-stone-400">आम्ही OTP पाठवू verification साठी</p>
          <Field label="मोबाईल नंबर" icon={Phone}>
            <input value={mobile} maxLength={10} inputMode="numeric" onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" className={inputCls} />
          </Field>
          <PrimaryBtn disabled={!valid} onClick={() => onSent(mobile)}>OTP पाठवा</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function OtpEntry({ mobile, onBack, onVerified }) {
  const [otp, setOtp] = useState(""); const [err, setErr] = useState("");
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader subtitle="OTP Verification" />
      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <BackBtn onBack={onBack} />
          <p className="font-bold text-lg mb-1 text-emerald-950">OTP टाका</p>
          <p className="text-xs mb-4 text-stone-400">+91 {mobile} वर पाठवला (डेमो OTP: {MOCK_OTP})</p>
          <Field label="4 अंकी OTP">
            <input value={otp} maxLength={4} inputMode="numeric" onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="1234" className={inputCls + " text-center tracking-[10px] text-xl font-bold"} />
          </Field>
          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1 text-rose-600"><AlertCircle size={13} /> {err}</p>}
          <PrimaryBtn disabled={otp.length !== 4} onClick={() => (otp === MOCK_OTP ? onVerified() : setErr("चुकीचा OTP, पुन्हा प्रयत्न करा"))}>Verify करा</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onBack, onVerified }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader subtitle="Admin Login" />
      <div className="px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <BackBtn onBack={onBack} />
          <p className="font-bold text-lg mb-1 text-emerald-950">Admin Password</p>
          <Field label="Password" icon={Lock}>
            <input type="password" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }} className={inputCls} placeholder="••••••••" />
          </Field>
          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1 text-rose-600"><AlertCircle size={13} /> {err}</p>}
          <PrimaryBtn onClick={() => (pw === ADMIN_PASSWORD ? onVerified() : setErr("चुकीचा पासवर्ड"))}>Login करा</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

/* ============================== REGISTRATION ============================== */
function emptyPlot() { return { id: uid(), khet: "", acres: "", sevenTwelveUrl: "", sevenTwelveName: "" }; }

function FarmerRegister({ mobile, onDone, onBack }) {
  const [name, setName] = useState(""); const [address, setAddress] = useState("");
  const [village, setVillage] = useState(VILLAGES[0]);
  const [plots, setPlots] = useState([emptyPlot()]);
  const [aadharFront, setAadharFront] = useState(null); const [aadharBack, setAadharBack] = useState(null);
  const [err, setErr] = useState(""); const [saving, setSaving] = useState(false);

  const updatePlot = (id, patch) => setPlots((p) => p.map((pl) => (pl.id === id ? { ...pl, ...patch } : pl)));
  const addPlot = () => setPlots((p) => [...p, emptyPlot()]);
  const removePlot = (id) => setPlots((p) => (p.length > 1 ? p.filter((pl) => pl.id !== id) : p));

  const submit = async () => {
    if (!name || !address) return setErr("कृपया नाव व पत्ता भरा");
    if (plots.some((p) => !p.khet || !p.acres)) return setErr("प्रत्येक शेताचा पत्ता व एकर भरा");
    setErr(""); setSaving(true);
    try {
      const totalAcres = plots.reduce((s, p) => s + (Number(p.acres) || 0), 0);
      const farmPlots = plots.map(({ id, khet, acres, sevenTwelveUrl, sevenTwelveName }) => ({
        id, khet, acres, sevenTwelveUrl, sevenTwelveName, status: sevenTwelveUrl ? "Pending" : "Documents Baaki",
      }));
      const aadharStatus = (aadharFront && aadharBack) ? "Pending" : "Documents Baaki";
      const docsStatus = (aadharStatus === "Pending" && farmPlots.every((p) => p.status === "Pending")) ? "Pending" : "Documents Baaki";
      const farmer = await createFarmer({
        mobile, name, address, village, farm_plots: farmPlots, total_acres: totalAcres,
        aadhar_front_url: aadharFront?.url || null, aadhar_back_url: aadharBack?.url || null,
        aadhar_status: aadharStatus, docs_status: docsStatus, is_subscribed: false, subscription_amount: 0,
      });
      onDone(farmer);
    } catch (e) { setErr("Save failed: " + (e.message || e)); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-8">
      <TopHeader subtitle="शेतकरी नोंदणी" />
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <BackBtn onBack={onBack} />
          <p className="font-bold text-lg mb-4 text-emerald-950">तुमची माहिती भरा</p>
          <Field label="पूर्ण नाव" icon={User}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="उदा. रमेश पाटील" /></Field>
          <Field label="पत्ता" icon={MapPin}><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="घर नं, गल्ली, तालुका" /></Field>
          <Field label="गाव" icon={MapPin}>
            <select value={village} onChange={(e) => setVillage(e.target.value)} className={inputCls}>{VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}</select>
          </Field>

          <p className="text-sm font-bold mb-2 text-emerald-950 flex items-center gap-1.5"><Sprout size={15} /> तुमची शेते (जितकी हवीत तितकी जोडा)</p>
          <div className="space-y-3 mb-2">
            {plots.map((pl, i) => (
              <div key={pl.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-emerald-800">शेत #{i + 1}</p>
                  {plots.length > 1 && <button onClick={() => removePlot(pl.id)} className="p-1.5 rounded-lg bg-rose-50"><Trash2 size={13} className="text-rose-600" /></button>}
                </div>
                <input value={pl.khet} onChange={(e) => updatePlot(pl.id, { khet: e.target.value })} className={inputCls + " mb-2"} placeholder="शेताचा पत्ता (गट नं.)" />
                <input value={pl.acres} inputMode="decimal" onChange={(e) => updatePlot(pl.id, { acres: e.target.value.replace(/[^0-9.]/g, "") })} className={inputCls + " mb-2"} placeholder="एकर (उदा. 2.5)" />
                <UploadSlot compact label="या शेताचा 7/12 उतारा" fileUrl={pl.sevenTwelveUrl} fileName={pl.sevenTwelveName}
                  onRemove={() => updatePlot(pl.id, { sevenTwelveUrl: "", sevenTwelveName: "" })}
                  onUpload={async (file) => { const r = await uploadDoc(file, "seven-twelve"); updatePlot(pl.id, { sevenTwelveUrl: r.url, sevenTwelveName: r.name }); }} />
              </div>
            ))}
          </div>
          <button onClick={addPlot} className="w-full mb-5 py-3 rounded-2xl font-bold text-sm border-2 border-dashed border-emerald-300 text-emerald-700 flex items-center justify-center gap-1.5">
            <Plus size={16} /> अजून एक शेत जोडा
          </button>

          <p className="text-xs mb-3 px-1 text-stone-400">📎 कागदपत्रे आत्ता उपलब्ध नसतील तर नंतरही अपलोड करू शकता — नोंदणी अडणार नाही.</p>
          <UploadSlot label="आधार कार्ड (समोर)" fileUrl={aadharFront?.url} fileName={aadharFront?.name} onRemove={() => setAadharFront(null)}
            onUpload={async (file) => setAadharFront(await uploadDoc(file, "aadhar"))} />
          <UploadSlot label="आधार कार्ड (मागे)" fileUrl={aadharBack?.url} fileName={aadharBack?.name} onRemove={() => setAadharBack(null)}
            onUpload={async (file) => setAadharBack(await uploadDoc(file, "aadhar"))} />

          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1 text-rose-600"><AlertCircle size={13} /> {err}</p>}
          <PrimaryBtn disabled={saving} onClick={submit}>{saving ? "सेव्ह होत आहे..." : "नोंदणी पूर्ण करा"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

function DriverRegister({ mobile, onDone, onBack }) {
  const [name, setName] = useState(""); const [address, setAddress] = useState(""); const [village, setVillage] = useState(VILLAGES[0]);
  const [aadharFront, setAadharFront] = useState(null); const [aadharBack, setAadharBack] = useState(null);
  const [rcBook, setRcBook] = useState(null); const [license, setLicense] = useState(null);
  const [err, setErr] = useState(""); const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!name || !address) return setErr("कृपया नाव व पत्ता भरा");
    setErr(""); setSaving(true);
    try {
      const docsStatus = (aadharFront && aadharBack && rcBook && license) ? "Pending" : "Documents Baaki";
      const driver = await createDriver({
        mobile, name, address, village,
        aadhar_front_url: aadharFront?.url || null, aadhar_back_url: aadharBack?.url || null,
        rc_book_url: rcBook?.url || null, license_url: license?.url || null, docs_status: docsStatus,
      });
      onDone(driver);
    } catch (e) { setErr("Save failed: " + (e.message || e)); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-8">
      <TopHeader subtitle="ड्रायव्हर नोंदणी" />
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <BackBtn onBack={onBack} />
          <p className="font-bold text-lg mb-4 text-emerald-950">तुमची माहिती भरा</p>
          <Field label="पूर्ण नाव" icon={User}><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="उदा. संदीप जाधव" /></Field>
          <Field label="पत्ता" icon={MapPin}><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="घर नं, गल्ली, तालुका" /></Field>
          <Field label="गाव" icon={MapPin}><select value={village} onChange={(e) => setVillage(e.target.value)} className={inputCls}>{VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}</select></Field>
          <p className="text-xs mb-3 px-1 text-stone-400">📎 कागदपत्रे आत्ता उपलब्ध नसतील तर नंतरही अपलोड करू शकता.</p>
          <UploadSlot label="आधार कार्ड (समोर)" fileUrl={aadharFront?.url} fileName={aadharFront?.name} onRemove={() => setAadharFront(null)} onUpload={async (f) => setAadharFront(await uploadDoc(f, "aadhar"))} />
          <UploadSlot label="आधार कार्ड (मागे)" fileUrl={aadharBack?.url} fileName={aadharBack?.name} onRemove={() => setAadharBack(null)} onUpload={async (f) => setAadharBack(await uploadDoc(f, "aadhar"))} />
          <UploadSlot label="RC Book" fileUrl={rcBook?.url} fileName={rcBook?.name} onRemove={() => setRcBook(null)} onUpload={async (f) => setRcBook(await uploadDoc(f, "rc"))} />
          <UploadSlot label="Driving License" fileUrl={license?.url} fileName={license?.name} onRemove={() => setLicense(null)} onUpload={async (f) => setLicense(await uploadDoc(f, "license"))} />
          {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1 text-rose-600"><AlertCircle size={13} /> {err}</p>}
          <PrimaryBtn disabled={saving} onClick={submit}>{saving ? "सेव्ह होत आहे..." : "नोंदणी पूर्ण करा"}</PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

/* ============================== FARMER HOME ============================== */
function SubscribeBanner({ subscribed, acres, onOpen }) {
  const price = SUBSCRIPTION_RATE_PER_ACRE * Number(acres || 0);
  return (
    <div className="mx-5 -mt-4 relative z-10 rounded-2xl p-4 shadow-xl bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-extrabold text-lg text-orange-950 font-display">50% OFF</p>
          <p className="text-xs font-semibold text-orange-950/80">{subscribed ? `₹${SUBSCRIPTION_RATE_PER_ACRE}/एकर/वर्ष ॲक्टिव्ह` : `फक्त ₹${SUBSCRIPTION_RATE_PER_ACRE}/एकर/वर्ष मध्ये सर्व services स्वस्त!`}</p>
        </div>
        {subscribed ? <GoldBadge className="!bg-white/90"><CheckCircle2 size={13} /> Subscribed</GoldBadge> :
          <button onClick={onOpen} className="px-4 py-2 rounded-xl text-sm font-bold shadow bg-emerald-950 text-white">Subscribe ₹{price}/yr</button>}
      </div>
    </div>
  );
}

function SubscribeModal({ acres, onClose, onConfirm }) {
  const price = SUBSCRIPTION_RATE_PER_ACRE * Number(acres || 0);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-7">
        <div className="w-10 h-1.5 rounded-full mx-auto mb-4 bg-stone-200" />
        <p className="font-bold text-lg mb-1 text-emerald-950">Yearly Subscription घ्या</p>
        <p className="text-xs mb-4 text-stone-400">दर ₹{SUBSCRIPTION_RATE_PER_ACRE} प्रति एकर प्रति वर्ष</p>
        <div className="rounded-2xl p-4 mb-4 bg-amber-50">
          <div className="flex justify-between text-sm mb-1"><span className="text-stone-500">तुमचे क्षेत्र</span><span className="font-bold text-emerald-950">{acres} एकर</span></div>
          <div className="flex justify-between text-sm mb-1"><span className="text-stone-500">दर</span><span className="font-bold text-emerald-950">₹{SUBSCRIPTION_RATE_PER_ACRE}/एकर/वर्ष</span></div>
          <div className="h-px my-2 bg-stone-200" />
          <div className="flex justify-between"><span className="font-bold text-emerald-950">वार्षिक एकूण</span><span className="font-extrabold text-lg text-emerald-700">{money(price)}/yr</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold border border-stone-200 text-emerald-950">रद्द करा</button>
          <button onClick={() => onConfirm(price)} className="flex-1 py-3 rounded-2xl font-bold shadow text-orange-950 bg-gradient-to-r from-amber-300 to-orange-400">{money(price)} भरा</button>
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
        <p className="font-bold text-[15px] mb-1 text-emerald-950">{svc.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-lg text-emerald-700">{money(price)}</span>
          {subscribed ? <span className="text-xs line-through text-stone-400">{money(svc.normal)}</span> : <GoldBadge>50% OFF सह {money(svc.subscription)}</GoldBadge>}
        </div>
      </div>
      <button onClick={() => onBook(svc)} className="px-4 py-2.5 rounded-xl font-bold text-sm shadow text-white bg-gradient-to-r from-emerald-600 to-teal-600">Book करा</button>
    </div>
  );
}

function BookingModal({ svc, subscribed, onClose, onConfirm }) {
  const [date, setDate] = useState(""); const [notes, setNotes] = useState(""); const [saving, setSaving] = useState(false);
  const price = subscribed ? svc.subscription : svc.normal;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-7">
        <div className="w-10 h-1.5 rounded-full mx-auto mb-4 bg-stone-200" />
        <p className="font-bold text-lg mb-1 text-emerald-950">{svc.name}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-extrabold text-xl text-emerald-700">{money(price)}</span>
          {subscribed && <GoldBadge>Subscriber Rate</GoldBadge>}
        </div>
        <Field label="Booking Date" icon={Calendar}><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} /></Field>
        <Field label="Notes (ऐच्छिक)" icon={PenLine}><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} placeholder="विशेष सूचना असल्यास लिहा..." /></Field>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold border border-stone-200 text-emerald-950">रद्द करा</button>
          <button disabled={!date || saving} onClick={async () => { setSaving(true); await onConfirm(date, notes, price); }} className="flex-1 py-3 rounded-2xl font-bold shadow disabled:opacity-40 text-white bg-gradient-to-r from-emerald-600 to-teal-600">
            {saving ? "..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FarmerHome({ farmer, onLogout, onFarmerUpdate }) {
  const [tab, setTab] = useState("home");
  const [bookings, setBookings] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [modalSvc, setModalSvc] = useState(null);
  const [subModal, setSubModal] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [b, n] = await Promise.all([
        getBookingsForFarmer(farmer.mobile),
        getNotificationsFor({ role: "farmer", mobile: farmer.mobile, village: farmer.village }),
      ]);
      setBookings(b); setNotifs(n);
    } catch (e) { setError(e.message || String(e)); }
    setLoading(false);
  }, [farmer.mobile, farmer.village]);

  useEffect(() => { refresh(); }, [refresh]);

  const confirmBooking = async (date, notes, price) => {
    try {
      await createBooking({
        farmer_mobile: farmer.mobile, farmer_name: farmer.name, village: farmer.village,
        service_id: modalSvc.id, service_name: modalSvc.name, price, date, notes,
        status: "Pending", incentive_amount: DRIVER_INCENTIVE_PER_JOB,
      });
      setModalSvc(null);
      setToast("✅ Booking Confirm! तुमच्या गावातील ड्रायव्हरला सूचना पाठवली गेली आहे.");
      setTimeout(() => setToast(""), 3200);
      setTab("history");
      refresh();
    } catch (e) { setError(e.message || String(e)); setModalSvc(null); }
  };

  const confirmSub = async (price) => {
    const updated = await updateFarmer(farmer.mobile, { is_subscribed: true, subscription_amount: price });
    onFarmerUpdate(updated);
    setSubModal(false);
    setToast(`✅ Subscription ॲक्टिव्ह! ${money(price)} भरले गेले.`);
    setTimeout(() => setToast(""), 3200);
  };

  return (
    <div className="min-h-screen pb-24">
      {error && <div className="p-3 m-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">⚠️ {error}</div>}
      {tab === "home" && (
        <>
          <TopHeader subtitle={`नमस्कार, ${farmer.name.split(" ")[0]} 🙏`} title={`📍 ${farmer.village} • ${farmer.total_acres} एकर`} onLogout={onLogout} />
          <SubscribeBanner subscribed={farmer.is_subscribed} acres={farmer.total_acres} onOpen={() => setSubModal(true)} />
          <div className="px-5 mt-5">
            <p className="font-bold mb-3 flex items-center gap-1.5 text-emerald-950"><Tractor size={16} /> उपलब्ध Services</p>
            {SERVICES.map((s) => <ServiceCard key={s.id} svc={s} subscribed={farmer.is_subscribed} onBook={setModalSvc} />)}
          </div>
        </>
      )}

      {tab === "history" && (
        <>
          <TopHeader subtitle="माझा Service History" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10 space-y-3">
            {loading && <p className="text-center text-sm text-stone-400 py-6">लोड होत आहे...</p>}
            {!loading && bookings.length === 0 && <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm text-stone-400">अजून कोणतीही booking नाही</p></div>}
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-bold text-sm text-emerald-950">{b.service_name}</p>
                  <StatusPill status={b.status} />
                </div>
                <p className="text-xs mb-1 text-stone-400">📅 {b.date} • {money(b.price)}</p>
                {b.driver_name && <p className="text-xs mb-1 text-stone-400">🚜 ड्रायव्हर: {b.driver_name} • 📞 {b.driver_mobile}</p>}
                {b.notes && <p className="text-xs italic text-stone-400 mb-2">"{b.notes}"</p>}
                {b.status === "Accepted" && b.completion_otp && (
                  <div className="mt-2 rounded-xl bg-amber-50 p-2.5">
                    <p className="text-[11px] font-semibold text-amber-700">काम पूर्ण झाल्यावर ड्रायव्हरला हा OTP सांगा:</p>
                    <p className="text-lg font-extrabold tracking-[6px] text-amber-800">{b.completion_otp}</p>
                  </div>
                )}
                {b.status === "Completed" && b.completion_photo_url && (
                  <div className="mt-2"><p className="text-[11px] font-semibold mb-1 text-stone-400">कामाचा फोटो:</p><img src={b.completion_photo_url} className="w-20 h-20 rounded-lg object-cover" /></div>
                )}
                {b.driver_mobile && (b.status === "Accepted" || b.status === "Completed") && <div className="mt-2"><CallButton number={b.driver_mobile} label="ड्रायव्हरला Call करा" /></div>}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "notify" && (
        <>
          <TopHeader subtitle="सूचना" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10 space-y-3">
            {notifs.length === 0 && <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm text-stone-400">अजून कोणतीही सूचना नाही</p></div>}
            {notifs.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl p-4 shadow-md flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-50"><Bell size={16} className="text-amber-500" /></div>
                <div><p className="font-bold text-sm text-emerald-950">{n.title}</p><p className="text-xs mt-0.5 text-stone-600">{n.message}</p></div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "profile" && (
        <>
          <TopHeader subtitle="माझी प्रोफाईल" onLogout={onLogout} />
          <div className="px-5 -mt-4 relative z-10 space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
              <Row icon={User} label="नाव" value={farmer.name} />
              <Row icon={Phone} label="मोबाईल" value={farmer.mobile} />
              <Row icon={MapPin} label="पत्ता" value={farmer.address} />
              <Row icon={MapPin} label="गाव" value={farmer.village} />
              <Row icon={ClipboardList} label="एकूण क्षेत्र" value={farmer.total_acres + " एकर"} />
              <div className="pt-2 flex items-center justify-between"><span className="text-sm font-semibold text-stone-500">Documents Status</span><StatusPill status={farmer.docs_status} /></div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <p className="font-bold text-sm mb-3 text-emerald-950 flex items-center gap-1.5"><Sprout size={15} /> माझी शेते ({(farmer.farm_plots || []).length})</p>
              {(farmer.farm_plots || []).map((p, i) => (
                <div key={p.id || i} className="text-xs mb-2 pb-2 border-b border-stone-100 last:border-0">
                  <p className="font-semibold text-emerald-950">#{i + 1} {p.khet} — {p.acres} एकर</p>
                  <p className="text-stone-400">{p.sevenTwelveUrl ? "✓ 7/12 अपलोड आहे" : "7/12 अजून अपलोड नाही"}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Toast text={toast} />
      {modalSvc && <BookingModal svc={modalSvc} subscribed={farmer.is_subscribed} onClose={() => setModalSvc(null)} onConfirm={confirmBooking} />}
      {subModal && <SubscribeModal acres={farmer.total_acres} onClose={() => setSubModal(false)} onConfirm={confirmSub} />}

      <BottomNav active={tab} onChange={setTab} items={[
        { key: "home", label: "Home", icon: HomeIcon },
        { key: "history", label: "History", icon: History },
        { key: "notify", label: "सूचना", icon: Bell },
        { key: "profile", label: "Profile", icon: User },
      ]} />
    </div>
  );
}

/* ============================== DRIVER HOME ============================== */
function IncentiveBar({ compact }) {
  return (
    <div className={`mx-5 ${compact ? "mt-4" : "-mt-4"} relative z-10 rounded-2xl p-4 shadow-xl bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-500`}>
      <div className="flex items-center gap-2 mb-1"><Wallet size={18} className="text-white" /><p className="font-extrabold text-white font-display">{DRIVER_INCENTIVE_BUDGET_LABEL} Incentive Budget</p></div>
      <p className="text-xs font-semibold text-white/90">प्रत्येक स्वीकारलेल्या बुकिंगवर +{money(DRIVER_INCENTIVE_PER_JOB)} बोनस इंसेंटिव्ह मिळेल!</p>
    </div>
  );
}

function DriverHome({ driver, onLogout }) {
  const [tab, setTab] = useState("jobs");
  const [villageJobs, setVillageJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completeFor, setCompleteFor] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      // village-scoped query: this driver only ever receives jobs from their own village
      const [vj, mj, n] = await Promise.all([
        getPendingBookingsForVillage(driver.village),
        getBookingsForDriver(driver.mobile),
        getNotificationsFor({ role: "driver", mobile: driver.mobile, village: driver.village }),
      ]);
      setVillageJobs(vj); setMyJobs(mj); setNotifs(n);
    } catch (e) { setError(e.message || String(e)); }
    setLoading(false);
  }, [driver.village, driver.mobile]);

  useEffect(() => { refresh(); }, [refresh]);

  const respond = async (id, status) => {
    try {
      const otp = status === "Accepted" ? generateOtp4() : undefined;
      await respondToBooking(id, status, status === "Accepted" ? driver.name : null, status === "Accepted" ? driver.mobile : null, otp);
      if (status === "Accepted") {
        const b = villageJobs.find((x) => x.id === id);
        if (b) {
          await createNotification({
            target: "farmer", target_mobile: b.farmer_mobile, target_label: "बुकिंग अपडेट",
            title: "🚜 ड्रायव्हर असाइन झाला!", from_role: "system",
            message: `तुमची "${b.service_name}" बुकिंग स्वीकारली गेली आहे. ड्रायव्हर: ${driver.name}, नंबर: ${driver.mobile}. काम पूर्ण झाल्यावर ड्रायव्हरला हा OTP सांगा: ${otp}`,
          });
        }
      }
      refresh();
    } catch (e) { setError(e.message || String(e)); }
  };

  return (
    <div className="min-h-screen pb-24">
      {error && <div className="p-3 m-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">⚠️ {error}</div>}
      <TopHeader subtitle={`नमस्कार, ${driver.name.split(" ")[0]} 🚜`} title={`📍 ${driver.village}`} onLogout={onLogout} />
      <IncentiveBar />

      {tab === "jobs" && (
        <div className="px-5 mt-5">
          <p className="font-bold mb-3 flex items-center gap-1.5 text-emerald-950"><Bell size={16} /> नवीन Booking Requests ({driver.village})</p>
          {loading && <p className="text-center text-sm text-stone-400 py-6">लोड होत आहे...</p>}
          {!loading && villageJobs.length === 0 && <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm text-stone-400">सध्या तुमच्या गावात नवीन request नाही</p></div>}
          {villageJobs.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md mb-3">
              <div className="flex items-start justify-between mb-1"><p className="font-bold text-sm text-emerald-950">{b.service_name}</p><span className="font-extrabold text-sm text-emerald-700">{money(b.price)}</span></div>
              <p className="text-xs mb-1 text-stone-400">👤 {b.farmer_name} • 📅 {b.date}</p>
              {b.notes && <p className="text-xs italic mb-2 text-stone-400">"{b.notes}"</p>}
              <p className="text-[11px] font-bold mb-2 text-rose-600">+ {money(b.incentive_amount || DRIVER_INCENTIVE_PER_JOB)} इंसेंटिव्ह या job वर</p>
              <div className="flex gap-2">
                <button onClick={() => respond(b.id, "Rejected")} className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-stone-200 text-rose-600">नकार</button>
                <button onClick={() => respond(b.id, "Accepted")} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600">स्वीकार</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "myjobs" && (
        <div className="px-5 mt-5 space-y-3">
          {myJobs.length === 0 && <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm text-stone-400">अजून कोणतेही काम नाही</p></div>}
          {myJobs.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-1"><p className="font-bold text-sm text-emerald-950">{b.service_name}</p><StatusPill status={b.status} /></div>
              <p className="text-xs mb-2 text-stone-400">👤 {b.farmer_name} • 📅 {b.date} • {money(b.price)}</p>
              {b.completion_photo_url && <img src={b.completion_photo_url} className="w-16 h-16 rounded-lg object-cover mb-2" />}
              <div className="flex gap-2">
                <CallButton number={b.farmer_mobile} label="शेतकऱ्याला Call करा" />
                {b.status === "Accepted" && <button onClick={() => setCompleteFor(b)} className="flex-1 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center gap-1"><CheckCircle2 size={14} /> काम पूर्ण करा</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "notify" && (
        <div className="px-5 mt-5 space-y-3">
          {notifs.length === 0 && <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm text-stone-400">अजून कोणतीही सूचना नाही</p></div>}
          {notifs.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl p-4 shadow-md flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-sky-50"><Bell size={16} className="text-sky-600" /></div>
              <div><p className="font-bold text-sm text-emerald-950">{n.title}</p><p className="text-xs mt-0.5 text-stone-600">{n.message}</p></div>
            </div>
          ))}
        </div>
      )}

      {tab === "profile" && (
        <div className="px-5 mt-5">
          <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
            <Row icon={User} label="नाव" value={driver.name} />
            <Row icon={Phone} label="मोबाईल" value={driver.mobile} />
            <Row icon={MapPin} label="पत्ता" value={driver.address} />
            <Row icon={MapPin} label="गाव" value={driver.village} />
            <div className="pt-2 flex items-center justify-between"><span className="text-sm font-semibold text-stone-500">Documents Status</span><StatusPill status={driver.docs_status} /></div>
          </div>
        </div>
      )}

      <BottomNav active={tab} onChange={setTab} items={[
        { key: "jobs", label: "Requests", icon: Bell },
        { key: "myjobs", label: "My Jobs", icon: ClipboardList },
        { key: "notify", label: "सूचना", icon: MessageCircle },
        { key: "profile", label: "Profile", icon: User },
      ]} />

      {completeFor && (
        <CompleteJobModal
          booking={completeFor}
          onClose={() => setCompleteFor(null)}
          onDone={() => { setCompleteFor(null); refresh(); }}
        />
      )}
    </div>
  );
}

function CompleteJobModal({ booking, onClose, onDone }) {
  const [photo, setPhoto] = useState(null);
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const camId = useId(), galId = useId();

  const pickPhoto = async (file) => {
    if (!file) return;
    setErr("");
    try { setPhoto(await uploadDoc(file, "completion-photos")); } catch (e) { setErr("फोटो अपलोड अयशस्वी: " + (e.message || e)); }
  };

  const submit = async () => {
    if (!photo) return setErr("कृपया कामाचा फोटो अपलोड करा");
    if (otp.length !== 4) return setErr("कृपया 4 अंकी OTP टाका");
    if (otp !== booking.completion_otp) return setErr("चुकीचा OTP — शेतकऱ्याकडून बरोबर OTP घ्या");
    setSaving(true);
    try { await completeBooking(booking.id, photo.url); onDone(); }
    catch (e) { setErr("Save failed: " + (e.message || e)); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 pb-7">
        <div className="w-10 h-1.5 rounded-full mx-auto mb-4 bg-stone-200" />
        <p className="font-bold text-lg mb-1 text-emerald-950">काम पूर्ण झाले? ✅</p>
        <p className="text-xs mb-4 text-stone-400">{booking.service_name} • {booking.farmer_name}</p>

        <p className="text-sm font-semibold mb-2 text-stone-600 flex items-center gap-1.5"><Camera size={15} /> कामाचा फोटो</p>
        {photo ? (
          <div className="flex items-center gap-3 mb-4">
            <img src={photo.url} className="w-16 h-16 rounded-lg object-cover border border-stone-200" />
            <p className="text-xs font-semibold text-emerald-700">✓ फोटो अपलोड झाला</p>
          </div>
        ) : (
          <div className="flex gap-2 mb-4">
            <label htmlFor={camId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold text-white bg-emerald-800"><Camera size={18} /> कैमरा</label>
            <input id={camId} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ""; pickPhoto(f); }} />
            <label htmlFor={galId} className="flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-lg cursor-pointer text-xs font-semibold border border-stone-200 text-emerald-950"><Upload size={18} /> गैलरी</label>
            <input id={galId} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; e.target.value = ""; pickPhoto(f); }} />
          </div>
        )}

        <Field label="शेतकऱ्याकडून मिळालेला 4 अंकी OTP">
          <input value={otp} maxLength={4} inputMode="numeric" onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="1234" className={inputCls + " text-center tracking-[10px] text-xl font-bold"} />
        </Field>
        {err && <p className="text-xs font-semibold mb-3 flex items-center gap-1 text-rose-600"><AlertCircle size={13} /> {err}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-bold border border-stone-200 text-emerald-950">रद्द करा</button>
          <button disabled={saving} onClick={submit} className="flex-1 py-3 rounded-2xl font-bold shadow text-white bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-40">{saving ? "..." : "काम पूर्ण करा"}</button>
        </div>
      </div>
    </div>
  );
}
function DocThumb({ label, url }) {
  return (
    <div className="text-center">
      {url ? (
        url.toLowerCase().endsWith(".pdf") ? <div className="w-full h-14 rounded-lg flex items-center justify-center bg-emerald-800"><FileText size={20} color="#fff" /></div>
          : <img src={url} className="w-full h-14 rounded-lg object-cover" />
      ) : <div className="w-full h-14 rounded-lg flex items-center justify-center bg-stone-100"><FileText size={16} className="text-stone-300" /></div>}
      <p className="text-[10px] mt-1 text-stone-400">{label}</p>
    </div>
  );
}

function DocApprovalRow({ label, url, status, onApprove, onReject, meta }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-stone-100 last:border-0">
      {url ? (
        url.toLowerCase().endsWith(".pdf")
          ? <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-emerald-800 flex-shrink-0"><FileText size={20} color="#fff" /></div>
          : <img src={url} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      ) : <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-stone-100 flex-shrink-0"><FileText size={16} className="text-stone-300" /></div>}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-emerald-950">{label}</p>
        {meta && <p className="text-[11px] text-stone-400 truncate">{meta}</p>}
        <div className="mt-1"><StatusPill status={status} /></div>
      </div>
      {url && status !== "Approved" && (
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button onClick={onApprove} className="p-1.5 rounded-lg bg-emerald-100"><CheckCircle2 size={15} className="text-emerald-700" /></button>
          <button onClick={onReject} className="p-1.5 rounded-lg bg-rose-100"><XCircle size={15} className="text-rose-600" /></button>
        </div>
      )}
    </div>
  );
}

function FarmerDetailCard({ f, onApproveAadhar, onRejectAadhar, onApprovePlot, onRejectPlot }) {
  const plots = f.farm_plots || [];
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bold text-sm text-emerald-950">{f.name}</p>
          <p className="text-xs text-stone-400">📱 {f.mobile} • 📍 {f.village} • {f.total_acres} एकर</p>
          <p className="text-xs text-stone-400">{f.address}</p>
          {f.is_subscribed && <p className="text-xs font-semibold text-amber-600">⭐ Subscribed • {money(f.subscription_amount)}/yr</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusPill status={f.docs_status} />
          <CallButton number={f.mobile} label="Call करा" />
        </div>
      </div>

      <p className="text-xs font-bold mb-1 mt-3 text-stone-500 uppercase tracking-wide">आधार कार्ड</p>
      <DocApprovalRow label="आधार कार्ड (समोर + मागे)" url={f.aadhar_front_url} status={f.aadhar_status}
        onApprove={() => onApproveAadhar(f.mobile)} onReject={() => onRejectAadhar(f.mobile)} />

      <p className="text-xs font-bold mb-1 mt-3 text-stone-500 uppercase tracking-wide">7/12 उतारे — सर्व शेते ({plots.length})</p>
      {plots.length === 0 && <p className="text-xs text-stone-400 py-2">या शेतकऱ्याने अजून कोणतेही शेत/7-12 जोडलेले नाही</p>}
      {plots.map((p, i) => (
        <DocApprovalRow key={p.id || i} label={`7/12 #${i + 1}`} url={p.sevenTwelveUrl} status={p.status || "Documents Baaki"}
          meta={`${p.khet} — ${p.acres} एकर`}
          onApprove={() => onApprovePlot(f.mobile, p.id)} onReject={() => onRejectPlot(f.mobile, p.id)} />
      ))}
    </div>
  );
}

function DriverDetailCard({ d, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div><p className="font-bold text-sm text-emerald-950">{d.name}</p><p className="text-xs text-stone-400">📱 {d.mobile} • 📍 {d.village}</p><p className="text-xs text-stone-400">{d.address}</p></div>
        <div className="flex flex-col items-end gap-2"><StatusPill status={d.docs_status} /><CallButton number={d.mobile} label="Call करा" /></div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3 mt-2">
        <DocThumb label="आधार समोर" url={d.aadhar_front_url} /><DocThumb label="आधार मागे" url={d.aadhar_back_url} />
        <DocThumb label="RC Book" url={d.rc_book_url} /><DocThumb label="License" url={d.license_url} />
      </div>
      {d.docs_status !== "Approved" && (
        <div className="flex gap-2">
          <button onClick={() => onReject(d.mobile)} className="flex-1 py-2 rounded-xl font-bold text-xs border border-stone-200 text-rose-600 flex items-center justify-center gap-1"><XCircle size={14} /> Reject</button>
          <button onClick={() => onApprove(d.mobile)} className="flex-1 py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1 bg-emerald-600"><CheckCircle2 size={14} /> Approve</button>
        </div>
      )}
    </div>
  );
}

class CardErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(err) { console.error("Card render error:", err); }
  render() {
    if (this.state.crashed) {
      return <div className="bg-white rounded-2xl p-4 shadow-md"><p className="text-xs font-semibold text-rose-600">⚠️ हा रेकॉर्ड दाखवताना एरर आला (मोबाईल: {this.props.mobile || "?"})</p></div>;
    }
    return this.props.children;
  }
}

function GroupByVillage({ items, villageKey, render }) {
  const groups = useMemo(() => {
    const m = {};
    items.forEach((it) => { const v = it[villageKey] || "अज्ञात"; (m[v] = m[v] || []).push(it); });
    return Object.entries(m).sort((a, b) => b[1].length - a[1].length);
  }, [items, villageKey]);
  if (items.length === 0) return <div className="bg-white rounded-2xl p-6 text-center shadow"><p className="text-sm text-stone-400">काहीही नाही</p></div>;
  return (
    <div className="space-y-5">
      {groups.map(([village, list]) => (
        <div key={village}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2 text-emerald-700">📍 {village} ({list.length})</p>
          <div className="space-y-3">
            {list.map((it) => <CardErrorBoundary key={it.mobile} mobile={it.mobile}>{render(it)}</CardErrorBoundary>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminNotifyForm({ farmers, drivers, onSend }) {
  const [target, setTarget] = useState("all_farmers");
  const [village, setVillage] = useState(VILLAGES[0]);
  const [person, setPerson] = useState("");
  const [title, setTitle] = useState(""); const [message, setMessage] = useState(""); const [sent, setSent] = useState("");
  const targets = [
    { key: "all_farmers", label: "सर्व शेतकरी" }, { key: "all_drivers", label: "सर्व ड्रायव्हर" },
    { key: "village", label: "विशिष्ट गाव" }, { key: "farmer", label: "विशिष्ट शेतकरी" }, { key: "driver", label: "विशिष्ट ड्रायव्हर" },
  ];
  const send = async () => {
    if (!title || !message) return;
    const payload = { target, title, message, from_role: "admin" };
    if (target === "village") { payload.target_village = village; payload.target_label = "गाव: " + village; }
    if (target === "farmer") { const p = farmers.find((x) => x.mobile === person); if (!p) return; payload.target_mobile = person; payload.target_label = "शेतकरी: " + p.name; }
    if (target === "driver") { const p = drivers.find((x) => x.mobile === person); if (!p) return; payload.target_mobile = person; payload.target_label = "ड्रायव्हर: " + p.name; }
    if (target === "all_farmers") payload.target_label = "सर्व शेतकरी";
    if (target === "all_drivers") payload.target_label = "सर्व ड्रायव्हर";
    await onSend(payload);
    setTitle(""); setMessage(""); setSent("✅ सूचना पाठवली गेली!"); setTimeout(() => setSent(""), 2500);
  };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md">
      <p className="font-bold mb-3 flex items-center gap-1.5 text-emerald-950"><Send size={16} /> नवीन सूचना पाठवा (कधीही)</p>
      <Field label="कोणाला पाठवायचे?"><select value={target} onChange={(e) => { setTarget(e.target.value); setPerson(""); }} className={inputCls}>{targets.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select></Field>
      {target === "village" && <Field label="गाव निवडा"><select value={village} onChange={(e) => setVillage(e.target.value)} className={inputCls}>{VILLAGES.map((v) => <option key={v} value={v}>{v}</option>)}</select></Field>}
      {target === "farmer" && <Field label="शेतकरी निवडा"><select value={person} onChange={(e) => setPerson(e.target.value)} className={inputCls}><option value="">-- निवडा --</option>{farmers.map((f) => <option key={f.mobile} value={f.mobile}>{f.name} ({f.mobile})</option>)}</select></Field>}
      {target === "driver" && <Field label="ड्रायव्हर निवडा"><select value={person} onChange={(e) => setPerson(e.target.value)} className={inputCls}><option value="">-- निवडा --</option>{drivers.map((d) => <option key={d.mobile} value={d.mobile}>{d.name} ({d.mobile})</option>)}</select></Field>}
      <Field label="शीर्षक"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="उदा. नवीन सवलत" /></Field>
      <Field label="मेसेज"><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className={inputCls} placeholder="सूचनेचा मजकूर लिहा..." /></Field>
      {sent && <p className="text-xs font-semibold mb-2 text-emerald-700">{sent}</p>}
      <PrimaryBtn disabled={!title || !message} onClick={send}>सूचना पाठवा</PrimaryBtn>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [farmers, setFarmers] = useState([]); const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]); const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [f, d, b, n] = await Promise.all([getAllFarmers(), getAllDrivers(), getAllBookings(), getAllNotifications()]);
      setFarmers(f); setDrivers(d); setBookings(b); setNotifications(n);
    } catch (e) { setError(e.message || String(e)); }
    setLoading(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const totalRevenue = bookings.reduce((s, b) => s + Number(b.price), 0);
  const subscriptionRevenue = farmers.reduce((s, f) => s + (f.is_subscribed ? Number(f.subscription_amount || 0) : 0), 0);
  const byService = useMemo(() => { const m = {}; bookings.forEach((b) => { m[b.service_name] = (m[b.service_name] || 0) + Number(b.price); }); return Object.entries(m).sort((a, b) => b[1] - a[1]); }, [bookings]);
  const byVillage = useMemo(() => { const m = {}; bookings.forEach((b) => { m[b.village] = m[b.village] || { revenue: 0, count: 0 }; m[b.village].revenue += Number(b.price); m[b.village].count += 1; }); return Object.entries(m).sort((a, b) => b[1].revenue - a[1].revenue); }, [bookings]);
  const maxServiceRev = Math.max(1, ...byService.map((x) => x[1]));
  const maxVillageRev = Math.max(1, ...byVillage.map((x) => x[1].revenue));
  const farmersByVillage = useMemo(() => {
    const m = {};
    VILLAGES.forEach((v) => { m[v] = { count: 0, acres: 0 }; });
    farmers.forEach((f) => { const v = f.village || "अज्ञात"; m[v] = m[v] || { count: 0, acres: 0 }; m[v].count += 1; m[v].acres += Number(f.total_acres || 0); });
    return Object.entries(m).sort((a, b) => b[1].count - a[1].count);
  }, [farmers]);

  const wrap = (fn) => async (...args) => { try { await fn(...args); refresh(); } catch (e) { setError(e.message || String(e)); } };
  const approveDriver = wrap((mob) => updateDriver(mob, { docs_status: "Approved" }));
  const rejectDriver = wrap((mob) => updateDriver(mob, { docs_status: "Rejected" }));
  const approveAadhar = wrap((mob) => setFarmerAadharStatus(mob, "Approved"));
  const rejectAadhar = wrap((mob) => setFarmerAadharStatus(mob, "Rejected"));
  const approvePlot = wrap((mob, plotId) => setFarmerPlotStatus(mob, plotId, "Approved"));
  const rejectPlot = wrap((mob, plotId) => setFarmerPlotStatus(mob, plotId, "Rejected"));

  return (
    <div className="min-h-screen pb-24">
      <TopHeader subtitle="Admin Dashboard" title="सर्व villages, services व documents नियंत्रित करा" onLogout={onLogout} />
      {error && <div className="p-3 mx-5 mt-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold relative z-10">⚠️ {error}</div>}
      <div className="px-5 -mt-4 relative z-10 mb-2 flex justify-end"><button onClick={refresh} className="text-xs font-bold flex items-center gap-1 text-emerald-700"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh</button></div>

      {tab === "overview" && (
        <div className="px-5 relative z-10 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-md"><IndianRupee size={18} className="text-emerald-600" /><p className="font-extrabold text-xl mt-1 text-emerald-950">{money(totalRevenue)}</p><p className="text-xs text-stone-400">Booking Revenue</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-md"><Wallet size={18} className="text-amber-500" /><p className="font-extrabold text-xl mt-1 text-emerald-950">{money(subscriptionRevenue)}</p><p className="text-xs text-stone-400">Subscription Revenue</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-md"><Sprout size={18} className="text-emerald-600" /><p className="font-extrabold text-xl mt-1 text-emerald-950">{farmers.length}</p><p className="text-xs text-stone-400">शेतकरी</p></div>
            <div className="bg-white rounded-2xl p-4 shadow-md"><Tractor size={18} className="text-amber-500" /><p className="font-extrabold text-xl mt-1 text-emerald-950">{drivers.length}</p><p className="text-xs text-stone-400">ड्रायव्हर</p></div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <p className="font-bold mb-3 flex items-center gap-1.5 text-emerald-950"><BarChart3 size={16} /> Service-wise Revenue</p>
            {byService.map(([name, rev]) => (
              <div key={name} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1"><span className="text-stone-500">{name}</span><span className="font-bold text-emerald-950">{money(rev)}</span></div>
                <div className="h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-amber-400" style={{ width: `${(rev / maxServiceRev) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <p className="font-bold mb-3 flex items-center gap-1.5 text-emerald-950"><TrendingUp size={16} /> Village-wise Revenue</p>
            {byVillage.map(([name, d]) => (
              <div key={name} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1"><span className="text-stone-500">{name} <span className="text-stone-300">({d.count})</span></span><span className="font-bold text-emerald-950">{money(d.revenue)}</span></div>
                <div className="h-2 rounded-full bg-stone-100"><div className="h-2 rounded-full bg-gradient-to-r from-emerald-800 to-teal-500" style={{ width: `${(d.revenue / maxVillageRev) * 100}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-md">
            <p className="font-bold mb-3 flex items-center gap-1.5 text-emerald-950"><Sprout size={16} /> Village-wise शेतकरी व एकर</p>
            <div className="grid grid-cols-2 gap-3">
              {farmersByVillage.map(([village, d]) => (
                <div key={village} className="rounded-xl p-3 bg-emerald-50">
                  <p className="text-xs font-bold text-emerald-800 mb-1">📍 {village}</p>
                  <p className="text-lg font-extrabold text-emerald-950">{d.count} <span className="text-xs font-semibold text-stone-400">शेतकरी</span></p>
                  <p className="text-xs font-semibold text-amber-600">{d.acres.toFixed(1)} एकर एकूण</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "bookings" && (
        <div className="px-5 relative z-10 space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 shadow-md">
              <div className="flex items-start justify-between mb-1"><p className="font-bold text-sm text-emerald-950">{b.service_name}</p><StatusPill status={b.status} /></div>
              <p className="text-xs text-stone-400">👤 {b.farmer_name} • 📍 {b.village}</p>
              <p className="text-xs text-stone-400">📅 {b.date} • {money(b.price)} {b.driver_name && `• 🚜 ${b.driver_name} (${b.driver_mobile})`}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "farmers" && (
        <div className="px-5 relative z-10">
          <GroupByVillage items={farmers} villageKey="village" render={(f) => (
            <FarmerDetailCard key={f.mobile} f={f}
              onApproveAadhar={approveAadhar} onRejectAadhar={rejectAadhar}
              onApprovePlot={approvePlot} onRejectPlot={rejectPlot} />
          )} />
        </div>
      )}
      {tab === "drivers" && (
        <div className="px-5 relative z-10">
          <GroupByVillage items={drivers} villageKey="village" render={(d) => (
            <DriverDetailCard key={d.mobile} d={d} onApprove={approveDriver} onReject={rejectDriver} />
          )} />
        </div>
      )}

      {tab === "notify" && (
        <div className="px-5 relative z-10">
          <AdminNotifyForm farmers={farmers} drivers={drivers} onSend={async (p) => { await createNotification(p); refresh(); }} />
          <p className="font-bold mb-3 mt-5 flex items-center gap-1.5 text-emerald-950"><Bell size={16} /> पाठवलेल्या सूचना</p>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="bg-white rounded-2xl p-4 shadow-md">
                <p className="font-bold text-sm text-emerald-950">{n.title}</p>
                <p className="text-xs mt-0.5 text-stone-600">{n.message}</p>
                <p className="text-[11px] mt-1.5 text-stone-400">{n.target_label || n.target}</p>
              </div>
            ))}
          </div>
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

/* ============================== ROOT PAGE ============================== */
export default function Page() {
  const [screen, setScreen] = useState("role");
  const [role, setRole] = useState(null);
  const [mobile, setMobile] = useState("");
  const [currentFarmer, setCurrentFarmer] = useState(null);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  const reset = () => { setScreen("role"); setRole(null); setMobile(""); setCurrentFarmer(null); setCurrentDriver(null); };
  const handleRolePick = (r) => { setRole(r); setScreen(r === "admin" ? "adminLogin" : "mobile"); };

  const handleOtpVerified = async () => {
    setBusy(true); setLoadErr("");
    try {
      if (role === "farmer") {
        const existing = await getFarmerByMobile(mobile);
        if (existing) { setCurrentFarmer(existing); setScreen("farmerHome"); } else setScreen("farmerRegister");
      } else {
        const existing = await getDriverByMobile(mobile);
        if (existing) { setCurrentDriver(existing); setScreen("driverHome"); } else setScreen("driverRegister");
      }
    } catch (e) { setLoadErr(e.message || String(e)); }
    setBusy(false);
  };

  return (
    <div className="w-full min-h-screen flex justify-center">
      <div className="w-full max-w-md relative bg-[#FFF9EE] min-h-screen">
        {loadErr && <div className="p-3 m-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">⚠️ {loadErr} (तुमचे Supabase env vars तपासा)</div>}
        {screen === "role" && <RoleSelect onPick={handleRolePick} />}
        {screen === "mobile" && <MobileEntry role={role} onBack={reset} onSent={(m) => { setMobile(m); setScreen("otp"); }} />}
        {screen === "otp" && <OtpEntry mobile={mobile} onBack={() => setScreen("mobile")} onVerified={handleOtpVerified} />}
        {screen === "adminLogin" && <AdminLogin onBack={reset} onVerified={() => setScreen("adminHome")} />}
        {screen === "farmerRegister" && <FarmerRegister mobile={mobile} onBack={() => setScreen("otp")} onDone={(f) => { setCurrentFarmer(f); setScreen("farmerHome"); }} />}
        {screen === "driverRegister" && <DriverRegister mobile={mobile} onBack={() => setScreen("otp")} onDone={(d) => { setCurrentDriver(d); setScreen("driverHome"); }} />}
        {screen === "farmerHome" && currentFarmer && <FarmerHome farmer={currentFarmer} onFarmerUpdate={setCurrentFarmer} onLogout={reset} />}
        {screen === "driverHome" && currentDriver && <DriverHome driver={currentDriver} onLogout={reset} />}
        {screen === "adminHome" && <AdminDashboard onLogout={reset} />}
      </div>
    </div>
  );
}
