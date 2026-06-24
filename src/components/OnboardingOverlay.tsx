import React, { useState } from "react";
import { WalletState } from "../types";
import { UserCheck, Sparkles, UploadCloud, Check, ArrowRight, Wallet, Eye, EyeOff, Twitter, MessageSquare, Github, Instagram, Linkedin } from "lucide-react";

interface OnboardingOverlayProps {
  onComplete: (profile: WalletState) => void;
  wallet: WalletState | null;
  connectWallet: () => void;
}

export default function OnboardingOverlay({ onComplete, wallet, connectWallet }: OnboardingOverlayProps) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("rialo_" + Math.floor(Math.random() * 1000));
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const [socials, setSocials] = useState({
    x: "",
    discord: "",
    github: "",
    instagram: "",
    linkedin: "",
  });

  const [privacy, setPrivacy] = useState({
    bio: true,
    x: true,
    discord: true,
    github: true,
    instagram: true,
    linkedin: true,
  });

  const handleTogglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAvatarSelect = () => {
    // Curated high quality abstract designs
    const rand = Math.floor(Math.random() * 1000);
    setAvatarSeed("rialo_" + rand);
    setCustomAvatar(`https://api.dicebear.com/7.x/identicon/svg?seed=rialo_${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalWallet: WalletState = wallet || {
      address: "0xDemoWallet" + Math.floor(1000 + Math.random() * 9000) + "Rialo",
      balance: "10.00",
      connected: true,
      isDemoMode: true,
      username: name.trim(),
      avatarSeed,
      socials,
      privacy,
      bio: bio.trim(),
    };

    // Update username & other bio fields if wallet was already connected but onboarding wasn't done
    const updatedWallet: WalletState = {
      ...finalWallet,
      username: name.trim(),
      bio: bio.trim(),
      avatarSeed,
      socials,
      privacy,
    };

    onComplete(updatedWallet);
  };

  return (
    <div className="fixed inset-0 bg-[#FAF9F6]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200/80 w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-auto flex flex-col gap-5 z-10 max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-3 animate-pulse">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif-luxury">Establish Your RWA Identity</h2>
          
          <div className="mt-2.5 mb-1.5 flex justify-center">
            <a
              href="https://x.com/iblamehsan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] text-amber-700 hover:text-amber-800 font-semibold uppercase tracking-wider bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 px-3 py-1 rounded-full transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Specially designed by ehsan for RIALO</span>
            </a>
          </div>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Create your premium investor profile to browse, list, and fractionalize certified real-world assets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Profile Photo Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Investor Profile Avatar <span className="text-zinc-300 font-normal">(Premium abstract seed)</span>
            </label>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50">
              <img
                src={customAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`}
                alt="Profile Avatar"
                className="w-14 h-14 rounded-full border-2 border-zinc-900 shadow-sm bg-white shrink-0 object-cover"
              />
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleAvatarSelect}
                  className="bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                >
                  Regenerate Seed
                </button>
                <p className="text-[9px] text-zinc-400">Generates a unique cryptographic digital fingerprint avatar.</p>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="onboardingNameInput">
              Collector Name / Trust Identifier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="onboardingNameInput"
              required
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ehsan Al-Maktoum"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-zinc-900 transition font-medium text-zinc-800"
            />
          </div>

          {/* Bio Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="onboardingBioInput">
                Biography <span className="text-zinc-300 font-normal">(Optional)</span>
              </label>
              <button
                type="button"
                onClick={() => handleTogglePrivacy("bio")}
                className="text-[10px] font-medium transition cursor-pointer flex items-center gap-1 text-emerald-600 hover:underline"
              >
                {privacy.bio ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                <span>{privacy.bio ? "Public" : "Private"}</span>
              </button>
            </div>
            <textarea
              id="onboardingBioInput"
              rows={2}
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Real-world asset collector & fractional yield strategist on Sepolia."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-900 transition font-medium text-zinc-800"
            />
          </div>

          {/* Connected Wallet Info */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 flex items-center justify-between text-xs">
            <div className="truncate mr-3">
              <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Verified Wallet Connection</span>
              <span className="block font-mono text-zinc-600 mt-0.5 truncate select-all">
                {wallet ? wallet.address : "Demo Sandbox Wallet (Auto-Mints on Entry)"}
              </span>
            </div>
            {!wallet && (
              <button
                type="button"
                onClick={connectWallet}
                className="shrink-0 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1"
              >
                <Wallet className="w-3 h-3" />
                <span>Connect</span>
              </button>
            )}
          </div>

          {/* Socials & Privacy */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Social Connections & Privacy</label>
              <span className="text-[10px] text-zinc-400">Public/Private toggles</span>
            </div>

            {/* X */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 flex-grow">
                <Twitter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="X Username"
                  value={socials.x}
                  onChange={(e) => setSocials((prev) => ({ ...prev, x: e.target.value }))}
                  className="bg-transparent border-none p-0 w-full text-xs focus:outline-none font-medium text-zinc-700"
                />
              </div>
              <button
                type="button"
                onClick={() => handleTogglePrivacy("x")}
                className={`shrink-0 px-2.5 py-2 rounded-xl border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 min-w-[75px] justify-center ${
                  privacy.x ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-500"
                }`}
              >
                {privacy.x ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{privacy.x ? "Public" : "Private"}</span>
              </button>
            </div>

            {/* LinkedIn */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 flex-grow">
                <Linkedin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="LinkedIn Profile URL"
                  value={socials.linkedin}
                  onChange={(e) => setSocials((prev) => ({ ...prev, linkedin: e.target.value }))}
                  className="bg-transparent border-none p-0 w-full text-xs focus:outline-none font-medium text-zinc-700"
                />
              </div>
              <button
                type="button"
                onClick={() => handleTogglePrivacy("linkedin")}
                className={`shrink-0 px-2.5 py-2 rounded-xl border text-[11px] font-medium transition cursor-pointer flex items-center gap-1.5 min-w-[75px] justify-center ${
                  privacy.linkedin ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-50 border-zinc-200 text-zinc-500"
                }`}
              >
                {privacy.linkedin ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{privacy.linkedin ? "Public" : "Private"}</span>
              </button>
            </div>
          </div>

          {/* Action */}
          <button
            type="submit"
            className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs py-3.5 rounded-xl transition shadow hover:shadow-md cursor-pointer mt-2 flex items-center justify-center gap-1.5"
          >
            <span>Verify & Enter Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
