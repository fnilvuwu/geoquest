import { create } from 'zustand';

interface AudioState {
    isInitialized: boolean;
    correctAudio: HTMLAudioElement | null;
    wrongAudio: HTMLAudioElement | null;
    actions: {
        initAudio: () => void;
        playSuccess: () => void;
        playError: () => void;
        cleanup: () => void;
    };
}

export const useAudioStore = create<AudioState>()((set, get) => ({
    isInitialized: false,
    correctAudio: null,
    wrongAudio: null,
    actions: {
        /**
         * Pre-loads the audio elements for correct and wrong answers.
         * Idempotent — safe to call multiple times.
         */
        initAudio: () => {
            if (get().isInitialized) return;

            const correctAudio = new Audio('/correct.mp3');
            const wrongAudio = new Audio('/wrong.mp3');

            // Pre-load the audio files
            correctAudio.load();
            wrongAudio.load();

            set({ isInitialized: true, correctAudio, wrongAudio });
        },

        /** Plays the correct answer sound. */
        playSuccess: () => {
            const { correctAudio } = get();
            if (correctAudio) {
                correctAudio.currentTime = 0;
                correctAudio.play().catch(() => { });
            }
        },

        /** Plays the wrong answer sound. */
        playError: () => {
            const { wrongAudio } = get();
            if (wrongAudio) {
                wrongAudio.currentTime = 0;
                wrongAudio.play().catch(() => { });
            }
        },

        /** Cleans up audio elements. */
        cleanup: () => {
            const { correctAudio, wrongAudio } = get();
            if (correctAudio) correctAudio.pause();
            if (wrongAudio) wrongAudio.pause();
            set({ correctAudio: null, wrongAudio: null, isInitialized: false });
        },
    },
}));