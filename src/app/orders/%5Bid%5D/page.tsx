"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { m } from "framer-motion";
import { 
  Clock, 
  MapPin, 
  Phone, 
  ChevronLeft, 
  CheckCircle2, 
  Bike,
  Flame,
  UtensilsCrossed,
  PackageCheck,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const router = useRouter();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // Real-time listener for Task 6
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      } else {
        console.error("Order not found");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted mb-8">We couldn&apos;t find an order with this ID.</p>
        <Link href="/" className="px-8 py-3 bg-primary text-black font-bold rounded-xl">
          Return Home
        </Link>
      </div>
    );
  }

  const statuses = [
    { id: "pending", label: "Order Placed", icon: CheckCircle2, desc: "Awaiting kitchen confirmation" },
    { id: "accepted", label: "Confirmed", icon: UtensilsCrossed, desc: "Kitchen has accepted your order" },
    { id: "preparing", label: "Preparing", icon: Flame, desc: "Your meal is being cooked with love" },
    { id: "out_for_delivery", label: "On the way", icon: Bike, desc: "Delivery partner is nearby" },
    { id: "delivered", label: "Delivered", icon: PackageCheck, desc: "Enjoy your meal!" },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.id === (order.status || "pending"));

  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </button>
          <div className="text-right">
            <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mb-1">Order ID</p>
            <p className="font-mono text-sm font-black">#{orderId.slice(-8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Status Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 space-y-8 relative overflow-hidden">
               {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative">
                <h1 className="text-3xl font-bold mb-2">Track Order</h1>
                <p className="text-muted text-sm">Real-time status of your meal from <span className="text-white font-bold">{order.vendorName}</span></p>
              </div>

              {/* Status Stepper */}
              <div className="space-y-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-white/5" />
                <div 
                  className="absolute left-6 top-8 transition-all duration-1000 ease-in-out w-0.5 bg-primary" 
                  style={{ height: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }} 
                />

                {statuses.map((status, idx) => {
                  const isActive = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;
                  
                  return (
                    <div key={status.id} className="flex gap-6 relative group">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all animate-none",
                        isActive ? "bg-primary text-black" : "bg-white/5 text-muted grayscale",
                        isCurrent && "shadow-glow ring-4 ring-primary/20 scale-110"
                      )}>
                        <status.icon className={cn("w-6 h-6", isCurrent && "animate-pulse")} />
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className={cn("font-bold text-lg", isActive ? "text-white" : "text-muted")}>
                          {status.label}
                        </h4>
                        <p className={cn("text-xs", isActive ? "text-muted" : "text-white/10")}>
                          {status.desc}
                        </p>
                      </div>
                      {isCurrent && (
                        <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full h-fit mt-1 self-start">
                          Live
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Partner Info */}
            <div className="bg-[#25D366]/5 border border-[#25D366]/20 rounded-[32px] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#25D366]/20 rounded-2xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <h4 className="font-bold">Contact Support</h4>
                  <p className="text-xs text-muted">Instant help for your order</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-[#25D366] text-black font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all">
                Call Kitchen
              </button>
            </div>
          </div>

          {/* Map/Address Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Simulated Map */}
            <div className="h-64 bg-secondary/40 border border-white/5 rounded-[40px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#0a0a0b] opacity-50" />
              {/* Animated dots simulating a path */}
              <div className="absolute w-full h-full p-12">
                 <div className="w-full h-full border-2 border-dashed border-white/10 rounded-full animate-spin-slow opacity-20" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                 <div className="w-3 h-3 bg-primary rounded-full animate-ping mb-2" />
                 <Bike className="w-8 h-8 text-primary opacity-80" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Distance</p>
                 <p className="text-xs font-bold font-mono">2.4 KM</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-secondary/20 border border-white/5 p-6 rounded-[32px] space-y-4">
               <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-bold uppercase tracking-widest">Delivery Address</h4>
               </div>
               <p className="text-sm text-muted leading-relaxed">
                 {order.address || "HSR Layout, Bangalore"}
               </p>
            </div>

            {/* Order Items Summary */}
            <div className="bg-secondary/20 border border-white/5 p-6 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-bold uppercase tracking-widest">Order Summary</h4>
               </div>
               <div className="space-y-3">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-bold">
                       <span className="text-muted">{item.quantity}x {item.name}</span>
                       <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="h-px bg-white/5 my-2" />
                  <div className="flex justify-between font-black text-primary">
                     <span>Grand Total</span>
                     <span>₹{order.total}</span>
                  </div>
               </div>
            </div>
            
            <Link href="/" className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest">
               Order Something Else
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
