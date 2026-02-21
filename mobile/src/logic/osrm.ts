/**
 * OSRM API — foot routing with retry
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export interface OsrmRouteResult {
  path: [number, number][];
  distanceMeters: number;
}

export class OsrmNode {
  baseUrl: string;

  constructor(baseUrl: string = OSRM_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetchRoute(url: string, timeoutMs: number = 20000): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }
      const data = await response.json();
      if (data && (data as { code?: string }).code && (data as { code: string }).code !== 'Ok') {
        console.warn('OSRM response code:', (data as { code: string }).code);
      }
      return data;
    } catch (e) {
      clearTimeout(timeoutId);
      if ((e as Error).name === 'AbortError') {
        throw new Error(`OSRM 서버 응답 시간 초과 (${timeoutMs / 1000}초)`);
      }
      throw e;
    }
  }

  async fetchWithRetry(url: string, timeoutMs: number = 20000, maxRetries: number = 2): Promise<unknown> {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise((r) => setTimeout(r, delay));
        }
        return await this.fetchRoute(url, timeoutMs);
      } catch (e) {
        lastError = e as Error;
      }
    }
    throw lastError;
  }

  async getRoundTrip(
    start: { lat: number; lng: number },
    waypoint: { lat: number; lng: number }
  ): Promise<OsrmRouteResult> {
    const coordinates = `${start.lng},${start.lat};${waypoint.lng},${waypoint.lat};${start.lng},${start.lat}`;
    const url = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false&alternatives=false`;
    const data = (await this.fetchWithRetry(url, 20000, 2)) as { routes?: { geometry: { coordinates: [number, number][] }; distance: number }[] };
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        path: route.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]),
        distanceMeters: route.distance,
      };
    }
    throw new Error('OSRM returned no routes');
  }

  async getOneWayRoute(
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): Promise<OsrmRouteResult> {
    const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
    const url = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false`;
    const data = (await this.fetchWithRetry(url, 20000, 2)) as { routes?: { geometry: { coordinates: [number, number][] }; distance: number }[] };
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      return {
        path: route.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]),
        distanceMeters: route.distance,
      };
    }
    throw new Error('OSRM returned no routes');
  }

  async getNearest(lat: number, lng: number, _profile: string = 'foot'): Promise<{ waypoints?: { location: [number, number] }[] }> {
    const url = `${this.baseUrl}/nearest/v1/foot/${lng},${lat}`;
    return (await this.fetchWithRetry(url, 10000, 1)) as { waypoints?: { location: [number, number] }[] };
  }
}
