import React, { useState } from "react";
import { RwaAsset, WalletState } from "../types";
import { imagePresets } from "../data";
import { X, ShieldCheck, UploadCloud, ArrowRight, Award, Sparkles } from "lucide-react";

interface CreateAssetModalProps {
  onClose: () => void;
  onSubmit: (newAsset: Omit<RwaAsset, "id">) => void;
  wallet: WalletState | null;
}

export default function CreateAssetModal({ onClose, onSubmit, wallet }: CreateAssetModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"House" | "Car" | "Other">("House");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [specs, setSpecs] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Compliance states
  const [compliance, setCompliance] = useState({
    custody: false,
    insurance: false,
    legal: false,
  });

  // Scanner simulation states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [fileName, setFileName] = useState("");

  const handlePresetSelect = (url: string) => {
    setImageUrl(url);
  };

  const handleComplianceToggle = (key: keyof typeof compliance) => {
    setCompliance((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsScanning(true);
    setScanProgress(0);
    setScanSuccess(false);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanSuccess(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!compliance.custody || !compliance.insurance || !compliance.legal) {
      alert("Please audit and complete all physical compliance checks before minting title.");
      return;
    }

    onSubmit({
      title,
      type,
      price: parseFloat(price).toString(),
      image: imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      owner: wallet?.address || "0xMyWalletAddress_Rialo",
      location: location || "Custom Location",
      specs: specs || (type === "House" ? "3,200 sqft / Yield: 8.5%" : "Yield: 8.5%"),
      description: description || "Certified Real-World Asset securitization token listed on Rialo.",
      yieldApr: type === "House" ? 8.5 : type === "Car" ? 7.8 : 9.0,
      isUnverifiedUserListed: true,
    });
  };

  const filteredPresets = imagePresets.filter((p) => p.category === type);

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200/80 w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-200/60 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 font-serif-luxury">List Real World Asset</h3>
            <p className="text-xs text-zinc-400">Mint cryptographic title deed ledger</p>
          </div>
          <button
            onClick={onClose}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Progress bar */}
        <div className="px-6 py-3 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 shrink-0 select-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                step >= 1 ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-400"
              }`}
            >
              1
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${step >= 1 ? "text-zinc-900" : "text-zinc-400"}`}>
              Valuation
            </span>
          </div>
          <div className={`w-6 h-0.5 ${step >= 2 ? "bg-zinc-950" : "bg-zinc-200"}`}></div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                step >= 2 ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-400"
              }`}
            >
              2
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${step >= 2 ? "text-zinc-900" : "text-zinc-400"}`}>
              Media
            </span>
          </div>
          <div className={`w-6 h-0.5 ${step >= 3 ? "bg-zinc-950" : "bg-zinc-200"}`}></div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                step >= 3 ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-400"
              }`}
            >
              3
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${step >= 3 ? "text-zinc-900" : "text-zinc-400"}`}>
              Compliance
            </span>
          </div>
        </div>

        {/* Form area */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow flex flex-col justify-between">
          
          {/* STEP 1: Core Details */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="assetTitle">
                  Asset Title
                </label>
                <input
                  type="text"
                  id="assetTitle"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aspen Mountain Chalet Share"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-zinc-900 transition font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="assetType">
                    Category
                  </label>
                  <select
                    id="assetType"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-zinc-900 transition font-medium text-zinc-800"
                  >
                    <option value="House">House 🏠</option>
                    <option value="Car">Car 🚗</option>
                    <option value="Other">Other 💎</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="assetPrice">
                    Securitized Cost (ETH)
                  </label>
                  <input
                    type="number"
                    id="assetPrice"
                    required
                    step="0.001"
                    min="0.001"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.015"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-zinc-900 transition font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="assetDesc">
                  Asset Description
                </label>
                <textarea
                  id="assetDesc"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the physical asset, its storage custody arrangements, and leasing / rental dividend expectations..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-900 transition font-medium leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Media and Location */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="assetLocation">
                    Physical Location
                  </label>
                  <input
                    type="text"
                    id="assetLocation"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Aspen, Colorado"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-zinc-900 transition font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="assetSpecs">
                    Specs / Metric Range
                  </label>
                  <input
                    type="text"
                    id="assetSpecs"
                    required
                    value={specs}
                    onChange={(e) => setSpecs(e.target.value)}
                    placeholder={type === "House" ? "e.g. 3,500 sqft / Duplex" : "e.g. EV SUV / 4x4"}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-zinc-900 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  High Fidelity Media Cover Preset
                </label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {filteredPresets.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePresetSelect(preset.url)}
                      className={`h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition relative ${
                        imageUrl === preset.url ? "border-zinc-950 scale-95 shadow" : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-1">
                        <span className="text-[8px] text-white font-bold leading-none text-center">{preset.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="Or paste a custom image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-[10px] focus:outline-none focus:border-zinc-900 transition font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Compliance Check and Simulated Scanning */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-xs">
              <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Legal Securitization Checks
              </span>

              <div className="space-y-2">
                {/* Checkbox 1 */}
                <div
                  onClick={() => handleComplianceToggle("custody")}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    compliance.custody
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={compliance.custody}
                    readOnly
                    className="mt-0.5 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-950 cursor-pointer pointer-events-none"
                  />
                  <div className="leading-snug">
                    <span className="block font-semibold text-zinc-800 text-[11px]">Physical Custody Audited & Vaulted</span>
                    <span className="block text-[9px] text-zinc-400 mt-0.5">Asset manager certifies physical secure storage.</span>
                  </div>
                </div>

                {/* Checkbox 2 */}
                <div
                  onClick={() => handleComplianceToggle("insurance")}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    compliance.insurance
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={compliance.insurance}
                    readOnly
                    className="mt-0.5 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-950 cursor-pointer pointer-events-none"
                  />
                  <div className="leading-snug">
                    <span className="block font-semibold text-zinc-800 text-[11px]">Insurance Underwriting Active</span>
                    <span className="block text-[9px] text-zinc-400 mt-0.5">Underwritten by tier-1 Lloyd's syndicate trustee.</span>
                  </div>
                </div>

                {/* Checkbox 3 */}
                <div
                  onClick={() => handleComplianceToggle("legal")}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    compliance.legal
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={compliance.legal}
                    readOnly
                    className="mt-0.5 rounded text-zinc-900 border-zinc-300 focus:ring-zinc-950 cursor-pointer pointer-events-none"
                  />
                  <div className="leading-snug">
                    <span className="block font-semibold text-zinc-800 text-[11px]">Proportional Trust Title Securitized</span>
                    <span className="block text-[9px] text-zinc-400 mt-0.5">Corporate wrapper establishes fractional title claim.</span>
                  </div>
                </div>
              </div>

              {/* Custom Signature Deed File Uploader */}
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Upload Physical Deed or Trust Agreement
                </span>
                <label className="border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-2xl p-4 text-center cursor-pointer transition bg-zinc-50/50 hover:bg-zinc-50 flex flex-col items-center justify-center min-h-[95px] relative">
                  <input type="file" accept=".pdf,image/*" onChange={handleFileUploadSimulate} className="sr-only" />
                  
                  {!isScanning && !scanSuccess && (
                    <div className="flex flex-col items-center">
                      <UploadCloud className="w-5 h-5 text-zinc-500 mb-1" />
                      <span className="text-[10px] font-semibold text-zinc-700">Drag property certificate here or click</span>
                      <span className="text-[8px] text-zinc-400 mt-0.5">Simulates signature extraction & vault scanning</span>
                    </div>
                  )}

                  {isScanning && (
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-500">
                        <span className="animate-pulse">Extracting trust seals...</span>
                        <span>{scanProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                        <div className="h-full bg-zinc-900 transition-all duration-100" style={{ width: `${scanProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {scanSuccess && (
                    <div className="flex flex-col items-center animate-fade-in">
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Trust Deed Certified!
                      </span>
                      <span className="text-[8px] text-zinc-400 font-mono mt-0.5 truncate max-w-xs">{fileName} (ID: 0x93f...3ad4)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <div className="pt-4 border-t border-zinc-150 flex items-center justify-between gap-3 mt-4 shrink-0">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:border-zinc-300 text-zinc-600 font-medium text-xs transition cursor-pointer"
              >
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-medium text-xs py-3 rounded-xl transition shadow cursor-pointer text-center"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={!compliance.custody || !compliance.insurance || !compliance.legal || !scanSuccess}
                className={`w-full text-white font-semibold text-xs py-3 rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  compliance.custody && compliance.insurance && compliance.legal && scanSuccess
                    ? "bg-zinc-950 hover:bg-zinc-900"
                    : "bg-zinc-300 cursor-not-allowed"
                }`}
              >
                <Award className="w-4 h-4 animate-pulse" />
                <span>Mint Title & List Asset</span>
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
