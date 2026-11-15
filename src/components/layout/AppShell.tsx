"use client";

import { useEffect, ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { usePlayerStore } from "@/lib/store/playerStore";

export function AppShell({ children }: { children: ReactNode }) {
  const init = usePlayerStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex flex-col min-h-screen bg-[#080B14] bg-arcade-grid relative selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      {/* Background ambient lighting effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-gradient pointer-events-none -z-10" />

      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
