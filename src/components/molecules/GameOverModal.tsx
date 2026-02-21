import { useGameStore } from '@/store/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartCrack, RotateCcw } from 'lucide-react';
import React from 'react';

export const GameOverModal: React.FC = () => {
    const isGameOver = useGameStore((state) => state.isGameOver);
    const score = useGameStore((state) => state.score);
    const { resetGame } = useGameStore((state) => state.actions);

    return (
        <AnimatePresence>
            {isGameOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-red-500/20 bg-slate-900 p-8 text-center shadow-2xl"
                    >
                        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                            <HeartCrack size={48} />
                        </div>
                        <h2 className="mb-2 text-4xl font-black text-white">Game Over</h2>
                        <p className="mb-8 text-slate-400">
                            You ran out of hearts! Your final score is <strong className="text-2xl text-white">{score}</strong>.
                        </p>

                        <button
                            onClick={resetGame}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-4 font-bold text-white transition-colors hover:bg-cyan-500 shadow-lg shadow-cyan-900/20"
                        >
                            <RotateCcw size={20} />
                            Play Again
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
