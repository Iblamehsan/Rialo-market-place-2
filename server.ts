import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client with graceful failure if API key is not configured
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it via the Secrets panel in AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Gemini-powered Real World Asset Smart Valuation Analyst Route
app.post("/api/analyze-asset", async (req, res) => {
  try {
    const { title, type, price, location, specs, description } = req.body;

    if (!title || !type || !price) {
      return res.status(400).json({ error: "Missing required fields (title, type, price)" });
    }

    const ai = getGeminiClient();

    const prompt = `You are the lead Real-World Asset (RWA) compliance officer and financial valuation officer for Rialo, a luxury, high-fidelity Web3 securitization platform.
    Analyze the following asset details and generate an institutional-grade investment analysis report.
    
    Asset Title: ${title}
    Asset Category: ${type}
    Listed Price: ${price} ETH
    Physical Location / Storage: ${location || "Unspecified"}
    Specifications / Metrics: ${specs || "Unspecified"}
    Description: ${description || "No description provided."}

    Analyze the asset across these four dimensions:
    1. MARKET COMPARABLES (How the listing price compares to physical asset equivalents).
    2. RISK RATING (Liquidity, custodial, legal structure, and physical degradation risk). Specify a grade from AAA (extremely low risk) to C (speculative/high risk).
    3. YIELD VIABILITY & STABILITY (Analyze the projected leasing, renting, or chartering returns mentioned, or estimate a realistic range based on typical market returns).
    4. STRATEGIC RECOMMENDATION (A professional verdict for fractional collectors vs. whole buyers).

    Generate the report in a highly structured JSON format that matches the required schema exactly. Avoid conversational fillers outside the JSON structure. Use clear, realistic metrics and values.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketAnalysis: {
              type: Type.STRING,
              description: "Detailed description of physical comps and how the listing price of " + price + " ETH aligns with fair market value."
            },
            riskRating: {
              type: Type.OBJECT,
              properties: {
                grade: { type: Type.STRING, description: "Risk Grade (e.g. AAA, AA, A, BBB, BB, B, C)" },
                score: { type: Type.INTEGER, description: "Numeric score from 1 (poor) to 100 (flawless)" },
                custodyRisk: { type: Type.STRING, description: "Custodial and vault storage risk assessment" },
                legalStatus: { type: Type.STRING, description: "Regulatory, ownership trust wrapper status" },
                degradationRisk: { type: Type.STRING, description: "Physical wear and tear / logistics risk" }
              },
              required: ["grade", "score", "custodyRisk", "legalStatus", "degradationRisk"]
            },
            yieldAnalysis: {
              type: Type.OBJECT,
              properties: {
                annualRoiEstimate: { type: Type.STRING, description: "Projected annual percentage return range (e.g., 7.5% - 8.2%)" },
                payoutFrequency: { type: Type.STRING, description: "Payout frequency (e.g., Daily continuous, monthly distributions)" },
                stabilityScore: { type: Type.STRING, description: "Stability of income streams (e.g., High (backed by triple-net lease))" },
                assessment: { type: Type.STRING, description: "Detailed narrative analysis of yield sources" }
              },
              required: ["annualRoiEstimate", "payoutFrequency", "stabilityScore", "assessment"]
            },
            recommendation: {
              type: Type.OBJECT,
              properties: {
                verdict: { type: Type.STRING, description: "A simple one-sentence verdict (e.g., Strongly Recommend for Fractional Yield Portfolios)" },
                minHoldingPeriod: { type: Type.STRING, description: "Recommended duration to hold the asset shares" },
                pros: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of 3 distinct positive features of this RWA"
                },
                cons: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of 2 potential warnings/concerns for collectors"
                }
              },
              required: ["verdict", "minHoldingPeriod", "pros", "cons"]
            }
          },
          required: ["marketAnalysis", "riskRating", "yieldAnalysis", "recommendation"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No response received from Gemini.");
    }

    const reportData = JSON.parse(reportText.trim());
    return res.json(reportData);
  } catch (error: any) {
    console.error("Gemini Asset Analysis Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during asset analysis."
    });
  }
});

// Gemini-powered Q&A Assistant Route for the Rialo Platform
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message query parameter" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return highly structured, high-fidelity mock chat responses for a pristine guest experience
      const lowerQuery = message.toLowerCase();
      let reply = "";

      if (lowerQuery.includes("yield") || lowerQuery.includes("apr") || lowerQuery.includes("accrue") || lowerQuery.includes("percent") || lowerQuery.includes("interest") || lowerQuery.includes("passive")) {
        reply = `### Rialo Continuous Yield Mechanics 📈

In Rialo, all fractional real-world assets generate **real-time compound yield** backed by actual legal lease contracts, rental yields, or charter booking revenues.

**Key features of our yield engine:**
*   **Accrual Frequency:** Dividends accrue in real-time and stream directly to your wallet **5 times per second**.
*   **Average APR:** The current average yield across all securitized luxury assets on our platform is **8.94% APR** or higher.
*   **Claiming:** You can claim your accumulated yield in a single click directly via the **Ledger Sidebar** or the **Yield Farm** dashboard.

You can purchase fractional shares in any luxury property, supercar, or collectable to immediately kickstart your real-time passive yield stream!`;
      } else if (lowerQuery.includes("nft") || lowerQuery.includes("certificate") || lowerQuery.includes("deed") || lowerQuery.includes("contract") || lowerQuery.includes("token") || lowerQuery.includes("erc")) {
        reply = `### Certified NFT Ownership & Proportional Deeds 📜

Every fraction listed on Rialo is structurally tied to a **certified on-chain ERC-1155 NFT Certificate**.

**How the legal-tech wrapper secures your investment:**
1.  **SPV Structuring:** Each asset is wholly owned by a dedicated, SEC-certified Swiss Corporate Special Purpose Vehicle (SPV).
2.  **Fractionalization:** The SPV issues on-chain digital deeds. When you purchase a fraction, you acquire a direct, legally underwritten proportionate equity share.
3.  **Physical Custody:** All physical assets are stored in ultra-secure climate-controlled custody vaults in Switzerland or managed by premier luxury caretakers, insured by global underwriters.`;
      } else if (lowerQuery.includes("unverified") || lowerQuery.includes("scam") || lowerQuery.includes("warning") || lowerQuery.includes("caution") || lowerQuery.includes("safety") || lowerQuery.includes("unverified listing")) {
        reply = `### Security, Verification & Compliance 🛡️

Rialo is a permissionless Web3 protocol, meaning anyone can mint and list real-world assets for fractionalization. However, we take compliance and security extremely seriously:

*   **Verified Institutional Listings:** Handled directly by certified luxury SPVs under professional brokerage supervision.
*   **Unverified User Listings:** Display a prominent warning tag: *"This asset is listed by an unverified user."*
*   **Investor Protection:** To acquire fractions of unverified listings, investors must read and acknowledge a **Safety Disclosure and Compliance Consent** popup. We strongly recommend doing your own research (DYOR) on these listings!`;
      } else if (lowerQuery.includes("wallet") || lowerQuery.includes("metamask") || lowerQuery.includes("connect") || lowerQuery.includes("balance") || lowerQuery.includes("address") || lowerQuery.includes("sepolia")) {
        reply = `### Wallet Connections & Sandboxed Testing 💳

Rialo supports multiple highly secure decentralized connection methods:

1.  **Web3 Browser Injected (MetaMask, Trust, Coinbase):** Enables standard connection on desktop or in-app dApp browsers.
2.  **Mobile Universal Deep-Linking:** Generates automated redirect strings to launch MetaMask or Coinbase Wallet apps on your phone.
3.  **Manual Read-Only Tracking:** Paste any valid public Ethereum address to synchronize native ledger balances and view their holdings.
4.  **Virtual Sandbox Mode:** Activates an instant test wallet pre-funded with **10.00 sandbox ETH** so you can test buying, selling, and yield accrual with zero risk.`;
      } else if (lowerQuery.includes("volume") || lowerQuery.includes("mint") || lowerQuery.includes("stats") || lowerQuery.includes("count")) {
        reply = `### Dynamic Marketplace Statistics 📊

Rialo calculates protocol volume, listed properties, and active Special Purpose Vehicles (SPVs) in real-time:

*   **Total Volume Minted:** Tracks the aggregate value of underwritten luxury deeds and active fractional transactions, commencing with a baseline of **8,432.50 ETH** and expanding dynamically with every minted asset or fractional acquisition!
*   **Securitized Properties:** We have listed dozens of premium physical assets, with more being listed continuously by users.
*   **Average Platform Yield:** Dynamically computed from the active average of all listed assets' APRs.
*   **Active Corporate SPVs:** Tracks the total unique legal syndicates holding custody of underwritten assets.`;
      } else {
        reply = `### Welcome to Rialo AI Concierge! 👋

I am your dedicated **Rialo Q&A Companion**, guiding you through the first real-world legal asset securitization and fractionalization marketplace on Web3!

**Here is what you can ask me about:**
*   **"How does the passive yield work?"** to learn about our real-time 5x/sec continuous streaming yield.
*   **"What are unverified listings?"** to understand user listing compliance and safety warnings.
*   **"How do I connect MetaMask on my phone?"** to get the step-by-step mobile deep-linking guide.
*   **"Tell me about NFT deeds."** to learn how fractional shares are certified on-chain via ERC-1155.

*Note: I am currently running in high-fidelity sandbox companion mode because the Gemini API key is offline, but I can answer all structural and functional questions about the Rialo platform perfectly!*`;
      }

      return res.json({ reply });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are the Rialo AI Concierge, a brilliant, professional, and knowledgeable digital host for Rialo, the ultimate fractionalized Real-World Asset (RWA) investment protocol.
Your job is to answer questions about Rialo, dApps, Web3, luxury tokenization, NFT-backed deeds, passive yield generation, sandbox wallets, and unverified user listings.

Keep your tone helpful, sleek, professional, and highly trustworthy. Keep responses concise, clear, and formatted in elegant Markdown.

Key platform features you should refer to when asked:
1. WHAT IS RIALO: A Web3 investment protocol that securitizes real-world physical masterpieces (luxury real estate, classic vintage cars, fine jewelry, rare arts) into fractional liquid tokens.
2. NFT INTEGRATION: When users purchase fractions of any RWA, they don't just get a ledger entry. They receive a certified, fractionalized ERC-1155 NFT Certificate directly to their wallet representing clear on-chain ownership, trust deeds, and legal shares.
3. UNVERIFIED USER LISTINGS: Anyone can list a physical asset on Rialo! However, first-time listings by unverified users carry a prominent warning label: "This asset is listed by an unverified user. Be aware of scams." Users must click through a safety disclosure and caution modal when purchasing fractions of these assets for the first time.
4. PORTFOLIO & TRANSACTIONS: Users can see their precise test ETH sandbox balance and their last 10 transaction logs (yield claims, list mints, and purchase receipts) directly under the real-time Yield Farm dashboard.
5. CONTINUOUS PASSSIVE YIELD: All owned fractions generate real-time fluid yield distributions that accrue continuously in the wallet 5 times per second. This yield is backed by real rent, chartering, or leasing payments.

Answer the user's question directly, clearly, and concisely.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I apologize, I was unable to formulate a response at this time. Please try asking again.";
    return res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during chat processing."
    });
  }
});

// Helper for safe BigInt-like decimals formatting
function formatWei(weiStr: string, decimals: number = 18): string {
  if (!weiStr || weiStr === "0") return "0";
  try {
    const cleanWei = weiStr.split(".")[0]; // remove any decimals in case string contains floats
    const len = cleanWei.length;
    if (len <= decimals) {
      const zeroes = "0".repeat(decimals - len);
      return ("0." + zeroes + cleanWei).replace(/0+$/, "").replace(/\.$/, "");
    }
    const intPart = cleanWei.substring(0, len - decimals);
    const fracPart = cleanWei.substring(len - decimals).replace(/0+$/, "");
    return fracPart ? `${intPart}.${fracPart}` : intPart;
  } catch (e) {
    return "0";
  }
}

// Multi-Chain Explorer Proxy Endpoint
app.get("/api/onchain-explorer", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Missing address query parameter" });
    }

    // Validate EVM address format
    const cleanAddress = address.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      return res.status(400).json({ error: "Invalid EVM Ethereum address format" });
    }

    const NETWORKS = [
      { id: "eth", name: "Ethereum", base: "https://eth.blockscout.com/api/v2", coin: "ETH" },
      { id: "polygon", name: "Polygon", base: "https://polygon.blockscout.com/api/v2", coin: "POL" },
      { id: "arbitrum", name: "Arbitrum", base: "https://arbitrum.blockscout.com/api/v2", coin: "ETH" },
      { id: "optimism", name: "Optimism", base: "https://optimism.blockscout.com/api/v2", coin: "ETH" },
      { id: "base", name: "Base", base: "https://base.blockscout.com/api/v2", coin: "ETH" }
    ];

    const results = await Promise.allSettled(
      NETWORKS.map(async (net) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout per request to keep it snappy

        try {
          // 1. Fetch balance & address info
          const addrRes = await fetch(`${net.base}/addresses/${cleanAddress}`, { signal: controller.signal });
          const addrData = addrRes.ok ? await addrRes.json() : null;

          // 2. Fetch tokens
          const tokensRes = await fetch(`${net.base}/addresses/${cleanAddress}/tokens`, { signal: controller.signal });
          const tokensData = tokensRes.ok ? await tokensRes.json() : null;

          // 3. Fetch transactions
          const txsRes = await fetch(`${net.base}/addresses/${cleanAddress}/transactions?limit=10`, { signal: controller.signal });
          const txsData = txsRes.ok ? await txsRes.json() : null;

          clearTimeout(timeoutId);

          // Format balance
          const rawBal = addrData?.coin_balance || "0";
          const formattedBal = formatWei(rawBal);

          // Format tokens
          const formattedTokens = (tokensData?.items || []).map((item: any) => {
            const dec = parseInt(item.token?.decimals || "18", 10);
            return {
              name: item.token?.name || "Unknown Token",
              symbol: item.token?.symbol || "TOK",
              type: item.token?.type || "ERC-20",
              balance: formatWei(item.value || "0", dec),
              address: item.token?.address || "",
              icon: item.token?.icon_url || null,
              tokenId: item.token_instance?.id || item.id || null
            };
          }).filter((t: any) => parseFloat(t.balance) > 0 || t.tokenId);

          // Format transactions
          const formattedTxs = (txsData?.items || []).map((item: any) => ({
            chain: net.name,
            hash: item.hash,
            timestamp: item.timestamp,
            value: formatWei(item.value || "0"),
            fee: item.fee?.value ? formatWei(item.fee.value) : "0",
            to: item.to?.hash || "",
            from: item.from?.hash || "",
            status: item.status || (item.result === "success" ? "ok" : "error"),
            type: item.type || "transfer"
          }));

          return {
            chainId: net.id,
            chainName: net.name,
            coin: net.coin,
            balance: formattedBal,
            ens: addrData?.ens_domain_name || null,
            tokens: formattedTokens,
            transactions: formattedTxs
          };
        } catch (err) {
          clearTimeout(timeoutId);
          return {
            chainId: net.id,
            chainName: net.name,
            coin: net.coin,
            balance: "0",
            tokens: [],
            transactions: [],
            error: true
          };
        }
      })
    );

    // Merge and extract results
    const responseData = {
      address: cleanAddress,
      balances: [] as any[],
      assets: [] as any[],
      transactions: [] as any[]
    };

    results.forEach((res) => {
      if (res.status === "fulfilled") {
        const val = res.value;
        responseData.balances.push({
          chain: val.chainName,
          balance: val.balance,
          coin: val.coin,
          ens: val.ens
        });

        val.tokens.forEach((t: any) => {
          responseData.assets.push({
            chain: val.chainName,
            ...t
          });
        });

        val.transactions.forEach((tx: any) => {
          responseData.transactions.push(tx);
        });
      }
    });

    // Sort combined transactions by timestamp (latest first)
    responseData.transactions.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    // Slice to top 20 latest transactions total
    responseData.transactions = responseData.transactions.slice(0, 20);

    return res.json(responseData);
  } catch (error: any) {
    console.error("Multi-Chain Explorer error:", error);
    return res.status(500).json({ error: error.message || "Failed to process onchain telemetry request" });
  }
});

// Setup Vite Dev server / static production build middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
