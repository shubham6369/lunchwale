"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowUpRight,
  Utensils,
  CheckCircle2,
  XCircle,
  Clock4,
  Truck,
  Package,
  Bell,
  AlertCircle,
  ChefHat,
  Volume2,
  VolumeX
} from "lucide-react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { updateOrderStatus, updateVendorAvailability, getVendor } from "@/lib/firestore";
import { cn } from "@/lib/utils";
import { doc, onSnapshot as onDocSnapshot } from "firebase/firestore";

export default function VendorDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingPayout: 0
  });
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const notificationAudio = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize notification sound
    notificationAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  const playNotification = () => {
    notificationAudio.current?.play().catch(e => console.error("Audio play failed", e));
  };

  const speakText = (text: string) => {
    if (!isVoiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    
    // Stop current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const announceOrder = (order: any) => {
    const customerName = order.userName || "Customer";
    const dishNames = (order.items || []).map((item: any) => item.name).join(", ");
    const address = order.address || "Address not provided";

    const message = `${customerName} se naya order aaya hai. Item hai: ${dishNames}. Pata: ${address}`;
    speakText(message);
  };

  // Repetition Loop: Announce all pending orders every 60 seconds
  useEffect(() => {
    if (!isVoiceEnabled) return;

    const interval = setInterval(() => {
      const pendingOrders = orders.filter(o => o.status === 'pending');
      if (pendingOrders.length > 0) {
        let index = 0;
        const announceNext = () => {
          if (index < pendingOrders.length) {
            announceOrder(pendingOrders[index]);
            index++;
            setTimeout(announceNext, 8000); // 8 second gap between multiple orders
          }
        };
        announceNext();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isVoiceEnabled, orders]);

  useEffect(() => {
    if (!user) return;

    // Listen to orders for this specific vendor
    const q = query(
      collection(db, "orders"),
      where("vendorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      
      // Calculate Stats
      let totalRevenue = 0;
      let todayRevenue = 0;
      let todayOrdersCount = 0;
      const active = ordersData.filter((o: any) => o.status !== 'delivered' && o.status !== 'rejected').length;
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      ordersData.forEach((o: any) => {
        const orderAmount = Number(o.total) || 0;
        const orderTime = o.createdAt?.toDate?.()?.getTime() || 0;
        
        if (o.paymentStatus === 'paid' || o.status === 'delivered') {
          totalRevenue += orderAmount;
          if (orderTime >= startOfToday) {
            todayRevenue += orderAmount;
          }
        }

        if (orderTime >= startOfToday) {
          todayOrdersCount++;
        }
      });

      setStats({
        activeOrders: active,
        totalRevenue: todayRevenue, // Showing Today's Revenue as primary
        totalCustomers: todayOrdersCount, // Showing Today's Orders as secondary
        pendingPayout: totalRevenue * 0.9 // Assuming 10% platform commission
      });
      
      // Handle New Order Alerts
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newOrder = change.doc.data() as any;
          const orderTime = newOrder.createdAt?.toDate?.() || new Date();
          const now = new Date();

          // Only alert for very recent orders (within 1 minute)
          if (now.getTime() - orderTime.getTime() < 60000) {
            playNotification();
            if (isVoiceEnabled) {
              announceOrder({ id: change.doc.id, ...newOrder });
            }
          }
        }
      });

      setLoading(false);
    });

    // Listen to vendor document for availability
    const unsubVendor = onDocSnapshot(doc(db, "vendors", user.uid), (doc) => {
      if (doc.exists()) {
        setVendorData({ id: doc.id, ...doc.data() });
      }
    });

    return () => {
      unsubscribe();
      unsubVendor();
    };
  }, [user]);

  const handleToggleAvailability = async () => {
    if (!user || !vendorData) return;
    try {
      await updateVendorAvailability(user.uid, !vendorData.isOpen);
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Error updating order status.");
    }
  };

  const statCards = [
    { label: "Active Orders", value: stats.activeOrders.toString(), icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Today's Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Today's Orders", value: stats.totalCustomers.toString(), icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Net Earnings", value: `₹${Math.round(stats.pendingPayout).toLocaleString()}`, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header with Store Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-white tracking-tight">Kitchen Dashboard</h1>
            {vendorData?.status === "approved" ? (
              <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                <Clock4 className="w-3 h-3" /> Pending Review
              </div>
            )}
          </div>
          <p className="text-muted mt-2 text-wrap">Manage your active orders and kitchen availability.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Voice Alert Toggle */}
          <div className="flex items-center gap-4 bg-secondary/40 p-4 rounded-[24px] border border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Voice Alerts</span>
              <span className={cn("text-xs font-bold", isVoiceEnabled ? "text-emerald-400" : "text-amber-400")}>
                {isVoiceEnabled ? "Active" : "Muted"}
              </span>
            </div>
            <button 
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={cn(
                "w-12 h-12 rounded-2xl transition-all flex items-center justify-center border",
                isVoiceEnabled 
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                  : "bg-white/5 border-white/10 text-muted hover:bg-white/10"
              )}
              title={isVoiceEnabled ? "Mute Voice Alerts" : "Enable Voice Alerts"}
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-6 h-6 animate-pulse" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Kitchen Status Toggle */}
          <div className="flex items-center gap-4 bg-secondary/40 p-4 rounded-[24px] border border-white/5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Kitchen Status</span>
              <span className={cn("text-xs font-bold", vendorData?.isOpen ? "text-emerald-400" : "text-red-400")}>
                {vendorData?.isOpen ? "Accepting Orders" : "Kitchen Closed"}
              </span>
            </div>
            <button 
              onClick={handleToggleAvailability}
              className={cn(
                "w-14 h-8 rounded-full transition-all relative p-1",
                vendorData?.isOpen ? "bg-emerald-500" : "bg-white/10"
              )}
            >
              <motion.div 
                animate={{ x: vendorData?.isOpen ? 24 : 0 }}
                className="w-6 h-6 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-secondary/40 p-6 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all font-sans"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  Live
                </div>
              </div>
              <h3 className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</h3>
              <div className="text-3xl font-black mt-2 text-white">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-1 gap-8">
        {/* Active Orders Section */}
        <section className="bg-secondary/30 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary animate-bounce-slow" />
              Incoming Orders
              <span className="ml-2 px-3 py-1 bg-primary/20 text-primary text-xs rounded-full">{stats.activeOrders}</span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               Auto-updating
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {orders.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10 text-muted" />
                  </div>
                  <h4 className="text-xl font-bold">No orders yet</h4>
                  <p className="text-muted text-sm px-10">Waiting for hungry customers to find your kitchen. <br />Make sure your menu is active!</p>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-background/40 border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shrink-0 border border-white/5">
                        <Package className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-lg">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                            order.status === 'pending' ? 'bg-amber-500/20 text-amber-500' : 
                            order.status === 'accepted' ? 'bg-blue-500/20 text-blue-500' :
                            order.status === 'preparing' ? 'bg-purple-500/20 text-purple-500' :
                            'bg-emerald-500/20 text-emerald-500'
                          )}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted mb-2">{order.items.length} items • ₹{order.total}</p>
                        <div className="flex gap-2">
                           {order.items.map((item: any, i: number) => (
                             <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-white/50 border border-white/5 italic">
                               {item.name}
                             </span>
                           ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(order.id, "accepted")}
                            className="bg-primary text-black px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-glow"
                          >
                            Accept Kitchen
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(order.id, "rejected")}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {order.status === 'accepted' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, "preparing")}
                          className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all w-full md:w-auto"
                        >
                          Start Preparing
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, "out_for_delivery")}
                          className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all w-full md:w-auto"
                        >
                          Out for Delivery
                        </button>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <button 
                          onClick={() => handleUpdateStatus(order.id, "delivered")}
                          className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all w-full md:w-auto"
                        >
                          Mark Delivered
                        </button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" />
                          Complete
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}
