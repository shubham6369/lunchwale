"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SeedPage() {
  const [status, setStatus] = useState("Idle");

  const seed = async () => {
    setStatus("Seeding...");
    try {
      const vendorsRef = collection(db, "vendors");
      const ordersRef = collection(db, "orders");
      const reviewsRef = collection(db, "reviews");
      
      const v1Data = {
        name: "Mom's Magic Tiffin",
        location: "Indiranagar, Bangalore",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800",
        pricePerLunch: 80,
        monthlyPlan: 2000,
        tags: ["Pure Veg", "Homemade", "Popular"],
        isPopular: true,
        deliveryTime: "30-45 min",
        totalRatingSum: 48,
        totalReviewCount: 10,
        description: "Authentic Ghar Jaisa Khana prepared with love by professional home chefs using cold-pressed oils.",
        menu: [
          {
            category: "Daily Specials",
            items: [
              { id: "v1-m1", name: "Premium Veg Thali", price: 80, desc: "Dal, Chawal, 2 Sabzi, 4 Roti, Salad, Raita", image: "/images/hero.png" },
              { id: "v1-m2", name: "Executive Thali", price: 120, desc: "Paneer, Dal Makhani, Pulao, 4 Roti, Sweet", image: "/images/pasta.png" }
            ]
          },
          {
            category: "Subscriptions",
            items: [
              { id: "v1-s1", name: "Monthly Economy", price: 2000, desc: "22 Daily Veg Thalis (Mon-Sat)", image: "/images/hero.png" }
            ]
          }
        ],
        createdAt: serverTimestamp()
      };

      const v2Data = {
        name: "Healthy Harvest",
        location: "Koramangala, Bangalore",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800",
        pricePerLunch: 120,
        monthlyPlan: 3000,
        tags: ["Diet Spec", "Healthy", "Veg"],
        isPopular: false,
        deliveryTime: "20-30 min",
        totalRatingSum: 45,
        totalReviewCount: 10,
        description: "Nutritious, high-protein meals designed by nutritionists for your fitness goals.",
        menu: [
          {
            category: "Salads & Bowls",
            items: [
              { id: "v2-m1", name: "Quinoa Protein Bowl", price: 150, desc: "Quinoa, Sprouts, Grilled Tofu, Seed mix", image: "/images/salad.png" },
              { id: "v2-m2", name: "Greek Salad", price: 130, desc: "Feta, Olives, Cucumber, Lettuce, Lemon dressing", image: "/images/salad.png" }
            ]
          }
        ],
        createdAt: serverTimestamp()
      };

      const vendor1 = await addDoc(vendorsRef, v1Data);
      const vendor2 = await addDoc(vendorsRef, v2Data);

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
    } catch (e) {
      console.error(e);
      setStatus("Error: " + e);
    }
  };

  return (
    <div className="p-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Seeding Tool</h1>
      <button 
        onClick={seed}
        className="px-8 py-4 bg-primary text-secondary font-bold rounded-xl"
      >
        {status === "Idle" ? "Click to Seed Vendors" : status}
      </button>
      {status === "Done!" && (
        <p className="mt-4 text-emerald-500">Data added successfully! Go to home page to see results.</p>
      )}
    </div>
  );
}
