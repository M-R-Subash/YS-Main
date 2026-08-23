import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-[9rem] leading-none font-black text-white/10 select-none tracking-tighter">404</h1>
        
        <div className="space-y-2 relative -mt-16">
          <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-white/60 text-sm">
            The page you are looking for may have been moved, deleted, or is currently in draft mode.
          </p>
        </div>

        <div className="pt-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all hover:-translate-y-0.5"
          >
            Return to Homepage
            <MoveRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
