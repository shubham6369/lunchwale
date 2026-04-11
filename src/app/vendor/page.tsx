"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Clock,
  ArrowUpRight,
  Utensils
} from "lucide-react";

export default function VendorDashboard() {
  const stats = [
    { label: "Active Orders", value: "12", icon: ShoppingBag, color: "text-blue-400", trend: "+20%", bg: "bg-blue-400/10" },
    { label: "Total Revenue", value: "₹42,350", icon: TrendingUp, color: "text-emerald-400", trend: "+12.5%", bg: "bg-emerald-400/10" },
    { label: "Total Customers", value: "840", icon: Users, color: "text-purple-400", trend: "+5.2%", bg: "bg-purple-400/10" },
    { label: "Avg. Prep Time", value: "18m", icon: Clock, color: "text-amber-400", trend: "-2.4%", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-secondary p-6 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-muted text-xs font-bold uppercase tracking-widest">{stat.label}</h3>
              <div className="text-3xl font-black mt-2 text-white">{stat.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Recent Activity */}
        <section className="bg-secondary p-8 rounded-[40px] border border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Today's Performance</h3>
            <button className="text-xs font-bold text-primary hover:underline">View All Analysis</button>
          </div>
          
          <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-3xl text-muted text-sm italic">
            Visual analytics chart placeholder (Chart.js / Recharts)
          </div>
        </section>

        {/* Popular Items */}
        <section className="bg-secondary p-8 rounded-[40px] border border-white/5 space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Utensils className="w-5 h-5 text-primary" />
            Top Sellers
          </h3>
          <div className="space-y-6">
            {[
              { name: "Executive Special Thali", count: 124, price: 120 },
              { name: "Premium Veg Thali", count: 98, price: 80 },
              { name: "Monthly Economy Plan", count: 42, price: 2000 },
            ].map((item, idx) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-bold text-primary italic">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{item.name}</div>
                  <div className="text-[10px] text-muted">{item.count} orders this week</div>
                </div>
                <div className="text-sm font-bold">₹{item.price}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
