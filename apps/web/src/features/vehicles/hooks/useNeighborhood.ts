import { useEffect, useState } from "react";

// Module-level cache — persists across panel open/close for the session
// key: vehicleId, value: resolved neighborhood name
const _cache = new Map<string, string>();

// Nominatim rate limit: 1 req/s. We only fetch on vehicle selection,
// never on position ticks, so this is safe.
async function fetchNeighborhood(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`;
  const res = await fetch(url, {
    headers: { "User-Agent": "FleetOps-Portfolio/1.0" },
  });
  if (!res.ok) throw new Error("Nominatim request failed");
  const data = await res.json();
  const addr = data.address ?? {};
  // Nominatim returns different granularity levels — pick the most specific
  return (
    addr.neighbourhood ??
    addr.suburb ??
    addr.quarter ??
    addr.city_district ??
    addr.county ??
    "Desconocido"
  );
}

interface UseNeighborhoodResult {
  neighborhood: string | null;
  loading: boolean;
}

export function useNeighborhood(
  vehicleId: string,
  position: [number, number],
): UseNeighborhoodResult {
  const [neighborhood, setNeighborhood] = useState<string | null>(
    _cache.get(vehicleId) ?? null,
  );
  const [loading, setLoading] = useState(!_cache.has(vehicleId));

  useEffect(() => {
    // Already cached for this vehicle — use it immediately
    if (_cache.has(vehicleId)) {
      setNeighborhood(_cache.get(vehicleId)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchNeighborhood(position[0], position[1])
      .then((name) => {
        if (cancelled) return;
        _cache.set(vehicleId, name);
        setNeighborhood(name);
      })
      .catch(() => {
        if (cancelled) return;
        setNeighborhood("No disponible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // vehicleId is the stable key — position intentionally excluded to avoid
    // re-fetching on every realtime tick. Cache is cleared on full page reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  return { neighborhood, loading };
}
