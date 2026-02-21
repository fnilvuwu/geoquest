import type { MapCoordinates } from '@/types';

// We replaced the online MAP_STYLE_URL with an entirely offline local Style Object
const EXCLUDED_TERRITORIES = [
    'Bermuda',
    'Saint Helena',
    'Greenland',
    'Puerto Rico',
    'Falkland Islands',
    'French Guiana',
    'New Caledonia',
    'Guam',
    'Macau',
    'Hong Kong',
    'Western Sahara',
    'Antarctica',
    'Faroe Islands',
    'American Samoa',
    'French Polynesia',
    'Virgin Islands, U.S.',
    'Virgin Islands, British',
    'Cayman Islands',
    'Turks and Caicos Islands',
    'Northern Mariana Islands',
    'Svalbard and Jan Mayen'
];

export const MAP_STYLE = {
    version: 8,
    projection: {
        type: 'globe'
    },
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
                'background-color': '#082f49' // Deep ocean blue
            }
        },
        {
            id: 'countries-fill',
            type: 'fill',
            source: 'countries-data',
            filter: ['!', ['in', ['get', 'name'], ['literal', EXCLUDED_TERRITORIES]]],
            paint: {
                'fill-color': '#10b981', // Vibrant emerald green
                'fill-outline-color': '#047857' // Dark emerald outline
            }
        },
        {
            id: 'country-labels',
            type: 'symbol',
            source: 'country-labels-data',
            filter: ['!', ['in', ['get', 'name'], ['literal', EXCLUDED_TERRITORIES]]],
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
