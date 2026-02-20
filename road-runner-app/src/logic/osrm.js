
/**
 * OSRM API Caller Node
 * Handles communication with the OSRM (Open Source Routing Machine) API.
 * 
 * 🆕 개선: 경로 좌표와 함께 실제 거리(meters)도 반환하여
 *         거리 보정 로직에 활용할 수 있게 합니다.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org'; // Public demo server (HTTPS)

export class OsrmNode {
    constructor(baseUrl = OSRM_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Helper to fetch with timeout
     */
    async fetchRoute(url, timeoutMs = 15000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error(`Status ${response.status}`);
            return await response.json();
        } catch (e) {
            clearTimeout(timeoutId);
            throw e;
        }
    }

    /**
     * Get route between two points (basic)
     */
    async getRoute(start, end, profile = 'foot') {
        const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
        const url = `${this.baseUrl}/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`;

        try {
            const data = await this.fetchRoute(url);
            return data;
        } catch (error) {
            console.error("OSRM Route Fetch Error:", error);
            throw error;
        }
    }

    /**
     * Get round trip route: Start -> Waypoint -> Start
     * @returns {{ path: Array, distanceMeters: number }}
     *   path: Array of [lat, lng] for Leaflet Polyline
     *   distanceMeters: actual road distance in meters
     */
    async getRoundTrip(start, waypoint) {
        const coordinates = `${start.lng},${start.lat};${waypoint.lng},${waypoint.lat};${start.lng},${start.lat}`;

        const primaryUrl = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&exclude=motorway,trunk&radiuses=1000;1000;1000&steps=false&alternatives=false`;
        const fallbackUrl = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false`;

        try {
            console.log("Attempting primary route strategy...");
            const data = await this.fetchRoute(primaryUrl, 15000);
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                    distanceMeters: route.distance // OSRM provides actual road distance
                };
            }
            throw new Error("No routes found in primary");
        } catch (error) {
            console.warn("Primary route failed, attempting fallback...", error);
            try {
                const data = await this.fetchRoute(fallbackUrl, 15000);
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    return {
                        path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                        distanceMeters: route.distance
                    };
                }
                return { path: [], distanceMeters: 0 };
            } catch (fallbackError) {
                console.error("All route strategies failed:", fallbackError);
                throw fallbackError;
            }
        }
    }

    /**
     * Get one-way route: Start -> End (no return)
     * @returns {{ path: Array, distanceMeters: number }}
     */
    async getOneWayRoute(start, end) {
        const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;

        const primaryUrl = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&exclude=motorway,trunk&radiuses=1000;1000&steps=false`;
        const fallbackUrl = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false`;

        try {
            console.log("Attempting primary one-way route...");
            const data = await this.fetchRoute(primaryUrl, 15000);
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                    distanceMeters: route.distance
                };
            }
            throw new Error("No routes found in primary");
        } catch (error) {
            console.warn("Primary one-way route failed, attempting fallback...", error);
            try {
                const data = await this.fetchRoute(fallbackUrl, 15000);
                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    return {
                        path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                        distanceMeters: route.distance
                    };
                }
                return { path: [], distanceMeters: 0 };
            } catch (fallbackError) {
                console.error("All one-way route strategies failed:", fallbackError);
                throw fallbackError;
            }
        }
    }

    /**
     * Get nearest point on the road network
     */
    async getNearest(lat, lng, profile = 'foot') {
        const url = `${this.baseUrl}/nearest/v1/${profile}/${lng},${lat}`;
        try {
            const data = await this.fetchRoute(url, 10000);
            return data;
        } catch (error) {
            console.error("OSRM Nearest Fetch Error:", error);
            throw error;
        }
    }
}
