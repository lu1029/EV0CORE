// GPS filtering utilities — drift removal + smoothing for accurate run tracking

export interface RawPoint {
  lat: number;
  lng: number;
  altitude?: number | null;
  accuracy?: number;
  speed?: number | null;
  timestamp?: number;
}

// Haversine distance in km
export function haversineKm(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Activity-specific max plausible speed (km/h) used to reject GPS jumps
const MAX_SPEED_KMH: Record<string, number> = {
  run: 30,
  walk: 12,
  bike: 80,
  treadmill: 30,
  elliptical: 30,
  stairs: 15,
};

export interface GpsAcceptResult {
  accept: boolean;
  reason?: string;
  distanceKm: number;
  speedKmh: number;
  elevationDeltaM: number;
}

export interface GpsAcceptOptions {
  activityType?: string;
  maxAccuracyM?: number; // reject points worse than this (default 25m)
  minDistanceKm?: number; // ignore micro-jitter (default 0.0025km = 2.5m)
}

/**
 * Decide whether a new GPS point should be appended to the route.
 * Filters: accuracy threshold, impossible speed jumps, micro-jitter.
 */
export function evaluateGpsPoint(
  prev: RawPoint | null,
  next: RawPoint,
  opts: GpsAcceptOptions = {}
): GpsAcceptResult {
  const maxAcc = opts.maxAccuracyM ?? 25;
  const minDist = opts.minDistanceKm ?? 0.0025;
  const maxSpeed = MAX_SPEED_KMH[opts.activityType ?? "run"] ?? 30;

  if ((next.accuracy ?? 999) > maxAcc) {
    return { accept: false, reason: "low-accuracy", distanceKm: 0, speedKmh: 0, elevationDeltaM: 0 };
  }
  if (!prev) {
    return { accept: true, distanceKm: 0, speedKmh: 0, elevationDeltaM: 0 };
  }
  const distanceKm = haversineKm(prev, next);
  const dtSec = next.timestamp && prev.timestamp ? (next.timestamp - prev.timestamp) / 1000 : 1;
  const speedKmh = dtSec > 0 ? (distanceKm / (dtSec / 3600)) : 0;
  const elevationDeltaM =
    typeof prev.altitude === "number" && typeof next.altitude === "number"
      ? next.altitude - prev.altitude
      : 0;

  if (distanceKm < minDist) {
    return { accept: false, reason: "below-min-distance", distanceKm, speedKmh, elevationDeltaM };
  }
  if (speedKmh > maxSpeed) {
    return { accept: false, reason: "speed-spike", distanceKm, speedKmh, elevationDeltaM };
  }
  return { accept: true, distanceKm, speedKmh, elevationDeltaM };
}

/** Add altitude delta to running elevation gain (only positive deltas, with small noise floor). */
export function accumulateElevation(currentGain: number, deltaM: number): number {
  const NOISE_FLOOR_M = 1.5; // GPS altitude jitter
  if (deltaM > NOISE_FLOOR_M) return currentGain + deltaM;
  return currentGain;
}
