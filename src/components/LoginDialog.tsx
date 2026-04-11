"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Phone, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck, 
  Utensils,
  Loader2
} from "lucide-react";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "phone" | "otp" | "success";

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setStep("phone");
        setPhoneNumber("");
        setOtp("");
        setError(null);
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        console.log("Recaptcha verified");
      }
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setLoading(true);
    setError(null);

    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      // Add country code if not present (default to +91 for India)
      const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    setLoading(true);
    setError(null);

    try {
      await confirmationResult.confirm(otp);
      setStep("success");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError("Invalid OTP code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-secondary z-[110] rounded-[40px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div id="recaptcha-container"></div>
            
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Utensils className="text-white w-4 h-4" />
                  </div>
                  <span className="font-bold">LunchNow Auth</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {step === "phone" && (
                  <motion.div
                    key="phone"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-muted text-sm mb-8">Enter your phone number to get started with your hot meals.</p>
                    
                    <form onSubmit={handleSendOtp} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Phone Number</label>
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3">
                            <span className="text-sm font-bold text-muted">+91</span>
                          </div>
                          <input 
                            type="tel" 
                            placeholder="9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-background border border-white/10 focus:border-primary/50 rounded-2xl py-4 pl-16 pr-4 outline-none transition-all placeholder:opacity-30"
                            autoFocus
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
                      )}

                      <button 
                        disabled={loading || phoneNumber.length < 10}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-glow hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                        {!loading && <ChevronRight className="w-5 h-5" />}
                      </button>
                    </form>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <button 
                      onClick={() => setStep("phone")}
                      className="flex items-center gap-2 text-primary text-xs font-bold mb-6 hover:underline"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change Number
                    </button>
                    <h2 className="text-3xl font-bold mb-2">Verify OTP</h2>
                    <p className="text-muted text-sm mb-8">We&apos;ve sent a 6-digit code to <span className="text-white font-bold">{phoneNumber}</span></p>
                    
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">OTP Code</label>
                        <input 
                          type="text" 
                          placeholder="000000"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-background border border-white/10 focus:border-primary/50 tracking-[1em] text-center font-bold text-2xl rounded-2xl py-4 outline-none transition-all placeholder:opacity-30"
                          autoFocus
                        />
                      </div>

                      {error && (
                        <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
                      )}

                      <button 
                        disabled={loading || otp.length < 6}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-glow hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                      </button>

                      <p className="text-center text-xs text-muted">
                        Didn&apos;t receive code? <button type="button" onClick={handleSendOtp} className="text-primary font-bold hover:underline">Resend</button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-20 h-20 bg-[#4CAF50]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#4CAF50]">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Verified!</h2>
                    <p className="text-muted text-sm">Welcome to LunchNow. Redirecting you to your tiffins...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white/5 p-6 text-center border-t border-white/5">
              <p className="text-[10px] text-muted leading-relaxed">
                By continuing, you agree to our <span className="text-white underline cursor-pointer">Terms of Service</span> and <span className="text-white underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
