/**
 * Deterministic geo-obfuscation for Care providers.
 *
 * Requirements this satisfies:
 *  - snaps a provider's exact coordinates to a randomized point within a
 *    500m radius
 *  - the offset is a pure function of providerId: same input -> same
 *    output on every render, every app restart, every device. No storage,
 *    no server round trip needed to keep it stable.
 *
 * Approach: hash the providerId (FNV-1a) into a 32-bit seed, feed that seed
 * into a small deterministic PRNG (mulberry32), then sample a point
 * uniformly within a disc of the given radius and convert the polar offset
 * (meters) into a lat/lng delta.
 *
 * The one detail that's easy to get wrong: sampling radius as
 * `R * rng()` biases points toward the center (area grows with r^2, so a
 * uniform radius draw crowds samples near r=0). Sampling
 * `R * sqrt(rng())` instead makes the point uniform over the disc's AREA,
 * which is the geometrically correct notion of "a random point within Xm".
 */

const METERS_PER_DEGREE_LAT = 111_320;
const DEFAULT_RADIUS_METERS = 500;

function fnv1aHash(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: tiny, fast, deterministic PRNG — same seed always produces the same sequence. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export function obfuscateLocation(
  providerId: string,
  exact: GeoPoint,
  radiusMeters: number = DEFAULT_RADIUS_METERS
): GeoPoint {
  const seed = fnv1aHash(providerId);
  const rng = mulberry32(seed);

  const angle = rng() * 2 * Math.PI;
  const radius = radiusMeters * Math.sqrt(rng()); // uniform-over-area sampling, see header

  const dLat = (radius * Math.cos(angle)) / METERS_PER_DEGREE_LAT;
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos((exact.lat * Math.PI) / 180);
  const dLng = (radius * Math.sin(angle)) / metersPerDegreeLng;

  return {
    lat: exact.lat + dLat,
    lng: exact.lng + dLng,
  };
}
