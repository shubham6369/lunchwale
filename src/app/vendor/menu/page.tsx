"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon,
  Check,
  X,
  Eye,
  Utensils
} from "lucide-react";
import Image from "next/image";

const INITIAL_MENU = [
  { id: "veg-thali", name: "Premium Veg Thali", price: 80, category: "Daily Special", status: "active", image: "/images/hero.png" },
  { id: "special-thali", name: "Executive Special Thali", price: 120, category: "Daily Special", status: "active", image: "/images/pasta.png" },
  { id: "monthly-veg", name: "Monthly Economy Plan", price: 2000, category: "Subscription", status: "active", image: "/images/hero.png" },
];

export default function VendorMenuPage() {
  const [menu, setMenu] = useState(INITIAL_MENU);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Kitchen Menu</h2>
          <p className="text-muted text-sm mt-1">Manage your thalis and subscription plans</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search items..."
              className="pl-11 pr-6 py-3 bg-secondary border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary/50 transition-all w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-glow hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </button>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="flex gap-4">
         {["All Items", "Daily Thali", "Subscriptions", "Extras"].map((cat) => (
           <button key={cat} className="px-5 py-2 rounded-full border border-white/5 bg-secondary text-xs font-bold text-muted hover:text-white transition-all">
             {cat}
           </button>
         ))}
      </div>

      {/* Menu List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredMenu.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-secondary p-4 rounded-[32px] border border-white/5 group hover:border-primary/20 transition-all flex flex-col md:flex-row items-center gap-6"
            >
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-premium bg-black shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold">{item.name}</h4>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md border border-primary/20">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-muted">ID: {item.id} • Last updated 2 days ago</p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-1 px-8">
                 <div className="text-2xl font-black text-white">₹{item.price}</div>
                 <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                   <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                   Available
                 </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-2xl border border-white/5">
                <button className="p-3 hover:bg-white/5 rounded-xl text-muted hover:text-white transition-all">
                  <Eye className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-white/5 rounded-xl text-muted hover:text-primary transition-all">
                  <Edit3 className="w-5 h-5" />
                </button>
                <button className="p-3 hover:bg-red-400/10 rounded-xl text-muted hover:text-red-400 transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Modal Placeholder */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-secondary w-full max-w-xl rounded-[40px] border border-white/10 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-xl font-bold">Add New Menu Item</h3>
                 <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                   <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase ml-2">Item Name</label>
                    <input type="text" placeholder="e.g. Deluxe Veg Thali" className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase ml-2">Base Price (₹)</label>
                    <input type="number" placeholder="80" className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase ml-2">Category</label>
                  <select className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                    <option>Daily Special</option>
                    <option>Subscription</option>
                    <option>Individual Item</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted uppercase ml-2">Item Image</label>
                  <div className="w-full h-32 bg-background border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-muted gap-2 hover:border-primary/50 transition-all cursor-pointer">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Click to upload image</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-glow hover:bg-primary-dark transition-all mt-4">
                  Confirm & Add Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
