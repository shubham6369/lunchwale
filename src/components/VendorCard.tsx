"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorCardProps {
  id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  pricePerLunch: number;
  monthlyPlan: number;
  tags: string[];
  isPopular?: boolean;
  deliveryTime?: string;
}

export default function VendorCard({
  id,
  name,
  image,
  rating,
  location,
  pricePerLunch,
  monthlyPlan,
  tags,
  isPopular,
  deliveryTime = "25-35 min"
}: VendorCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative rounded-[32px] overflow-hidden bg-background border border-white/5 hover:border-primary/20 transition-all hover:shadow-glow"
    >
      <Link href={`/vendors/${id}`}>
        <div className="relative h-64 overflow-hidden">
          <Image 
            src={image} 
            alt={name} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          {isPopular && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-[10px] font-bold uppercase rounded-lg shadow-glow">
              Popular Kitchen
            </div>
          )}
          <div className="absolute bottom-4 right-4 glass px-3 py-1 rounded-lg text-xs font-bold">
            ₹{pricePerLunch} per lunch
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted">
                 <MapPin className="w-3 h-3 text-primary" /> {location}
              </div>
            </div>
            <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-sm font-bold">{rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
              <Clock className="w-3 h-3 text-primary" /> {deliveryTime}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted font-medium">
              <ShieldCheck className="w-3 h-3 text-primary" /> Verified
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-muted border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-6">
            <div>
              <div className="text-[10px] text-muted uppercase font-bold tracking-wider">Starting at</div>
              <div className="text-xl font-bold text-white tracking-tight">
                ₹{monthlyPlan}<span className="text-xs text-muted font-normal">/month</span>
              </div>
            </div>
            <button className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg">
              View Menu
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
