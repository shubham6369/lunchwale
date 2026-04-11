"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Search,
  MoreVertical,
  Activity,
  MessageSquare,
  ShieldAlert,
  Trash2,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeVendors: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Orders & Stats Listener
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      let revenue = 0;
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      orders.forEach((order: any) => {
        revenue += Number(order.total) || 0;
      });
      
      setStats(prev => ({ 
        ...prev, 
        totalOrders: snapshot.size, 
        totalRevenue: revenue 
      }));
      
      const sorted = [...orders].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5);
      setRecentOrders(sorted);
    });

    // Users Listener
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Vendors Listener
    const unsubVendors = onSnapshot(collection(db, "vendors"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendorsList(list);
      setStats(prev => ({ ...prev, activeVendors: snapshot.size }));
    });

    // Reviews Listener
    const unsubReviews = onSnapshot(collection(db, "reviews"), (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubVendors();
      unsubReviews();
    };
  }, []);

  const handleSettleDues = async (vendorId: string, amount: number) => {
    try {
      const { settleVendorPayout } = await import("@/lib/firestore");
      await settleVendorPayout(vendorId, amount);
      alert("Payout settled successfully!");
    } catch (error) {
      console.error("Payout settlement failed:", error);
      alert("Failed to settle payout.");
    }
  };

  const cards = [
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, trend: "+8.2%", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Active Vendors", value: stats.activeVendors.toString(), icon: Store, trend: "+3", color: "text-primary", bg: "bg-primary/10" },
    { title: "Total Foodies", value: stats.totalUsers.toString(), icon: Users, trend: "+156", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6 text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/5 pb-1">
          {["overview", "reviews", "vendors", "payouts"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-primary px-2" : "text-muted hover:text-white"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-secondary/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-primary/20 transition-all"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${card.bg} rounded-bl-full opacity-50 group-hover:scale-110 transition-transform`} />
                  <card.icon className={`w-8 h-8 ${card.color} mb-4`} />
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-bold uppercase tracking-wider">{card.title}</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
                      <span className="text-[10px] text-emerald-500 font-bold mb-1 flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> {card.trend}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Live Revenue Stream
                  </h2>
                </div>
                <div className="bg-secondary/20 border border-white/5 rounded-3xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-muted">
                        <th className="px-6 py-4">Order ID</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold capitalize", 
                              order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            )}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm">₹{order.total}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-muted" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-bold px-2">System Status</h2>
                <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Community Feedback</h2>
            <div className="bg-secondary/20 border border-white/5 rounded-[40px] overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    <th className="px-8 py-6">Customer</th>
                    <th className="px-8 py-6">Rating</th>
                    <th className="px-8 py-6">Review</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reviews.map((review) => (
                    <tr key={review.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6 font-bold">{review.userName}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-bold">{review.rating}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm">{review.comment}</td>
                      <td className="px-8 py-6 text-right">
                        <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Kitchen Partners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {vendorsList.map((vendor) => (
                <div key={vendor.id} className="bg-secondary/20 border border-white/5 p-6 rounded-[2rem] space-y-4">
                  <h3 className="text-lg font-bold truncate">{vendor.name}</h3>
                  <div className="flex justify-between text-xs text-muted">
                    <span>Plate: ₹{vendor.pricePerLunch}</span>
                    <span>Rating: {(vendor.totalRatingSum / (vendor.totalReviewCount || 1)).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Vendor Payouts</h2>
            <div className="bg-secondary/20 border border-white/5 rounded-[40px] p-8 space-y-4">
              {vendorsList.map((vendor) => {
                const unpaid = vendor.pendingBalance || 0;
                const isSettled = unpaid === 0;
                return (
                  <div key={vendor.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div>
                      <p className="font-bold">{vendor.name}</p>
                      <p className="text-[10px] text-muted font-mono tracking-tighter">ID: {vendor.id.slice(0,8)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted font-bold uppercase mb-1">Unpaid Balance</p>
                      <p className={cn("text-xl font-bold", isSettled ? "text-emerald-500" : "text-white")}>
                        {isSettled ? "Settled" : `₹${unpaid}`}
                      </p>
                    </div>
                    {!isSettled && (
                      <button 
                        onClick={() => handleSettleDues(vendor.id, unpaid)}
                        className="px-6 py-3 bg-emerald-500 text-black font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                      >
                        Settle Dues
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
