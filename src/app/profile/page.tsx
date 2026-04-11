"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Save, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile } from "@/lib/firestore";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const data = await getUserProfile(user.uid);
        setProfile(data);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    setSuccess(false);
    try {
      await updateUserProfile(user.uid, {
        displayName: profile.displayName,
        address: profile.address,
        email: profile.email
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 px-6 uppercase-labels">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        <div className="glass-card p-8 space-y-8 relative overflow-hidden">
          {/* Progress or Status Decor */}
          <div className="absolute top-0 right-0 p-4">
             {success && (
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex items-center gap-2 text-green-500 text-xs font-bold"
               >
                 <CheckCircle2 className="w-4 h-4" /> Changes Saved
               </motion.div>
             )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted tracking-widest uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text"
                  value={profile?.displayName || ""}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-black text-muted tracking-widest uppercase">Phone Number (Linked)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  type="text"
                  value={user?.phoneNumber || ""}
                  disabled
                  className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/5 rounded-2xl cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted tracking-widest uppercase">Default Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted" />
                <textarea 
                  value={profile?.address || ""}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Street name, floor, landmark..."
                  className="w-full pl-12 pr-4 py-4 h-32 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all font-medium resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-primary text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-glow"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 p-8 border border-red-500/20 rounded-[32px] bg-red-500/5">
           <h3 className="text-red-400 font-bold mb-2">Danger Zone</h3>
           <p className="text-xs text-muted mb-4">Once you delete your account, all your subscription data and order history will be permanently removed.</p>
           <button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all">
             Request Account Deletion
           </button>
        </div>
      </div>
    </div>
  );
}
