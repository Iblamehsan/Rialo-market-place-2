export interface RwaAsset {
  id: number;
  title: string;
  type: "House" | "Car" | "Other";
  price: string; // in ETH
  image: string;
  owner: string;
  location: string;
  specs: string;
  description: string;
  yieldApr: number; // e.g., 8.4 for 8.4%
  isDefault?: boolean;
  isUnverifiedUserListed?: boolean;
}

export interface WalletState {
  address: string;
  balance: string; // in ETH
  connected: boolean;
  isDemoMode: boolean;
  username: string;
  avatarSeed: string; // fallback generator seed
  socials: {
    x?: string;
    discord?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
  };
  privacy: {
    bio: boolean;
    x: boolean;
    discord: boolean;
    github: boolean;
    instagram: boolean;
    linkedin: boolean;
  };
  bio?: string;
}

export interface AiValuationReport {
  marketAnalysis: string;
  riskRating: {
    grade: string; // e.g. AAA, B+
    score: number; // 1-100
    custodyRisk: string;
    legalStatus: string;
    degradationRisk: string;
  };
  yieldAnalysis: {
    annualRoiEstimate: string;
    payoutFrequency: string;
    stabilityScore: string;
    assessment: string;
  };
  recommendation: {
    verdict: string;
    minHoldingPeriod: string;
    pros: string[];
    cons: string[];
  };
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "info" | "error" | "yield";
}

export interface RwaTransaction {
  id: string;
  type: "mint_asset" | "buy_fraction_nft" | "claim_yield";
  assetTitle?: string;
  amount: string;
  timestamp: string;
  hash: string;
  nftTokenId?: string;
}
