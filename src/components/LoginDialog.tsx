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
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "choose" | "phone" | "otp" | "success";

// Google "G" SVG icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const { signInWithGoogle, profile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("choose");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("choose");
        setPhoneNumber("");
        setOtp("");
        setError(null);
        setLoading(false);
        setGoogleLoading(false);
      }, 300);
    }
  }, [isOpen]);

  // ── Google Sign-in ──────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      setStep("success");
      
      // Handle redirection after a short delay
      setTimeout(() => {
        onClose();
        // Use a small delay to ensure profile has synced if it was just created/updated
        const role = profile?.role;
        if (role === 'vendor') {
          router.push('/vendor');
        } else if (role === 'admin') {
          router.push('/admin');
        }
      }, 1800);
    } catch (err: any) {
      console.error(err);
      setError(err.code === "auth/popup-closed-by-user" 
        ? "Sign-in cancelled. Please try again."
        : err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Phone OTP ───────────────────────────────────────────
  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      try { (window as any).recaptchaVerifier.clear(); } catch {}
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setError(null);
    try {
      setupRecaptcha();
      const formatted = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formatted, (window as any).recaptchaVerifier);
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
        const role = profile?.role;
        if (role === 'vendor') {
          router.push('/vendor');
        } else if (role === 'admin') {
          router.push('/admin');
        }
      }, 2000);
    } catch (err: any) {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-100"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111] z-110 rounded-[40px] border border-white/8 shadow-2xl overflow-hidden"
          >
            <div id="recaptcha-container" />

            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Utensils className="text-white w-4 h-4" />
                  </div>
                  <span className="font-bold text-white">LunchNow</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <AnimatePresence mode="wait">

                {/* ─── Step: choose method ─── */}
                {step === "choose" && (
                  <motion.div
                    key="choose"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h2 className="text-3xl font-bold mb-1 text-white">Welcome Back</h2>
                    <p className="text-muted text-sm mb-8">Sign in to order your favourite meals.</p>

                    {/* Google button */}
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-white text-gray-800 rounded-2xl font-bold hover:bg-gray-100 transition-all mb-4 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                    >
                      {googleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      ) : (
                        <GoogleIcon />
                      )}
                      {googleLoading ? "Signing in…" : "Continue with Google"}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-muted text-xs font-bold uppercase tracking-wider">or</span>
                      <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Phone button */}
                    <button
                      onClick={() => setStep("phone")}
                      className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                      Continue with Phone (OTP)
                    </button>

                    {error && (
                      <p className="mt-4 text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                        {error}
                      </p>
                    )}
                  </motion.div>
                )}

                {/* ─── Step: phone ─── */}
                {step === "phone" && (
                  <motion.div
                    key="phone"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <button
                      onClick={() => setStep("choose")}
                      className="flex items-center gap-2 text-primary text-xs font-bold mb-6 hover:underline"
                    >
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <h2 className="text-3xl font-bold mb-2 text-white">Enter Phone</h2>
                    <p className="text-muted text-sm mb-8">We'll send you a 6-digit OTP.</p>

                    <form onSubmit={handleSendOtp} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Phone Number</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-white/10 pr-3">
                            <span className="text-sm font-bold text-muted">+91</span>
                          </div>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-background border border-white/10 focus:border-primary/50 rounded-2xl py-4 pl-16 pr-4 outline-none transition-all text-white placeholder:opacity-30"
                            autoFocus
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
                      )}

                      <button
                        disabled={loading || phoneNumber.length < 10}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ChevronRight className="w-5 h-5" /></>}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* ─── Step: OTP ─── */}
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
                    <h2 className="text-3xl font-bold mb-2 text-white">Verify OTP</h2>
                    <p className="text-muted text-sm mb-8">
                      Code sent to <span className="text-white font-bold">+91 {phoneNumber}</span>
                    </p>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-background border border-white/10 focus:border-primary/50 tracking-[1em] text-center font-bold text-2xl rounded-2xl py-4 outline-none transition-all text-white placeholder:opacity-30"
                        autoFocus
                      />

                      {error && (
                        <p className="text-xs text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>
                      )}

                      <button
                        disabled={loading || otp.length < 6}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                      </button>

                      <p className="text-center text-xs text-muted">
                        Didn&apos;t receive code?{" "}
                        <button type="button" onClick={handleSendOtp} className="text-primary font-bold hover:underline">
                          Resend
                        </button>
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* ─── Step: success ─── */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                      className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <ShieldCheck className="w-10 h-10 text-emerald-400" />
                    </motion.div>
                    <h2 className="text-3xl font-bold mb-2 text-white">Welcome!</h2>
                    <p className="text-muted text-sm">You&apos;re signed in. Enjoy your meals 🍱</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-white/3 p-6 text-center border-t border-white/5">
              <p className="text-[10px] text-muted leading-relaxed">
                By continuing, you agree to our{" "}
                <span className="text-white underline cursor-pointer">Terms of Service</span> and{" "}
                <span className="text-white underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
