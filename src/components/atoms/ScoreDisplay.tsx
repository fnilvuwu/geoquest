import { motion } from 'framer-motion';
import React from 'react';

interface ScoreDisplayProps {
    score: number;
    highScore?: number;
}

/**
 * Compact inline score badge with animated pop on value change.
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, highScore = 0 }) => (
    <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Score
            </span>
            <motion.span
                key={score}
                initial={{ scale: 1.4, color: '#818cf8' }}
                animate={{ scale: 1, color: '#e2e8f0' }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="text-xl font-black tabular-nums"
            >
                {score}
            </motion.span>
        </div>
        {highScore > 0 && (
            <span className="text-[10px] font-bold text-slate-400">
                BEST: <span className="text-amber-400 tabular-nums">{highScore}</span>
            </span>
        )}
    </div>
);
