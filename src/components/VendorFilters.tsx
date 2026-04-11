"use client";

import React from "react";
import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";

const CATEGORIES = [
  "All",
  "Pure Veg",
  "Non-Veg",
  "Diet Spec",
  "North Indian",
  "South Indian",
  "Chinese",
  "Bengali",
  "Homemade"
];

interface VendorFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function VendorFilters({ 
  selectedCategory, 
  onSelectCategory 
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
    </div>
  );
}
