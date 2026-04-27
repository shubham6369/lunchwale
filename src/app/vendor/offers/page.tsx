"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getVendorOffers, upsertVendorOffer, deleteVendorOffer, OfferData } from "@/lib/firestore";
import { Tag, Plus, Edit2, Trash2, Calendar, Scissors, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorOffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<OfferData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferData | null>(null);
  
  const [formData, setFormData] = useState<Partial<OfferData>>({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    active: true,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  });

  useEffect(() => {
    if (user) {
      loadOffers();
    }
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await getVendorOffers(user!.uid);
      setOffers(data);
    } catch (error) {
      console.error("Error loading offers:", error);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (offer?: OfferData) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        ...offer,
        validUntil: offer.validUntil?.split('T')[0] || ""
      });
    } else {
      setEditingOffer(null);
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderValue: 0,
        maxDiscount: 0,
        active: true,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || formData.discountValue <= 0) {
      toast.error("Please fill in required fields correctly");
      return;
    }

    try {
      const offerId = editingOffer?.id || formData.code.toUpperCase().replace(/\s+/g, '');
      
      const offerToSave: OfferData = {
        id: offerId,
        code: formData.code.toUpperCase(),
        description: formData.description || "",
        discountType: formData.discountType as "percentage" | "fixed",
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue) || 0,
        maxDiscount: Number(formData.maxDiscount) || 0,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
        active: formData.active ?? true,
      };

      await upsertVendorOffer(user!.uid, offerId, offerToSave);
      
      toast.success(editingOffer ? "Offer updated successfully" : "Offer created successfully");
      setShowModal(false);
      loadOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
      toast.error("Failed to save offer");
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    
    try {
      await deleteVendorOffer(user!.uid, offerId);
      toast.success("Offer deleted");
      loadOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const toggleActiveStatus = async (offer: OfferData) => {
    try {
      await upsertVendorOffer(user!.uid, offer.id!, { ...offer, active: !offer.active });
      toast.success(`Offer ${offer.active ? 'deactivated' : 'activated'}`);
      loadOffers();
    } catch (error) {
      console.error("Error toggling offer status:", error);
      toast.error("Failed to update offer status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Offers</h1>
          <p className="text-muted text-sm mt-1">Create promo codes and discounts for your customers</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Offer
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="bg-secondary/50 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No active offers</h3>
          <p className="text-muted mb-6 max-w-md">
            Boost your sales by creating custom discount codes for your customers.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={offer.id}
              className={`bg-secondary border rounded-2xl overflow-hidden transition-all duration-300 ${
                offer.active ? 'border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 opacity-70'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 font-mono font-bold text-lg tracking-wider text-white">
                    <Scissors className="w-4 h-4 text-primary" />
                    {offer.code}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(offer)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id!)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-2xl font-black text-white">
                      {offer.discountType === 'percentage' 
                        ? `${offer.discountValue}% OFF` 
                        : `₹${offer.discountValue} OFF`}
                    </div>
                    {offer.description && (
                      <p className="text-sm text-muted mt-1">{offer.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-xl">
                    <div>
                      <span className="text-muted block mb-1">Min Order</span>
                      <span className="font-bold text-white">
                        {offer.minOrderValue ? `₹${offer.minOrderValue}` : 'No minimum'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block mb-1">Max Discount</span>
                      <span className="font-bold text-white">
                        {offer.maxDiscount ? `₹${offer.maxDiscount}` : 'No limit'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Calendar className="w-4 h-4" />
                      {offer.validUntil 
                        ? new Date(offer.validUntil).toLocaleDateString() 
                        : 'No expiry'}
                    </div>
                    
                    <button
                      onClick={() => toggleActiveStatus(offer)}
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        offer.active 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
                          : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {offer.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="text-xl font-bold text-white">
                  {editingOffer ? 'Edit Offer' : 'Create New Offer'}
                </h3>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-muted mb-1">Promo Code</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono uppercase"
                      placeholder="e.g. WELCOME50"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-muted mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="Special discount for new users"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-muted mb-1">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={e => setFormData({...formData, discountType: e.target.value as "percentage" | "fixed"})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-muted mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.discountValue || ''}
                      onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. 20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-muted mb-1">Min Order Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minOrderValue || ''}
                      onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="0 for no minimum"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-muted mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount || ''}
                      onChange={e => setFormData({...formData, maxDiscount: Number(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                      placeholder="0 for no limit"
                      disabled={formData.discountType === 'fixed'}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-muted mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil || ''}
                      onChange={e => setFormData({...formData, validUntil: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary [color-scheme:dark]"
                    />
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      id="active-status"
                      checked={formData.active}
                      onChange={e => setFormData({...formData, active: e.target.checked})}
                      className="w-5 h-5 accent-primary rounded"
                    />
                    <label htmlFor="active-status" className="font-bold text-white cursor-pointer">
                      Offer is Active
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 mt-6 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors shadow-glow"
                  >
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
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
