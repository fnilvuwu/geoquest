import { useGameStore } from '@/store/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, Globe2, Landmark, Map, Phone, Users, X } from 'lucide-react';
import React from 'react';

export const NationInfoPanel: React.FC = () => {
    const showInfoPanel = useGameStore((state) => state.showInfoPanel);
    const gameMode = useGameStore((state) => state.gameMode);
    const countriesData = useGameStore((state) => state.countriesData);
    const { closeInfoPanel, continueAfterInfo } = useGameStore((state) => state.actions);

    const fact = showInfoPanel ? countriesData[showInfoPanel] : null;

    const onClose = () => {
        if (gameMode === 'explore') {
            closeInfoPanel();
        } else {
            continueAfterInfo();
        }
    };

    return (
        <AnimatePresence>
            {showInfoPanel && fact && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                >
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900/90 p-6 shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full bg-slate-800/50 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="mb-6 flex items-center gap-4">
                            {fact.flags?.svg ? (
                                <img src={fact.flags.svg} alt={`Flag of ${fact.name.common}`} className="h-16 w-24 rounded-md object-cover shadow-lg" />
                            ) : (
                                <span className="text-6xl drop-shadow-lg">🌍</span>
                            )}
                            <div>
                                <h2 className="text-3xl font-black text-white">{fact.name.common}</h2>
                                <p className="text-sm font-semibold text-slate-400">{fact.capital?.[0] || 'Unknown Capital'}</p>
                            </div>
                        </div>

                        {/* About */}
                        <div className="mb-6 rounded-2xl bg-slate-800/60 p-4">
                            <p className="text-sm leading-relaxed text-slate-300">
                                {fact.name.official} is a nation located in the region of {fact.subregion ? `${fact.subregion}, ` : ''}{fact.region}.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 rounded-2xl bg-slate-800/60 p-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Landmark size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Language</span>
                                </div>
                                <span className="text-sm font-medium text-white line-clamp-1" title={Object.values(fact.languages || {}).join(', ') || 'Unknown'}>
                                    {Object.values(fact.languages || {}).join(', ') || 'Unknown'}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-2xl bg-slate-800/60 p-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Globe2 size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Region</span>
                                </div>
                                <span className="text-sm font-medium text-white">{fact.region || 'Unknown'}</span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-2xl bg-slate-800/60 p-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Users size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Population</span>
                                </div>
                                <span className="text-sm font-medium text-white">{fact.population ? fact.population.toLocaleString() : 'Unknown'}</span>
                            </div>

                            <div className="flex flex-col gap-1 rounded-2xl bg-slate-800/60 p-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Banknote size={16} />
                                    <span className="text-xs font-semibold uppercase tracking-wider">Currencies</span>
                                </div>
                                <span className="text-sm font-medium text-white">
                                    {Object.values(fact.currencies || {}).map(c => `${c.name} (${c.symbol})`).join(', ') || 'Unknown'}
                                </span>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-4 rounded-2xl bg-slate-800/60 p-4">
                            <div className="mb-1 flex items-center gap-2 text-slate-400">
                                <Map size={16} />
                                <span className="text-xs font-semibold uppercase tracking-wider">Geographic Region</span>
                            </div>
                            <span className="mb-3 block text-sm text-slate-300">{fact.subregion || fact.region || 'Unknown'}</span>

                            <div className="mb-1 flex items-center gap-2 text-slate-400">
                                <Phone size={16} />
                                <span className="text-xs font-semibold uppercase tracking-wider">Dialing Code</span>
                            </div>
                            <span className="text-sm text-slate-300">
                                {fact.idd ? `${fact.idd.root}${fact.idd.suffixes?.[0] || ''}` : 'Unknown'}
                            </span>
                        </div>

                        {/* Action Button */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onClose}
                                className="rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition-colors hover:bg-cyan-500 shadow-lg shadow-cyan-900/20"
                            >
                                {gameMode === 'explore' ? 'Close' : 'Next Target'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
