"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, Clock, Truck } from "lucide-react";
import Link from "next/link";
import { getOrder } from "@/lib/firestore";
import confetti from "canvas-confetti";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      getOrder(orderId).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pt-32 pb-20 px-6 overflow-hidden relative">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-8 mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]"
        >
          <CheckCircle2 className="w-12 h-12 text-black" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold mb-4"
        >
          Payment <span className="text-emerald-400">Successful!</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-gray-400 mb-12 max-w-md mx-auto"
        >
          Your order has been received and is being sent to <span className="text-white font-bold">{order?.vendorName || "the kitchen"}</span>.
        </motion.p>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6 mb-12 text-left"
        >
          <div className="bg-secondary/40 border border-white/5 p-6 rounded-[32px] backdrop-blur-md">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Order Details</div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Order ID</span>
                <span className="font-mono font-bold text-sm">#{orderId?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount Paid</span>
                <span className="font-bold text-emerald-400">₹{order?.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Status</span>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg uppercase">Confirmed</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary/40 border border-white/5 p-6 rounded-[32px] backdrop-blur-md">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Estimated Delivery</div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">25-30</div>
                <div className="text-xs text-gray-400">Minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Truck className="w-4 h-4" />
              <span>Partner is arriving at the kitchen</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link 
            href={`/orders/${orderId}`}
            className="w-full sm:w-auto px-10 py-4 bg-primary text-black font-black rounded-2xl shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Track Live Order
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/"
            className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all"
          >
            Back to Home
          </Link>
        </motion.div>

        {/* Support Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 p-8 border border-white/5 rounded-[40px] bg-linear-to-br from-white/2 to-transparent"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-left">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
              <ShoppingBag className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-1 text-white">Need help with your order?</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                If you have any issues with your delivery or the food, our support team is available 24/7.
              </p>
            </div>
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all">
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
