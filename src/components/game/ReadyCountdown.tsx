"use client";

import { motion } from "framer-motion";

interface ReadyCountdownProps {
  count: number;
}

export function ReadyCountdown({ count }: ReadyCountdownProps) {
  return (
    <div className="absolute inset-0 z-40 bg-[#080B14]/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none select-none">
      <motion.div
        key={count}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.2, 1], opacity: [0, 1, 0.9] }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-8xl sm:text-9xl font-black font-mono tracking-tighter bg-gradient-to-br from-[#00E5FF] via-white to-[#8B5CF6] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,229,255,0.8)]">
          {count > 0 ? count : "GO!"}
        </span>
        <span className="text-sm font-mono uppercase tracking-widest text-[#00E5FF] animate-pulse">
          GET READY...
        </span>
      </motion.div>
    </div>
  );
}
