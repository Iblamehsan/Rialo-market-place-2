import React, { useState, useEffect } from "react";
import { Search, Loader, Wallet, Coins, History, ShieldAlert, ArrowUpRight, ArrowDownLeft, ExternalLink, RefreshCw, BadgeHelp } from "lucide-react";

interface RealBalance {
  chain: string;
  balance: string;
  coin: string;
  ens?: string | null;
}

interface RealAsset {
  chain: string;
  name: string;
  symbol: string;
  type: string;
  balance: string;
  address: string;
  icon?: string | null;
  tokenId?: string | null;
}

interface RealTransaction {
  chain: string;
  hash: string;
  timestamp: string;
  value: string;
  fee: string;
  to: string;
  from: string;
  status: string;
  type: string;
}

const POPULAR_ADDRESSES = [
  { label: "Vitalik Buterin", address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" },
  { label: "Justin Sun", address: "0x3ddfa8ec3052539b6c9549f12beb29975487e36c" },
  { label: "Arbitrum Bridge SPV", address: "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a" },
];

export default function OnChainExplorer() {
  const [addressInput, setAddressInput] = useState("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [balances, setBalances] = useState<RealBalance[]>([]);
  const [assets, setAssets] = useState<RealAsset[]>([]);
  const [transactions, setTransactions] = useState<RealTransaction[]>([]);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const fetchOnChainData = async (targetAddress: string) => {
    if (!targetAddress || !/^0x[a-fA-F0-9]{40}$/.test(targetAddress.trim())) {
      setError("Please specify a valid 40-character EVM hexadecimal address (0x...)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchTriggered(true);

    try {
      const response = await fetch(`/api/onchain-explorer?address=${targetAddress.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve real-time address metrics.");
      }

      setBalances(data.balances || []);
      setAssets(data.assets || []);
      setTransactions(data.transactions || []);
    } catch (err: any) {
      console.error("On-Chain Explorer failure:", err);
      setError(err.message || "An unexpected network error occurred while querying the Blockscout oracle.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch for the default address on render
  useEffect(() => {
    fetchOnChainData("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
  }, []);

  return (
    <section id="onchain-explorer" className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-zinc-800 bg-zinc-950/40 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-extrabold font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            Live Multi-Chain Oracle
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-zinc-100 tracking-tight mt-1">
            Real Address Tracker
          </h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-xl">
            Query real-time balances, multi-chain ERC-20/721/1155 assets, and the last 10 real on-chain transactions directly from decentralized nodes across 5 major public networks.
          </p>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Suggested Oracles:</span>
          {POPULAR_ADDRESSES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAddressInput(item.address);
                fetchOnChainData(item.address);
              }}
              className="text-[10px] font-semibold bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl px-3 py-1.5 transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Address Search Form */}
      <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/80 p-5 mb-8 flex flex-col md:flex-row gap-3 items-stretch shadow-xl">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Search EVM Wallet Address (0x...)"
            className="w-full bg-zinc-950/60 border border-zinc-800 text-zinc-200 pl-11 pr-4 py-3 rounded-2xl text-xs font-mono focus:outline-none focus:border-emerald-500 transition-all placeholder-zinc-600"
          />
        </div>
        <button
          onClick={() => fetchOnChainData(addressInput)}
          disabled={isLoading}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 text-zinc-950 font-bold text-xs px-6 py-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Fetching Decentralized State...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Sync Live Ledgers</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex gap-3 items-start">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p className="font-bold">Address Inquiry Interrupted</p>
            <p className="text-[10px] mt-0.5 opacity-90">{error}</p>
          </div>
        </div>
      )}

      {searchTriggered && !isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Native balances card - col-span-4 */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 space-y-4">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-extrabold font-mono flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                Native Coin Balances
              </span>
              
              <div className="space-y-3">
                {balances.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">{item.chain}</span>
                      {item.ens && (
                        <span className="block text-[10px] text-emerald-400 font-mono font-semibold mt-0.5">{item.ens}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-zinc-200 block">
                        {parseFloat(item.balance).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 5 })}
                      </span>
                      <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold font-mono">
                        {item.coin}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats / total info */}
            <div className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-5 text-center space-y-2">
              <BadgeHelp className="w-6 h-6 mx-auto text-emerald-400/60" />
              <h4 className="text-xs font-bold text-zinc-300">How did we get this data?</h4>
              <p className="text-[10px] text-zinc-500 leading-normal">
                This app directly queries standard, keyless REST API block indexes from official, public Blockscout explorers. No test credentials or mock states are employed.
              </p>
            </div>
          </div>

          {/* Tokens & Multi-chain ERC Assets - col-span-4 */}
          <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 flex flex-col h-[400px]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-extrabold font-mono flex items-center gap-1.5 mb-4 shrink-0">
              <Coins className="w-3.5 h-3.5 text-zinc-400" />
              On-Chain Assets ({assets.length})
            </span>

            <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
              {assets.length > 0 ? (
                assets.map((item, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 flex justify-between items-center gap-3">
                    <div className="overflow-hidden leading-tight">
                      <div className="flex items-center gap-2">
                        {item.icon ? (
                          <img src={item.icon} alt={item.symbol} className="w-4 h-4 rounded-full object-contain shrink-0" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                        ) : null}
                        <span className="block font-bold text-zinc-200 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1 rounded font-bold uppercase tracking-wider shrink-0 font-mono">
                          {item.chain}
                        </span>
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-bold uppercase shrink-0 font-mono">
                          {item.type}
                        </span>
                        {item.tokenId && (
                          <span className="text-[8px] text-zinc-500 font-mono truncate">
                            ID #{item.tokenId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-zinc-200 block">
                        {parseFloat(item.balance) ? parseFloat(item.balance).toLocaleString(undefined, { maximumFractionDigits: 4 }) : item.balance || "1"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-bold font-mono block">
                        {item.symbol}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-zinc-600">
                  <Coins className="w-8 h-8 mx-auto opacity-20 mb-2" />
                  <p className="text-[10px] uppercase font-bold tracking-wider">No separate ERC tokens discovered</p>
                </div>
              )}
            </div>
          </div>

          {/* Transactions col-span-4 */}
          <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 flex flex-col h-[400px]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-extrabold font-mono flex items-center gap-1.5 mb-4 shrink-0">
              <History className="w-3.5 h-3.5 text-zinc-400" />
              Latest Real Transactions ({transactions.length})
            </span>

            <div className="flex-grow overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
              {transactions.length > 0 ? (
                transactions.map((tx, idx) => (
                  <div key={idx} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-900 flex justify-between items-center gap-3">
                    <div className="overflow-hidden leading-normal">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-zinc-900 text-zinc-400 px-1 py-0.2 rounded font-bold uppercase tracking-wider font-mono">
                          {tx.chain}
                        </span>
                        <span className="text-[8px] uppercase bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-bold font-mono">
                          {tx.type}
                        </span>
                      </div>
                      <span className="block text-[10px] text-zinc-500 mt-1 font-mono truncate">
                        {new Date(tx.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-zinc-200 block">
                        {parseFloat(tx.value) > 0 ? parseFloat(tx.value).toFixed(4) : "0"}
                      </span>
                      <a
                        href={
                          tx.chain === "Ethereum"
                            ? `https://etherscan.io/tx/${tx.hash}`
                            : tx.chain === "Polygon"
                            ? `https://polygonscan.com/tx/${tx.hash}`
                            : tx.chain === "Arbitrum"
                            ? `https://arbiscan.io/tx/${tx.hash}`
                            : tx.chain === "Optimism"
                            ? `https://optimistic.etherscan.io/tx/${tx.hash}`
                            : `https://basescan.org/tx/${tx.hash}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold font-mono inline-flex items-center gap-1 mt-0.5"
                      >
                        <span>{tx.hash.substring(0, 8)}...</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-zinc-600">
                  <History className="w-8 h-8 mx-auto opacity-20 mb-2" />
                  <p className="text-[10px] uppercase font-bold tracking-wider">No transactions indexed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
