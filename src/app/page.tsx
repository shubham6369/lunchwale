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
  Utensils,
  ChefHat
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import LoginDialog from "@/components/LoginDialog";
import { useState, useEffect } from "react";
import { getVendors, getAllDishes } from "@/lib/firestore";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import VendorCard from "@/components/VendorCard";
import DishCard from "@/components/DishCard";
import { VendorCardSkeleton } from "@/components/SkeletonLoader";

const DISH_FILTERS = ["All", "Veg", "Non-Veg"];

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Vendors
  const [vendors, setVendors] = useState<any[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<any[]>([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [loadingVendors, setLoadingVendors] = useState(true);

  // Dishes
  const [dishes, setDishes] = useState<any[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
  const [dishSearch, setDishSearch] = useState("");
  const [dishFilter, setDishFilter] = useState("All");
  const [loadingDishes, setLoadingDishes] = useState(true);

  const { cartCount } = useCart();
  const { user } = useAuth();

  // Fetch vendors and dishes in real-time
  useEffect(() => {
    // 1. Listen to active vendors
    const vendorsQuery = query(
      collection(db, "vendors"),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubVendors = onSnapshot(vendorsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVendors(data);
      setFilteredVendors(data);
      setLoadingVendors(false);
    }, (error) => {
      console.error("Vendors listener error:", error);
      setLoadingVendors(false);
    });

    // 2. Listen to all dishes (using collectionGroup)
    let unsubDishes = () => {};
    import("firebase/firestore").then(({ collectionGroup }) => {
      const dishesGroup = collectionGroup(db, "dishes");
      const dishesQuery = query(
        dishesGroup,
        where("isAvailable", "==", true),
        limit(80)
      );

      unsubDishes = onSnapshot(dishesQuery, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          vendorId: doc.ref.parent.parent?.id || "",
          ...doc.data()
        }));
        setDishes(data);
        setFilteredDishes(data);
        setLoadingDishes(false);
      }, (error) => {
        console.error("Dishes listener error:", error);
        setLoadingDishes(false);
      });
    });

    return () => {
      unsubVendors();
      unsubDishes();
    };
  }, []);

  // Enrich dishes with vendor names once both are loaded
  useEffect(() => {
    if (!vendors.length || !dishes.length) return;
    const vendorMap = Object.fromEntries(vendors.map(v => [v.id, v.name]));
    // Instead of directly mutating the array inside setDishes with the same data,
    // we only update if there's a missing vendorName to avoid infinite loops
    let updated = false;
    const enrichedDishes = dishes.map(d => {
      if (d.vendorName !== vendorMap[d.vendorId] && vendorMap[d.vendorId]) {
        updated = true;
        return { ...d, vendorName: vendorMap[d.vendorId] };
      }
      return d;
    });

    if (updated) {
      setDishes(enrichedDishes);
      // Re-apply current filters
      let result = enrichedDishes;
      if (dishFilter === "Veg") result = result.filter((d: any) => d.isVeg === true);
      if (dishFilter === "Non-Veg") result = result.filter((d: any) => d.isVeg === false);
      if (dishSearch) {
        const q = dishSearch.toLowerCase();
        result = result.filter((d: any) =>
          d.name?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.vendorName?.toLowerCase().includes(q)
        );
      }
      setFilteredDishes(result);
    }
  }, [vendors, dishes, dishFilter, dishSearch]);

  // Filter vendors
  useEffect(() => {
    if (!vendorSearch) {
      setFilteredVendors(vendors);
      return;
    }
    const q = vendorSearch.toLowerCase();
    setFilteredVendors(vendors.filter(v =>
      v.name?.toLowerCase().includes(q) || v.location?.toLowerCase().includes(q)
    ));
  }, [vendorSearch, vendors]);

  // Filter dishes
  useEffect(() => {
    let result = dishes;
    if (dishFilter === "Veg") result = result.filter(d => d.isVeg === true);
    if (dishFilter === "Non-Veg") result = result.filter(d => d.isVeg === false);
    if (dishSearch) {
      const q = dishSearch.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q) ||
        d.vendorName?.toLowerCase().includes(q)
      );
    }
    setFilteredDishes(result);
  }, [dishSearch, dishFilter, dishes]);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">

      {/* ─── Hero Section ────────────────────────────────── */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,87,34,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
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

      {/* ─── All Dishes Section ──────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                <ChefHat className="w-3 h-3" />
                Fresh From Our Kitchens
              </div>
              <h2 className="text-4xl font-bold text-white">
                All <span className="text-primary">Dishes</span>
              </h2>
              <p className="text-muted mt-2 text-sm">
                {loadingDishes ? "Loading..." : `${filteredDishes.length} dishes available right now`}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Veg filter pills */}
              <div className="flex gap-2">
                {DISH_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setDishFilter(f)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap",
                      dishFilter === f
                        ? "bg-primary text-black border-primary"
                        : "bg-white/5 text-muted border-white/10 hover:border-white/20"
                    )}
                  >
                    {f === "Veg" && <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" />}
                    {f === "Non-Veg" && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5" />}
                    {f}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={dishSearch}
                  onChange={e => setDishSearch(e.target.value)}
                  placeholder="Search dishes..."
                  className="pl-11 pr-5 py-2.5 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary/50 transition-all text-sm w-52 text-white"
                />
              </div>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {loadingDishes ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-secondary/30 border border-white/5 rounded-[28px] overflow-hidden animate-pulse">
                  <div className="h-44 bg-white/5" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredDishes.length > 0 ? (
              filteredDishes.map((dish: any) => (
                <DishCard
                  key={`${dish.vendorId}-${dish.id}`}
                  id={dish.id}
                  vendorId={dish.vendorId}
                  name={dish.name}
                  price={dish.price}
                  image={dish.image}
                  category={dish.category}
                  isVeg={dish.isVeg}
                  vendorName={dish.vendorName}
                  isAvailable={dish.isAvailable !== false}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Utensils className="w-12 h-12 text-muted mx-auto mb-4 opacity-30" />
                <h3 className="text-xl font-bold mb-2 text-white">No dishes found</h3>
                <p className="text-muted text-sm">
                  {dishSearch ? "Try a different search term." : "No dishes available right now. Check back soon!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Featured Kitchens Section ───────────────────── */}
      <section id="menu" className="py-24 px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                Featured <span className="text-primary">Kitchens</span>
              </h2>
              <p className="text-muted text-sm">Browse verified home kitchens near you</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="text" 
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Search kitchens or locations..." 
                className="pl-12 pr-6 py-3 bg-background border border-white/10 rounded-xl outline-none focus:border-primary/50 transition-all text-sm w-64 text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingVendors ? (
              [1, 2, 3].map(i => <VendorCardSkeleton key={i} />)
            ) : filteredVendors.length > 0 ? (
              filteredVendors.map((vendor: any) => (
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
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-xl font-bold mb-2 text-white">No kitchens found</h3>
                <p className="text-muted">Try a different search or check back soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </main>
  );
}
