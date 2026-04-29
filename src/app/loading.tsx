"use client";

import { m } from 'framer-motion';
import { Utensils } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <m.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/40 shadow-2xl shadow-primary/20"
        >
          <Utensils className="w-8 h-8 text-primary" />
        </m.div>
        
        {/* Loading ring */}
        <div className="absolute inset-0 -m-2 opacity-50">
          <div className="w-full h-full border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">
          LunchNow
        </p>
        <p className="text-[10px] text-muted font-bold">
          Prepping your delicious meal experience...
        </p>
      </div>

      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <m.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: i * 0.2 
            }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
