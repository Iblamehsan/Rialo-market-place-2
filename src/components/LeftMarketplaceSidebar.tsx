import React from "react";
import { Wallet, CreditCard, Activity, ArrowUpRight, ArrowDownLeft, ShieldAlert, Sparkles, User, Power } from "lucide-react";
import { WalletState, RwaTransaction } from "../types";

interface LeftMarketplaceSidebarProps {
  wallet: WalletState | null;
  connectWallet: () => void;
  transactions: RwaTransaction[];
  onOpenProfile: () => void;
  onDisconnect: () => void;
  accruedYield: number;
  onClaimYield: () => void;
}

export default function LeftMarketplaceSidebar({
  wallet,
  connectWallet,
  transactions,
  onOpenProfile,
  onDisconnect,
  accruedYield,
  onClaimYield,
}: LeftMarketplaceSidebarProps) {
  // Get exactly the last 10 transactions
  const last10Transactions = transactions.slice(0, 10);

  return (
    <aside className="w-full md:w-64 lg:w-80 shrink-0 space-y-6 md:sticky md:top-24">
      
      {/* 1. Wallet Balance & Identity Panel */}
      <div className="bg-white rounded-3xl border border-zinc-200/60 p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
            On-Chain Wallet
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
              Disconnected
            </span>
          )}
        </div>

        {wallet?.connected ? (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold font-mono text-zinc-900 tracking-tight">
                  {parseFloat(wallet.balance).toFixed(4)}
                </span>
                <span className="text-xs font-bold text-zinc-500 font-mono">ETH</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 truncate pt-1">
                <span className="font-bold text-zinc-700">{wallet.username}</span>
                <span className="text-zinc-300">|</span>
                <span className="font-mono text-[9px] bg-zinc-100 px-1.5 py-0.5 rounded select-all" title={wallet.address}>
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
              </div>
            </div>

            {/* Micro profile & disconnect actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={onOpenProfile}
                className="flex-1 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-lg font-bold text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
              >
                <User className="w-3 h-3" />
                <span>Profile</span>
              </button>
              <button
                onClick={onDisconnect}
                className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center"
                title="Disconnect Wallet"
              >
                <Power className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-5 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-xs text-zinc-700">Identity Inactive</p>
              <p className="text-[10px] text-zinc-400 leading-normal max-w-xs mx-auto">
                Establish your investor wallet connection to start accumulating fraction yields.
              </p>
            </div>
            <button
              onClick={connectWallet}
              className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer shadow-sm"
            >
              Connect Secure Wallet
            </button>
          </div>
        )}
      </div>

      {/* 2. Continuous Yield Engine Tracker */}
      {wallet?.connected && (
        <div className="bg-white rounded-3xl border border-zinc-200/60 p-5 space-y-4 shadow-sm relative overflow-hidden">
          {/* Real-time background pulse */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

          <div className="flex justify-between items-center relative">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Accruing Passive Yield
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-3.5 relative">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold font-mono text-emerald-600 tracking-tight">
                  {accruedYield.toFixed(8)}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 font-mono">ETH</span>
              </div>
              <span className="text-[9px] text-zinc-400 block font-medium mt-0.5">
                Yield streaming 5x per second
              </span>
            </div>

            {accruedYield > 0 ? (
              <button
                onClick={onClaimYield}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer shadow-md shadow-emerald-600/10"
              >
                Claim Continuous Yield
              </button>
            ) : (
              <div className="text-center py-2 bg-zinc-50 border border-zinc-150 rounded-xl text-[9px] text-zinc-400 font-mono">
                Buy Fractions to Start Yield
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Recent Transactions Ledger (Exactly Last 10 Transactions) */}
      <div className="bg-white rounded-3xl border border-zinc-200/60 p-5 space-y-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            Ledger History
          </span>
          <span className="text-[9px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-mono font-bold">
            {last10Transactions.length} Logged
          </span>
        </div>

        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {last10Transactions.length > 0 ? (
            last10Transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="p-3 bg-zinc-50/70 border border-zinc-200/50 rounded-xl space-y-1.5 transition hover:bg-zinc-50"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0 ${
                    tx.type === "claim_yield" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : tx.type === "mint_asset"
                      ? "bg-purple-50 text-purple-700 border border-purple-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {tx.type === "claim_yield" 
                      ? "Yield" 
                      : tx.type === "mint_asset" 
                      ? "Mint" 
                      : "Acquire"}
                  </span>
                  
                  <span className={`text-[10px] font-mono font-bold shrink-0 ${
                    tx.amount.startsWith("+") ? "text-emerald-600" : "text-zinc-700"
                  }`}>
                    {tx.amount}
                  </span>
                </div>

                <div className="text-[10px] font-bold text-zinc-800 leading-tight truncate">
                  {tx.assetTitle || "Continuous Yield Claim"}
                </div>

                <div className="flex justify-between items-center text-[9px] text-zinc-400 pt-1 border-t border-zinc-200/30">
                  <span className="font-mono text-[8px] truncate max-w-[100px]" title={tx.hash}>
                    {tx.hash.slice(0, 10)}...
                  </span>
                  <span className="font-mono text-[8px]">{tx.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-zinc-400 bg-zinc-50 rounded-2xl border border-zinc-150">
              <p className="font-bold text-[10px] uppercase tracking-wider">No Ledger Entries</p>
              <p className="text-[9px] mt-0.5 text-zinc-400 leading-normal max-w-[150px] mx-auto">
                Claimed yield, listed properties, and acquisitions appear here.
              </p>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}
