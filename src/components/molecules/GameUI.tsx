import { CountryAutocomplete } from '@/components/atoms/CountryAutocomplete';
import { ModeSelector } from '@/components/atoms/ModeSelector';
import { ScoreDisplay } from '@/components/atoms/ScoreDisplay';
import { TargetIndicator } from '@/components/atoms/TargetIndicator';
import { GameOverModal } from '@/components/molecules/GameOverModal';
import { NationInfoPanel } from '@/components/molecules/NationInfoPanel';
import { useGameStore } from '@/store/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';

/**
 * Floating game HUD overlay.
 * Top bar: title + score + reset.
 * Bottom center: mode selector, quiz options, essay input.
 */
export const GameUI: React.FC = () => {
    const [showWatermark, setShowWatermark] = useState(false);
    
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
    const highScoreQuiz = useGameStore((state) => state.highScoreQuiz);
    const highScoreEssay = useGameStore((state) => state.highScoreEssay);
    const { setGameMode, resetGame, handleGuess, setMaxHearts, startGame } = useGameStore((state) => state.actions);

    const currentHighScore = gameMode === 'quiz' ? highScoreQuiz : gameMode === 'essay' ? highScoreEssay : 0;

    return (
        <>
            <NationInfoPanel />
            <GameOverModal />

            {/* ─── Top Bar ─── */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
                {/* Title */}
                <button
                    onClick={() => setShowWatermark(!showWatermark)}
                    title="Toggle Credits"
                    className="pointer-events-auto rounded-xl bg-slate-900/70 px-4 py-2 shadow-lg backdrop-blur-md self-start sm:self-auto transition-colors hover:bg-slate-800/80 cursor-pointer"
                >
                    <h1 className="text-lg font-black tracking-tight text-white">
                     <img src="/geoquest3d.webp" width={50} height={50} className="inline-block" alt="GeoQuest 3D" /> GeoQuest 3D
                    </h1>
                </button>

                {/* Score + Hearts + Reset (hidden in explore) */}
                {gameMode !== 'explore' && (
                    <div className="pointer-events-auto flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 rounded-xl bg-slate-900/70 px-3 py-2 shadow-lg backdrop-blur-md max-w-full">
                        <div className="flex flex-wrap gap-1 text-red-500 max-w-[140px] sm:max-w-none justify-start sm:justify-end">
                            {Array.from({ length: maxHearts }).map((_, i) => (
                                <Heart
                                    key={i}
                                    size={14}
                                    fill={i < hearts ? 'currentColor' : 'none'}
                                    className={i < hearts ? '' : 'text-slate-600 shadow-sm'}
                                />
                            ))}
                        </div>
                        <ScoreDisplay score={score} highScore={currentHighScore} />
                        <button
                            onClick={resetGame}
                            title="Reset Game"
                            className="rounded-lg border border-slate-600/50 bg-slate-700/50 p-2 text-slate-400 transition-colors hover:border-slate-500 hover:text-white shrink-0 ml-1"
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

            {/* ─── Watermark ─── */}
            <AnimatePresence>
                {showWatermark && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto absolute top-[64px] left-4 z-40 flex flex-col items-start gap-2 rounded-xl bg-slate-900/90 p-3 backdrop-blur-md border border-slate-700/50 shadow-xl"
                    >
                        <span className="text-xs font-semibold text-slate-300 drop-shadow-md pb-1 border-b border-slate-700/50 w-full text-center">Created by fnilvu</span>
                        <div className="flex items-center gap-3 text-slate-300 drop-shadow-md pt-1">
                            <a href="https://linkedin.com/in/fnilvuwu" target="_blank" rel="noreferrer" className="transition-colors hover:text-cyan-400" title="LinkedIn">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                            <a href="https://instagram.com/fnilvuwu" target="_blank" rel="noreferrer" className="transition-colors hover:text-pink-400" title="Instagram">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                            <a href="https://youtube.com/@fnilvuwu" target="_blank" rel="noreferrer" className="transition-colors hover:text-red-500" title="YouTube">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                            </a>
                            <a href="https://fiverr.com/fnilvuwu" target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-wide transition-colors hover:text-green-400" title="Fiverr">
                                Fiverr
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};