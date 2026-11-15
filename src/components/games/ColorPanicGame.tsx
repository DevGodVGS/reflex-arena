"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Palette, Heart, HeartCrack, AlertCircle } from "lucide-react";
import { useGameEngine } from "@/lib/game-engine/useGameEngine";
import { GameHeader } from "@/components/game/GameHeader";
import { ReadyCountdown } from "@/components/game/ReadyCountdown";
import { ResultsModal } from "@/components/game/ResultsModal";
import { GAMES } from "@/lib/constants/games";
import { sound } from "@/lib/audio/sound-synth";
import { cn } from "@/lib/utils";

type ColorName = "RED" | "GREEN" | "BLUE" | "YELLOW" | "PURPLE";

interface ColorItem {
  name: ColorName;
  hex: string;
}

const COLOR_OPTIONS: ColorItem[] = [
  { name: "RED", hex: "#EF4444" },
  { name: "GREEN", hex: "#22C55E" },
  { name: "BLUE", hex: "#00E5FF" },
  { name: "YELLOW", hex: "#EAB308" },
  { name: "PURPLE", hex: "#8B5CF6" },
];

export function ColorPanicGame() {
  const meta = GAMES["color-panic"];
  const MAX_LIVES = 3;

  const engine = useGameEngine({
    gameId: "color-panic",
  });

  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [rule, setRule] = useState<"FONT_COLOR" | "WRITTEN_WORD">("FONT_COLOR");
  const [wordText, setWordText] = useState<ColorName>("RED");
  const [fontColor, setFontColor] = useState<ColorItem>(COLOR_OPTIONS[1]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);

  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateNewQuestion = useCallback(() => {
    // 50% chance rule is font color, 50% chance word text
    const newRule: "FONT_COLOR" | "WRITTEN_WORD" = Math.random() > 0.5 ? "FONT_COLOR" : "WRITTEN_WORD";

    // Pick random word
    const textIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    const word = COLOR_OPTIONS[textIdx].name;

    // Pick different random font color for conflict
    let colorIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    if (colorIdx === textIdx) {
      colorIdx = (colorIdx + 1) % COLOR_OPTIONS.length;
    }
    const color = COLOR_OPTIONS[colorIdx];

    setRule(newRule);
    setWordText(word);
    setFontColor(color);
    setQuestionStartTime(performance.now());
  }, []);

  useEffect(() => {
    if (engine.state === "PLAYING") {
      generateNewQuestion();
    }
    return () => {
      if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
    };
  }, [engine.state, generateNewQuestion]);

  const handleAnswer = (selectedColor: ColorName) => {
    if (engine.state !== "PLAYING") return;

    const answerLatency = performance.now() - questionStartTime;
    const targetColor = rule === "FONT_COLOR" ? fontColor.name : wordText;

    if (selectedColor === targetColor) {
      // Correct!
      sound.play("hit");
      const speedBonus = Math.max(0, Math.round(1000 - answerLatency));
      const addedPoints = 300 + speedBonus;
      engine.updateScore((prev) => prev + addedPoints);
      engine.updateCombo(engine.combo + 1);
      setCorrectCount((prev) => prev + 1);
    } else {
      // Mistake!
      sound.play("strike");
      engine.updateCombo(0);
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        // Game Over!
        const total = questionsAnswered + 1;
        const accuracy = Math.round((correctCount / total) * 100);
        engine.endGame(undefined, {
          accuracyPercentage: accuracy,
          roundsPlayed: total,
        });
        return;
      }
    }

    setQuestionsAnswered((prev) => prev + 1);
    generateNewQuestion();
  };

  const handleRestart = () => {
    if (questionTimerRef.current) clearTimeout(questionTimerRef.current);
    setLives(MAX_LIVES);
    setQuestionsAnswered(0);
    setCorrectCount(0);
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

      <div className="w-full h-[520px] bg-[#0A0E1A] rounded-b-2xl border-x border-b border-[#1E293B] relative overflow-hidden flex flex-col items-center justify-center p-6 select-none">
        {engine.state === "COUNTDOWN" && <ReadyCountdown count={engine.countdown} />}

        {engine.state === "IDLE" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.2)]">
              <Palette className="w-8 h-8 text-rose-400" />
            </div>

            <div className="max-w-md">
              <h2 className="text-2xl font-black text-white">{meta.title}</h2>
              <p className="text-sm text-slate-400 mt-2">{meta.description}</p>
            </div>

            <div className="bg-[#080B14] p-4 rounded-xl border border-[#1E293B] text-left text-xs text-slate-300 max-w-md space-y-1.5">
              <span className="font-bold text-rose-400 uppercase block font-mono">
                Instructions:
              </span>
              {meta.instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            <button
              onClick={engine.ready}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-[#080B14] font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              Start Stroop Test
            </button>
          </div>
        )}

        {(engine.state === "PLAYING" || engine.state === "PAUSED") && (
          <div className="w-full max-w-lg flex flex-col items-center gap-6">
            {/* Top Lives Bar */}
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Questions: {questionsAnswered}</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: MAX_LIVES }).map((_, idx) => (
                  <Heart
                    key={idx}
                    className={cn(
                      "w-5 h-5",
                      idx < lives
                        ? "text-rose-500 fill-rose-500 animate-pulse"
                        : "text-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="px-5 py-2 rounded-full bg-[#111827] border border-[#1E293B] shadow-md flex items-center gap-2">
              <span className="text-xs uppercase font-mono text-slate-400">RULE:</span>
              <span className="text-sm font-black text-[#00E5FF] tracking-wider uppercase">
                {rule === "FONT_COLOR" ? "CLICK THE FONT COLOR" : "CLICK THE WRITTEN WORD"}
              </span>
            </div>

            {/* Central Word with Conflicting Color */}
            <div className="h-32 flex items-center justify-center">
              <span
                style={{ color: fontColor.hex }}
                className="text-6xl sm:text-7xl font-black font-mono tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {wordText}
              </span>
            </div>

            {/* Color Option Buttons */}
            <div className="w-full grid grid-cols-5 gap-2 sm:gap-3">
              {COLOR_OPTIONS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleAnswer(item.name)}
                  style={{ borderColor: item.hex }}
                  className="py-3 px-1 rounded-xl bg-[#111827] border-2 hover:bg-slate-800 text-xs sm:text-sm font-black tracking-wide text-white transition-all active:scale-95 shadow-md flex flex-col items-center gap-1"
                >
                  <div
                    style={{ backgroundColor: item.hex }}
                    className="w-3.5 h-3.5 rounded-full"
                  />
                  <span>{item.name}</span>
                </button>
              ))}
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
