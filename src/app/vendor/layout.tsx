"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Utensils, 
  BarChart3, 
  Settings, 
  LogOut,
  LayoutDashboard,
  ChefHat
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/vendor" },
    { icon: ShoppingBag, label: "Orders", href: "/vendor/orders" },
    { icon: Utensils, label: "Menu Management", href: "/vendor/menu" },
    { icon: BarChart3, label: "Insights", href: "/vendor/insights" },
    { icon: Settings, label: "Profile", href: "/vendor/profile" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary border-r border-white/5 flex flex-col fixed h-full z-20">
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl shadow-glow flex items-center justify-center">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">LUNCH<span className="text-primary">NOW</span></span>
          </Link>
          <div className="mt-4 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full inline-block">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Vendor Partner</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all
                  ${isActive 
                    ? "bg-primary text-white shadow-glow" 
                    : "text-muted hover:bg-white/5 hover:text-white"}`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            {navItems.find(n => n.href === pathname)?.label || "Vendor Portal"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white">Maa Ka Swaad Kitchen</div>
              <div className="text-[10px] text-primary font-bold">Online & Taking Orders</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
              MK
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
