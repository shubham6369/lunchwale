"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Star, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ShoppingBag,
  Info,
  ChevronDown,
  Plus,
  Minus,
  MessageCircle,
  Utensils
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import LoginDialog from "@/components/LoginDialog";

import { getVendor } from "@/lib/firestore";

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { addToCart, items, cartCount, cartTotal, updateQuantity } = useCart();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true);
      const data = await getVendor(params.id);
      setVendor(data);
      setLoading(false);
    };
    fetchVendor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-bold">Loading Kitchen...</h2>
        <p className="text-muted text-sm mt-2">Getting the best local flavors for you.</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mb-6">
          <Utensils className="text-muted w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Kitchen Not Found</h2>
        <p className="text-muted text-sm mb-8">The kitchen you're looking for might have moved or closed.</p>
        <Link href="/vendors" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-glow">
          Explore Other Kitchens
        </Link>
      </div>
    );
  }

  const menuSections = vendor.menuSections || [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
       {/* Hero Section */}
       <header className="relative h-[45vh] w-full overflow-hidden">
        <Image 
          src={vendor.image} 
          alt={vendor.name} 
          fill 
          className="object-cover brightness-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <nav className="absolute top-0 w-full z-10 px-6 h-20 flex items-center justify-between">
          <Link href="/vendors" className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-black/60 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:bg-black/60 transition-all relative"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-glow">
                  {cartCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5">
                <div className="hidden md:block text-right">
                  <div className="text-[10px] font-bold text-white">Verified</div>
                  <button onClick={() => logout()} className="text-[9px] text-primary font-bold hover:underline">Logout</button>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-xs">
                  {user.phoneNumber?.slice(-2) || "U"}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-full text-sm font-bold shadow-glow transition-all"
              >
                Login
              </button>
            )}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                {vendor.isPopular && (
                  <span className="px-3 py-1 bg-primary text-[10px] font-bold uppercase rounded-lg shadow-glow">Popular</span>
                )}
                <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{vendor.rating || 4.5} ({vendor.totalReviewCount || 10}+)</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold tracking-tight">{vendor.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {vendor.location}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {vendor.deliveryTime || "30-45 min"}</div>
                <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Verified Kitchen</div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 mt-12 grid lg:grid-cols-[1fr_380px] gap-12">
        <div className="space-y-12">
          {/* About */}
          <section className="bg-secondary/30 p-8 rounded-[40px] border border-white/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                <Info className="text-primary w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">About Kitchen</h2>
                <p className="text-muted leading-relaxed text-sm">{vendor.description}</p>
              </div>
            </div>
          </section>

          {/* Menu Sections */}
          {menuSections.map((section: any, idx: number) => (
            <section key={section.category || idx} className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                  <Utensils className="w-6 h-6 text-primary" />
                  {section.category}
                </h3>
                <div className="h-px flex-1 bg-white/5 ml-6" />
              </div>

              <div className="grid gap-6">
                {(section.items || []).map((item: any) => (
                  <motion.div 
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    className="group bg-secondary/10 hover:bg-secondary/20 border border-white/5 p-6 rounded-[32px] flex items-center gap-6 transition-all"
                  >
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-premium">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{item.name}</h4>
                        <span className="text-xl font-black text-white tracking-tight">₹{item.price}</span>
                      </div>
                      <p className="text-xs text-muted mb-6 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                        {item.desc}
                      </p>
                      <button 
                        onClick={() => addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          vendorId: vendor.id,
                          vendorName: vendor.name,
                          type: section.category?.toLowerCase().includes("subscription") ? "subscription" : "meal"
                        })}
                        className="flex items-center gap-2 px-6 py-2.5 bg-background border border-white/10 group-hover:bg-primary group-hover:border-primary group-hover:text-white rounded-xl text-xs font-bold transition-all shadow-glow"
                      >
                        <Plus className="w-3 h-3" /> Add to Plate
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sidebar Sticky Cart / Summary */}
        <aside className="hidden lg:block">
          <div className="sticky top-32 space-y-8">
            <div className="bg-secondary/30 border border-white/10 rounded-[40px] p-8">
              <h3 className="text-xl font-bold mb-6">Your Lunch Plate</h3>
              {items.length === 0 ? (
                <div className="text-center py-12">
                   <ShoppingBag className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                   <p className="text-muted text-sm italic">Nothing yet! Add some Ghar-Jaisa items to start.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{item.name}</div>
                          <div className="text-[10px] text-muted">₹{item.price} × {item.quantity}</div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-white/10 rounded"><Minus className="w-3 h-3"/></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-white/10 rounded"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-xs font-bold text-muted uppercase">Subtotal</span>
                    <span className="text-xl font-bold">₹{cartTotal}</span>
                  </div>
                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-glow hover:bg-primary-dark transition-all active:scale-95">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 rounded-[40px] glass border border-[#25D366]/20 bg-[#25D366]/5">
              <h4 className="text-sm font-bold text-[#25D366] mb-4 uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Need Help?
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Chat directly with {vendor.name} kitchen for custom requests or bulk orders.
              </p>
              <a 
                href={`https://wa.me/${vendor.whatsapp || '919999999999'}?text=Hi ${vendor.name}, I have a query about your menu.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-xs shadow-glow-green flex items-center justify-center gap-2"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Mobile Cart */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 inset-x-6 z-50 lg:hidden"
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full h-16 bg-primary text-white rounded-3xl shadow-glow px-8 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                 <div>
                   <div className="text-sm font-bold">{cartCount} Items Added</div>
                   <div className="text-[10px] text-white/70">From {vendor.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black text-lg">
                View Plate <ChevronDown className="w-4 h-4 -rotate-90" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}
