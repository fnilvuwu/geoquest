import {
    COUNTRY_LAYER_ID,
    MAP_DEFAULT_CENTER,
    MAP_DEFAULT_ZOOM,
    MAP_MAX_ZOOM,
    MAP_MIN_ZOOM,
    MAP_STYLE
} from '@/constants/mapConfig';

import { useGameStore } from '@/store/useGameStore';
import { COUNTRY_BBOXES } from '@/utils/countryUtils';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that encapsulates MapLibre GL initialization, event listeners,
 * and cleanup.
 *
 * @returns An object containing the container ref to attach to a div and any initialization error.
 */
export function useMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        let unsubStore: (() => void) | undefined;

        try {
            const map = new maplibregl.Map({
                container: containerRef.current,
                style: MAP_STYLE as maplibregl.StyleSpecification, // <--- Using local style object
                center: MAP_DEFAULT_CENTER,
                zoom: MAP_DEFAULT_ZOOM,
                maxZoom: MAP_MAX_ZOOM,
                minZoom: MAP_MIN_ZOOM,
            });
            mapRef.current = map;

            map.on('load', () => {

                // Capture original map styling to restore properly
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const originalCountryFillColor = (map.getPaintProperty(COUNTRY_LAYER_ID, 'fill-color') as string | any[]) || 'rgba(255, 255, 255, 0)';

                // Subscribe to store for map manipulations
                unsubStore = useGameStore.subscribe((state, prevState) => {
                    // 1. Zoom to bounds on new target
                    if (state.currentTarget !== prevState.currentTarget) {
                        if (state.currentTarget) {
                            const bbox = COUNTRY_BBOXES[state.currentTarget];
                            if (bbox) {
                                map.fitBounds(bbox, { padding: 40, duration: 2000, essential: true });

                                // Update the point source for the question mark
                                const centerLng = (bbox[0] + bbox[2]) / 2;
                                const centerLat = (bbox[1] + bbox[3]) / 2;
                                const pointSource = map.getSource('target-point') as maplibregl.GeoJSONSource;
                                if (pointSource) {
                                    pointSource.setData({
                                        type: 'FeatureCollection',
                                        features: [{
                                            type: 'Feature',
                                            geometry: {
                                                type: 'Point',
                                                coordinates: [centerLng, centerLat]
                                            },
                                            properties: {}
                                        }]
                                    });
                                }
                            }
                        } else {
                            // Clear point source
                            const pointSource = map.getSource('target-point') as maplibregl.GeoJSONSource;
                            if (pointSource) {
                                pointSource.setData({
                                    type: 'FeatureCollection',
                                    features: []
                                });
                            }
                        }
                    }

                    // 2. Pan out slightly on reveal
                    if (state.isRevealing && !prevState.isRevealing) {
                        map.easeTo({ zoom: map.getZoom() - 1, duration: 1000, essential: true });
                    }

                    // 3. Toggle text labels visibility
                    const hideLabels = state.gameMode !== 'explore' && !state.isRevealing;
                    const prevHideLabels = prevState.gameMode !== 'explore' && !prevState.isRevealing;

                    if (hideLabels !== prevHideLabels) {
                        const style = map.getStyle();
                        if (style && style.layers) {
                            style.layers.forEach((layer) => {
                                if (layer.type === 'symbol' && layer.layout && layer.layout['text-field'] && layer.id !== 'target-question-mark') {
                                    map.setPaintProperty(layer.id, 'text-opacity', hideLabels ? 0 : 1);
                                }
                            });
                        }
                    }

                    // 4. Highlight target, dim others, and handle guess colors
                    const targetChanged = state.currentTarget !== prevState.currentTarget;
                    const modeChanged = state.gameMode !== prevState.gameMode;
                    const revealChanged = state.isRevealing !== prevState.isRevealing;
                    const selectedChanged = state.selectedCountry !== prevState.selectedCountry;

                    // 5. Interactive zoom out on incorrect guess
                    if (selectedChanged && state.selectedCountry && !state.isRevealing && state.currentTarget && state.selectedCountry !== state.currentTarget) {
                        const targetBbox = COUNTRY_BBOXES[state.currentTarget];
                        const selectedBbox = COUNTRY_BBOXES[state.selectedCountry];
                        if (targetBbox && selectedBbox) {
                            // Merge bounding boxes
                            const minLng = Math.min(targetBbox[0], selectedBbox[0]);
                            const minLat = Math.min(targetBbox[1], selectedBbox[1]);
                            const maxLng = Math.max(targetBbox[2], selectedBbox[2]);
                            const maxLat = Math.max(targetBbox[3], selectedBbox[3]);
                            const mergedBbox: [number, number, number, number] = [minLng, minLat, maxLng, maxLat];

                            // Zoom out to show both countries with a smoother flight path
                            map.fitBounds(mergedBbox, { padding: 40, duration: 1500, essential: true });

                            // Wait for the 1.5s zoom-out to finish, pause for 0.5s (2000ms total), then gracefully swoosh back down
                            setTimeout(() => {
                                const currentState = useGameStore.getState();
                                // Only snap back if they haven't made a new guess or moved on
                                if (currentState.currentTarget === state.currentTarget && currentState.selectedCountry === state.selectedCountry && currentState.gameMode === state.gameMode) {
                                    map.fitBounds(targetBbox, { padding: 40, duration: 2000, essential: true, curve: 1.5 });
                                }
                            }, 2000);
                        }
                    }

                    if (targetChanged || modeChanged || revealChanged || selectedChanged) {
                        try {
                            if (state.gameMode !== 'explore' && state.currentTarget) {
                                // Default fallback color: Explore mode uses transparent (green underneath). Quiz mode uses dark forest green `#064e3b`. Correct answer restores base green.
                                const fallbackColor = state.isRevealing ? originalCountryFillColor : '#064e3b';

                                // Default color is yellow, cyan if correct reveal
                                const targetColor = state.isRevealing ? '#06b6d4' : '#facc15';

                                // Color mapping setup
                                const colorMapping = [
                                    'match',
                                    ['get', 'name']
                                ];

                                // Push the target
                                colorMapping.push(state.currentTarget);
                                colorMapping.push(targetColor);

                                // Push the selected incorrect country if any
                                if (state.selectedCountry && !state.isRevealing && state.selectedCountry !== state.currentTarget) {
                                    colorMapping.push(state.selectedCountry);
                                    colorMapping.push('#fb7185'); // Rose if incorrect
                                }

                                // Default fallback color
                                colorMapping.push(fallbackColor);

                                map.setPaintProperty(COUNTRY_LAYER_ID, 'fill-opacity', 1);
                                map.setPaintProperty(COUNTRY_LAYER_ID, 'fill-color', colorMapping);

                                // Show question mark only when asking (not revealing)
                                // Use layout visibility instead of text-opacity to fully remove from collision detection.
                                // Otherwise the large '?' blocks the target country label even when invisible.
                                if (map.getLayer('target-question-mark')) {
                                    if (!state.isRevealing) {
                                        map.setLayoutProperty('target-question-mark', 'visibility', 'visible');
                                    } else {
                                        map.setLayoutProperty('target-question-mark', 'visibility', 'none');
                                    }
                                }
                            } else {
                                // Explore Mode or resetting
                                map.setPaintProperty(COUNTRY_LAYER_ID, 'fill-opacity', 1);
                                map.setPaintProperty(COUNTRY_LAYER_ID, 'fill-color', originalCountryFillColor);
                                if (map.getLayer('target-question-mark')) {
                                    map.setLayoutProperty('target-question-mark', 'visibility', 'none');
                                }
                            }
                        } catch (e) {
                            console.warn('Could not update country layer styles', e);
                        }
                    }
                });

                // Initial setup for layers
                const style = map.getStyle();
                const initialState = useGameStore.getState();

                // Add a dedicated point source for the question mark to ensure only one is rendered
                map.addSource('target-point', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    }
                });

                map.addLayer({
                    id: 'target-question-mark',
                    type: 'symbol',
                    source: 'target-point',
                    layout: {
                        'text-field': '?',
                        'text-size': 64,
                        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                        'visibility': 'none'
                    },
                    paint: {
                        'text-color': '#000000',
                        'text-halo-color': '#ffffff',
                        'text-halo-width': 2,
                    }
                });

                if (initialState.gameMode !== 'explore' && !initialState.isRevealing) {
                    if (style && style.layers) {
                        style.layers.forEach((layer) => {
                            if (layer.type === 'symbol' && layer.layout && layer.layout['text-field'] && layer.id !== 'target-question-mark') {
                                map.setPaintProperty(layer.id, 'text-opacity', 0);
                            }
                        });
                    }

                    try {
                        if (initialState.currentTarget) {
                            map.setPaintProperty(COUNTRY_LAYER_ID, 'fill-opacity', 1);
                            map.setPaintProperty(COUNTRY_LAYER_ID, 'fill-color', [
                                'match',
                                ['get', 'name'],
                                initialState.currentTarget,
                                '#facc15', // Yellow for target
                                '#064e3b' // Dark green for others initially
                            ]);
                            map.setLayoutProperty('target-question-mark', 'visibility', 'visible');

                            const bbox = COUNTRY_BBOXES[initialState.currentTarget];
                            if (bbox) {
                                const centerLng = (bbox[0] + bbox[2]) / 2;
                                const centerLat = (bbox[1] + bbox[3]) / 2;
                                const pointSource = map.getSource('target-point') as maplibregl.GeoJSONSource;
                                if (pointSource) {
                                    pointSource.setData({
                                        type: 'FeatureCollection',
                                        features: [{
                                            type: 'Feature',
                                            geometry: {
                                                type: 'Point',
                                                coordinates: [centerLng, centerLat]
                                            },
                                            properties: {}
                                        }]
                                    });
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Could not initialize country layer styles', e);
                    }
                }

                // Add map click interaction for Explore mode
                map.on('click', COUNTRY_LAYER_ID, (e) => {
                    const state = useGameStore.getState();
                    if (state.gameMode === 'explore' && e.features && e.features.length > 0) {
                        const feature = e.features[0];
                        const countryName = feature.properties?.NAME || feature.properties?.name;
                        if (countryName) {
                            state.actions.setExploreCountry(countryName);
                        }
                    }
                });

                // Change cursor to pointer when hovering over countries in explore mode
                map.on('mouseenter', COUNTRY_LAYER_ID, () => {
                    const state = useGameStore.getState();
                    if (state.gameMode === 'explore') {
                        map.getCanvas().style.cursor = 'pointer';
                    }
                });

                map.on('mouseleave', COUNTRY_LAYER_ID, () => {
                    map.getCanvas().style.cursor = '';
                });

            });
        } catch (err) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError(
                err instanceof Error ? err.message : 'Failed to initialize map'
            );
        }

        return () => {
            if (unsubStore) unsubStore();
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return { containerRef, error };
}
