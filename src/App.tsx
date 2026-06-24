import React, { useState, useEffect, useMemo, useRef } from "react";
import { RwaAsset, WalletState, ToastMessage, RwaTransaction } from "./types";
import { initialAssets } from "./data";
import { motion, AnimatePresence } from "motion/react";

// Component imports
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import YieldFarm from "./components/YieldFarm";
import AssetCard from "./components/AssetCard";
import AssetDetailModal from "./components/AssetDetailModal";
import CreateAssetModal from "./components/CreateAssetModal";
import ProfileModal from "./components/ProfileModal";
import OnboardingOverlay from "./components/OnboardingOverlay";
import Toast from "./components/Toast";
import AiChatBubble from "./components/AiChatBubble";
import OnChainExplorer from "./components/OnChainExplorer";
import ConnectWalletModal from "./components/ConnectWalletModal";
import LeftWalletSidebar from "./components/LeftWalletSidebar";
import LeftMarketplaceSidebar from "./components/LeftMarketplaceSidebar";

// Lucide icon helper
import { Filter, Home, Car, Gem, Briefcase, RefreshCw, CheckCircle2, Shield, Loader, Send } from "lucide-react";

export default function App() {
  // --- STATE DECLARATIONS ---
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateAssetModal, setShowCreateAssetModal] = useState(false);
  const [showWalletConnectModal, setShowWalletConnectModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<RwaAsset | null>(null);
  
  // Loaded list of assets (merges default presets and any user listings in local storage)
  const [assets, setAssets] = useState<RwaAsset[]>(initialAssets);
  
  // List of purchased asset IDs
  const [purchasedAssetIds, setPurchasedAssetIds] = useState<number[]>([]);
  
  // Real-time continuous yield accrual state
  const [accruedYield, setAccruedYield] = useState<number>(0);
  
  // Toast notifications array
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Transactions log history state
  const [transactions, setTransactions] = useState<RwaTransaction[]>([]);
  
  // Marketplace Category Filter state
  const [categoryFilter, setCategoryFilter] = useState<"all" | "House" | "Car" | "Other" | "MyPurchases">("all");

  // On-chain transaction progress simulator overlay state
  const [txStatus, setTxStatus] = useState<{
    show: boolean;
    step: number;
    message: string;
    hash?: string;
  } | null>(null);

  // Use a ref to track the last tick time to maintain high accrual accuracy
  const lastTickTimeRef = useRef<number>(Date.now());

  // --- DYNAMIC STATISTICS CALCULATIONS ---
  const totalVolumeStr = useMemo(() => {
    const baseVolume = 8432.50;
    const userAcquisitionVolume = transactions
      .filter((t) => t.type === "buy_fraction_nft")
      .reduce((sum, t) => {
        const amt = parseFloat(t.amount.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0);
    const userMintVolume = transactions
      .filter((t) => t.type === "mint_asset")
      .reduce((sum, t) => {
        const amt = parseFloat(t.amount.replace(/[^0-9.]/g, ""));
        return sum + (isNaN(amt) ? 0 : amt);
      }, 0);
    return (baseVolume + userAcquisitionVolume + userMintVolume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [transactions]);

  const totalAssetsCount = useMemo(() => {
    return assets.length;
  }, [assets]);

  const averageYieldPct = useMemo(() => {
    if (assets.length === 0) return "8.94";
    const sum = assets.reduce((acc, a) => acc + (a.yieldApr || 8.0), 0);
    return (sum / assets.length).toFixed(2);
  }, [assets]);

  const activeSpvsCount = useMemo(() => {
    const uniqueOwners = new Set(assets.map((a) => a.owner)).size;
    return 10 + uniqueOwners;
  }, [assets]);

  // --- LOCAL STORAGE PERSISTENCE SYNC ---
  useEffect(() => {
    // 1. Load Profile
    const savedWallet = localStorage.getItem("rialo_wallet");
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
      } catch (e) {
        console.error("Stale profile data.", e);
      }
    } else {
      setShowOnboarding(true);
    }

    // 2. Load custom user-listed assets
    const savedAssets = localStorage.getItem("rialo_custom_assets");
    if (savedAssets) {
      try {
        const parsedCustom = JSON.parse(savedAssets) as RwaAsset[];
        setAssets([...initialAssets, ...parsedCustom]);
      } catch (e) {
        console.error("Stale custom listings.", e);
      }
    }

    // 3. Load user-purchased RWA fractions
    const savedPurchases = localStorage.getItem("rialo_purchased_ids");
    if (savedPurchases) {
      try {
        setPurchasedAssetIds(JSON.parse(savedPurchases));
      } catch (e) {
        console.error("Stale purchase ledger.", e);
      }
    }

    // 4. Load unclaimed yield returns
    const savedYield = localStorage.getItem("rialo_accrued_yield");
    if (savedYield) {
      const parsedYield = parseFloat(savedYield);
      if (!isNaN(parsedYield)) {
        setAccruedYield(parsedYield);
      }
    }

    // 5. Load transactions history log
    const savedTx = localStorage.getItem("rialo_transactions");
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch (e) {
        console.error("Stale transaction log ledger.", e);
      }
    } else {
      const genesisTx: RwaTransaction = {
        id: "tx_genesis_init",
        type: "claim_yield",
        assetTitle: "Sandbox Allocation",
        amount: "+10.0000 ETH",
        timestamp: "Genesis",
        hash: "0xRIALO_GENESIS_STATE_MINT_LEDGER",
      };
      setTransactions([genesisTx]);
      localStorage.setItem("rialo_transactions", JSON.stringify([genesisTx]));
    }
  }, []);

  // --- CONTINUOUS REAL-TIME YIELD ACCRUAL ENGINE ---
  useEffect(() => {
    lastTickTimeRef.current = Date.now();

    const interval = setInterval(() => {
      if (purchasedAssetIds.length === 0) {
        lastTickTimeRef.current = Date.now();
        return;
      }

      // Calculate total yield rate (yield per millisecond) for all owned assets
      // yieldPerYearInEth = Sum(asset.price * (asset.yieldApr / 100))
      // yieldPerSecondInEth = yieldPerYear / (365 * 24 * 3600)
      // yieldPerMsInEth = yieldPerSecond / 1000
      const now = Date.now();
      const elapsedMs = now - lastTickTimeRef.current;
      lastTickTimeRef.current = now;

      if (elapsedMs <= 0) return;

      let totalYieldMs = 0;
      purchasedAssetIds.forEach((id) => {
        const asset = assets.find((a) => a.id === id);
        if (asset) {
          const priceNum = parseFloat(asset.price) || 0;
          const aprFactor = asset.yieldApr / 100;
          const yieldPerYear = priceNum * aprFactor;
          const yieldPerMs = yieldPerYear / (365 * 24 * 3600 * 1000);
          totalYieldMs += yieldPerMs * elapsedMs;
        }
      });

      setAccruedYield((prev) => {
        const updated = prev + totalYieldMs;
        // Save to local storage occasionally
        localStorage.setItem("rialo_accrued_yield", updated.toString());
        return updated;
      });
    }, 200); // Trigger fast fluid updates (5 times a second)

    return () => clearInterval(interval);
  }, [purchasedAssetIds, assets]);

  // --- ACTIONS & HANDLERS ---
  const addToast = (message: string, type: ToastMessage["type"]) => {
    const id = "toast_" + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const connectWallet = () => {
    setShowWalletConnectModal(true);
  };

  const handleConnectSuccess = (connectedWallet: WalletState) => {
    setWallet(connectedWallet);
    localStorage.setItem("rialo_wallet", JSON.stringify(connectedWallet));
    setShowOnboarding(false);
    setShowWalletConnectModal(false);

    // Append standard transaction indicator if it's a real connected wallet or manual read-only sync
    const syncTx: RwaTransaction = {
      id: "tx_sync_" + Date.now(),
      type: "claim_yield",
      assetTitle: connectedWallet.isDemoMode ? "Sandbox Handshake" : "Active Address Telemetry Sync",
      amount: `+${parseFloat(connectedWallet.balance).toFixed(4)} ETH`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      hash: "0x" + Math.random().toString(16).substr(2, 40).toUpperCase(),
    };
    setTransactions((prev) => {
      const updated = [syncTx, ...prev].slice(0, 10);
      localStorage.setItem("rialo_transactions", JSON.stringify(updated));
      return updated;
    });
  };

  const handleOnboardingComplete = (profile: WalletState) => {
    setWallet(profile);
    localStorage.setItem("rialo_wallet", JSON.stringify(profile));
    setShowOnboarding(false);
    addToast(`Welcome to Rialo, ${profile.username}! Your digital ledger identity is certified.`, "success");
  };

  const handleSaveProfile = (updatedProfile: WalletState) => {
    setWallet(updatedProfile);
    localStorage.setItem("rialo_wallet", JSON.stringify(updatedProfile));
    setShowProfileModal(false);
    addToast("Investor profile updated successfully.", "info");
  };

  const handleDisconnect = () => {
    setWallet(null);
    localStorage.removeItem("rialo_wallet");
    addToast("Wallet disconnected successfully.", "info");
  };

  const handleListNewAsset = (newAssetData: Omit<RwaAsset, "id">) => {
    const nextId = assets.reduce((max, asset) => (asset.id > max ? asset.id : max), 0) + 1;
    const completedAsset: RwaAsset = {
      ...newAssetData,
      id: nextId,
    };

    const updatedAssets = [...assets, completedAsset];
    setAssets(updatedAssets);

    // Persist custom user assets list
    const userListedOnly = updatedAssets.filter((a) => !a.isDefault);
    localStorage.setItem("rialo_custom_assets", JSON.stringify(userListedOnly));

    // Append to transactions log
    const listTx: RwaTransaction = {
      id: "tx_mint_" + Date.now(),
      type: "mint_asset",
      assetTitle: completedAsset.title,
      amount: "0.0000 ETH",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      hash: "0x" + Math.random().toString(16).substr(2, 40).toUpperCase(),
      nftTokenId: `RWA-NFT-${completedAsset.id}`,
    };
    setTransactions((prev) => {
      const updated = [listTx, ...prev].slice(0, 10);
      localStorage.setItem("rialo_transactions", JSON.stringify(updated));
      return updated;
    });

    setShowCreateAssetModal(false);
    addToast(`Successfully minted corporate SPV trust deed for ${completedAsset.title}!`, "success");
  };

  const handleBuyAssetFraction = (fractionCostStr: string) => {
    if (!wallet) {
      addToast("Please connect your wallet or activate Demo Mode before purchasing.", "error");
      return;
    }

    const costNum = parseFloat(fractionCostStr);
    const balanceNum = parseFloat(wallet.balance);

    if (costNum > balanceNum) {
      addToast("Insufficient test ETH balance in sandbox wallet.", "error");
      return;
    }

    if (!selectedAsset) return;

    // Trigger secure on-chain block verification simulation
    setTxStatus({
      show: true,
      step: 1,
      message: "Constructing fractional smart contract on Arbitrum Sepolia..."
    });

    setTimeout(() => {
      setTxStatus({
        show: true,
        step: 2,
        message: "Signing secure multi-sig custody receipts under custody vaults..."
      });
    }, 1500);

    setTimeout(() => {
      setTxStatus({
        show: true,
        step: 3,
        message: "Generating metadata and minting Fractional ERC-1155 NFT Certificate..."
      });
    }, 3000);

    setTimeout(() => {
      // Completed transaction state
      const mockHash = "0x" + Math.random().toString(16).substr(2, 40).toUpperCase();
      setTxStatus({
        show: true,
        step: 4,
        message: "Fractional RWA NFT Certificate successfully minted and transferred!",
        hash: mockHash
      });

      // Update balances, portfolios, and ledger states
      const newBalance = (balanceNum - costNum).toFixed(4);
      const updatedWallet: WalletState = {
        ...wallet,
        balance: newBalance
      };
      setWallet(updatedWallet);
      localStorage.setItem("rialo_wallet", JSON.stringify(updatedWallet));

      // Append to transactions log
      const purchaseTx: RwaTransaction = {
        id: "tx_buy_" + Date.now(),
        type: "buy_fraction_nft",
        assetTitle: selectedAsset.title,
        amount: `-${costNum.toFixed(4)} ETH`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hash: mockHash,
        nftTokenId: `RWA-NFT-${selectedAsset.id}`
      };
      setTransactions((prev) => {
        const updated = [purchaseTx, ...prev].slice(0, 10);
        localStorage.setItem("rialo_transactions", JSON.stringify(updated));
        return updated;
      });

      setPurchasedAssetIds((prev) => {
        const next = prev.includes(selectedAsset.id) ? prev : [...prev, selectedAsset.id];
        localStorage.setItem("rialo_purchased_ids", JSON.stringify(next));
        return next;
      });

      addToast(`Minted and received Fractional NFT Deed in ${selectedAsset.title} for ${fractionCostStr} ETH!`, "success");
    }, 4500);
  };

  const handleClaimYield = () => {
    if (!wallet || accruedYield <= 0) return;

    const claimAmount = accruedYield;
    const updatedBalance = (parseFloat(wallet.balance) + claimAmount).toFixed(4);
    
    const updatedWallet: WalletState = {
      ...wallet,
      balance: updatedBalance
    };

    setWallet(updatedWallet);
    localStorage.setItem("rialo_wallet", JSON.stringify(updatedWallet));

    setAccruedYield(0);
    localStorage.setItem("rialo_accrued_yield", "0");

    // Append to transactions log
    const claimTx: RwaTransaction = {
      id: "tx_claim_" + Date.now(),
      type: "claim_yield",
      assetTitle: "Continuous Portfolio Yield Stream",
      amount: `+${claimAmount.toFixed(4)} ETH`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      hash: "0x" + Math.random().toString(16).substr(2, 40).toUpperCase(),
    };
    setTransactions((prev) => {
      const updated = [claimTx, ...prev].slice(0, 10);
      localStorage.setItem("rialo_transactions", JSON.stringify(updated));
      return updated;
    });

    addToast(`Claimed ${claimAmount.toFixed(8)} ETH of accumulated passive yield directly to your wallet!`, "yield");
  };

  const handleCloseTxOverlay = () => {
    setTxStatus(null);
    setSelectedAsset(null);
  };

  // --- DERIVED METRICS ---
  const filteredAssets = useMemo(() => {
    if (categoryFilter === "MyPurchases") {
      return assets.filter((a) => purchasedAssetIds.includes(a.id));
    }
    if (categoryFilter === "all") {
      return assets;
    }
    return assets.filter((a) => a.type === categoryFilter);
  }, [assets, categoryFilter, purchasedAssetIds]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-zinc-800 flex flex-col font-sans selection:bg-zinc-950 selection:text-white pb-16">
      
      {/* Top Navbar */}
      <Navbar
        wallet={wallet}
        connectWallet={connectWallet}
        onOpenCreateAsset={() => setShowCreateAssetModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Content Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow w-full">
        
        {/* Hero banner section */}
        <Hero
          totalVolume={totalVolumeStr}
          totalAssets={totalAssetsCount}
          averageYield={averageYieldPct}
          activeSpvs={activeSpvsCount}
        />

        {/* Portfolio Live Yield Farm Dashboard */}
        <YieldFarm
          purchasedAssetIds={purchasedAssetIds}
          assets={assets}
          accruedYield={accruedYield}
          onClaimYield={handleClaimYield}
          wallet={wallet}
          transactions={transactions}
        />

        {/* Real Address Tracker / On-Chain Multi-chain Explorer */}
        <OnChainExplorer />

        {/* Marketplace Explorer Grid with Left Ledger Sidebar (Direct Tab Integration) */}
        <div className="flex flex-col md:flex-row gap-8 items-start pt-4 pb-12">
          
          {/* Left Tab Panel Sidebar */}
          <LeftMarketplaceSidebar
            wallet={wallet}
            connectWallet={connectWallet}
            transactions={transactions}
            onOpenProfile={() => setShowProfileModal(true)}
            onDisconnect={handleDisconnect}
            accruedYield={accruedYield}
            onClaimYield={handleClaimYield}
          />

          {/* Right Main Listings Area */}
          <div className="flex-grow w-full space-y-6">
            
            {/* Category filtering tab interface */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200/50 pb-5">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Browse Underwritten RWA Collections
                </h4>
              </div>

              {/* Filtering buttons */}
              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer ${
                    categoryFilter === "all"
                      ? "bg-zinc-950 border-zinc-950 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
                >
                  All Assets
                </button>
                <button
                  onClick={() => setCategoryFilter("House")}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === "House"
                      ? "bg-zinc-950 border-zinc-950 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Real Estate</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("Car")}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === "Car"
                      ? "bg-zinc-950 border-zinc-950 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Supercars</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("Other")}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === "Other"
                      ? "bg-zinc-950 border-zinc-950 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
                >
                  <Gem className="w-3.5 h-3.5" />
                  <span>Collectables</span>
                </button>
                <button
                  onClick={() => setCategoryFilter("MyPurchases")}
                  className={`px-3.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    categoryFilter === "MyPurchases"
                      ? "bg-zinc-950 border-zinc-950 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>My Holdings</span>
                </button>
              </div>
            </div>

            {/* Empty listings state */}
            {filteredAssets.length === 0 ? (
              <div className="text-center py-20 bg-white border border-zinc-200/50 rounded-3xl p-6">
                <h3 className="text-base font-bold text-zinc-900 font-serif-luxury">No physical assets listed</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {categoryFilter === "MyPurchases"
                    ? "You don't own any fractional shares yet. Buy some fractions to start accumulating real-time yields!"
                    : "No listings correspond to this selection parameters."}
                </p>
              </div>
            ) : (
              /* Asset listings grid with smooth fade-in and slide-up transitions */
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredAssets.map((asset) => (
                    <motion.div
                      key={asset.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25, 
                        opacity: { duration: 0.25 }
                      }}
                    >
                      <AssetCard
                        asset={asset}
                        onView={setSelectedAsset}
                        isOwned={purchasedAssetIds.includes(asset.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

          </div>
        </div>

      </main>

      {/* --- MODAL DIALOG OVERLAYS --- */}

      {/* 1. Onboarding Identity Creator Overlay */}
      {showOnboarding && (
        <OnboardingOverlay
          onComplete={handleOnboardingComplete}
          wallet={wallet}
          connectWallet={connectWallet}
        />
      )}

      {/* 2. Detailed Asset View Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          wallet={wallet}
          onBuyFraction={handleBuyAssetFraction}
          isOwned={purchasedAssetIds.includes(selectedAsset.id)}
        />
      )}

      {/* 3. Create Asset Multi-step Wizard */}
      {showCreateAssetModal && (
        <CreateAssetModal
          onClose={() => setShowCreateAssetModal(false)}
          onSubmit={handleListNewAsset}
          wallet={wallet}
        />
      )}

      {/* 4. Edit Credentials Profile Modal */}
      {showProfileModal && wallet && (
        <ProfileModal
          wallet={wallet}
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}

      {/* 4. Left Sidebar Wallet & Ledger tab */}
      <LeftWalletSidebar
        wallet={wallet}
        connectWallet={connectWallet}
        transactions={transactions}
        onOpenProfile={() => setShowProfileModal(true)}
        onDisconnect={handleDisconnect}
      />

      {/* Wallet Connection Provider Options (Mobile Optimized) */}
      <ConnectWalletModal
        isOpen={showWalletConnectModal}
        onClose={() => setShowWalletConnectModal(false)}
        onConnectSuccess={handleConnectSuccess}
        addToast={addToast}
      />

      {/* 5. Custom Block Verification Sim Overlay */}
      {txStatus?.show && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-zinc-200/80 w-full max-w-sm p-6 text-center shadow-2xl relative">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center mx-auto mb-4">
              {txStatus.step < 4 ? (
                <Loader className="w-6 h-6 text-zinc-900 animate-spin" />
              ) : (
                <CheckCircle2 className="w-7 h-7 text-emerald-500 animate-bounce" />
              )}
            </div>

            <h3 className="text-base font-bold text-zinc-900 font-serif-luxury">
              {txStatus.step < 4 ? "Executing Sepolia Gateway" : "Fractions Securitized!"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-normal">
              {txStatus.message}
            </p>

            {/* Custom transaction hashing indicator */}
            {txStatus.hash && (
              <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-[9px] text-zinc-400 select-all truncate text-left">
                <span className="block font-bold text-zinc-500 uppercase">TX HASH ID:</span>
                <span className="mt-0.5 block break-all font-semibold text-zinc-700">{txStatus.hash}</span>
              </div>
            )}

            {/* Verification close button */}
            {txStatus.step === 4 && (
              <button
                onClick={handleCloseTxOverlay}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-semibold text-xs py-3 rounded-xl transition cursor-pointer mt-5"
              >
                Inspect Ledger Deed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notification Toast List */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Floating AI Assistant Concierge */}
      <AiChatBubble />

    </div>
  );
}
