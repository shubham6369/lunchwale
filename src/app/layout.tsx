import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LunchNow | Ghar Jaisa Khana, Delivery Everywhere",
  description: "Experience the premium tiffin service. Healthy, homemade, and hygienic meals delivered to your doorstep. Subscription plans starting at ₹2000/month.",
  keywords: ["tiffin service", "homemade food", "lunch delivery", "healthy meals", "veg tiffin", "non-veg tiffin"],
  openGraph: {
    title: "LunchNow | Ghar Jaisa Khana",
    description: "Premium homemade meal delivery service.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            <Footer />
            <WhatsAppButton />
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
