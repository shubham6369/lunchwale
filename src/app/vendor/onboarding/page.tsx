"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { m } from "framer-motion";
import { Utensils, MapPin, Clock, Tag, ArrowRight, Loader2 } from "lucide-react";

export default function VendorOnboarding() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    openingTime: "09:00",
    closingTime: "22:00",
    cuisines: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else if (profile?.role === "vendor") {
        router.push("/vendor");
      } else if (profile?.role === "admin") {
        router.push("/admin");
      }
    }
  }, [user, profile, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const vendorId = user.uid;
      
      // 1. Create Vendor Document
      await setDoc(doc(db, "vendors", vendorId), {
        id: vendorId,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        cuisines: formData.cuisines.split(",").map(c => c.trim()),
        status: "pending", // Admin needs to approve
        rating: 0,
        totalReviews: 0,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", // Placeholder
        createdAt: serverTimestamp(),
      });

      // 2. Update User Role
      await updateProfile({ role: "vendor" });

      // 3. Redirect to Dashboard
      router.push("/vendor");
    } catch (error) {
      console.error("Error during onboarding:", error);
      alert("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Partner with LunchNow
          </h1>
          <p className="text-gray-400 text-lg">
            Register your kitchen and start reaching thousands of hungry customers.
          </p>
        </m.div>

        <m.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-[#141414] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8"
        >
          {/* Kitchen Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-400">
              <Utensils size={20} /> Kitchen Details
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kitchen Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Royal Punjab Kitchen"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Short Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Tell customers about your signature dishes..."
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Location & Time */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-400">
              <MapPin size={20} /> Location & Availability
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Address</label>
              <input
                required
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Shop No, Area, City, Pin Code"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Clock size={16} /> Opening Time
                </label>
                <input
                  required
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({...formData, openingTime: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Clock size={16} /> Closing Time
                </label>
                <input
                  required
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({...formData, closingTime: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Cuisines */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-orange-400">
              <Tag size={20} /> Categorization
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 text-wrap">Cuisines (comma separated)</label>
              <input
                required
                type="text"
                value={formData.cuisines}
                onChange={(e) => setFormData({...formData, cuisines: e.target.value})}
                placeholder="North Indian, Chinese, Mughlai"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-orange-900/20 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Register Kitchen <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </m.form>
      </div>
    </div>
  );
}
