"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Store, MapPin, Phone, Clock, Image as ImageIcon,
  Save, Loader2, CheckCircle2, ToggleLeft, ToggleRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getVendor } from "@/lib/firestore";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function VendorProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
    deliveryTime: "30-45 min",
    image: "",
    description: "",
    isOpen: true,
    tags: [] as string[],
    openingTime: "09:00",
    closingTime: "22:00",
  });

  useEffect(() => {
    if (!user) return;
    const fetchVendor = async () => {
      const data = await getVendor(user.uid) as any;
      if (data) {
        setForm({
          name: data.name || "",
          location: data.location || "",
          phone: data.phone || user.phoneNumber || "",
          deliveryTime: data.deliveryTime || "30-45 min",
          image: data.image || "",
          description: data.description || "",
          isOpen: data.isOpen ?? true,
          tags: data.tags || [],
          openingTime: data.openingTime || "09:00",
          closingTime: data.closingTime || "22:00",
        });
      }
      setLoading(false);
    };
    fetchVendor();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, "vendors", user.uid), {
        ...form,
        updatedAt: new Date(),
      }, { merge: true });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save vendor profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const PRESET_TAGS = ["Pure Veg", "Non-Veg", "North Indian", "Diet Spec", "Thali", "Tiffin", "Fast Food", "South Indian"];

  const toggleTag = (tag: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
    }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight">Kitchen Profile</h1>
        <p className="text-muted mt-2">Update your restaurant details visible to customers.</p>
      </div>

      {/* Preview card */}
      <div className="relative h-36 rounded-3xl overflow-hidden border border-white/10">
        {form.image && (
          <img src={form.image} alt="preview" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent flex items-center gap-5 p-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl overflow-hidden">
            {form.image ? <img src={form.image} alt="" className="w-full h-full object-cover" /> : (form.name[0] || "K")}
          </div>
          <div>
            <div className="text-white font-black text-xl">{form.name || "Kitchen Name"}</div>
            <div className="text-muted text-xs mt-1 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-primary" /> {form.location || "Location"}
            </div>
            <div className={`mt-1 text-[10px] font-bold uppercase ${form.isOpen ? "text-emerald-400" : "text-red-400"}`}>
              {form.isOpen ? "● Accepting Orders" : "● Closed"}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 relative">
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-4 right-0 flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" /> Saved!
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-5">
          {/* Name */}
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Kitchen Name</label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text" required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sharma Ji Ki Rasoi"
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Location / Area</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text" required
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Boring Road, Patna"
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 9876543210"
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          {/* Delivery Time */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Est. Delivery Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                value={form.deliveryTime}
                onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))}
                placeholder="30-45 min"
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          {/* Opening & Closing Times */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Opening Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="time"
                value={form.openingTime}
                onChange={e => setForm(f => ({ ...f, openingTime: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white transition-all scheme-dark"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Closing Time</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="time"
                value={form.closingTime}
                onChange={e => setForm(f => ({ ...f, closingTime: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white transition-all scheme-dark"
              />
            </div>
          </div>

          {/* Image URL */}
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Cover Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="url"
                value={form.image}
                onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-12 pr-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">About Your Kitchen</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Fresh home-cooked meals since 2010..."
              rows={3}
              className="w-full px-4 py-4 bg-secondary border border-white/10 rounded-2xl outline-none focus:border-primary/50 text-white placeholder:text-white/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-muted uppercase tracking-widest">Cuisine Tags</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map(tag => (
              <button
                key={tag} type="button"
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  form.tags.includes(tag)
                    ? "bg-primary border-primary text-white shadow-glow"
                    : "bg-secondary border-white/10 text-muted hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Open/Closed Toggle */}
        <div className="flex items-center justify-between p-5 bg-secondary/50 border border-white/5 rounded-2xl">
          <div>
            <div className="font-bold text-white text-sm">Kitchen Status</div>
            <div className={`text-xs mt-0.5 font-bold ${form.isOpen ? "text-emerald-400" : "text-red-400"}`}>
              {form.isOpen ? "● Currently Accepting Orders" : "● Currently Closed"}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, isOpen: !f.isOpen }))}
            className="flex items-center gap-2"
          >
            {form.isOpen
              ? <ToggleRight className="w-10 h-10 text-emerald-400" />
              : <ToggleLeft className="w-10 h-10 text-muted" />
            }
          </button>
        </div>

        <button
          type="submit" disabled={saving}
          className="w-full py-4 bg-primary text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-glow active:scale-[0.98]"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Kitchen Profile</>}
        </button>
      </form>
    </div>
  );
}
