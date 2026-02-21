import type { MapCoordinates } from '@/types';

// We replaced the online MAP_STYLE_URL with an entirely offline local Style Object
export const MAP_STYLE = {
    version: 8,
    sources: {
        'countries-data': {
            type: 'geojson',
            data: '/countries.geojson' // Hosted locally from your public folder!
        },
        'country-labels-data': {
            type: 'geojson',
            data: '/country-labels.geojson' // Contains one point per country to avoid duplicate labels
        }
    },
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': '#0f172a' // Dark slate background for oceans
            }
        },
        {
            id: 'countries-fill',
            type: 'fill',
            source: 'countries-data',
            paint: {
                'fill-color': '#d1d5db',
                'fill-outline-color': '#64748b'
            }
        },
        {
            id: 'country-labels',
            type: 'symbol',
            source: 'country-labels-data',
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                'text-size': 12,
                'text-max-width': 8,
                'text-justify': 'center'
            },
            paint: {
                'text-color': '#475569',
                'text-halo-color': '#ffffff',
                'text-halo-width': 1.5
            }
        }
    ]
};

export const MAP_DEFAULT_CENTER: MapCoordinates = [0, 0];
export const MAP_DEFAULT_ZOOM = 2;
export const COUNTRY_LAYER_ID = 'countries-fill'; // Must match the layer id above
export const MAP_MAX_ZOOM = 10;
export const MAP_MIN_ZOOM = 1.5;
