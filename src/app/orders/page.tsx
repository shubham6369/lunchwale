"use client";

import React, { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ShoppingBag, 
  MapPin, 
  Package, 
  Clock,
  ArrowLeft,
  Star,
  X,
  Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { submitReview } from "@/lib/firestore";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  limit 
} from "firebase/firestore";

export default function OrdersPage() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewOrder) return;
    setSubmittingReview(true);
    try {
      await submitReview({
        orderId: reviewOrder.id,
        vendorId: reviewOrder.vendorId, // Ensure vendorId is part of the order data when creating
        userId: user.uid,
        userName: profile?.displayName || user.email || "Customer",
        rating,
        comment
      });
      setReviewOrder(null);
      setRating(5);
      setComment("");
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const statusMap: any = {
    pending: { label: "Order Placed", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    accepted: { label: "Accepted by Kitchen", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    preparing: { label: "Preparing your meal", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    out_for_delivery: { label: "Out for Delivery", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
    delivered: { label: "Delivered ✓", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    rejected: { label: "Rejected", color: "text-red-400 bg-red-400/10 border-red-400/20" },
  };

  const progressMap: any = {
    pending: "20%", accepted: "40%", preparing: "70%", out_for_delivery: "90%", delivered: "100%"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 md:px-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Link href="/vendors" className="text-muted text-xs font-bold flex items-center gap-2 hover:text-primary transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to exploring
            </Link>
            <h1 className="text-4xl font-black italic tracking-tighter">
              YOUR <span className="text-primary">ORDERS</span>
            </h1>
          </div>
          <div className="w-16 h-16 rounded-[20px] bg-secondary border border-white/5 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-secondary/30 p-20 rounded-[40px] border border-dashed border-white/10 text-center flex flex-col items-center">
            <Package className="w-16 h-16 text-muted/30 mb-4" />
            <h3 className="text-xl font-bold text-muted">No orders yet</h3>
            <p className="text-muted text-sm italic mt-2">Start your first order from your favourite kitchen!</p>
            <Link href="/vendors" className="mt-8 px-8 py-3 bg-primary rounded-2xl font-bold text-sm shadow-glow">
              Explore Kitchens
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {orders.map((order) => (
                <m.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary rounded-[40px] border border-white/5 overflow-hidden group hover:border-primary/20 transition-all shadow-xl"
                >
                  <div className="p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
                    <div className="space-y-4">
                      {/* Status badge */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${statusMap[order.status]?.color || "text-muted bg-white/5 border-white/10"}`}>
                          {statusMap[order.status]?.label || order.status}
                        </span>
                        <span className="text-[10px] text-muted font-bold tracking-widest uppercase">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      {/* Item summary */}
                      <div>
                        <h4 className="text-xl font-bold">
                          {order.items?.[0]?.name}
                          {order.items?.length > 1 && ` + ${order.items.length - 1} more`}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted font-medium mt-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {order.createdAt?.seconds
                              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "Just now"}
                          </div>
                          {order.address && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {(order.address || "").slice(0, 30)}{order.address?.length > 30 ? "…" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price + Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-3xl font-black italic tracking-tighter text-white">₹{order.total}</div>
                      
                      <div className="flex gap-2">
                        {order.status === "delivered" && !order.isReviewed && (
                          <button
                            onClick={() => setReviewOrder(order)}
                            className="px-5 py-2 bg-amber-400 text-black hover:bg-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow"
                          >
                            Leave Review
                          </button>
                        )}
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-5 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          {order.status === "delivered" ? "View Details" : "Track Order"} →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {order.status !== "rejected" && (
                    <div className="px-8 pb-6">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <m.div
                          initial={{ width: 0 }}
                          animate={{ width: progressMap[order.status] || "10%" }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-primary shadow-glow shadow-primary/50 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOrder && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-secondary w-full max-w-md rounded-[32px] border border-white/10 p-6 relative"
            >
              <button 
                onClick={() => setReviewOrder(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-2">Leave a Review</h2>
              <p className="text-muted text-sm mb-6">How was your order from {reviewOrder.vendorName || "the kitchen"}?</p>
              
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex items-center justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-2 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        className={`w-10 h-10 ${rating >= star ? "fill-amber-400 text-amber-400" : "text-white/20"}`} 
                      />
                    </button>
                  ))}
                </div>
                
                <div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked (or didn't like)..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none h-32"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-4 bg-primary text-black font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-glow"
                >
                  {submittingReview ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
                </button>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
