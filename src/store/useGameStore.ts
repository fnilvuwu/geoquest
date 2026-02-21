import { useAudioStore } from '@/store/useAudioStore';
import type { GameMode } from '@/types';
import { getMultipleChoiceOptions, getRandomCountry } from '@/utils/countryUtils';
import { create } from 'zustand';

interface GameState {
    score: number;
    currentTarget: string | null;
    gameMode: GameMode;
    selectedCountry: string | null;
    isRevealing: boolean;
    isAnimating: boolean;
    quizOptions: string[];
    actions: {
        setTarget: (country: string) => void;
        incrementScore: (points: number) => void;
        setGameMode: (mode: GameMode) => void;
        selectCountry: (country: string) => void;
        nextTarget: () => void;
        resetGame: () => void;
        handleGuess: (countryName: string) => void;
    };
}

export const useGameStore = create<GameState>()((set, get) => ({
    score: 0,
    currentTarget: null,
    gameMode: 'explore',
    selectedCountry: null,
    isRevealing: false,
    isAnimating: false,
    quizOptions: [],
    actions: {
        setTarget: (country) => set({ currentTarget: country }),

        incrementScore: (points) =>
            set((state) => ({ score: state.score + points })),

        setGameMode: (mode) => {
            // When entering quiz/timed, auto-generate first target
            if (mode !== 'explore') {
                const target = getRandomCountry();
                set({
                    gameMode: mode,
                    currentTarget: target,
                    selectedCountry: null,
                    quizOptions: mode === 'quiz' ? getMultipleChoiceOptions(target) : [],
                    isRevealing: false,
                    isAnimating: false
                });
            } else {
                set({ gameMode: mode, currentTarget: null, selectedCountry: null, quizOptions: [], isRevealing: false, isAnimating: false });
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

        resetGame: () =>
            set({ score: 0, currentTarget: null, selectedCountry: null, isRevealing: false, isAnimating: false, quizOptions: [] }),

        handleGuess: (countryName: string) => {
            const state = get();
            if (state.gameMode === 'explore' || !state.currentTarget || state.isRevealing || state.isAnimating) {
                return;
            }

            const audioState = useAudioStore.getState();
            // Ensure audio is initialized on first user interaction
            audioState.actions.initAudio();

            if (countryName.toLowerCase() === state.currentTarget.toLowerCase()) {
                audioState.actions.playSuccess();
                set({ isRevealing: true, selectedCountry: countryName });

                setTimeout(() => {
                    const currentState = get();
                    // Only advance if we are still revealing (user didn't reset)
                    if (currentState.isRevealing) {
                        set({ isRevealing: false, score: currentState.score + 10 });
                        currentState.actions.nextTarget();
                    }
                }, 3000);
            } else {
                audioState.actions.playError();
                set({ selectedCountry: countryName, isAnimating: true });

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