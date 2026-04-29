"use client";

import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { User, Phone, MapPin, Mail, Save, ArrowLeft, Loader2, CheckCircle2, Heart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile, getFavoriteVendors } from "@/lib/firestore";
import VendorCard from "@/components/VendorCard";

export default function ProfilePage() {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "favorites">("settings");
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        const data = await getUserProfile(user.uid);
        // Merge firebase auth data with firestore profile
        setProfile({
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          address: "",
          ...data,
        });
        
        // Fetch favorites
        try {
          const favs = await getFavoriteVendors(user.uid);
          setFavorites(favs);
        } catch (error) {
          console.error("Error fetching favorites:", error);
        }
        
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, authProfile?.favorites]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setSaving(true);
    setSuccess(false);
    try {
      await updateUserProfile(user.uid, {
        displayName: profile.displayName,
        address: profile.address,
        email: profile.email,
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center">
          <User className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-xl font-bold text-white">Please sign in</h2>
        <p className="text-muted text-sm">You need to be logged in to view your profile.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-black rounded-2xl font-bold text-sm">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Account Settings</h1>
        </div>

        {/* Avatar block */}
        <div className="flex items-center gap-5 mb-8 p-6 bg-secondary/30 border border-white/5 rounded-3xl">
          <div className="relative">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt="avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-black text-3xl">
                {(profile?.displayName || user.email || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-bold text-lg">{profile?.displayName || "Set your name"}</div>
            <div className="text-muted text-xs mt-1">{user.email || user.phoneNumber || ""}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3 h-3" />
              {user.email ? "Google Account" : "Phone Verified"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "settings" ? "border-primary text-primary" : "border-transparent text-muted hover:text-white"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "favorites" ? "border-primary text-primary" : "border-transparent text-muted hover:text-white"
            }`}
          >
            Favorites
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "settings" ? (
          <div className="bg-secondary/20 border border-white/5 p-8 rounded-3xl space-y-6 relative">
          {success && (
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </m.div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted tracking-widest uppercase">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  value={profile?.displayName || ""}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted tracking-widest uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={profile?.email || user.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Phone — read-only if phone login */}
            {user.phoneNumber && (
              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black text-muted tracking-widest uppercase">Phone (Linked)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    value={user.phoneNumber}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-black/20 border border-white/5 rounded-2xl cursor-not-allowed text-white"
                  />
                </div>
              </div>
            )}

            {/* Address */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted tracking-widest uppercase">Default Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-muted" />
                <textarea
                  value={profile?.address || ""}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Street name, floor, landmark..."
                  className="w-full pl-12 pr-4 py-4 h-28 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/20 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-primary text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-glow"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </form>
        </div>
        ) : (
          <div className="space-y-6">
            {favorites.length === 0 ? (
              <div className="bg-secondary/20 border border-white/5 p-8 rounded-3xl text-center">
                <Heart className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Favorites Yet</h3>
                <p className="text-muted text-sm mb-6">Explore our kitchens and save your favorites here.</p>
                <Link href="/vendors" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all inline-block">
                  Find Kitchens
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favorites.map((vendor) => (
                  <VendorCard
                    key={vendor.id}
                    id={vendor.id}
                    name={vendor.name}
                    image={vendor.branding?.bannerImage || "/images/placeholder-kitchen.jpg"}
                    rating={vendor.totalReviewCount ? Number((vendor.totalRatingSum / vendor.totalReviewCount).toFixed(1)) : 4.5}
                    location={vendor.location?.address || "Unknown"}
                    pricePerLunch={vendor.pricing?.pricePerLunch || 0}
                    monthlyPlan={vendor.pricing?.monthlyPlanPrice || 0}
                    tags={vendor.cuisineTags || []}
                    isPopular={vendor.totalReviewCount > 20}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Link href="/orders" className="p-5 bg-secondary/20 border border-white/5 rounded-2xl hover:border-primary/30 transition-all group">
            <div className="text-xs font-black text-muted uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">My Orders</div>
            <div className="text-white font-bold">View History →</div>
          </Link>
          <Link href="/vendors" className="p-5 bg-secondary/20 border border-white/5 rounded-2xl hover:border-primary/30 transition-all group">
            <div className="text-xs font-black text-muted uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Explore</div>
            <div className="text-white font-bold">Find Kitchens →</div>
          </Link>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 p-6 border border-red-500/20 rounded-2xl bg-red-500/5">
          <h3 className="text-red-400 font-bold mb-2 text-sm">Danger Zone</h3>
          <p className="text-xs text-muted mb-4">All subscription data and order history will be permanently removed.</p>
          <button className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all">
            Request Account Deletion
          </button>
        </div>
      </div>
    </div>
  );
}
