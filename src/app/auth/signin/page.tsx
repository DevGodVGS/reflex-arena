"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const { profile } = usePlayerStore();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Synchronizing cloud gladiator profile...");
    setTimeout(() => {
      window.location.href = "/profile";
    }, 1000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-16 flex flex-col items-center">
      <div className="w-full rounded-3xl bg-[#111827] border border-[#1E293B] p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] p-[1.5px]">
            <div className="w-full h-full bg-[#080B14] rounded-[14px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#00E5FF]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Gladiator Sign In</h1>
          <p className="text-xs text-slate-400">
            Sync your local guest scores and achievements to your permanent cloud account.
          </p>
        </div>

        {status && (
          <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-xs font-mono text-[#00E5FF] text-center">
            {status}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="gladiator@reflexarena.gg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080B14] border border-[#1E293B] text-white text-xs focus:border-[#00E5FF] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080B14] border border-[#1E293B] text-white text-xs focus:border-[#00E5FF] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>Sign In to Cloud</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-[#1E293B]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-[#00E5FF] font-bold hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
}
