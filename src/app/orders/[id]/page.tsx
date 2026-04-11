"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  ChefHat, 
  Truck, 
  Package, 
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Star,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { getOrder } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import ReviewModal from "@/components/ReviewModal";

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await getOrder(params.id);
      setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <Link href="/" className="text-primary font-bold">Back to Home</Link>
      </div>
    );
  }

  const steps = [
    { status: "pending", label: "Confirmed", icon: CheckCircle2, description: "Your order is confirmed" },
    { status: "cooking", label: "Cooking", icon: ChefHat, description: "Chef is preparing your meal" },
    { status: "out_for_delivery", label: "Delivery", icon: Truck, description: "Delivery partner is on the way" },
    { status: "delivered", label: "Delivered", icon: Package, description: "Enjoy your fresh meal!" },
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="p-6 flex items-center gap-4 bg-secondary/50 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Track Order</h1>
          <p className="text-xs text-muted">ID: #{order.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-8">
        {/* Status Stepper */}
        <div className="bg-secondary p-8 rounded-3xl border border-white/5 shadow-xl">
          <div className="relative space-y-8">
            {steps.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="flex gap-6 relative">
                  {/* Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-5 top-10 w-0.5 h-10 ${index < currentStepIndex ? "bg-primary" : "bg-white/10"}`} />
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 
                    ${isActive ? "bg-primary shadow-glow" : "bg-white/5 border border-white/10 text-muted"}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold ${isActive ? "text-white" : "text-muted"}`}>{step.label}</h3>
                    <p className="text-xs text-muted">{step.description}</p>
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 text-[10px] py-1 px-2 bg-primary/20 text-primary rounded-md inline-block font-bold uppercase tracking-wider"
                      >
                        In Progress
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-secondary p-6 rounded-3xl border border-white/5 space-y-6">
          <h3 className="font-bold border-b border-white/5 pb-4">Order Summary</h3>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <span className="text-xs font-bold text-primary">x{item.quantity}</span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="font-bold">Total Paid</span>
            <span className="text-xl font-bold text-primary">₹{order.total}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-secondary p-6 rounded-3xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Delivery Address</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">{order.address}</p>
          </div>
          <div className="bg-secondary p-6 rounded-3xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Estimated Time</span>
            </div>
            <p className="text-sm font-medium">Delivering in 25-30 mins</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-4">
          {order.status === 'delivered' && !order.isReviewed && (
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full py-4 bg-primary text-black rounded-2xl font-bold flex items-center justify-center gap-2 shadow-glow hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <Star className="w-5 h-5 fill-current" />
              Rate Your Meal
            </button>
          )}
          
          <div className="flex gap-4">
            <a 
              href={`https://wa.me/919999999999?text=Support needed for Order ${order.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-white/5"
            >
              <MessageCircle className="w-4 h-4" />
              Support
            </a>
            <button className="flex-1 py-4 bg-secondary text-white border border-white/5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
              Share Status
            </button>
          </div>
        </div>
      </div>

      <ReviewModal 
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={order.id}
        vendorId={order.vendorId}
        vendorName={order.vendorName || "the Kitchen"}
        onSuccess={() => setOrder({ ...order, isReviewed: true })}
      />
    </div>
  );
}
