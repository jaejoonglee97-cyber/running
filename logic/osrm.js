
/**
 * OSRM API Caller Node
 * Handles communication with the OSRM (Open Source Routing Machine) API.
 */

const OSRM_BASE_URL = 'http://router.project-osrm.org'; // Public demo server, replace with own instance for production

export class OsrmNode {
    constructor(baseUrl = OSRM_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get route between two points
     * @param {Object} start - { lat, lng }
     * @param {Object} end - { lat, lng }
     * @param {string} profile - 'driving', 'walking', 'cycling'
     */
    async getRoute(start, end, profile = 'walking') {
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
        // Using 'foot' profile as requested
        const url = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`OSRM API Error: ${response.statusText}`);
            }
            const data = await response.json();

            // Process response to match Leaflet Polyline needs (routes[0].geometry)
            if (data.routes && data.routes.length > 0) {
                const geometry = data.routes[0].geometry;
                // OSRM GeoJSON returns [lng, lat], Leaflet needs [lat, lng]
                // So we map and swap
                return geometry.coordinates.map(coord => [coord[1], coord[0]]);
            }
            return [];
        } catch (error) {
            console.error("OSRM Round Trip Fetch Error:", error);
            throw error;
        }
    }

    /**
     * Get nearest point on the road network
     */
    async getNearest(lat, lng, profile = 'walking') {
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
