import { useAudioStore } from '@/store/useAudioStore';
import { useEffect } from 'react';

/**
 * Lifecycle hook for the audio subsystem.
 * Disposes of the Tone.js synthesizer when the consuming component unmounts.
 *
 * Note: Audio initialization (`initAudio`) is deliberately triggered on user
 * interaction (first map click) rather than on mount, to comply with browser
 * autoplay policies that require a user gesture before creating an AudioContext.
 */
export function useAudio() {
    const cleanup = useAudioStore((state) => state.actions.cleanup);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);
}
