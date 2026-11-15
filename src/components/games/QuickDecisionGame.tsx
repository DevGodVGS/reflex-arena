"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { HelpCircle, Check, X, ArrowUp, ArrowDown, Circle, Square } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

interface Question {
  prompt: string;
  displayElement: "NUMBER" | "ARROW" | "SHAPE";
  value: number | string;
  isYes: boolean;
}

export function QuickDecisionGame() {
  const meta = GAMES["quick-decision"];
  const TOTAL_QUESTIONS = 20;

  const engine = useGameEngine({
    gameId: "quick-decision",
    totalRounds: TOTAL_QUESTIONS,
  });

  const [questionIndex, setQuestionIndex] = useState<number>(1);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const generateQuestion = useCallback((): Question => {
    const qTypes = ["EVEN_CHECK", "ARROW_UP_CHECK", "CIRCLE_CHECK"];
    const type = qTypes[Math.floor(Math.random() * qTypes.length)];

    if (type === "EVEN_CHECK") {
      const num = Math.floor(Math.random() * 90) + 10;
      const isEven = num % 2 === 0;
      return {
        prompt: "IS THIS NUMBER EVEN?",
        displayElement: "NUMBER",
        value: num,
        isYes: isEven,
      };
    } else if (type === "ARROW_UP_CHECK") {
      const isUp = Math.random() > 0.5;
      return {
        prompt: "IS THE ARROW POINTING UP?",
        displayElement: "ARROW",
        value: isUp ? "UP" : "DOWN",
        isYes: isUp,
      };
    } else {
      const isCircle = Math.random() > 0.5;
      return {
        prompt: "IS THIS SHAPE A CIRCLE?",
        displayElement: "SHAPE",
        value: isCircle ? "CIRCLE" : "SQUARE",
        isYes: isCircle,
      };
    }
  }, []);

  const nextQuestion = useCallback(() => {
    setCurrentQ(generateQuestion());
    setQuestionStartTime(performance.now());
  }, [generateQuestion]);

  useEffect(() => {
    if (engine.state === "PLAYING" && !currentQ) {
      nextQuestion();
    }
  }, [engine.state, currentQ, nextQuestion]);

  const handleDecision = useCallback(
    (choice: boolean) => {
      if (engine.state !== "PLAYING" || !currentQ) return;

      const latency = performance.now() - questionStartTime;
      const isCorrect = choice === currentQ.isYes;

      if (isCorrect) {
        sound.play("hit");
        const speedBonus = Math.max(0, Math.round(500 - latency));
        const pts = 300 + speedBonus;
        engine.updateScore((prev) => prev + pts);
        engine.updateCombo(engine.combo + 1);
        setCorrectCount((prev) => prev + 1);
      } else {
        sound.play("miss");
        engine.updateCombo(0);
      }

      if (questionIndex >= TOTAL_QUESTIONS) {
        const total = TOTAL_QUESTIONS;
        const accuracy = Math.round(((correctCount + (isCorrect ? 1 : 0)) / total) * 100);
        setTimeout(() => {
          engine.endGame(undefined, {
            accuracyPercentage: accuracy,
            roundsPlayed: total,
          });
        }, 500);
      } else {
        setQuestionIndex((prev) => prev + 1);
        nextQuestion();
      }
    },
    [engine, currentQ, questionStartTime, questionIndex, correctCount, nextQuestion]
  );

  // Keyboard navigation: Left Arrow / Key A = YES, Right Arrow / Key D = NO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        handleDecision(true);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        handleDecision(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDecision]);

  const handleRestart = () => {
    setQuestionIndex(1);
    setCorrectCount(0);
    setCurrentQ(null);
    engine.restart();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <GameHeader
        meta={meta}
        state={engine.state}
        score={engine.score}
        currentRound={questionIndex}
        totalRounds={TOTAL_QUESTIONS}
        combo={engine.combo}
        onPause={engine.pause}
        onResume={engine.resume}
        onRestart={handleRestart}
      />

      <div className="w-full h-[520px] bg-[#0A0E1A] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col items-center justify-center p-6 select-none">
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.2)]">
              <HelpCircle className="w-8 h-8 text-purple-400" />
            </div>

            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
            </div>

            <div className="bg-[#080B14] p-4 rounded-xl border border-[#1E293B] text-left text-xs text-slate-300 max-w-md space-y-1.5">
              <span className="font-bold text-purple-400 uppercase block font-mono">
                Instructions:
              </span>
              {meta.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <button
              onClick={engine.ready}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Start 20-Question Sprint
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && currentQ && (
          <div className="w-full max-w-md flex flex-col items-center gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-xs uppercase font-mono text-slate-400">
                Question {questionIndex} / {TOTAL_QUESTIONS}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Stimulus Box */}
            <div className="w-48 h-48 rounded-2xl bg-[#111827] border-2 border-[#1E293B] shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
              {currentQ.displayElement === "NUMBER" && (
                <span className="text-6xl font-black font-mono text-[#00E5FF] text-glow-cyan">
                  {currentQ.value}
                </span>
              )}

              {currentQ.displayElement === "ARROW" && (
                <div>
                  {currentQ.value === "UP" ? (
                    <ArrowUp className="w-24 h-24 text-emerald-400" />
                  ) : (
                    <ArrowDown className="w-24 h-24 text-rose-400" />
                  )}
                </div>
              )}

              {currentQ.displayElement === "SHAPE" && (
                <div>
                  {currentQ.value === "CIRCLE" ? (
                    <div className="w-24 h-24 rounded-full bg-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.8)]" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.8)]" />
                  )}
                </div>
              )}
            </div>

            {/* Decision Buttons (YES / NO) */}
            <div className="w-full grid grid-cols-2 gap-4">
              <button
                onClick={() => handleDecision(true)}
                className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-95"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                YES (← / A)
              </button>

              <button
                onClick={() => handleDecision(false)}
                className="py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95"
              >
                <X className="w-6 h-6 stroke-[3]" />
                NO (→ / D)
              </button>
            </div>
          </div>
        )}

        {engine.state === "ENDED" && engine.results && (
          <ResultsModal meta={meta} result={engine.results} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
