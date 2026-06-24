import React from "react";
import { WalletState } from "../types";
import { Wallet, Plus, ShieldAlert, Sparkles, User, Settings, ArrowRight } from "lucide-react";

interface NavbarProps {
  wallet: WalletState | null;
  connectWallet: () => void;
  onOpenCreateAsset: () => void;
  onOpenProfile: () => void;
}

export default function Navbar({ wallet, connectWallet, onOpenCreateAsset, onOpenProfile }: NavbarProps) {
  const [networkAlert, setNetworkAlert] = React.useState(false);

  // Auto detect incorrect networks or display status info
  const handleConnectClick = () => {
    if (!wallet) {
      connectWallet();
    } else {
      setNetworkAlert((prev) => !prev);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9F6]/85 backdrop-blur-md border-b border-zinc-200/40 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo and Title */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-serif-luxury font-black text-lg shadow-md hover:scale-105 transition">
            R
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-950 font-serif-luxury leading-none">
              Rialo
            </h1>
            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-0.5 block">
              RWA Marketplace
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          
          {/* List asset button */}
          <button
            onClick={onOpenCreateAsset}
            className="hidden sm:flex items-center gap-1.5 bg-zinc-150 border border-zinc-200/80 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-zinc-700" />
            <span>List Asset</span>
          </button>

          {/* Connected wallet profile details */}
          {wallet ? (
            <div className="flex items-center gap-2.5 bg-white border border-zinc-200 p-1.5 rounded-2xl shadow-sm">
              <div className="px-2.5 py-1 text-right hidden md:block">
                <span className="block text-xs font-bold text-zinc-900 leading-tight">
                  {wallet.username}
                </span>
                <span className="block text-[9px] font-mono text-zinc-400 font-semibold leading-none mt-0.5">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              </div>

              {/* Balance Badge */}
              <div className="bg-zinc-50 border border-zinc-150/50 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-zinc-800 shrink-0">
                {parseFloat(wallet.balance).toFixed(2)} ETH
              </div>

              {/* Avatar indicator / Edit Profile Trigger */}
              <button
                onClick={onOpenProfile}
                className="w-8 h-8 rounded-xl overflow-hidden border border-zinc-300 shadow bg-zinc-50 flex items-center justify-center hover:scale-105 transition cursor-pointer shrink-0"
                title="Investor Credentials"
              >
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${wallet.avatarSeed}`}
                  alt="Identity"
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl transition shadow hover:shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}

        </div>
      </div>

      {/* Dropdown alert details if user connected and clicks address */}
      {networkAlert && wallet && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 animate-fade-in">
          <div className="p-3 bg-zinc-900 text-zinc-300 rounded-2xl text-[10px] font-mono flex items-center justify-between border border-zinc-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Network: <strong className="text-white">Sepolia Arbitrum Testnet</strong> (Demo Mode)</span>
            </span>
            <span className="text-zinc-500">Address: {wallet.address}</span>
          </div>
        </div>
      )}
    </header>
  );
}
