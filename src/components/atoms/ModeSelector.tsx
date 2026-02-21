import type { GameMode } from '@/types';
import React from 'react';

interface ModeSelectorProps {
    value: GameMode;
    onChange: (mode: GameMode) => void;
}

const MODES: { value: GameMode; label: string; icon: string }[] = [
    { value: 'explore', label: 'Explore', icon: '🌍' },
    { value: 'quiz', label: 'Quiz', icon: '🧠' },
    { value: 'essay', label: 'Essay', icon: '✍️' },
];

/**
 * Pill-style tab buttons for switching between game modes.
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({
    value,
    onChange,
}) => (
    <div className="flex gap-1 rounded-xl bg-slate-800/60 p-1">
        {MODES.map((mode) => (
            <button
                key={mode.value}
                onClick={() => onChange(mode.value)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${value === mode.value
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }`}
            >
                <span className="mr-1">{mode.icon}</span>
                {mode.label}
            </button>
        ))}
    </div>
);
