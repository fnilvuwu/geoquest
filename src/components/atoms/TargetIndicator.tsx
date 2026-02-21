import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface TargetIndicatorProps {
    target: string | null;
    visible: boolean;
}

/**
 * Animated banner showing the current country to find in quiz/timed modes.
 * Uses AnimatePresence for smooth entrance/exit transitions.
 */
export const TargetIndicator: React.FC<TargetIndicatorProps> = ({
    target,
    visible,
}) => (
    <AnimatePresence mode="wait">
        {visible && target && (
            <motion.div
                key={target}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex flex-col items-center gap-1 rounded-2xl border border-amber-500/20 bg-amber-950/40 p-5 text-center backdrop-blur-sm"
            >
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Find Country
                </span>
                <span className="text-2xl font-black text-amber-200">{target}</span>
            </motion.div>
        )}
    </AnimatePresence>
);
