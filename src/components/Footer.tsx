"use client";

import React from "react";
import Link from "next/link";
import { 
  Utensils, 
  ArrowRight, 
  Star,
  Camera,
  Share2,
  Send
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black/50 backdrop-blur-md border-t border-white/5 pt-24 pb-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-glow">
                <Utensils className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Lunch<span className="text-primary">Now</span></span>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-8">
              Premium multi-vendor lunch platform connecting home kitchens to busy professionals. Authentic, healthy, and delivered with love.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all group border border-white/5">
                <Camera className="w-4 h-4 group-hover:text-black transition-colors" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all group border border-white/5">
                <Share2 className="w-4 h-4 group-hover:text-black transition-colors" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all group border border-white/5">
                <Send className="w-4 h-4 group-hover:text-black transition-colors" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white text-sm uppercase tracking-widest">Quick Links</h4>
            <ul className="space-y-4 text-sm text-muted">
              <li><Link href="#menu" className="hover:text-primary transition-colors">Find Kitchens</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Daily Menu Thali</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Subscription Plans</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Corporate Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white text-sm uppercase tracking-widest">Partner with Us</h4>
            <ul className="space-y-4 text-sm text-muted">
              <li><Link href="#" className="hover:text-primary transition-colors">List Your Kitchen</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Be a Delivery Partner</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Corporate Catering</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Partner FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white text-sm uppercase tracking-widest">Stay Fresh</h4>
            <p className="text-sm text-muted mb-4 leading-relaxed">Get weekly menu updates and seasonal health tips.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary/50 transition-all placeholder:text-muted/50" 
              />
              <button className="p-3 bg-primary text-black rounded-xl shadow-glow hover:bg-primary-dark transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-muted flex items-center gap-2">
            &copy; {new Date().getFullYear()} LunchNow SaaS. Crafted with ❤️ for your health.
          </div>
          <div className="flex gap-8 text-xs text-muted">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link href="#" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
