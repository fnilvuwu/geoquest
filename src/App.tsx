import { ErrorBoundary } from '@/components/atoms/ErrorBoundary';
import { GameUI } from '@/components/molecules/GameUI';
import { MapContainer } from '@/components/organisms/MapContainer';
import { useAudio } from '@/hooks/useAudio';
import React from 'react';

/**
 * Root application layout.
 * Map fills the entire viewport; GameUI floats on top as a HUD overlay.
 */
const AppContent: React.FC = () => {
  // Initialize audio lifecycle (cleanup on unmount)
  useAudio();

  return (
    <div className="relative h-full w-full">
      {/* Map — fills entire viewport */}
      <MapContainer />

      {/* Floating game HUD overlay */}
      <GameUI />
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);

export default App;