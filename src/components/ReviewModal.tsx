"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Star, X, MessageSquare, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReview } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  vendorId: string;
  vendorName: string;
  onSuccess?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  vendorId,
  vendorName,
  onSuccess
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    if (!user) return;

    setIsSubmitting(true);
    try {
      await submitReview({
        orderId,
        vendorId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        rating,
        comment
      });
      setIsSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass-card overflow-hidden"
          >
            {isSuccess ? (
              <div className="p-12 text-center">
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </m.div>
                <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
                <p className="text-muted">Your review helps the community and {vendorName}.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                  <div>
                    <h2 className="text-xl font-bold">Rate Your Meal</h2>
                    <p className="text-xs text-muted">from {vendorName}</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-bold text-muted uppercase tracking-widest mb-4">Quality & Taste</div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          className="p-1 transition-transform active:scale-90"
                        >
                          <Star
                            className={cn(
                              "w-10 h-10 transition-all",
                              (hover || rating) >= star 
                                ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(255,184,0,0.5)]" 
                                : "text-white/20"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-muted flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Share your feedback (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Was the spices right? How was the delivery?"
                      className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    disabled={rating === 0 || isSubmitting}
                    onClick={handleSubmit}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                      rating > 0 
                        ? "bg-primary text-black hover:bg-primary/90" 
                        : "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </div>
              </>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
