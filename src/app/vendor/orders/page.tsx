"use client";

import React, { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  ChevronDown, 
  CheckCircle2, 
  Clock,
  Package,
  Utensils
} from "lucide-react";
import { db } from "@/lib/firestore";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  orderBy,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, using a placeholder vendor ID. In a real app, this comes from user profile.
    const vendorId = "maa-ka-swaad"; 
    
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      where("vendorId", "==", vendorId),
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
  }, []);

  const updateOrderStatus = async (orderId: string, status: string, userId: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });

      // Create notification for customer
      const notifRef = collection(db, "notifications");
      await addDoc(notifRef, {
        userId: userId,
        orderId: orderId,
        title: "Order Update",
        message: `Your order #${orderId.slice(-6).toUpperCase()} is now ${status.replace("_", " ")}!`,
        type: "order_update",
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const statusColors: any = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    cooking: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    out_for_delivery: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    delivered: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">New & Incoming Orders</h2>
        <div className="px-4 py-2 bg-secondary rounded-xl border border-white/5 text-xs font-bold text-muted">
          Auto-refreshing live...
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-secondary/30 p-20 rounded-[40px] border border-dashed border-white/10 text-center flex flex-col items-center">
          <ShoppingBag className="w-16 h-16 text-muted/30 mb-4" />
          <h3 className="text-xl font-bold text-muted">No orders yet today</h3>
          <p className="text-muted text-sm italic mt-2">When customers order, they will appear here in real-time.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {orders.map((order) => (
              <m.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-secondary rounded-[40px] border border-white/5 overflow-hidden shadow-xl"
              >
                <div className="p-8 grid md:grid-cols-[1fr_300px_200px] gap-8 items-center">
                  {/* Order Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${statusColors[order.status]}`}>
                        {order.status.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted font-bold tracking-tighter uppercase">ID: #{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="space-y-1">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-black text-primary">x{item.quantity}</span>
                          <span className="text-sm font-bold">{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-muted text-xs">
                      <Clock className="w-3 h-3" />
                      Received {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-3 p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">U</div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">Verified Customer</div>
                        <div className="text-[10px] text-muted">{order.address.slice(0, 30)}...</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-all border border-white/5 flex items-center justify-center gap-2">
                         <MapPin className="w-3 h-3" /> Address
                       </button>
                       <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold transition-all border border-white/5 flex items-center justify-center gap-2">
                         <Phone className="w-3 h-3" /> Contact
                       </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="text-xl font-black text-right mb-2 text-white">₹{order.total}</div>
                    
                    {order.status === "pending" && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, "confirmed", order.userId)}
                        className="w-full py-3 bg-primary text-white rounded-2xl text-xs font-bold shadow-glow hover:bg-primary-dark transition-all"
                      >
                        Accept Order
                      </button>
                    )}
                    {order.status === "confirmed" && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, "cooking", order.userId)}
                        className="w-full py-3 bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-glow-blue hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Utensils className="w-4 h-4" /> Start Cooking
                      </button>
                    )}
                    {order.status === "cooking" && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, "out_for_delivery", order.userId)}
                        className="w-full py-3 bg-purple-500 text-white rounded-2xl text-xs font-bold shadow-glow-purple hover:bg-purple-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" /> Order Ready
                      </button>
                    )}
                    {order.status === "out_for_delivery" && (
                      <button 
                         onClick={() => updateOrderStatus(order.id, "delivered", order.userId)}
                         className="w-full py-3 bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-glow-green hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                         <Package className="w-4 h-4" /> Mark Delivered
                      </button>
                    )}
                    {order.status === "delivered" && (
                      <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs bg-emerald-400/10 py-3 rounded-2xl border border-emerald-400/20">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
