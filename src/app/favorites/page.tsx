"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, ArrowLeft, Utensils, Search } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getFavoriteVendors } from "@/lib/firestore";
import VendorCard from "@/components/VendorCard";
import { VendorCardSkeleton } from "@/components/SkeletonLoader";

export default function FavoritesPage() {
  const { user, profile } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const data = await getFavoriteVendors(user.uid);
        setFavorites(data);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, [user, profile?.favorites]); // Reload when profile favorites change

  const filteredFavorites = favorites.filter(v => 
    v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-muted" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Please login to see your favorites</h1>
        <p className="text-muted mb-8 max-w-sm">Save your favorite kitchens to find them easily next time!</p>
        <Link href="/" className="px-8 py-3 bg-primary rounded-2xl font-bold shadow-glow">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/" className="text-muted text-xs font-bold flex items-center gap-2 hover:text-primary transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to Home
            </Link>
            <h1 className="text-5xl font-black italic tracking-tighter">
              YOUR <span className="text-primary">FAVORITES</span>
            </h1>
            <p className="text-muted">Kitchens you love, all in one place.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorites..." 
              className="pl-12 pr-6 py-3 bg-secondary border border-white/5 rounded-2xl outline-none focus:border-primary/50 transition-all text-sm w-full md:w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <VendorCardSkeleton key={i} />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-secondary/30 p-20 rounded-[40px] border border-dashed border-white/10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-muted/30" />
            </div>
            <h3 className="text-xl font-bold text-muted">No favorites yet</h3>
            <p className="text-muted text-sm italic mt-2">Browse kitchens and tap the heart icon to save them here!</p>
            <Link href="/vendors" className="mt-8 px-8 py-3 bg-primary rounded-2xl font-bold text-sm shadow-glow text-black">
              Find Your First Favorite
            </Link>
          </div>
        ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-white">No matches found</h3>
              <p className="text-muted">Try a different search term.</p>
            </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredFavorites.map((vendor) => (
                <VendorCard 
                  key={vendor.id}
                  id={vendor.id}
                  name={vendor.name}
                  image={vendor.image || "/images/hero.png"}
                  rating={vendor.totalReviewCount > 0 ? Number((vendor.totalRatingSum / vendor.totalReviewCount).toFixed(1)) : 0}
                  location={vendor.address || vendor.location || "Local Kitchen"}
                  pricePerLunch={vendor.pricePerLunch || 99}
                  monthlyPlan={vendor.monthlyPlan || 2499}
                  tags={vendor.tags || vendor.cuisines || []}
                  isPopular={vendor.isPopular}
                  deliveryTime={vendor.deliveryTime}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
