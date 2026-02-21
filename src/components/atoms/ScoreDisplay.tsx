import { motion } from 'framer-motion';
import React from 'react';

interface ScoreDisplayProps {
    score: number;
}

/**
 * Compact inline score badge with animated pop on value change.
 */
export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => (
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
);
