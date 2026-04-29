import Link from 'next/link';
import { Home, Search, Ghost } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_0%,rgba(242,183,5,0.05)_0%,transparent_50%)]">
      <div className="text-center space-y-8 max-w-xl mx-auto">
        <div className="relative inline-block">
          <h1 className="text-[120px] font-black leading-none bg-linear-to-b from-white to-white/10 bg-clip-text text-transparent opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <Ghost className="w-24 h-24 text-primary animate-bounce" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Lost in the Tiffin Jungle?</h2>
          <p className="text-muted text-lg text-balance">
            The meal you're looking for might have been delivered already, or the vendor has changed their menu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-primary text-secondary font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            <Home className="w-5 h-5" />
            Go to Kitchen
          </Link>
          
          <Link 
            href="/search"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all border border-white/10"
          >
            <Search className="w-5 h-5" />
            Search Menus
          </Link>
        </div>

        <div className="pt-12">
           <div className="inline-flex items-center gap-4 p-1 bg-secondary/40 border border-white/5 rounded-full pl-4 pr-1">
              <span className="text-xs text-muted font-black uppercase tracking-widest">Hungry?</span>
              <Link href="/" className="px-6 py-2 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/20">
                Order Now
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
