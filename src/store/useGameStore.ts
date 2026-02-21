import { useAudioStore } from '@/store/useAudioStore';
import type { GameMode } from '@/types';
import { getMultipleChoiceOptions, getRandomCountry } from '@/utils/countryUtils';
import { create } from 'zustand';

export interface RestCountry {
    name: { common: string; official: string };
    flags: { svg: string; png: string };
    capital?: string[];
    languages?: Record<string, string>;
    population: number;
    region: string;
    subregion?: string;
    currencies?: Record<string, { name: string; symbol: string }>;
    idd?: { root: string; suffixes: string[] };
}

interface GameState {
    score: number;
    highScoreQuiz: number;
    highScoreEssay: number;
    currentTarget: string | null;
    gameMode: GameMode;
    selectedCountry: string | null;
    isRevealing: boolean;
    isAnimating: boolean;
    quizOptions: string[];
    // Hearts system
    maxHearts: number;
    hearts: number;
    isGameOver: boolean;
    hasStarted: boolean;
    // Info panel
    showInfoPanel: string | null;
    countriesData: Record<string, RestCountry>;
    actions: {
        setTarget: (country: string) => void;
        incrementScore: (points: number) => void;
        setGameMode: (mode: GameMode) => void;
        selectCountry: (country: string) => void;
        nextTarget: () => void;
        resetGame: () => void;
        handleGuess: (countryName: string) => void;
        setMaxHearts: (hearts: number) => void;
        closeInfoPanel: () => void;
        setExploreCountry: (country: string) => void;
        continueAfterInfo: () => void;
        fetchCountriesData: () => Promise<void>;
        startGame: () => void;
    };
}

const getStoredHighScore = (key: string) => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) : 0;
    } catch {
        return 0;
    }
};

export const useGameStore = create<GameState>()((set, get) => ({
    score: 0,
    highScoreQuiz: getStoredHighScore('geoquest-hs-quiz'),
    highScoreEssay: getStoredHighScore('geoquest-hs-essay'),
    currentTarget: null,
    gameMode: 'explore',
    selectedCountry: null,
    isRevealing: false,
    isAnimating: false,
    quizOptions: [],
    maxHearts: 3,
    hearts: 3,
    isGameOver: false,
    showInfoPanel: null,
    hasStarted: false,
    countriesData: {},
    actions: {
        setTarget: (country) => set({ currentTarget: country }),

        incrementScore: (points) =>
            set((state) => ({ score: state.score + points })),

        setGameMode: (mode) => {
            if (mode !== 'explore') {
                set({
                    gameMode: mode,
                    currentTarget: null,
                    selectedCountry: null,
                    quizOptions: [],
                    isRevealing: false,
                    isAnimating: false,
                    hearts: get().maxHearts,
                    isGameOver: false,
                    hasStarted: false,
                    showInfoPanel: null
                });
            } else {
                set({ gameMode: mode, currentTarget: null, selectedCountry: null, quizOptions: [], isRevealing: false, isAnimating: false, hearts: get().maxHearts, isGameOver: false, hasStarted: false, showInfoPanel: null });
            }
        },

        selectCountry: (country) => set({ selectedCountry: country }),

        /**
         * Advances to the next random target, ensuring no immediate repeats.
         */
        nextTarget: () => {
            const currentTarget = get().currentTarget;
            const newTarget = getRandomCountry(currentTarget);
            set({
                currentTarget: newTarget,
                selectedCountry: null,
                quizOptions: get().gameMode === 'quiz' ? getMultipleChoiceOptions(newTarget) : []
            });
        },

        resetGame: () => {
            const state = get();
            set({ score: 0, currentTarget: null, selectedCountry: null, isRevealing: false, isAnimating: false, quizOptions: [], hearts: state.maxHearts, isGameOver: false, hasStarted: false, showInfoPanel: null });
        },

        startGame: () => {
            const state = get();
            const target = getRandomCountry();
            set({
                hasStarted: true,
                currentTarget: target,
                quizOptions: state.gameMode === 'quiz' ? getMultipleChoiceOptions(target) : [],
                hearts: state.maxHearts,
                score: 0,
                isGameOver: false,
                isRevealing: false,
                isAnimating: false,
                showInfoPanel: null,
                selectedCountry: null
            });
        },

        setMaxHearts: (hearts) => set({ maxHearts: hearts, hearts }),

        closeInfoPanel: () => set({ showInfoPanel: null }),

        setExploreCountry: (country) => {
            const state = get();
            if (state.gameMode === 'explore') {
                set({ showInfoPanel: country });
            }
        },

        continueAfterInfo: () => {
            const state = get();
            if (state.isRevealing) {
                const newScore = state.score + 10;
                let highScoreQuiz = state.highScoreQuiz;
                let highScoreEssay = state.highScoreEssay;

                if (state.gameMode === 'quiz' && newScore > highScoreQuiz) {
                    highScoreQuiz = newScore;
                    localStorage.setItem('geoquest-hs-quiz', newScore.toString());
                } else if (state.gameMode === 'essay' && newScore > highScoreEssay) {
                    highScoreEssay = newScore;
                    localStorage.setItem('geoquest-hs-essay', newScore.toString());
                }

                set({
                    isRevealing: false,
                    score: newScore,
                    highScoreQuiz,
                    highScoreEssay,
                    showInfoPanel: null
                });
                state.actions.nextTarget();
            } else {
                set({ showInfoPanel: null });
            }
        },

        fetchCountriesData: async () => {
            try {
                const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,capital,languages,population,region,subregion,currencies,idd');
                const data: RestCountry[] = await res.json();
                const dict: Record<string, RestCountry> = {};
                data.forEach(c => {
                    if (c.name.common) dict[c.name.common] = c;
                    if (c.name.official) dict[c.name.official] = c;
                    // Provide a few common map overrides if REST Countries API name differs slightly
                    if (c.name.common === 'United States') {
                        dict['United States of America'] = c;
                    }
                });
                set({ countriesData: dict });
            } catch (err) {
                console.error('Failed to fetch countries data', err);
            }
        },

        handleGuess: (countryName: string) => {
            const state = get();
            if (state.gameMode === 'explore' || !state.currentTarget || state.isRevealing || state.isAnimating || state.isGameOver) {
                return;
            }

            const audioState = useAudioStore.getState();
            // Ensure audio is initialized on first user interaction
            audioState.actions.initAudio();

            if (countryName.toLowerCase() === state.currentTarget.toLowerCase()) {
                audioState.actions.playSuccess();
                // Set revealing state immediately to trigger map zoom/color
                set({ isRevealing: true, selectedCountry: countryName });

                // Add a small delay before showing the info panel
                setTimeout(() => {
                    const currentState = get();
                    // Double check we are still in the revealing state for this country
                    if (currentState.isRevealing && currentState.selectedCountry === countryName) {
                        set({ showInfoPanel: countryName });
                    }
                }, 1500);
            } else {
                audioState.actions.playError();

                const newHearts = state.hearts - 1;
                const gameOver = newHearts <= 0;

                set({ selectedCountry: countryName, isAnimating: true, hearts: Math.max(0, newHearts), isGameOver: gameOver });

                // Keep the UI blocked until the 1.5s zoom out + 0.5s pause + 2.0s zoom in finishes (~4000ms total)
                setTimeout(() => {
                    const currentState = get();
                    if (currentState.isAnimating && currentState.selectedCountry === countryName) {
                        set({ isAnimating: false });
                    }
                }, 4000);
            }
        },
    },
}));