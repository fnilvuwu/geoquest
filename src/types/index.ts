/**
 * Represents the available gameplay modes.
 */
export type GameMode = 'explore' | 'quiz' | 'essay';

/**
 * Standard coordinate tuple [longitude, latitude].
 */
export type MapCoordinates = [number, number];

/**
 * Properties expected within a standard Natural Earth or demo tile GeoJSON feature.
 */
export interface CountryFeatureProperties {
  NAME?: string;
  name?: string;
  ISO_A3?: string;
  [key: string]: unknown;
}

/**
 * GeoJSON Feature interface mapping for country borders.
 */
export interface CountryFeature {
  type: 'Feature';
  properties: CountryFeatureProperties;
  geometry: unknown;
}