"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  ChevronRight, 
  MapPin, 
  Package, 
  Clock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firestore";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy 
} from "firebase/firestore";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
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

  const statusMap: any = {
    pending: { label: "Order Placed", color: "text-amber-400 bg-amber-400/10" },
    confirmed: { label: "Confirmed", color: "text-blue-400 bg-blue-400/10" },
    cooking: { label: "Preparing your meal", color: "text-purple-400 bg-purple-400/10" },
    out_for_delivery: { label: "Out for Delivery", color: "text-indigo-400 bg-indigo-400/10" },
    delivered: { label: "Delivered", color: "text-emerald-400 bg-emerald-400/10" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Link href="/vendors" className="text-muted text-xs font-bold flex items-center gap-2 hover:text-primary transition-colors">
              <ArrowLeft className="w-3 h-3" /> Back to exploring
            </Link>
            <h1 className="text-4xl font-black italic tracking-tighter">YOUR <span className="text-primary">ORDERS</span></h1>
          </div>
          <div className="w-16 h-16 rounded-[20px] bg-secondary border border-white/5 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-secondary/30 p-20 rounded-[40px] border border-dashed border-white/10 text-center flex flex-col items-center">
            <Package className="w-16 h-16 text-muted/30 mb-4" />
            <h3 className="text-xl font-bold text-muted">No orders found</h3>
            <p className="text-muted text-sm italic mt-2">Start your first order from your favorite kitchen!</p>
            <Link href="/vendors" className="mt-8 px-8 py-3 bg-primary rounded-2xl font-bold text-sm shadow-glow">
              Explore Kitchens
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence>
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary rounded-[40px] border border-white/5 overflow-hidden group hover:border-primary/20 transition-all shadow-xl"
                >
                  <div className="p-8 grid md:grid-cols-[1fr_auto] gap-8 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 text-[10px] font-black uppercase rounded-full border border-white/5 ${statusMap[order.status]?.color}`}>
                          {statusMap[order.status]?.label || order.status}
                        </span>
                        <span className="text-[10px] text-muted font-bold tracking-widest uppercase">ID: #{order.id.slice(-6).toUpperCase()}</span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xl font-bold">{order.items[0]?.name} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</h4>
                        <div className="flex items-center gap-4 text-xs text-muted font-medium">
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                          <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {order.address.slice(0, 30)}...</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="text-3xl font-black italic tracking-tighter text-white">₹{order.total}</div>
                      <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Track Order
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Bar for Active Orders */}
                  {order.status !== "delivered" && (
                     <div className="px-8 pb-8">
                       <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ 
                             width: order.status === "pending" ? "20%" : 
                                    order.status === "confirmed" ? "40%" :
                                    order.status === "cooking" ? "70%" : "90%" 
                           }}
                           className="h-full bg-primary shadow-glow shadow-primary/50"
                         />
                       </div>
                     </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
