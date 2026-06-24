import React, { useState } from "react";
import { Wallet, CreditCard, ShieldAlert, X, ChevronRight, Activity, ArrowUpRight, ArrowDownLeft, CheckCircle2, User, Power, HelpCircle } from "lucide-react";
import { WalletState, RwaTransaction } from "../types";

interface LeftWalletSidebarProps {
  wallet: WalletState | null;
  connectWallet: () => void;
  transactions: RwaTransaction[];
  onOpenProfile: () => void;
  onDisconnect: () => void;
}

export default function LeftWalletSidebar({
  wallet,
  connectWallet,
  transactions,
  onOpenProfile,
  onDisconnect,
}: LeftWalletSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 1. Floating Trigger Tab - Fixed to Left Viewport Edge */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center">
        <button
          onClick={() => setIsOpen(true)}
          id="left-wallet-tab-trigger"
          className="bg-zinc-950 text-white border-y border-r border-zinc-800 hover:bg-zinc-900 transition-all shadow-2xl rounded-r-2xl py-4 px-2.5 flex flex-col items-center gap-3 cursor-pointer group"
          title="Open Wallet Ledger"
        >
          {/* Animated active/inactive beacon dot */}
          <span className="relative flex h-2 w-2">
            {wallet?.connected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
            )}
          </span>

          <Wallet className="w-4 h-4 text-zinc-300 group-hover:scale-110 transition-transform" />
          
          {/* Vertical text layout */}
          <span className="text-[9px] font-extrabold tracking-widest uppercase [writing-mode:vertical-lr] text-zinc-400 font-mono">
            {wallet?.connected ? "CONNECTED" : "LEDGER TAB"}
          </span>

          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Slide-out Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 sm:w-96 bg-white border-r border-zinc-200/80 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="bg-zinc-950 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100 font-serif-luxury">
                On-Chain Ledger
              </h3>
              <span className="block text-[8px] text-zinc-400 uppercase tracking-widest font-mono font-bold mt-0.5">
                Fractional Balance Sync
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body - Scrollable content */}
        <div className="flex-grow overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Balance Widget Section */}
          <div className="bg-zinc-50 rounded-2xl border border-zinc-200/60 p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                Current Wallet Balance
              </span>
              {wallet?.connected ? (
                <span className={`text-[8px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                  wallet.isDemoMode 
                    ? "bg-amber-50 text-amber-700 border border-amber-200" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {wallet.isDemoMode ? "Sandbox" : "Web3 Injected"}
                </span>
              ) : (
                <span className="text-[8px] bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Inactive
                </span>
              )}
            </div>

            {wallet?.connected ? (
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-mono text-zinc-900 tracking-tight">
                    {parseFloat(wallet.balance).toFixed(4)}
                  </span>
                  <span className="text-sm font-bold text-zinc-500 font-mono">ETH</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1 truncate">
                  <span className="font-semibold text-zinc-700">{wallet.username}</span>
                  <span className="text-zinc-300">|</span>
                  <span className="font-mono text-[9px] truncate bg-zinc-200/50 px-1.5 py-0.5 rounded select-all" title={wallet.address}>
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-3">
                <ShieldAlert className="w-8 h-8 mx-auto text-zinc-400" />
                <div className="space-y-1">
                  <p className="font-bold text-zinc-700">No Cryptographic Identity Connected</p>
                  <p className="text-[10px] text-zinc-400 leading-normal max-w-xs mx-auto">
                    Connect your secure mobile wallet app or desktop browser extension to explore fractional real estate yields.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    connectWallet();
                  }}
                  className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>

          {/* Accrued / Staking Portfolio Indicator */}
          {wallet?.connected && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="block text-[8px] uppercase tracking-wider text-emerald-700 font-bold font-mono">RIALO Yield Engine</span>
                <span className="block text-xs font-bold text-zinc-800 mt-0.5">Continuous Ledger Sync</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          )}

          {/* Last Transaction Section */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-zinc-400" />
              Recent Ledger Entries
            </span>

            <div className="space-y-2">
              {transactions.length > 0 ? (
                transactions.slice(0, 10).map((tx, idx) => (
                  <div key={idx} className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-xl space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-bold text-zinc-800 leading-normal truncate pr-2">
                        {tx.assetTitle || "Continuous Yield Claim"}
                      </div>
                      <span className={`text-[9px] font-mono font-bold shrink-0 ${
                        tx.amount.startsWith("+") ? "text-emerald-600" : "text-zinc-600"
                      }`}>
                        {tx.amount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/40">
                      <span className="capitalize font-medium text-zinc-500">{tx.type.replace("_", " ")}</span>
                      <span className="font-mono text-[9px]">{tx.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-200/60">
                  <p className="font-semibold text-[10px] uppercase tracking-wider">No Transaction History</p>
                  <p className="text-[9px] mt-0.5 text-zinc-400">Yield claims and investments appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        {wallet?.connected && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
              className="flex-1 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Identity Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                onDisconnect();
              }}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center"
              title="Disconnect Wallet"
            >
              <Power className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-zinc-950/20 backdrop-blur-xs z-40 transition-opacity"
        />
      )}
    </>
  );
}
