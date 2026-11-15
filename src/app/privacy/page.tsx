import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-[#00E5FF] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Home
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs font-mono text-slate-400">Effective Date: November 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">1. Introduction</h2>
          <p>
            Reflex Arena is committed to protecting your privacy. We believe in minimal data footprint principles: anyone can play all 10 arcade disciplines completely anonymously without creating an account or providing personally identifiable information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">2. Data We Collect</h2>
          <p>
            - <strong>Local Gameplay Data:</strong> Reaction times, scores, achievements, and unlocked items are stored directly within your browser&apos;s local storage.
          </p>
          <p>
            - <strong>Server Submissions:</strong> When participating in ranked global leaderboards or daily challenges, anonymous telemetry including reaction latency, session duration, and mathematical verification hashes are recorded to detect automated bot scripts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">3. Cookies & Telemetry</h2>
          <p>
            We do not use invasive third-party cross-site tracking cookies. We utilize standard browser local storage for keeping your gladiator level, coins, and high scores persistent across visits.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-white">4. Contact & Inquiries</h2>
          <p>
            For privacy queries or data deletion requests, contact security@reflexarena.gg.
          </p>
        </section>
      </div>
    </div>
  );
}
