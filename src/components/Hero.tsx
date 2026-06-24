import React from "react";
import { Award, ShieldCheck, Sparkles } from "lucide-react";

interface HeroProps {
  totalVolume: string;
  totalAssets: number;
  averageYield: string;
  activeSpvs: number;
}

export default function Hero({ totalVolume, totalAssets, averageYield, activeSpvs }: HeroProps) {
  return (
    <section className="py-12 md:py-16 text-center space-y-5 select-none animate-fade-in shrink-0">
      
      {/* Small badge header specially designed by Ehsan */}
      <div className="inline-flex items-center gap-1.5 text-[10px] text-amber-700 hover:text-amber-800 font-bold uppercase tracking-wider bg-amber-50 hover:bg-amber-100/80 border border-amber-200/65 px-3.5 py-1 rounded-full transition shadow-sm mx-auto">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span>Designed by Ehsan for RIALO</span>
      </div>

      {/* Main headings */}
      <div className="space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-950 font-serif-luxury leading-tight">
          Fractionalize & Secure <br />
          <span className="text-zinc-800">Real World Luxury Assets</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-lg mx-auto font-medium">
          Rialo legal-tech wrapper transforms luxury real-estate, hypercars, and vintage collectables into continuous yield-bearing fractional on-chain deeds.
        </p>
      </div>

      {/* Trust guarantees badge list */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-zinc-400 font-bold font-mono tracking-wider uppercase pt-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Swiss Custody Vaulted</span>
        </span>
        <span className="text-zinc-300 hidden sm:inline">•</span>
        <span className="flex items-center gap-1">
          <Award className="w-4 h-4 text-amber-500" />
          <span>Fully Underwritten Insurance</span>
        </span>
        <span className="text-zinc-300 hidden sm:inline">•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>SEC Certified Corporate SPV</span>
        </span>
      </div>

      {/* Marketplace Statistics Stats Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-zinc-200/50">
        <div className="p-4 bg-white rounded-2xl border border-zinc-200/50 shadow-sm text-center">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-semibold font-mono">Total Volume Minted</span>
          <span className="block text-lg font-bold text-zinc-900 font-serif-luxury mt-0.5">{totalVolume} ETH</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-zinc-200/50 shadow-sm text-center">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-semibold font-mono">Securitized Properties</span>
          <span className="block text-lg font-bold text-zinc-900 font-serif-luxury mt-0.5">{totalAssets} Assets</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-zinc-200/50 shadow-sm text-center">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-semibold font-mono">Average Asset Yield</span>
          <span className="block text-lg font-bold text-emerald-600 font-serif-luxury mt-0.5">{averageYield}% APR</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-zinc-200/50 shadow-sm text-center">
          <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-semibold font-mono">Active Legal SPVs</span>
          <span className="block text-lg font-bold text-zinc-900 font-serif-luxury mt-0.5">{activeSpvs} SPVs</span>
        </div>
      </div>

    </section>
  );
}
