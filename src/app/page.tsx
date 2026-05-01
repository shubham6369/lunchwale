"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { m } from "framer-motion";
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
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentChange
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import DishCard from "@/components/DishCard";

const DISH_FILTERS = ["All", "Veg", "Non-Veg"];
const PRICE_FILTERS = ["All", "Under ₹100", "₹100 - ₹200", "₹200+"];

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Vendors
  const [vendors, setVendors] = useState<any[]>([]);

  // Dishes
  const [dishes, setDishes] = useState<any[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<any[]>([]);
  const [dishSearch, setDishSearch] = useState("");
  const [dishFilter, setDishFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [loadingDishes, setLoadingDishes] = useState(true);

  // Live Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [latestActivity, setLatestActivity] = useState<string | null>(null);

  const { cartCount } = useCart();
  const { user } = useAuth();

  // Fetch vendors, dishes, and live stats in real-time
  useEffect(() => {
    // 1. Listen to all vendors — filter client-side to avoid missing index errors
    const vendorsQuery = query(collection(db, "vendors"));

    const unsubVendors = onSnapshot(vendorsQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const data = snapshot.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() }))
        .filter((v: any) => !v.status || v.status === "active"); // show all if no status field
      setVendors(data);
    }, (error: Error) => {
      console.error("Vendors listener error:", error);
    });

    // 2. Listen to all dishes (using collectionGroup) — filter client-side to avoid missing index errors
    let unsubDishes = () => {};
    import("firebase/firestore").then(({ collectionGroup }) => {
      const dishesQuery = query(collectionGroup(db, 'dishes'));

      unsubDishes = onSnapshot(dishesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs
          .map((doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            vendorId: doc.ref.parent.parent?.id || "",
            ...doc.data()
          }))
          .filter((d: any) => d.isAvailable !== false); // client-side filter
          
        setDishes(data);
        setFilteredDishes(data);
        setLoadingDishes(false);
      }, (error: Error) => {
        console.error("Dishes listener error:", error);
        setLoadingDishes(false);
      });
    });

    // 3. Listen to Live User Count (Users collection is typically smaller)
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot: QuerySnapshot<DocumentData>) => {
      setTotalUsers(snapshot.size);
    });

    // 4. Live Orders and Recent Activity (Optimized)
    let isInitialLoad = true;
    
    // Get initial total count once
    import("firebase/firestore").then(({ getCountFromServer }) => {
      getCountFromServer(collection(db, "orders")).then((snap) => {
        setTotalOrders(Number(snap.data().count));
      });
    });

    // Listen for NEW orders only for activity notification and count increments
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(1));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }

      // Handle new activity notification and increment total
      snapshot.docChanges().forEach((change: DocumentChange<DocumentData>) => {
        if (change.type === "added") {
          const order = change.doc.data();
          setTotalOrders((prev: number) => prev + 1); // Increment count locally
          
          if (order.vendorName) {
            setLatestActivity(`Someone just ordered from ${order.vendorName}!`);
            setTimeout(() => setLatestActivity(null), 5000);
          }
        }
      });
    });

    return () => {
      unsubVendors();
      unsubDishes();
      unsubUsers();
      unsubOrders();
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
      
      // Apply Price Filter
      if (priceFilter === "Under ₹100") result = result.filter((d: any) => d.price < 100);
      else if (priceFilter === "₹100 - ₹200") result = result.filter((d: any) => d.price >= 100 && d.price <= 200);
      else if (priceFilter === "₹200+") result = result.filter((d: any) => d.price > 200);

      setFilteredDishes(result);
    }
  }, [vendors, dishes, dishFilter, dishSearch, priceFilter]);


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

    // Apply Price Filter
    if (priceFilter === "Under ₹100") result = result.filter(d => d.price < 100);
    else if (priceFilter === "₹100 - ₹200") result = result.filter(d => d.price >= 100 && d.price <= 200);
    else if (priceFilter === "₹200+") result = result.filter(d => d.price > 200);

    setFilteredDishes(result);
  }, [dishSearch, dishFilter, dishes, priceFilter]);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">

      {/* ─── Hero Section ────────────────────────────────── */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,87,34,0.08)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <m.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex flex-wrap items-center gap-4 animate-fade-in mb-6">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                <Star className="w-3 h-3 fill-current" />
                Trusted by {totalUsers > 0 ? totalUsers.toLocaleString() : "..."}+ Daily Users
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {totalOrders > 0 ? totalOrders.toLocaleString() : "..."}+ Orders Served
              </div>
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
          </m.div>

          <m.div 
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
            
            <m.div 
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
            </m.div>

            <m.div 
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
            </m.div>
          </m.div>
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
                      "px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border whitespace-nowrap active:scale-95",
                      dishFilter === f
                        ? "bg-linear-to-r from-primary to-orange-600 text-white border-transparent shadow-[0_8px_20px_-5px_rgba(249,115,22,0.4)]"
                        : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
                    {f === "Veg" && <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                    {f === "Non-Veg" && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                    {f}
                  </button>
                ))}
              </div>

              {/* Price filter pills */}
              <div className="flex gap-2">
                {PRICE_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setPriceFilter(f)}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border whitespace-nowrap active:scale-95",
                      priceFilter === f
                        ? "bg-linear-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-[0_8px_20px_-5px_rgba(16,185,129,0.4)]"
                        : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:border-white/10"
                    )}
                  >
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDishSearch(e.target.value)}
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


      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Live Activity Notification */}
      {latestActivity && (
        <div className="fixed bottom-24 left-6 z-50 animate-slide-up">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-sm group hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">
              🔥
            </div>
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-widest text-orange-400 font-bold mb-0.5">Live Activity</p>
              <p className="text-xs text-white font-medium leading-tight">
                {latestActivity}
              </p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          </div>
        </div>
      )}
    </main>
  );
}
