import React, { useState } from "react";
import { RwaAsset, WalletState, RwaTransaction } from "../types";
import { Coins, Briefcase, TrendingUp, RefreshCw, ShieldCheck, Wallet, History, ArrowUpRight, ArrowDownLeft, Award, ExternalLink } from "lucide-react";

interface YieldFarmProps {
  purchasedAssetIds: number[];
  assets: RwaAsset[];
  accruedYield: number;
  onClaimYield: () => void;
  wallet: WalletState | null;
  transactions: RwaTransaction[];
}

export default function YieldFarm({
  purchasedAssetIds,
  assets,
  accruedYield,
  onClaimYield,
  wallet,
  transactions,
}: YieldFarmProps) {
  const [activeFarmTab, setActiveFarmTab] = useState<"nfts" | "history" | "wallet">("nfts");
  const ownedAssets = assets.filter((a) => purchasedAssetIds.includes(a.id));
  const hasHoldings = ownedAssets.length > 0;

  // Calculate average APR yield
  const avgYield = hasHoldings
    ? (ownedAssets.reduce((sum, current) => sum + current.yieldApr, 0) / ownedAssets.length).toFixed(1)
    : "0.0";

  return (
    <section className="mb-12 rounded-3xl bg-zinc-950 text-white border border-zinc-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Background radial glow accents */}
      <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Yield Accrual Active
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif-luxury text-zinc-50">
            Rialo Portfolio Vault & Yield Farm
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">
            Every fraction of a real-world asset you hold on Rialo generates continuous lease, rent, and charter passive yield payouts.
          </p>
        </div>

        <button
          onClick={onClaimYield}
          disabled={accruedYield <= 0}
          className={`font-semibold text-xs px-5 py-3 rounded-xl transition shadow-lg flex items-center gap-2 self-start md:self-auto shrink-0 cursor-pointer ${
            accruedYield > 0
              ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/10"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span>Claim Accrued Yield ({accruedYield.toFixed(8)} ETH)</span>
        </button>
      </div>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800/80 text-xs font-medium">
        
        {/* Holdings card */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-400 border border-zinc-700/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold font-mono">My Portfolio</span>
            <span className="block text-base font-bold font-serif-luxury text-zinc-200 mt-0.5">
              {ownedAssets.length} {ownedAssets.length === 1 ? "Fractional NFT" : "Fractional NFTs"}
            </span>
          </div>
        </div>

        {/* Average yield card */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-400 border border-zinc-700/30">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Weighted Portfolio ROI</span>
            <span className="block text-base font-bold font-serif-luxury text-zinc-200 mt-0.5">
              {avgYield}% Avg APR
            </span>
          </div>
        </div>

        {/* Real-time returns ticker */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800/60 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: "8s" }} />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Accumulated Return Balance</span>
            <span className="block text-base font-mono font-bold text-emerald-400 mt-0.5">
              {accruedYield.toFixed(8)} ETH
            </span>
          </div>
        </div>

      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="mt-8 border-b border-zinc-800 flex gap-4 overflow-x-auto text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none scrollbar-none">
        <button
          onClick={() => setActiveFarmTab("nfts")}
          className={`pb-3 border-b-2 transition duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeFarmTab === "nfts"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent hover:text-zinc-300"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Fractional NFT Deeds ({ownedAssets.length})</span>
        </button>
        <button
          onClick={() => setActiveFarmTab("history")}
          className={`pb-3 border-b-2 transition duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeFarmTab === "history"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent hover:text-zinc-300"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transaction Logs ({transactions.length})</span>
        </button>
        <button
          onClick={() => setActiveFarmTab("wallet")}
          className={`pb-3 border-b-2 transition duration-200 shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeFarmTab === "wallet"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent hover:text-zinc-300"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Sandbox Wallet Balance</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="mt-6">
        {/* NFT Tab */}
        {activeFarmTab === "nfts" && (
          <div className="animate-fade-in">
            {hasHoldings ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ownedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0"
                      />
                      <div className="overflow-hidden leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className="block font-serif-luxury font-bold text-zinc-100 truncate">{asset.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-400 font-mono">APR: {asset.yieldApr}% Yield</span>
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 rounded font-mono font-bold uppercase shrink-0">
                            ERC-1155 NFT
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="shrink-0 flex flex-col items-end gap-0.5 text-right">
                      <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-bold font-mono">
                        <ShieldCheck className="w-3 h-3" />
                        <span>NFT ID #{100 + asset.id}</span>
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 bg-zinc-900/10 border border-zinc-900 rounded-2xl">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-wider">No active fractional NFT certificates</p>
                <p className="text-[10px] mt-1 max-w-xs mx-auto text-zinc-600">Purchase a fractional share of any luxury underwritten collection asset below to mint your certified deed NFT.</p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeFarmTab === "history" && (
          <div className="animate-fade-in space-y-2">
            {transactions.length > 0 ? (
              <div className="max-h-[250px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                {transactions.map((tx) => {
                  const isMint = tx.type === "mint_asset";
                  const isBuy = tx.type === "buy_fraction_nft";
                  const isClaim = tx.type === "claim_yield";
                  
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between text-xs transition hover:bg-zinc-900/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isMint
                            ? "bg-purple-950/40 text-purple-400 border-purple-800/30"
                            : isBuy
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/30"
                            : "bg-amber-950/40 text-amber-400 border-amber-800/30"
                        }`}>
                          {isClaim ? (
                            <Coins className="w-4 h-4" />
                          ) : isMint ? (
                            <Award className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                            <span>
                              {isMint
                                ? "SPV Trust Deed Asset Minted"
                                : isBuy
                                ? "Fractional Share NFT Purchased"
                                : "Yield Claim Dispatched"}
                            </span>
                            {tx.nftTokenId && (
                              <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-mono">
                                {tx.nftTokenId}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            {tx.assetTitle && <span className="font-semibold text-zinc-400 mr-2">{tx.assetTitle}</span>}
                            <span className="font-mono">{tx.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold block ${
                          isBuy ? "text-zinc-400" : "text-emerald-400"
                        }`}>
                          {tx.amount}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-mono truncate max-w-[80px] sm:max-w-none block hover:text-emerald-400 select-all cursor-pointer">
                          {tx.hash.substring(0, 10)}...
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 bg-zinc-900/10 border border-zinc-900 rounded-2xl">
                <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-wider">Zero sandbox transactions recorded</p>
              </div>
            )}
          </div>
        )}

        {/* Wallet Tab */}
        {activeFarmTab === "wallet" && (
          <div className="animate-fade-in">
            {wallet ? (
              <div className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                      Authenticated Sandbox Account Address
                    </span>
                    <span className="text-sm font-mono font-semibold text-zinc-200 select-all bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800 block sm:inline-block">
                      {wallet.address}
                    </span>
                  </div>
                  
                  <div className="bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 text-right">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                      Sandbox Ledger Balance
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {parseFloat(wallet.balance).toFixed(4)} ETH
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 text-xs">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Network Metadata</span>
                    <p className="mt-1 font-bold text-zinc-300">Arbitrum Sepolia Testnet</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Continuous decentralized state machine sync</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 text-xs">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Minted RWA NFTs</span>
                    <p className="mt-1 font-bold text-zinc-300">{ownedAssets.length} ERC-1155 Fractional Certificate Deeds</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Asset-backed luxury fractional securities</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 bg-zinc-900/10 border border-zinc-900 rounded-2xl">
                <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-wider">Wallet Disconnected</p>
                <p className="text-[10px] mt-1 max-w-xs mx-auto text-zinc-600">Connect sandbox wallet at top bar to populate real-time ledger metrics.</p>
              </div>
            )}
          </div>
        )}
      </div>

    </section>
  );
}
