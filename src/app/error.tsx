'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-10 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted text-sm">
            We've encountered an unexpected error. Don't worry, our team has been notified.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-primary text-secondary font-black rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
          
          <Link 
            href="/"
            className="w-full py-4 bg-white/5 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {error.digest && (
          <p className="text-[10px] text-muted font-mono bg-black/20 py-1 px-2 rounded-lg inline-block">
            Error ID: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
