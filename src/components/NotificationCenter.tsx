"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle2, Clock, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firestore";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit 
} from "firebase/firestore";

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(docs);
      // Count notifications created in the last 5 minutes as 'unread' for this session
      const now = Date.now();
      const count = docs.filter((n: any) => (now - n.createdAt?.seconds * 1000) < 300000).length;
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 hover:bg-white/5 rounded-full transition-colors relative group"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-primary" : "text-muted group-hover:text-white"}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse shadow-glow shadow-primary" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-100"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-secondary border border-white/5 rounded-[32px] shadow-2xl z-101 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-muted text-xs italic">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex gap-4">
                        <div className="mt-1">
                           {notif.type === "order_update" ? (
                             <Package className="w-4 h-4 text-primary" />
                           ) : (
                             <Bell className="w-4 h-4 text-primary" />
                           )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold leading-tight">{notif.title}</p>
                          <p className="text-[10px] text-muted leading-relaxed">{notif.message}</p>
                          <p className="text-[8px] text-muted font-black uppercase tracking-widest pt-1">
                            {new Date(notif.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-white/5 text-center">
                 <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                    View All Activity
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
