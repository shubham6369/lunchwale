"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function SeedPage() {
  const [status, setStatus] = useState("Idle");

  const seed = async () => {
    setStatus("Seeding...");
    try {
      const { collection, addDoc, doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const vendorsRef = collection(db, "vendors");
      const ordersRef = collection(db, "orders");
      const reviewsRef = collection(db, "reviews");
      
      // 1. Vendor 1: Mom's Magic Tiffin
      const v1Data = {
        name: "Mom's Magic Tiffin",
        location: "Indiranagar, Bangalore",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800",
        pricePerLunch: 80,
        monthlyPlan: 2000,
        tags: ["Pure Veg", "Homemade", "Popular"],
        isPopular: true,
        status: "active",
        isOpen: true,
        deliveryTime: "30-45 min",
        totalRatingSum: 48,
        totalReviewCount: 10,
        description: "Authentic Ghar Jaisa Khana prepared with love by professional home chefs using cold-pressed oils.",
        createdAt: serverTimestamp()
      };

      const vendor1 = await addDoc(vendorsRef, v1Data);
      
      // Dishes for Vendor 1
      const v1Dishes = [
        { name: "Premium Veg Thali", price: 80, category: "Thalis", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400" },
        { name: "Executive Paneer Thali", price: 120, category: "Thalis", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400" },
        { name: "Dal Makhani Bowl", price: 90, category: "Curries", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1585937421612-71a005056cd9?auto=format&fit=crop&w=400" },
        { name: "Homestyle Aloo Paratha", price: 50, category: "Breakfast", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400" }
      ];

      for (const dish of v1Dishes) {
        const dishRef = doc(collection(db, "vendors", vendor1.id, "dishes"));
        await setDoc(dishRef, { ...dish, id: dishRef.id, vendorId: vendor1.id, updatedAt: serverTimestamp() });
      }

      // 2. Vendor 2: Healthy Harvest
      const v2Data = {
        name: "Healthy Harvest",
        location: "Koramangala, Bangalore",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800",
        pricePerLunch: 120,
        monthlyPlan: 3000,
        tags: ["Diet Spec", "Healthy", "Veg"],
        isPopular: false,
        status: "active",
        isOpen: true,
        deliveryTime: "20-30 min",
        totalRatingSum: 45,
        totalReviewCount: 10,
        description: "Nutritious, high-protein meals designed by nutritionists for your fitness goals.",
        createdAt: serverTimestamp()
      };

      const vendor2 = await addDoc(vendorsRef, v2Data);

      // Dishes for Vendor 2
      const v2Dishes = [
        { name: "Quinoa Protein Bowl", price: 150, category: "Salads", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400" },
        { name: "Greek Salad", price: 130, category: "Salads", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400" },
        { name: "Avocado Toast", price: 180, category: "Breakfast", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400" }
      ];

      for (const dish of v2Dishes) {
        const dishRef = doc(collection(db, "vendors", vendor2.id, "dishes"));
        await setDoc(dishRef, { ...dish, id: dishRef.id, vendorId: vendor2.id, updatedAt: serverTimestamp() });
      }

      // 3. Vendor 3: Spice Route (Non-Veg)
      const v3Data = {
        name: "Spice Route",
        location: "HSR Layout, Bangalore",
        image: "https://images.unsplash.com/photo-1589187151003-0dd4769c82e2?auto=format&fit=crop&w=800",
        pricePerLunch: 150,
        monthlyPlan: 3500,
        tags: ["Non-Veg", "Spicy", "Biryani"],
        isPopular: true,
        status: "active",
        isOpen: true,
        deliveryTime: "40-50 min",
        totalRatingSum: 92,
        totalReviewCount: 20,
        description: "Experience the rich flavors of traditional Indian spices and perfectly cooked meats.",
        createdAt: serverTimestamp()
      };

      const vendor3 = await addDoc(vendorsRef, v3Data);

      // Dishes for Vendor 3
      const v3Dishes = [
        { name: "Chicken Dum Biryani", price: 180, category: "Biryani", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&w=400" },
        { name: "Butter Chicken", price: 220, category: "Curries", isVeg: false, isAvailable: true, image: "https://images.unsplash.com/photo-1603894584713-f484439d3b7c?auto=format&fit=crop&w=400" },
        { name: "Garlic Naan", price: 40, category: "Breads", isVeg: true, isAvailable: true, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400" }
      ];

      for (const dish of v3Dishes) {
        const dishRef = doc(collection(db, "vendors", vendor3.id, "dishes"));
        await setDoc(dishRef, { ...dish, id: dishRef.id, vendorId: vendor3.id, updatedAt: serverTimestamp() });
      }

      // Seed a sample order
      await addDoc(ordersRef, {
        userId: "sample-user",
        userName: "Shivam Kumar",
        vendorId: vendor1.id,
        vendorName: v1Data.name,
        items: [
          { id: "v1-m1", name: "Premium Veg Thali", price: 80, quantity: 2, image: "/images/hero.png" }
        ],
        total: 160,
        address: "Flat 402, Sunshine Apts, Patna",
        status: "pending",
        createdAt: serverTimestamp()
      });

      // Seed a sample review
      await addDoc(reviewsRef, {
        vendorId: vendor1.id,
        userName: "Rahul Sharma",
        rating: 5,
        comment: "Excellent food! Truly reminds me of home. The rotis were soft and warm.",
        createdAt: serverTimestamp()
      });

      setStatus("Done!");
      toast.success("Database seeded successfully!");
    } catch (e: any) {
      console.error("Seeding error:", e);
      let errorMessage = e.message || String(e);
      
      if (e.code === 'permission-denied') {
        errorMessage = "Permission Denied: Update your Firestore Security Rules in the Firebase Console.";
      } else if (e.code === 'unavailable') {
        errorMessage = "Service Unavailable: Check your internet connection or Firebase project status.";
      }
      
      setStatus("Error: " + errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-20 text-center bg-background min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-gradient">Seeding Tool</h1>
      <div className="max-w-md mx-auto bg-secondary/20 p-12 rounded-[40px] border border-white/10 shadow-2xl">
        <button 
          onClick={seed}
          disabled={status === "Seeding..."}
          className="w-full px-8 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-glow disabled:opacity-50 disabled:scale-100"
        >
          {status === "Idle" ? "Click to Seed Database" : status}
        </button>
        {status === "Done!" && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-emerald-500 font-bold"
          >
            Data added successfully! <br />
            <span className="text-muted text-xs font-normal">Go to home page to see results.</span>
          </motion.p>
        )}
      </div>
    </div>
  );
}
