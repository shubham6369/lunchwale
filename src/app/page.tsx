"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Clock, 
  ShieldCheck, 
  MessageCircle,
  Search,
  MapPin,
  Utensils
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import LoginDialog from "@/components/LoginDialog";
import { useState, useEffect } from "react";
import { getVendors } from "@/lib/firestore";
import VendorCard from "@/components/VendorCard";
import { VendorCardSkeleton } from "@/components/SkeletonLoader";
import { CATEGORIES } from "@/lib/constants";

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchVendors = async () => {
      const data = await getVendors();
      setVendors(data);
      setFilteredVendors(data);
      setLoading(false);
    };
    fetchVendors();
  }, []);

  useEffect(() => {
    let result = vendors;

    if (activeCategory !== "All") {
      result = result.filter(v => v.tags?.includes(activeCategory));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.location.toLowerCase().includes(q)
      );
    }

    setFilteredVendors(result);
  }, [searchQuery, activeCategory, vendors]);
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,87,34,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Star className="w-3 h-3 fill-current" />
              Trusted by 5000+ Daily Users
            </div>
            <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-8">
              Ghar Jaisa <br />
              <span className="text-gradient">Khana</span>, Everyday.
            </h1>
            <p className="text-lg text-muted max-w-lg mb-10 leading-relaxed">
              Experience the warmth of home-cooked meals delivered from local kitchens. 
              Authentic taste, healthy ingredients, and zero compromises.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/vendors" className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-2xl font-bold flex items-center gap-2 transition-all group">
                Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center gap-2 transition-all">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Order on WhatsApp
              </button>
            </div>

            <div className="flex items-center gap-8 border-t border-white/5 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-white">Fast Delivery</div>
                  <div className="text-xs text-muted">In 20-30 mins</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-white">Hygiene First</div>
                  <div className="text-xs text-muted">Verified Kitchens</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden border border-white/10 shadow-premium">
              <Image 
                src="/images/hero.png" 
                alt="Gourmet Lunch Bowl" 
                width={800} 
                height={800}
                className="w-full h-auto"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
            </div>
            
            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 glass p-6 rounded-3xl shadow-premium z-20 border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Star className="text-primary w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="text-xs text-muted">Average Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 glass-morphism p-6 rounded-3xl shadow-premium z-20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#25D366]/20 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="text-[#25D366] w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="font-bold">Fast Support</div>
                  <div className="text-xs text-muted">via WhatsApp</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Menu / Filter Section */}
      <section id="menu" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-4">Today&apos;s <span className="text-primary">Daily Thali</span></h2>
              <div className="flex gap-4 mb-4 overflow-x-auto pb-2 no-scrollbar">
                {["All", "Veg", "Non-Veg", "Popular", "Budget"].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                      activeCategory === cat 
                        ? "bg-primary text-black border-primary" 
                        : "bg-white/5 text-muted border-white/10 hover:border-white/20"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search kitchens or locations..." 
                  className="pl-12 pr-6 py-3 bg-background border border-white/10 rounded-xl outline-none focus:border-primary/50 transition-all text-sm w-64"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <VendorCardSkeleton key={i} />
              ))
            ) : filteredVendors.length > 0 ? (
              filteredVendors.map((vendor: any) => (
                <VendorCard 
                  key={vendor.id}
                  id={vendor.id}
                  name={vendor.name}
                  image={vendor.image || "/images/hero.png"}
                  rating={vendor.totalReviewCount > 0 ? (vendor.totalRatingSum / vendor.totalReviewCount).toFixed(1) : "New"}
                  location={vendor.location}
                  pricePerLunch={vendor.pricePerLunch}
                  monthlyPlan={vendor.monthlyPlan}
                  tags={vendor.tags || []}
                  isPopular={vendor.isPopular}
                  deliveryTime={vendor.deliveryTime}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold mb-2">No kitchens found</h3>
                <p className="text-muted">Try a different search or category.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      </main>
  );
}
