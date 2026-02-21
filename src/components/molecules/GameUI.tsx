import { CountryAutocomplete } from '@/components/atoms/CountryAutocomplete';
import { ModeSelector } from '@/components/atoms/ModeSelector';
import { ScoreDisplay } from '@/components/atoms/ScoreDisplay';
import { TargetIndicator } from '@/components/atoms/TargetIndicator';
import { GameOverModal } from '@/components/molecules/GameOverModal';
import { NationInfoPanel } from '@/components/molecules/NationInfoPanel';
import { useGameStore } from '@/store/useGameStore';
import { Heart, RotateCcw } from 'lucide-react';
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
    const hearts = useGameStore((state) => state.hearts);
    const maxHearts = useGameStore((state) => state.maxHearts);
    const hasStarted = useGameStore((state) => state.hasStarted);
    const { setGameMode, resetGame, handleGuess, setMaxHearts, startGame } = useGameStore((state) => state.actions);

    return (
        <>
            <NationInfoPanel />
            <GameOverModal />

            {/* ─── Top Bar ─── */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
                {/* Title */}
                <div className="pointer-events-auto rounded-xl bg-slate-900/70 px-4 py-2 shadow-lg backdrop-blur-md">
                    <h1 className="text-lg font-black tracking-tight text-white">
                        🌍 GeoQuest
                    </h1>
                </div>

                {/* Score + Hearts + Reset (hidden in explore) */}
                {gameMode !== 'explore' && (
                    <div className="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900/70 px-4 py-2 shadow-lg backdrop-blur-md">
                        <div className="flex gap-1 mr-2 text-red-500">
                            {Array.from({ length: maxHearts }).map((_, i) => (
                                <Heart
                                    key={i}
                                    size={16}
                                    fill={i < hearts ? 'currentColor' : 'none'}
                                    className={i < hearts ? '' : 'text-slate-600'}
                                />
                            ))}
                        </div>
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

                    {/* Pre-game Screen */}
                    {gameMode !== 'explore' && !hasStarted && (
                        <div className="mt-4 flex flex-col items-center gap-4 border-t border-slate-700/50 pt-4">
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-white capitalize">{gameMode} Mode</h2>
                                <p className="text-xs text-slate-400">Configure your session before starting</p>
                            </div>

                            <div className="flex flex-col items-center gap-3 w-full">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Starting Hearts</p>
                                <div className="flex gap-2">
                                    {[3, 5, 10].map((h) => (
                                        <button
                                            key={h}
                                            onClick={() => setMaxHearts(h)}
                                            className={`rounded-lg px-6 py-2 text-sm font-bold transition-all ${maxHearts === h
                                                ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50'
                                                : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                                                }`}
                                        >
                                            {h} ❤️
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={startGame}
                                    className="mt-2 w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-500 shadow-lg shadow-cyan-900/20"
                                >
                                    Start Game
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quiz Options */}
                    {gameMode === 'quiz' && hasStarted && quizOptions.length > 0 && (
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
                    {gameMode === 'essay' && hasStarted && (
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