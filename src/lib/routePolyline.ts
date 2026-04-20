// Convert lat/lng GPS points into a normalized SVG path for the Animation/Photo modes

export interface LatLng { lat: number; lng: number; }

export interface PolylineRender {
  d: string; // SVG path data
  width: number;
  height: number;
  length: number; // approximate path length in SVG units (used for stroke-dasharray)
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
}

/**
 * Project lat/lng points to a normalized SVG viewport, preserving aspect ratio.
 * Returns an SVG path "d" string + dimensions ready to plug into <svg viewBox>.
 */
export function buildPolyline(
  points: LatLng[],
  opts: { padding?: number; targetSize?: number } = {}
): PolylineRender | null {
  if (!points || points.length < 2) return null;

  const padding = opts.padding ?? 16;
  const target = opts.targetSize ?? 400;

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }

  const latRange = Math.max(maxLat - minLat, 1e-6);
  const lngRange = Math.max(maxLng - minLng, 1e-6);
  // Keep aspect ratio — use larger range as the divisor
  const aspect = lngRange / latRange;
  let width: number, height: number;
  if (aspect >= 1) {
    width = target;
    height = target / aspect;
  } else {
    height = target;
    width = target * aspect;
  }

  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const project = (p: LatLng) => {
    const x = padding + ((p.lng - minLng) / lngRange) * innerW;
    // SVG y is inverted (north should be up)
    const y = padding + (1 - (p.lat - minLat) / latRange) * innerH;
    return { x, y };
  };

  let d = "";
  let length = 0;
  let prev: { x: number; y: number } | null = null;
  for (let i = 0; i < points.length; i++) {
    const { x, y } = project(points[i]);
    if (i === 0) {
      d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    } else {
      d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      if (prev) length += Math.hypot(x - prev.x, y - prev.y);
    }
    prev = { x, y };
  }

  return { d, width, height, length, bbox: { minLat, maxLat, minLng, maxLng } };
}
