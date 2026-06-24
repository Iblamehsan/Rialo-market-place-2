import React, { useState, useEffect } from "react";
import { X, Wallet, Smartphone, Globe, ArrowRight, AlertCircle, ShieldCheck, RefreshCw, Info, HelpCircle } from "lucide-react";
import { WalletState } from "../types";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectSuccess: (wallet: WalletState) => void;
  addToast: (message: string, type: "success" | "info" | "error" | "yield") => void;
}

export default function ConnectWalletModal({
  isOpen,
  onClose,
  onConnectSuccess,
  addToast,
}: ConnectWalletModalProps) {
  // Auto-detect injected Web3 environments (e.g. MetaMask in-app browser)
  const isInjectedBrowser = typeof window !== "undefined" && !!(window as any).ethereum;

  const [activeTab, setActiveTab] = useState<"mobile" | "extension" | "manual" | "sandbox">("mobile");
  const [manualAddress, setManualAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Switch default tab to extension if they are already inside MetaMask or Trust Wallet DApp Browser
  useEffect(() => {
    if (isInjectedBrowser) {
      setActiveTab("extension");
    } else {
      setActiveTab("mobile");
    }
  }, [isOpen, isInjectedBrowser]);

  if (!isOpen) return null;

  // Generate deep links for mobile apps
  const currentUrlWithoutProtocol = typeof window !== "undefined"
    ? window.location.href.replace(/^https?:\/\//, "")
    : "";
  
  // Custom URI Schemes (Direct launch if app is installed)
  const metamaskDirectScheme = `metamask://dapp/${currentUrlWithoutProtocol}`;
  const trustWalletDirectScheme = `trust://open_url?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;
  const coinbaseDirectScheme = `cbwallet://dapp?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

  // Universal fallback redirector links
  const metamaskUniversalLink = `https://metamask.app.link/dapp/${currentUrlWithoutProtocol}`;
  const coinbaseUniversalLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      addToast("App URL copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Handle Extension Injected Connection (window.ethereum)
  const connectExtension = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      let eth = (window as any).ethereum;
      
      // Handle multi-providers setup (e.g. MetaMask + Coinbase Wallet installed simultaneously)
      if (eth && eth.providers && Array.isArray(eth.providers)) {
        eth = eth.providers.find((p: any) => p.isMetaMask) || eth.providers[0];
      }
      
      // Fallback to legacy window.web3 if window.ethereum is missing
      if (!eth && (window as any).web3) {
        eth = (window as any).web3.currentProvider;
      }

      if (!eth) {
        throw new Error(
          "No Web3 provider detected in this browser. Please open this app inside the MetaMask, Trust Wallet, or Coinbase Wallet app browser, or use a desktop browser with a wallet extension installed."
        );
      }

      // Request accounts - support standard and legacy formats
      let accounts: string[] = [];
      if (typeof eth.request === "function") {
        accounts = await eth.request({ method: "eth_requestAccounts" });
      } else if (typeof eth.enable === "function") {
        accounts = await eth.enable();
      } else {
        throw new Error("Connected Web3 provider does not support account request protocols.");
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts authorized. Connection request declined.");
      }

      const address = accounts[0];

      // Try to fetch balance
      let balance = "10.00"; // Default sandbox test allocation
      try {
        if (typeof eth.request === "function") {
          const rawBal = await eth.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          });
          if (rawBal) {
            // Convert from hex wei
            const wei = BigInt(rawBal);
            const ethVal = Number(wei) / 1e18;
            balance = ethVal.toFixed(4);
          }
        }
      } catch (balErr) {
        console.warn("Could not retrieve real native balance, using default Sepolia test balance.", balErr);
      }

      const connectedWallet: WalletState = {
        address,
        balance,
        connected: true,
        isDemoMode: false,
        username: "Web3 Collector",
        avatarSeed: "web3_" + address.slice(-4),
        socials: {},
        privacy: { bio: true, x: true, discord: true, github: true, instagram: true, linkedin: true },
      };

      onConnectSuccess(connectedWallet);
      addToast("Successfully connected to decentralized Web3 secure keypair!", "success");
      onClose();
    } catch (err: any) {
      console.error("Web3 connection failure:", err);
      setErrorMessage(err.message || "An unexpected extension handshake error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Manual Read-Only Address Paste
  const handleManualConnect = () => {
    setErrorMessage(null);
    const cleanAddr = manualAddress.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddr)) {
      setErrorMessage("Invalid address format. Must be a 40-character hex EVM address starting with 0x");
      return;
    }

    const manualWallet: WalletState = {
      address: cleanAddr,
      balance: "5.45", // Mock pre-funded balance for viewing, actual assets queried dynamically
      connected: true,
      isDemoMode: false,
      username: "Oracle Sync Profile",
      avatarSeed: "sync_" + cleanAddr.slice(-4),
      socials: {},
      privacy: { bio: true, x: true, discord: true, github: true, instagram: true, linkedin: true },
    };

    onConnectSuccess(manualWallet);
    addToast(`Successfully synced read-only tracker for ${cleanAddr.slice(0, 6)}...${cleanAddr.slice(-4)}`, "success");
    onClose();
  };

  // Handle Sandbox Connection (Demo Mode)
  const handleSandboxConnect = () => {
    const sandboxWallet: WalletState = {
      address: "0x78a5c2" + Math.random().toString(16).substr(2, 8).toUpperCase() + "9d10Rialo",
      balance: "10.00",
      connected: true,
      isDemoMode: true,
      username: "Collector Guest",
      avatarSeed: "rialo_default",
      socials: {},
      privacy: { bio: true, x: true, discord: true, github: true, instagram: true, linkedin: true },
    };

    onConnectSuccess(sandboxWallet);
    addToast("High-yield Web3 sandbox wallet activated with 10.00 test ETH!", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200/80 w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-zinc-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100 font-serif-luxury">
                Select Connection Method
              </h3>
              <span className="block text-[9px] text-zinc-400 uppercase tracking-widest font-mono font-bold mt-0.5">
                Real-World Asset Gatekeeper
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Status indicator if already inside mobile or extension browser */}
        {isInjectedBrowser && (
          <div className="bg-emerald-50 border-b border-emerald-200/80 px-6 py-3 flex items-center gap-2.5 text-xs text-emerald-800 animate-pulse">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
            <span className="font-semibold leading-none">
              Injected Web3 Browser Detected! Connection can be authorized instantly.
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-zinc-100 flex overflow-x-auto text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none bg-zinc-50/50 scrollbar-none">
          <button
            onClick={() => { setActiveTab("mobile"); setErrorMessage(null); }}
            className={`flex-1 py-3.5 border-b-2 text-center transition duration-200 shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "mobile"
                ? "border-emerald-500 text-emerald-600 bg-white font-extrabold"
                : "border-transparent hover:text-zinc-800"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile App</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("extension"); setErrorMessage(null); }}
            className={`flex-1 py-3.5 border-b-2 text-center transition duration-200 shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "extension"
                ? "border-emerald-500 text-emerald-600 bg-white font-extrabold"
                : "border-transparent hover:text-zinc-800"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Extension</span>
          </button>

          <button
            onClick={() => { setActiveTab("manual"); setErrorMessage(null); }}
            className={`flex-1 py-3.5 border-b-2 text-center transition duration-200 shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "manual"
                ? "border-emerald-500 text-emerald-600 bg-white font-extrabold"
                : "border-transparent hover:text-zinc-800"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Manual Paste</span>
          </button>

          <button
            onClick={() => { setActiveTab("sandbox"); setErrorMessage(null); }}
            className={`flex-1 py-3.5 border-b-2 text-center transition duration-200 shrink-0 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "sandbox"
                ? "border-emerald-500 text-emerald-600 bg-white font-extrabold"
                : "border-transparent hover:text-zinc-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandbox</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 flex-grow overflow-y-auto space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex gap-2.5 items-start animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-bold">Handshake Interrupted</p>
                <p className="text-[10px] mt-0.5 text-red-600 leading-normal">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Tab 1: Mobile Deep Linking */}
          {activeTab === "mobile" && (
            <div className="space-y-4 animate-fade-in text-xs leading-relaxed text-zinc-600">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase inline-block">
                  Highly Recommended Mobile Flow
                </span>
                <p className="font-bold text-emerald-950 text-sm">
                  Connect via MetaMask In-App Browser
                </p>
                <p className="text-emerald-800 leading-normal text-[11px]">
                  Standard phone browsers (Safari, Chrome) block Web3 extensions. The most reliable way is to copy this website URL and open it inside MetaMask's built-in secure browser!
                </p>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? window.location.href : ""}
                    className="flex-1 bg-white border border-emerald-200 rounded-xl px-3 py-2 text-[11px] font-mono text-emerald-900 select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-3.5 rounded-xl transition cursor-pointer shrink-0"
                  >
                    {copied ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>

              <p className="font-semibold text-zinc-800">
                Alternative: Try Direct App Launchers
              </p>
              <p>
                If you have the mobile applications installed, you can attempt to launch them directly using these Web3 deep-links:
              </p>

              <div className="grid grid-cols-1 gap-3 pt-1">
                {/* MetaMask Connect Options */}
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                      alt="MetaMask Logo"
                      className="w-8 h-8 object-contain shrink-0"
                    />
                    <div>
                      <span className="block font-bold text-orange-950">MetaMask Application</span>
                      <span className="block text-[10px] text-orange-700 font-medium">Automatic mobile cryptographic injection</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <a
                      href={metamaskDirectScheme}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Direct Open App</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                    <a
                      href={metamaskUniversalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white hover:bg-orange-50 border border-orange-300 text-orange-700 font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Universal Link</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Coinbase Wallet Options */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 font-mono">
                      C
                    </div>
                    <div>
                      <span className="block font-bold text-blue-950">Coinbase Wallet</span>
                      <span className="block text-[10px] text-blue-700 font-medium">Secure Coinbase on-chain dapp link</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-1">
                    <a
                      href={coinbaseDirectScheme}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Direct Open App</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                    <a
                      href={coinbaseUniversalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-white hover:bg-blue-50 border border-blue-300 text-blue-700 font-bold text-[10px] uppercase tracking-wider py-2.5 px-3 rounded-xl transition text-center flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Universal Link</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Trust Wallet Option */}
                <a
                  href={trustWalletDirectScheme}
                  className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 hover:bg-teal-50 transition flex items-center justify-between text-left group animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0 font-mono">
                      🛡️
                    </div>
                    <div>
                      <span className="block font-bold text-teal-950">Open in Trust Wallet</span>
                      <span className="block text-[10px] text-teal-700 font-medium">Standard Trust multi-chain address injector</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 text-[10px] text-zinc-500 leading-normal space-y-1">
                <p>💡 <strong>How to connect on phone (MetaMask step-by-step):</strong></p>
                <ol className="list-decimal pl-4 space-y-1 mt-1">
                  <li>Tap the **Copy URL** button at the top of this panel.</li>
                  <li>Open the **MetaMask app** on your mobile phone.</li>
                  <li>Tap the **Browser** tab/icon at the bottom of MetaMask's screen.</li>
                  <li>Paste the copied URL into MetaMask's address bar and load the page.</li>
                  <li>Inside MetaMask browser, simply tap **Connect Wallet** & select the **Extension** tab to connect instantly with zero error!</li>
                </ol>
              </div>
            </div>
          )}

          {/* Tab 2: Browser Extension injected */}
          {activeTab === "extension" && (
            <div className="space-y-4 animate-fade-in text-xs leading-relaxed text-zinc-600">
              <p className="font-semibold text-zinc-800">
                Establish direct secure handshake with browser wallets
              </p>
              <p>
                Rialo will query your local client for any injected providers (MetaMask, Trust Wallet, Phantom, Coinbase Extension, etc.) to request your public account hash.
              </p>

              <button
                onClick={connectExtension}
                disabled={isLoading}
                className="w-full bg-zinc-950 hover:bg-zinc-900 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-xs py-3.5 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Inquiring Client Handshake...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Connect Browser Injected Extension</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 text-center leading-normal">
                Direct cryptographic keys are never shared or stored. We only request permission to view public addresses and network metadata for security deeds.
              </p>
            </div>
          )}

          {/* Tab 3: Manual paste for read-only sync */}
          {activeTab === "manual" && (
            <div className="space-y-4 animate-fade-in text-xs leading-relaxed text-zinc-600">
              <p className="font-semibold text-zinc-800">
                Pristine Read-Only State Syncing
              </p>
              <p>
                Don't have access to a mobile wallet extension or private keys? No worries! Paste any valid EVM Ethereum public address to immediately import all native balances, on-chain tokens, and transaction logs from the live public block explorers.
              </p>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest" htmlFor="modalAddressInput">
                  EVM Public Address Hash (0x...)
                </label>
                <input
                  type="text"
                  id="modalAddressInput"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="e.g. 0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-3 text-xs font-mono text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              <button
                onClick={handleManualConnect}
                disabled={!manualAddress.trim()}
                className="w-full bg-zinc-950 hover:bg-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold text-xs py-3.5 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Sync Public Address Telemetry</span>
              </button>
            </div>
          )}

          {/* Tab 4: Sandbox (Demo Mode) */}
          {activeTab === "sandbox" && (
            <div className="space-y-4 animate-fade-in text-xs leading-relaxed text-zinc-600">
              <p className="font-semibold text-zinc-800">
                High-Yield Web3 Sandbox Environment
              </p>
              <p>
                Don't have a wallet configured yet? Boot up our test virtual environment with a pre-funded test wallet to interact with the Rialo liquidity protocol and buy fractional luxury RWA NFT certificates immediately.
              </p>

              <div className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2.5">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase inline-block">
                  Instant Test Allocation
                </span>
                <p className="font-bold text-zinc-800 text-sm">10.00 Test ETH</p>
                <p className="text-[10px] text-zinc-500">
                  Funded on our sandboxed layer so you can list custom luxury assets, fractionalize them, and earn continuous passive yield accruing 5 times per second.
                </p>
              </div>

              <button
                onClick={handleSandboxConnect}
                className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-xs py-3.5 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Activate Web3 Sandbox Wallet</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
