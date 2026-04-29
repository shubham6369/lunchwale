"use client";

import React, { useEffect, useState } from "react";
import { m } from "framer-motion";
import { TrendingUp, ShoppingBag, Users, Star, ArrowUpRight, Utensils } from "lucide-react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function VendorInsightsPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const q = query(
        collection(db, "orders"),
        where("vendorId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  // Calculate metrics
  const delivered = orders.filter(o => o.status === "delivered");
  const totalRevenue = delivered.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const avgOrderValue = delivered.length ? Math.round(totalRevenue / delivered.length) : 0;
  const uniqueCustomers = new Set(orders.map(o => o.userId)).size;

  // Top dishes by order count
  const dishCount: Record<string, { name: string; count: number; revenue: number }> = {};
  delivered.forEach(order => {
    (order.items || []).forEach((item: any) => {
      if (!dishCount[item.name]) dishCount[item.name] = { name: item.name, count: 0, revenue: 0 };
      dishCount[item.name].count += item.quantity || 1;
      dishCount[item.name].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });
  const topDishes = Object.values(dishCount).sort((a, b) => b.count - a.count).slice(0, 5);

  // Today's stats
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => {
    const t = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : 0;
    return t >= startOfToday.getTime();
  });
  const todayRevenue = todayOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (Number(o.total) || 0), 0);

  // Last 7 days orders
  const dayMs = 86400000;
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const dayStart = d.getTime();
    const dayEnd = dayStart + dayMs;

    const dayOrders = orders.filter(o => {
      const t = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : 0;
      return t >= dayStart && t < dayEnd;
    });

    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      orders: dayOrders.length,
      revenue: dayOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (Number(o.total) || 0), 0),
    };
  });

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue), 1);

  const statCards = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Orders Delivered", value: delivered.length.toString(), icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Unique Customers", value: uniqueCustomers.toString(), icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Avg Order Value", value: `₹${avgOrderValue}`, icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Insights</h1>
          <p className="text-muted mt-2">Deep dive into your kitchen's performance metrics.</p>
        </div>
        <div className="flex gap-4 p-4 bg-secondary/30 rounded-[24px] border border-white/5">
          <div className="text-right">
            <div className="text-[10px] font-black text-muted uppercase tracking-widest">Today's Revenue</div>
            <div className="text-xl font-black text-primary">₹{todayRevenue.toLocaleString()}</div>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div className="text-right">
            <div className="text-[10px] font-black text-muted uppercase tracking-widest">Today's Orders</div>
            <div className="text-xl font-black text-white">{todayOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-secondary/40 p-6 rounded-[28px] border border-white/5 shadow-xl hover:border-primary/20 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-[10px] font-bold text-muted uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-black text-white mt-1">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Revenue Chart */}
      <div className="bg-secondary/30 border border-white/5 rounded-[32px] p-8">
        <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> 7-Day Revenue
        </h3>
        <div className="flex items-end gap-3 h-40">
          {weeklyData.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-[10px] font-bold text-primary">
                {day.revenue > 0 ? `₹${day.revenue}` : ""}
              </div>
              <m.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                className="w-full bg-primary/30 rounded-t-lg border-t-2 border-primary min-h-[4px]"
                style={{ height: `${Math.max((day.revenue / maxRevenue) * 128, 4)}px` }}
              />
              <div className="text-[10px] text-muted font-bold">{day.day}</div>
              <div className="text-[10px] text-muted">{day.orders} orders</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Dishes */}
      <div className="bg-secondary/30 border border-white/5 rounded-[32px] p-8">
        <h3 className="font-bold text-lg text-white mb-6 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-primary" /> Top Selling Dishes
        </h3>
        {topDishes.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No delivered orders yet. Keep going!</p>
        ) : (
          <div className="space-y-4">
            {topDishes.map((dish, i) => (
              <div key={dish.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-sm">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white text-sm">{dish.name}</span>
                    <span className="text-[10px] text-muted font-bold">{dish.count} sold • ₹{dish.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <m.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(dish.count / (topDishes[0]?.count || 1)) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
