import React, { useState } from "react";
import { WalletState } from "../types";
import { X, Eye, EyeOff, Twitter, MessageSquare, Github, Instagram, Linkedin, RefreshCw, UserCheck } from "lucide-react";

interface ProfileModalProps {
  wallet: WalletState;
  onClose: () => void;
  onSave: (updated: WalletState) => void;
}

export default function ProfileModal({ wallet, onClose, onSave }: ProfileModalProps) {
  const [username, setUsername] = useState(wallet.username);
  const [bio, setBio] = useState(wallet.bio || "");
  const [avatarSeed, setAvatarSeed] = useState(wallet.avatarSeed);
  const [socials, setSocials] = useState({ ...wallet.socials });
  const [privacy, setPrivacy] = useState({ ...wallet.privacy });

  const handleTogglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegenerateSeed = () => {
    setAvatarSeed("rialo_" + Math.floor(Math.random() * 1000));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...wallet,
      username: username.trim() || wallet.username,
      bio: bio.trim(),
      avatarSeed,
      socials,
      privacy,
    });
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200/80 w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-zinc-200/60 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 font-serif-luxury">Investor Credentials</h3>
            <p className="text-xs text-zinc-400">Manage your Web3 RWA profile</p>
          </div>
          <button
            onClick={onClose}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow text-xs font-medium">
          
          {/* Avatar seed */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Cryptographic Avatar Seed
            </label>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${avatarSeed}`}
                alt="Profile Avatar"
                className="w-12 h-12 rounded-full border-2 border-zinc-900 bg-white"
              />
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleRegenerateSeed}
                  className="bg-white border border-zinc-200 hover:bg-zinc-100 text-[10px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-zinc-600" />
                  <span>Regenerate Seed</span>
                </button>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="usernameInput">
              Investor Username / Entity Name
            </label>
            <input
              type="text"
              id="usernameInput"
              required
              maxLength={24}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-zinc-900 transition font-semibold text-zinc-800"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="bioInput">
                Biography Statement
              </label>
              <button
                type="button"
                onClick={() => handleTogglePrivacy("bio")}
                className="text-[10px] transition cursor-pointer flex items-center gap-1 text-emerald-600 hover:underline"
              >
                {privacy.bio ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-zinc-400" />}
                <span>{privacy.bio ? "Public" : "Private"}</span>
              </button>
            </div>
            <textarea
              id="bioInput"
              rows={2}
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Luxury real-world asset fractional collector & yield optimizer."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-900 transition font-medium text-zinc-700"
            />
          </div>

          {/* Social connections */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Social Connection privacy settings
            </label>

            {/* X */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 flex-grow">
                <Twitter className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="X Username"
                  value={socials.x || ""}
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
                  value={socials.linkedin || ""}
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

          {/* Wallet and Network stats */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-[10px] font-mono leading-relaxed space-y-1">
            <div>
              <span className="text-zinc-400">WALLET ADDRESS:</span> <span className="text-zinc-700 select-all">{wallet.address}</span>
            </div>
            <div>
              <span className="text-zinc-400">FUND BALANCE:</span> <span className="text-zinc-700">{wallet.balance} ETH</span>
            </div>
            <div>
              <span className="text-zinc-400">NETWORK GATEWAY:</span> <span className="text-zinc-700">Arbitrum Sepolia Testnet</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs py-3.5 rounded-xl transition shadow hover:shadow-md cursor-pointer mt-2 flex items-center justify-center gap-1"
          >
            <UserCheck className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </form>

      </div>
    </div>
  );
}
