
/**
 * OSRM API Caller Node
 * Handles communication with the OSRM (Open Source Routing Machine) API.
 * 
 * 🔧 개선: public 서버의 불안정성 대응
 *   - exclude 파라미터 제거 (public 서버 미지원)
 *   - 자동 재시도 (최대 3회, 지수 백오프)
 *   - 타임아웃 연장 (20초)
 *   - 상세 에러 로깅
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export class OsrmNode {
    constructor(baseUrl = OSRM_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Helper to fetch with timeout
     */
    async fetchRoute(url, timeoutMs = 20000) {
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
            // OSRM returns code: 'Ok' on success
            if (data.code && data.code !== 'Ok') {
                console.warn(`OSRM response code: ${data.code}, message: ${data.message || 'none'}`);
            }
            return data;
        } catch (e) {
            clearTimeout(timeoutId);
            if (e.name === 'AbortError') {
                throw new Error(`OSRM 서버 응답 시간 초과 (${timeoutMs / 1000}초)`);
            }
            throw e;
        }
    }

    /**
     * Fetch with automatic retry (up to maxRetries)
     */
    async fetchWithRetry(url, timeoutMs = 20000, maxRetries = 2) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    // 지수 백오프: 1초, 2초, 4초...
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`⏳ Retry ${attempt}/${maxRetries} after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                return await this.fetchRoute(url, timeoutMs);
            } catch (e) {
                lastError = e;
                console.warn(`OSRM fetch attempt ${attempt + 1} failed:`, e.message);
            }
        }
        throw lastError;
    }

    /**
     * Get round trip route: Start -> Waypoint -> Start
     * @returns {{ path: Array, distanceMeters: number }}
     */
    async getRoundTrip(start, waypoint) {
        const coordinates = `${start.lng},${start.lat};${waypoint.lng},${waypoint.lat};${start.lng},${start.lat}`;

        // public OSRM 서버는 exclude 미지원 → 제거
        const url = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false&alternatives=false`;

        try {
            console.log("Fetching round trip route...");
            const data = await this.fetchWithRetry(url, 20000, 2);
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                    distanceMeters: route.distance
                };
            }
            throw new Error("OSRM returned no routes");
        } catch (error) {
            console.error("Round trip route failed:", error.message);
            throw error;
        }
    }

    /**
     * Get one-way route: Start -> End
     * @returns {{ path: Array, distanceMeters: number }}
     */
    async getOneWayRoute(start, end) {
        const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
        const url = `${this.baseUrl}/route/v1/foot/${coordinates}?overview=full&geometries=geojson&steps=false`;

        try {
            console.log("Fetching one-way route...");
            const data = await this.fetchWithRetry(url, 20000, 2);
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                return {
                    path: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
                    distanceMeters: route.distance
                };
            }
            throw new Error("OSRM returned no routes");
        } catch (error) {
            console.error("One-way route failed:", error.message);
            throw error;
        }
    }

    /**
     * Get nearest point on the road network
     */
    async getNearest(lat, lng, profile = 'foot') {
        const url = `${this.baseUrl}/nearest/v1/${profile}/${lng},${lat}`;
        try {
            const data = await this.fetchWithRetry(url, 10000, 1);
            return data;
        } catch (error) {
            console.error("OSRM Nearest Fetch Error:", error.message);
            throw error;
        }
    }
}
