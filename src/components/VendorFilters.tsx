"use client";

import React from "react";
import { Filter, X, Star } from "lucide-react";

import { CATEGORIES } from "@/lib/constants";

interface VendorFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  minRating: number;
  onSelectRating: (rating: number) => void;
  isPureVeg: boolean;
  onTogglePureVeg: (val: boolean) => void;
}

export default function VendorFilters({ 
  selectedCategory, 
  onSelectCategory,
  minRating,
  onSelectRating,
  isPureVeg,
  onTogglePureVeg
}: VendorFiltersProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm uppercase tracking-wider">Filters</span>
        </div>
        {selectedCategory !== "All" && (
          <button 
            onClick={() => onSelectCategory("All")}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              selectedCategory === category
                ? "bg-primary text-white border-primary shadow-glow scale-105"
                : "bg-white/5 text-muted border-white/10 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Price Range</h4>
        <div className="flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="5000" 
            className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer" 
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-muted">
          <span>₹0</span>
          <span>₹5000+</span>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Dietary</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={isPureVeg} 
              onChange={(e) => onTogglePureVeg(e.target.checked)}
              className="sr-only" 
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${isPureVeg ? 'bg-green-500' : 'bg-white/10'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPureVeg ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
          <span className="text-sm font-semibold group-hover:text-white transition-colors">Pure Veg Only</span>
        </label>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Rating</h4>
        <div className="flex flex-wrap gap-2">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() => onSelectRating(minRating === rating ? 0 : rating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1 ${
                minRating === rating
                  ? "bg-primary text-white border-primary shadow-glow"
                  : "bg-white/5 text-muted border-white/10 hover:border-white/20"
              }`}
            >
              {rating}+ <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
