import { ErrorBoundary } from '@/components/atoms/ErrorBoundary';
import { useMap } from '@/hooks/useMap';
import React from 'react';

/**
 * Full-viewport map component.
 * Delegates all MapLibre logic to the `useMap` hook and wraps itself
 * in an ErrorBoundary for resilient rendering.
 */
const MapContainerInner: React.FC = () => {
    const { containerRef, error } = useMap();

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-900 p-4">
                <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-950/40 p-8 text-center backdrop-blur-xl">
                    <div className="mb-3 text-3xl">🗺️</div>
                    <h2 className="mb-2 text-lg font-bold text-red-300">
                        Map Initialization Error
                    </h2>
                    <p className="font-mono text-sm text-red-400/80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 h-full w-full bg-slate-900"
        />
    );
};

export const MapContainer: React.FC = () => (
    <ErrorBoundary>
        <MapContainerInner />
    </ErrorBoundary>
);