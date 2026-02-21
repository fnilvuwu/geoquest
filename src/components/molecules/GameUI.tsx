import { CountryAutocomplete } from '@/components/atoms/CountryAutocomplete';
import { ModeSelector } from '@/components/atoms/ModeSelector';
import { ScoreDisplay } from '@/components/atoms/ScoreDisplay';
import { TargetIndicator } from '@/components/atoms/TargetIndicator';
import { useGameStore } from '@/store/useGameStore';
import { RotateCcw } from 'lucide-react';
import React from 'react';

/**
 * Floating game HUD overlay.
 * Top bar: title + score + reset.
 * Bottom center: mode selector, quiz options, essay input.
 */
export const GameUI: React.FC = () => {
    const score = useGameStore((state) => state.score);
    const gameMode = useGameStore((state) => state.gameMode);
    const currentTarget = useGameStore((state) => state.currentTarget);
    const selectedCountry = useGameStore((state) => state.selectedCountry);
    const quizOptions = useGameStore((state) => state.quizOptions);
    const isRevealing = useGameStore((state) => state.isRevealing);
    const isAnimating = useGameStore((state) => state.isAnimating);
    const { setGameMode, resetGame, handleGuess } = useGameStore((state) => state.actions);

    return (
        <>
            {/* ─── Top Bar ─── */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
                {/* Title */}
                <div className="pointer-events-auto rounded-xl bg-slate-900/70 px-4 py-2 shadow-lg backdrop-blur-md">
                    <h1 className="text-lg font-black tracking-tight text-white">
                        🌍 GeoQuest
                    </h1>
                </div>

                {/* Score + Reset (hidden in explore) */}
                {gameMode !== 'explore' && (
                    <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900/70 px-4 py-2 shadow-lg backdrop-blur-md">
                        <ScoreDisplay score={score} />
                        <button
                            onClick={resetGame}
                            title="Reset Game"
                            className="rounded-lg border border-slate-600/50 bg-slate-700/50 p-2 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                        >
                            <RotateCcw size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* ─── Target Indicator (top center) ─── */}
            <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center">
                <TargetIndicator
                    target={currentTarget}
                    visible={gameMode === 'explore' || isRevealing}
                />
            </div>

            {/* ─── Bottom Center Panel ─── */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-6">
                <div className="pointer-events-auto flex w-full max-w-md flex-col gap-3 rounded-2xl bg-slate-900/75 p-4 shadow-2xl backdrop-blur-md">
                    {/* Mode Selector */}
                    <ModeSelector value={gameMode} onChange={setGameMode} />

                    {/* Quiz Options */}
                    {gameMode === 'quiz' && quizOptions.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-center text-sm font-semibold text-slate-300">
                                What country is this?
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {quizOptions.map((option) => {
                                    const isCorrect = option === currentTarget;
                                    const isSelected = option === selectedCountry;

                                    let btnClass = 'bg-slate-700/80 text-slate-200 hover:bg-slate-600';

                                    if (isRevealing) {
                                        if (isCorrect) {
                                            btnClass = 'bg-green-600 text-white';
                                        } else if (isSelected) {
                                            btnClass = 'bg-red-600/80 text-white';
                                        } else {
                                            btnClass = 'bg-slate-700/30 text-slate-500 line-through';
                                        }
                                    } else if (isSelected && !isCorrect) {
                                        btnClass = 'bg-red-600/80 text-white';
                                    } else if (isAnimating) {
                                        btnClass = 'bg-slate-700/50 text-slate-400 cursor-not-allowed';
                                    }

                                    return (
                                        <button
                                            key={option}
                                            disabled={isRevealing || isAnimating}
                                            onClick={() => handleGuess(option)}
                                            className={`rounded-xl px-4 py-3 text-center font-semibold transition-all ${btnClass}`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Essay Mode Input */}
                    {gameMode === 'essay' && (
                        <CountryAutocomplete
                            onSubmit={handleGuess}
                            disabled={isRevealing || isAnimating}
                        />
                    )}
                </div>
            </div>
        </>
    );
};