
/**
 * OSRM API Caller Node
 * Handles communication with the OSRM (Open Source Routing Machine) API.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org'; // Public demo server (HTTPS)

export class OsrmNode {
    constructor(baseUrl = OSRM_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get route between two points
     * @param {Object} start - { lat, lng }
     * @param {Object} end - { lat, lng }
     * @param {string} profile - 'foot', 'driving', 'cycling'
     */
    async getRoute(start, end, profile = 'foot') {
        const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
        const url = `${this.baseUrl}/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`OSRM API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("OSRM Route Fetch Error:", error);
            throw error;
        }
    }

    /**
     * Get round trip route: Start -> Waypoint -> Start
     * URL Format: /route/v1/foot/{user_lng},{user_lat};{waypoint_lng},{waypoint_lat};{user_lng},{user_lat}?overview=full&geometries=geojson
     * @param {Object} start - { lat, lng }
     * @param {Object} waypoint - { lat, lng }
     * @return {Array} Array of [lat, lng] for Leaflet Polyline
     */
    async getRoundTrip(start, waypoint) {
        // OSRM expects [lng, lat] order in URL
        const coordinates = `${start.lng},${start.lat};${waypoint.lng},${waypoint.lat};${start.lng},${start.lat}`;

        // 1. Primary Strategy: High quality, avoid cars, large snapping radius
        const primaryUrl = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&exclude=motorway,trunk&radiuses=1000;1000;1000`;

        // 2. Fallback Strategy: Simple, permissive snapping, standard routing
        const fallbackUrl = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson`;

        // Helper to fetch with timeout
        const fetchRoute = async (url, timeoutMs) => {
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
        };

        try {
            console.log("Attempting primary route strategy...");
            const data = await fetchRoute(primaryUrl, 15000); // 15s timeout
            if (data.routes && data.routes.length > 0) {
                return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            }
            throw new Error("No routes found in primary");
        } catch (error) {
            console.warn("Primary route failed, attempting fallback...", error);
            try {
                // Retry with fallback
                const data = await fetchRoute(fallbackUrl, 15000);
                if (data.routes && data.routes.length > 0) {
                    return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                }
                // If even fallback fails, return empty array (or throw if you prefer explicit error)
                return [];
            } catch (fallbackError) {
                console.error("All route strategies failed:", fallbackError);
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
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("OSRM Nearest Fetch Error:", error);
            throw error;
        }
    }
}
