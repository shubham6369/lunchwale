"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

// Inline SVG icons to avoid lucide-react version gaps
const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const InstagramIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#000000] text-white pt-16 pb-8 px-6 mt-auto font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="text-3xl font-bold italic tracking-tighter">
            Lunch<span className="text-red-600">Now</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 mb-16">
          {/* ABOUT LUNCHNOW */}
          <div>
            <h4 className="text-[13px] font-bold tracking-widest mb-5 uppercase">About LunchNow</h4>
            <ul className="space-y-3 text-[13px] text-gray-400 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Who We Are</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Work With Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Investor Relations</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Report Fraud</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* LUNCHVERSE */}
          <div>
            <h4 className="text-[13px] font-bold tracking-widest mb-5 uppercase">LunchVerse</h4>
            <ul className="space-y-3 text-[13px] text-gray-400 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">LunchNow</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Feeding India</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Hyperpure</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Lunchland</Link></li>
            </ul>
          </div>

          {/* LEARN MORE */}
          <div>
            <h4 className="text-[13px] font-bold tracking-widest mb-5 uppercase">Learn More</h4>
            <ul className="space-y-3 text-[13px] text-gray-400 font-medium">
              <li><Link href="#" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">Admin Panel <ExternalLink className="w-3 h-3" /></Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* SOCIAL LINKS */}
          <div>
            <h4 className="text-[13px] font-bold tracking-widest mb-5 uppercase">Social Links</h4>
            <div className="flex gap-4">
              <Link href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <FacebookIcon />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <TwitterIcon />
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                <InstagramIcon />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} LunchNow. All rights reserved.
          </p>
          <Link 
            href="/admin"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all border border-white/10 hover:border-white/20"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}

