import React from "react";
import { RwaAsset } from "../types";
import { Home, Car, Gem, MapPin, TrendingUp, Tag, ShieldCheck, AlertTriangle } from "lucide-react";

interface AssetCardProps {
  key?: React.Key;
  asset: RwaAsset;
  onView: (asset: RwaAsset) => void;
  isOwned: boolean;
  onQuickBuy?: (asset: RwaAsset) => void;
}

export default function AssetCard({ asset, onView, isOwned, onQuickBuy }: AssetCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-zinc-200/55 overflow-hidden rialto-shadow-hover flex flex-col justify-between h-full group">
      
      {/* Thumbnail and Category Tag */}
      <div 
        className="relative h-48 w-full overflow-hidden shrink-0 bg-zinc-100 cursor-pointer" 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onView(asset);
        }}
      >
        <img
          src={asset.image}
          alt={asset.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent"></div>
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-zinc-900 border border-zinc-200/50 shadow-sm">
          {asset.type === "House" && <Home className="w-3 h-3 text-zinc-800" />}
          {asset.type === "Car" && <Car className="w-3 h-3 text-zinc-800" />}
          {asset.type === "Other" && <Gem className="w-3 h-3 text-zinc-800" />}
          <span className="uppercase tracking-wider">{asset.type}</span>
        </div>

        {/* APR Yield Pill */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm">
          <TrendingUp className="w-3 h-3 text-white" />
          <span>{asset.yieldApr}% Yield</span>
        </div>

        {/* Owned badge if owned */}
        {isOwned && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-900/95 text-white text-[9px] font-bold px-2 py-1 rounded-lg border border-zinc-700 shadow-lg pulse-soft">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>CERTIFIED OWNER</span>
          </div>
        )}
      </div>

      {asset.isUnverifiedUserListed && (
        <div className="bg-amber-50/80 border-b border-amber-200/50 px-5 py-2 flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 select-none">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>This asset is listed by an unverified user</span>
        </div>
      )}

      {/* Asset Body Content */}
      <div className="p-5 flex-grow flex flex-col justify-between space-y-3.5">
        <div 
          className="space-y-1.5 cursor-pointer" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onView(asset);
          }}
        >
          <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 font-mono uppercase tracking-wide">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{asset.location}</span>
          </div>
          <h3 className="text-base font-bold text-zinc-950 font-serif-luxury leading-tight group-hover:text-zinc-800 transition">
            {asset.title}
          </h3>
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {asset.description}
          </p>
        </div>

        {/* Footer Details */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-semibold font-mono">Securitized Cost</span>
            <span className="text-sm font-bold font-mono text-zinc-900">{asset.price} ETH</span>
          </div>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onView(asset);
            }}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer ${
              isOwned
                ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200"
                : "bg-zinc-950 hover:bg-zinc-900 text-white shadow-sm hover:shadow"
            }`}
          >
            {isOwned ? "View Details" : "View Details"}
          </button>
        </div>
      </div>

    </div>
  );
}
