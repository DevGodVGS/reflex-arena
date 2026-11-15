"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ShieldAlert, Zap, Sparkles } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";

interface Hazard {
  id: number;
  x: number; // in pixels
  y: number; // in pixels
  width: number;
  height: number;
  speed: number;
}

interface Orb {
  id: number;
  x: number;
  y: number;
  radius: number;
  speed: number;
}

export function DodgeMasterGame() {
  const meta = GAMES["dodge-master"];

  const engine = useGameEngine({
    gameId: "dodge-master",
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Game loop state
  const playerXRef = useRef<number>(200);
  const playerWidth = 36;
  const playerHeight = 24;
  const hazardsRef = useRef<Hazard[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const scoreRef = useRef<number>(0);
  const speedScaleRef = useRef<number>(1);
  const isGameOverRef = useRef<boolean>(false);
  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysPressedRef.current.left = true;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysPressedRef.current.right = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysPressedRef.current.left = false;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysPressedRef.current.right = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const runGameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Move player
    const moveSpeed = 6;
    if (keysPressedRef.current.left) {
      playerXRef.current = Math.max(playerWidth / 2, playerXRef.current - moveSpeed);
    }
    if (keysPressedRef.current.right) {
      playerXRef.current = Math.min(width - playerWidth / 2, playerXRef.current + moveSpeed);
    }

    // 2. Spawn hazards
    speedScaleRef.current += 0.0004; // progressive acceleration
    if (Math.random() < 0.04) {
      hazardsRef.current.push({
        id: Math.random(),
        x: Math.random() * (width - 40),
        y: -30,
        width: Math.random() * 30 + 20,
        height: 18,
        speed: (Math.random() * 2 + 3) * speedScaleRef.current,
      });
    }

    // 3. Spawn bonus crystals
    if (Math.random() < 0.015) {
      orbsRef.current.push({
        id: Math.random(),
        x: Math.random() * (width - 30) + 15,
        y: -20,
        radius: 9,
        speed: 2.5 * speedScaleRef.current,
      });
    }

    // 4. Update and draw canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background subtle grid lines
    ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const playerY = height - 45;

    // Draw player ship
    ctx.save();
    ctx.translate(playerXRef.current, playerY);
    ctx.fillStyle = "#00E5FF";
    ctx.shadowColor = "#00E5FF";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(0, -playerHeight / 2);
    ctx.lineTo(playerWidth / 2, playerHeight / 2);
    ctx.lineTo(-playerWidth / 2, playerHeight / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 5. Update Hazards & Check Collision
    const remainingHazards: Hazard[] = [];
    for (const h of hazardsRef.current) {
      h.y += h.speed;

      // Draw laser hazard
      ctx.fillStyle = "#EF4444";
      ctx.shadowColor = "#EF4444";
      ctx.shadowBlur = 10;
      ctx.fillRect(h.x, h.y, h.width, h.height);

      // Check collision with player
      const pLeft = playerXRef.current - playerWidth / 2;
      const pRight = playerXRef.current + playerWidth / 2;
      const pTop = playerY - playerHeight / 2;
      const pBottom = playerY + playerHeight / 2;

      if (
        h.x < pRight &&
        h.x + h.width > pLeft &&
        h.y < pBottom &&
        h.y + h.height > pTop
      ) {
        // Collision!
        isGameOverRef.current = true;
        sound.play("miss");
        engine.endGame(scoreRef.current, {
          roundsPlayed: Math.round(scoreRef.current / 100),
        });
        return;
      }

      if (h.y < height + 30) {
        remainingHazards.push(h);
      }
    }
    hazardsRef.current = remainingHazards;

    // 6. Update Orbs & Check Collection
    const remainingOrbs: Orb[] = [];
    for (const o of orbsRef.current) {
      o.y += o.speed;

      // Draw neon cyan orb
      ctx.fillStyle = "#22C55E";
      ctx.shadowColor = "#22C55E";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
      ctx.fill();

      // Check distance to player
      const dist = Math.hypot(o.x - playerXRef.current, o.y - playerY);
      if (dist < o.radius + playerWidth / 2) {
        // Collected!
        sound.play("hit");
        scoreRef.current += 500;
        engine.updateScore((prev) => prev + 500);
      } else if (o.y < height + 30) {
        remainingOrbs.push(o);
      }
    }
    orbsRef.current = remainingOrbs;

    // Score accumulation over time
    scoreRef.current += 2;
    engine.updateScore(scoreRef.current);

    if (!isGameOverRef.current) {
      rafRef.current = requestAnimationFrame(runGameLoop);
    }
  }, [engine]);

  useEffect(() => {
    if (engine.state === "PLAYING") {
      isGameOverRef.current = false;
      scoreRef.current = 0;
      speedScaleRef.current = 1;
      hazardsRef.current = [];
      orbsRef.current = [];
      rafRef.current = requestAnimationFrame(runGameLoop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [engine.state, runGameLoop]);

  // Touch and drag support for mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    playerXRef.current = Math.max(playerWidth / 2, Math.min(canvas.width - playerWidth / 2, touchX));
  };

  const handleRestart = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    isGameOverRef.current = false;
    scoreRef.current = 0;
    engine.restart();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={engine.score}
        combo={engine.combo}
        onPause={engine.pause}
        onResume={engine.resume}
        onRestart={handleRestart}
      />

      <div className="w-full h-[520px] bg-[#0A0E1A] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col items-center justify-center select-none">
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.2)]">
              <ShieldAlert className="w-8 h-8 text-[#00E5FF]" />
            </div>

            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
            </div>

            <div className="bg-[#080B14] p-4 rounded-xl border border-[#1E293B] text-left text-xs text-slate-300 max-w-md space-y-1.5">
              <span className="font-bold text-[#00E5FF] uppercase block font-mono">
                Instructions:
              </span>
              {meta.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#00E5FF] font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <button
              onClick={engine.ready}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Start Survival Run
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full h-full relative">
            <canvas
              ref={canvasRef}
              width={640}
              height={520}
              onTouchMove={handleTouchMove}
              className="w-full h-full block"
            />
          </div>
        )}

        {engine.state === "ENDED" && engine.results && (
          <ResultsModal meta={meta} result={engine.results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
