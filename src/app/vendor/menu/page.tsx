"use client";

import React, { useState, useEffect } from "react";
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
  Utensils,
  Loader2,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { getVendorDishes, upsertDish, deleteDish } from "@/lib/firestore";
import { cn } from "@/lib/utils";

interface Dish {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
}

export default function VendorMenuPage() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    isVeg: true,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
  });

  const openAddForm = () => {
    setFormData({ name: "", price: "", category: "", description: "", isVeg: true, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" });
    setEditingDish(null);
    setIsAdding(true);
  };

  const openEditForm = (dish: Dish) => {
    setFormData({ name: dish.name, price: String(dish.price), category: dish.category, description: (dish as any).description || "", isVeg: dish.isVeg, image: dish.image });
    setEditingDish(dish);
    setIsAdding(true);
  };

  const categories = Array.from(new Set(dishes.map(d => d.category)));

  useEffect(() => {
    async function fetchDishes() {
      if (!user) return;
      try {
        const data = await getVendorDishes(user.uid);
        setDishes(data as Dish[]);
      } catch (error) {
        console.error("Error fetching dishes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDishes();
  }, [user]);

  const handleToggleAvailability = async (dish: Dish) => {
    if (!user) return;
    try {
      const updatedDish = { ...dish, isAvailable: !dish.isAvailable };
      await upsertDish(user.uid, updatedDish);
      setDishes(prev => prev.map(d => d.id === dish.id ? updatedDish : d));
    } catch (error) {
      console.error("Error toggling availability:", error);
    }
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const dishPayload: any = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category || "General",
        isVeg: formData.isVeg,
        isAvailable: editingDish ? editingDish.isAvailable : true,
        image: formData.image,
        description: formData.description,
      };
      if (editingDish) {
        dishPayload.id = editingDish.id;
      }
      const id = await upsertDish(user.uid, dishPayload);
      if (editingDish) {
        setDishes(prev => prev.map(d => d.id === editingDish.id ? { ...dishPayload, id: editingDish.id } : d));
      } else {
        setDishes(prev => [{ ...dishPayload, id } as Dish, ...prev]);
      }
      setIsAdding(false);
      setEditingDish(null);
      setFormData({ name: "", price: "", category: "", description: "", isVeg: true, image: formData.image });
    } catch (error) {
      console.error("Error saving dish:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dishId: string) => {
    if (!user || !confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDish(user.uid, dishId);
      setDishes(prev => prev.filter(d => d.id !== dishId));
    } catch (error) {
      console.error("Error deleting dish:", error);
    }
  };

  const filteredDishes = dishes.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Kitchen Menu</h2>
          <p className="text-muted text-sm mt-1 uppercase tracking-wider font-bold">Manage your custom categories & dishes</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search dishes or categories..."
              className="pl-11 pr-6 py-3 bg-secondary border border-white/5 rounded-2xl text-sm focus:outline-none focus:border-primary/50 transition-all w-64 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={openAddForm}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-glow hover:bg-primary-dark transition-all"
          >
            <Plus className="w-4 h-4" /> Add Dish
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
         <button 
           onClick={() => setSelectedCategory("All")}
           className={`px-5 py-2 rounded-full border transition-all shrink-0 text-xs font-bold ${selectedCategory === "All" ? 'bg-primary border-primary text-white shadow-glow' : 'border-white/5 bg-secondary text-muted hover:text-white'}`}
         >
           All Items
         </button>
         {categories.map((cat) => (
           <button 
             key={cat} 
             onClick={() => setSelectedCategory(cat)}
             className={`px-5 py-2 rounded-full border transition-all shrink-0 text-xs font-bold ${selectedCategory === cat ? 'bg-primary border-primary text-white shadow-glow' : 'border-white/5 bg-secondary/50 text-muted hover:text-white'}`}
           >
             {cat}
           </button>
         ))}
      </div>

      {/* Menu List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredDishes.length > 0 ? filteredDishes.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-secondary p-4 rounded-[32px] border border-white/5 group hover:border-primary/20 transition-all flex flex-col md:flex-row items-center gap-6"
            >
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-premium bg-black shrink-0 border border-white/5">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2 justify-center md:justify-start">
                  <h4 className="text-lg font-bold text-white">{item.name}</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded-md border border-primary/20">
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${item.isVeg ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}`}>
                      {item.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-muted font-bold tracking-widest uppercase">ID: {item.id.slice(0, 8)}</p>
              </div>

              <div className="flex flex-col items-center md:items-end gap-1 px-8">
                 <div className="text-2xl font-black text-white">₹{item.price}</div>
                 <button 
                   onClick={() => handleToggleAvailability(item)}
                   className={cn(
                     "text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest px-3 py-1 rounded-full border transition-all hover:scale-105",
                     item.isAvailable 
                       ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5 hover:bg-emerald-400/10" 
                       : "text-red-400 border-red-400/20 bg-red-400/5 hover:bg-red-400/10"
                   )}
                 >
                   {item.isAvailable ? (
                     <>
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Available
                     </>
                   ) : (
                     <span className="font-bold uppercase">Out of Stock</span>
                   )}
                 </button>
              </div>

              <div className="flex items-center gap-2 p-2 bg-white/5 rounded-2xl border border-white/5">
                <button 
                  onClick={() => openEditForm(item)}
                  className="p-3 hover:bg-primary/10 rounded-xl text-muted hover:text-primary transition-all"
                  title="Edit dish"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-3 hover:bg-red-400/10 rounded-xl text-muted hover:text-red-400 transition-all"
                  title="Delete dish"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="h-48 flex flex-col items-center justify-center text-muted border border-dashed border-white/10 rounded-[40px] bg-white/2">
              <Utensils className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">No items found</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
              className="bg-secondary w-full max-w-xl rounded-[40px] border border-white/10 shadow-2xl relative z-60 overflow-hidden"
            >
              <form onSubmit={handleAddDish}>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                   <h3 className="text-xl font-bold text-white">{editingDish ? "Edit Dish" : "Add New Food Item"}</h3>
                   <button type="button" onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                     <X className="w-5 h-5 text-white" />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase ml-2">Item Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Deluxe Veg Thali" 
                        className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted uppercase ml-2">Price (₹)</label>
                      <input 
                        required
                        type="number" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="80" 
                        className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase ml-2">Category (Type to Create)</label>
                    <input 
                      required
                      list="categories-list"
                      type="text" 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. Daily Thali, Desserts, Starters" 
                      className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white" 
                    />
                    <datalist id="categories-list">
                      {categories.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted uppercase ml-2">Description (optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="e.g. Served with salad and papad" 
                      rows={2}
                      className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white resize-none" 
                    />
                  </div>

                  <div className="flex items-center gap-6 p-4 bg-white/2 rounded-2xl border border-white/5">
                    <label className="text-[10px] font-bold text-muted uppercase">Type</label>
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isVeg: true})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${formData.isVeg ? 'bg-green-500 text-white' : 'bg-white/5 text-muted'}`}
                      >
                        VEG
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, isVeg: false})}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${!formData.isVeg ? 'bg-red-500 text-white' : 'bg-white/5 text-muted'}`}
                      >
                        NON-VEG
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-wrap">
                    <label className="text-[10px] font-bold text-muted uppercase ml-2">Image URL</label>
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-background border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary transition-all text-white" 
                    />
                  </div>

                  <button 
                    disabled={saving}
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-glow hover:bg-primary-dark transition-all mt-4 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="animate-spin" /> : (editingDish ? "Save Changes" : "Confirm & Add Item")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
