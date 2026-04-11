"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  ChevronLeft,
  Utensils,
  ShoppingBag
} from "lucide-react";
import VendorCard from "@/components/VendorCard";
import VendorFilters from "@/components/VendorFilters";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getVendors } from "@/lib/firestore";

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { cartCount } = useCart();
  const { user } = useAuth();

  React.useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      const data = await getVendors();
      setVendors(data);
      setLoading(false);
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    // Handle tags being an array or a string (safety)
    const tags = Array.isArray(vendor.tags) ? vendor.tags : [];
    const matchesCategory = selectedCategory === "All" || tags.some((t: string) => t.includes(selectedCategory));
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (vendor.location && vendor.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">

      <div className="max-w-7xl mx-auto px-6 pt-32">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block space-y-8 sticky top-32 h-fit">
            <div className="p-8 rounded-[32px] bg-secondary/30 border border-white/5">
              <VendorFilters 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
              />
            </div>
            
            <div className="p-8 rounded-[32px] glass border border-primary/20 bg-primary/5">
              <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider italic">Partner Offer</h4>
              <p className="text-xs text-muted leading-relaxed">
                Join our premium gold membership and get flat 10% off on all monthly subscriptions.
              </p>
              <button className="mt-6 w-full py-3 bg-primary text-white rounded-xl font-bold text-xs shadow-glow">
                Upgrade Now
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-bold mb-2 tracking-tight">Discover <span className="text-gradient">Kitchens</span></h1>
                <p className="text-muted text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Showing kitchens in Patna, Bihar
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by kitchen name or area" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-6 py-4 bg-secondary/30 border border-white/5 rounded-2xl outline-none focus:border-primary/50 transition-all text-sm w-full md:w-80"
                  />
                </div>
              </div>
            </div>

            {/* Category Pills for Mobile */}
            <div className="lg:hidden flex overflow-x-auto gap-2 pb-6 no-scrollbar mb-8">
              {["All", "Pure Veg", "Non-Veg", "Diet Spec", "North Indian"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat
                      ? "bg-primary text-white border-primary shadow-glow"
                      : "bg-white/5 text-muted border-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-[400px] rounded-[32px] bg-secondary/20 animate-pulse" />
                ))}
              </div>
            ) : filteredVendors.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredVendors.map((vendor) => (
                  <VendorCard key={vendor.id} {...vendor} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="text-muted w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">No kitchens found</h3>
                <p className="text-muted text-sm">Try adjusting your filters or search query.</p>
                <button 
                  onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
