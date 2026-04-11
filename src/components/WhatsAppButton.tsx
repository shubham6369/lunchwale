"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
}

export default function WhatsAppButton({ 
  phoneNumber = "919000000000", // Placeholder: Replace with actual business number
  message = "Hi LunchNow! I'd like to know more about today's lunch menu." 
}: WhatsAppButtonProps) {
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, "_blank");
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleWhatsAppClick}
      className="fixed bottom-8 right-8 z-90 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-premium group"
    >
      <MessageCircle className="w-8 h-8 fill-white shadow-lg" />
      
      {/* Tooltip */}
      <div className="absolute right-[120%] top-1/2 -translate-y-1/2 px-4 py-2 bg-white text-black text-xs font-bold rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Need help? Chat with us!
        <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45" />
      </div>

      {/* Pulsing Ring Animation */}
      <div className="absolute inset-0 rounded-full border-4 border-[#25D366]/30 animate-ping pointer-events-none" />
    </motion.button>
  );
}
