import type { CountryFeatureProperties } from '@/types';

/**
 * Extracts a human-readable country name from GeoJSON feature properties.
 * Handles multiple property naming conventions across different tile sources.
 *
 * @param properties - The feature properties object from a map click event.
 * @returns The country name string, or `null` if no name could be extracted.
 */
export function extractCountryName(
    properties: CountryFeatureProperties | null | undefined
): string | null {
    if (!properties) return null;
    return properties.NAME || properties.name || null;
}

/**
 * Curated list of countries for quiz mode.
 * These are countries with well-known borders that appear clearly on most tile styles.
 */
export const QUIZ_COUNTRIES: string[] = [
    'France',
    'Brazil',
    'Australia',
    'Japan',
    'Canada',
    'India',
    'Egypt',
    'Mexico',
    'Germany',
    'Russia',
    'China',
    'Argentina',
    'United States of America',
    'South Africa',
    'Indonesia',
    'United Kingdom',
    'Italy',
    'Spain',
    'Turkey',
    'Nigeria',
    'Thailand',
    'Colombia',
    'Kenya',
    'Sweden',
    'Peru',
    'Saudi Arabia',
    'Pakistan',
    'Chile',
    'Norway',
    'Mongolia',
    'Vietnam',
    'South Korea',
    'Malaysia',
    'Philippines',
    'New Zealand',
    'Ukraine',
    'Poland',
    'Netherlands',
    'Greece',
    'Portugal',
    'Iran',
    'Morocco',
    'Venezuela',
];

/**
 * Picks a random country from the quiz pool, optionally excluding a specific country.
 *
 * @param exclude - Country name to exclude (e.g., current target to avoid repeats).
 * @returns A randomly selected country name.
 */
export function getRandomCountry(exclude?: string | null): string {
    const pool = exclude
        ? QUIZ_COUNTRIES.filter((c) => c !== exclude)
        : QUIZ_COUNTRIES;
    return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Bounding boxes for each quiz country [minLng, minLat, maxLng, maxLat].
 * Used to zoom the map automatically to the target country.
 */
export const COUNTRY_BBOXES: Record<string, [number, number, number, number]> = {
    'France': [-5.14, 41.33, 9.56, 51.09],
    'Brazil': [-73.98, -33.75, -34.79, 5.27],
    'Australia': [112.9, -43.6, 153.6, -9.2],
    'Japan': [122.9, 24.0, 153.9, 45.6],
    'Canada': [-141.0, 41.6, -52.6, 83.1],
    'India': [68.1, 6.7, 97.4, 35.5],
    'Egypt': [24.7, 21.7, 36.9, 31.6],
    'Mexico': [-117.1, 14.5, -86.7, 32.7],
    'Germany': [5.8, 47.2, 15.0, 55.0],
    'Russia': [19.6, 41.1, 180.0, 81.8],
    'China': [73.5, 18.1, 134.7, 53.5],
    'Argentina': [-73.5, -55.0, -53.6, -21.7],
    'United States of America': [-124.7, 24.5, -66.9, 49.3], // Mainland
    'South Africa': [16.4, -34.8, 32.9, -22.1],
    'Indonesia': [95.0, -11.0, 141.0, 6.0],
    'United Kingdom': [-8.6, 49.8, 1.7, 60.8],
    'Italy': [6.6, 35.4, 18.5, 47.0],
    'Spain': [-9.3, 36.0, 3.3, 43.7],
    'Turkey': [25.6, 35.8, 44.8, 42.1],
    'Nigeria': [2.6, 4.2, 14.6, 13.8],
    'Thailand': [97.3, 5.6, 105.6, 20.4],
    'Colombia': [-79.0, -4.2, -66.8, 12.4],
    'Kenya': [33.9, -4.6, 41.9, 5.0],
    'Sweden': [11.1, 55.3, 24.1, 69.0],
    'Peru': [-81.3, -18.3, -68.6, -0.0],
    'Saudi Arabia': [34.5, 16.3, 55.6, 32.1],
    'Pakistan': [60.8, 23.6, 77.8, 37.0],
    'Chile': [-75.6, -56.5, -66.9, -17.5],
    'Norway': [4.6, 57.9, 31.1, 71.1],
    'Mongolia': [87.7, 41.5, 119.9, 52.1],
    'Vietnam': [102.1, 8.5, 109.5, 23.4],
    'South Korea': [125.0, 33.1, 131.0, 38.6],
    'Malaysia': [99.6, 0.8, 119.3, 7.4],
    'Philippines': [116.9, 4.5, 126.6, 21.1],
    'New Zealand': [166.4, -47.3, 178.6, -34.4],
    'Ukraine': [22.1, 44.3, 40.2, 52.4],
    'Poland': [14.1, 49.0, 24.1, 54.8],
    'Netherlands': [3.3, 50.7, 7.2, 53.6],
    'Greece': [19.3, 34.8, 29.6, 41.8],
    'Portugal': [-9.5, 36.9, -6.1, 42.2],
    'Iran': [44.0, 25.0, 63.3, 39.8],
    'Morocco': [-13.2, 27.6, -1.0, 35.9],
    'Venezuela': [-73.4, 0.6, -59.8, 12.2],
};

/**
 * Generates an array of multiple choice options including the correct target.
 *
 * @param targetCountry - The correct answer.
 * @param count - Total number of options to return.
 * @returns Array of randomly sorted country names.
 */
export function getMultipleChoiceOptions(targetCountry: string, count: number = 4): string[] {
    const others = QUIZ_COUNTRIES.filter((c) => c !== targetCountry);

    // Shuffle others
    for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
    }

    // Pick (count - 1) wrong options
    const options = [targetCountry, ...others.slice(0, count - 1)];

    // Shuffle the final options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }

    return options;
}
