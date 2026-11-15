"use client";

import { useState } from "react";
import {
  Settings,
  Volume2,
  VolumeX,
  Sliders,
  Moon,
  Trash2,
  Download,
  Check,
  Shield,
  Sparkles,
} from "lucide-react";
import { usePlayerStore } from "@/lib/store/playerStore";
import { SoundPack } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    profile,
    soundSettings,
    setSoundMuted,
    setSoundVolume,
    setSoundPack,
  } = usePlayerStore();

  const [savedAlert, setSavedAlert] = useState(false);

  const soundPacks: { id: SoundPack; label: string; desc: string }[] = [
    { id: "cyber", label: "Cyber Classic", desc: "Default futuristic synth beeps and high-frequency chimes." },
    { id: "retro", label: "8-Bit Arcade", desc: "Classic chiptune sound waves reminiscent of 1980s coin-ops." },
    { id: "synthwave", label: "Retro Synthwave", desc: "Warm analog saw harmonics with lush resonant decays." },
    { id: "minimal", label: "Minimalist Crisp", desc: "Subtle organic woodblock clicks and clicks." },
  ];

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reflex_arena_profile_${profile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#00E5FF]">
          <Settings className="w-4 h-4" />
          SYSTEM CONFIGURATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
          Settings & Preferences
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Adjust procedural synthesizer audio, input calibration, and local data persistence.
        </p>
      </div>

      {/* 1. AUDIO SYNTHESIZER SETTINGS */}
      <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-[#00E5FF]" />
          Audio Synthesizer Engine
        </h2>

        {/* Mute Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#080B14] border border-[#1E293B]">
          <div>
            <span className="text-sm font-bold text-white block">Procedural Audio Effects</span>
            <span className="text-xs text-slate-400">Zero-latency synthesized clicks and chimes</span>
          </div>

          <button
            onClick={() => setSoundMuted(!soundSettings.isMuted)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              soundSettings.isMuted
                ? "bg-rose-950 border border-rose-600 text-rose-300"
                : "bg-[#00E5FF] text-[#080B14] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            )}
          >
            {soundSettings.isMuted ? "Audio Muted" : "Audio Active"}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2 p-4 rounded-2xl bg-[#080B14] border border-[#1E293B]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Master Volume</span>
            <span className="text-[#00E5FF] font-bold">
              {Math.round(soundSettings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundSettings.volume}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            className="w-full accent-[#00E5FF] bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Sound Pack Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase text-slate-400 block">
            Synthesizer Sound Pack
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {soundPacks.map((pack) => (
              <button
                key={pack.id}
                onClick={() => setSoundPack(pack.id)}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all",
                  soundSettings.soundPack === pack.id
                    ? "bg-[#080B14] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                    : "bg-[#080B14] border-[#1E293B] hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{pack.label}</span>
                  {soundSettings.soundPack === pack.id && (
                    <Check className="w-4 h-4 text-[#00E5FF]" />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{pack.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. DATA MANAGEMENT */}
      <div className="rounded-3xl bg-[#111827] border border-[#1E293B] p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          Data & Local Storage
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-[#080B14] border border-[#1E293B] gap-4">
          <div>
            <span className="text-sm font-bold text-white block">Export Profile JSON</span>
            <span className="text-xs text-slate-400">
              Download your personal bests, achievements, and stats backup
            </span>
          </div>

          <button
            onClick={handleExportData}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
