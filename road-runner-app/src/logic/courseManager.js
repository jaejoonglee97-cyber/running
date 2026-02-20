
/**
 * Course Manager
 * Orchestrates the sequence of generating a random running course.
 * 
 * 🆕 경유지(Waypoints): 경유지를 거친 후 남은 거리만큼 더 나가서 반환점 계산
 *    예: 16km 왕복 + 경유지 A → 출발→A→반환점→출발 = 16km
 * 🆕 반복 보정(iterative correction)으로 거리 정확도 향상
 */

import { GpsNode } from './gps';
import { TurnaroundCalculator } from './turnaround';
import { OsrmNode } from './osrm';

const DISTANCE_TOLERANCE = 0.15;
const MAX_CORRECTION_ATTEMPTS = 3;

export class CourseManager {
    constructor() {
        this.gps = new GpsNode();
        this.turnaroundCalculator = new TurnaroundCalculator();
        this.osrm = new OsrmNode();
    }

    /**
     * Generates round-trip course from a given start point
     */
    async generateCourseFromPoint(startPoint, targetDistanceMeters, waypoints = []) {
        if (waypoints.length > 0) {
            return this.generateRoundTripWithWaypoints(startPoint, targetDistanceMeters, waypoints);
        }
        return this.generateRoundTripSimple(startPoint, targetDistanceMeters);
    }

    /**
     * Generates one-way course from a given start point
     */
    async generateOneWayCourse(startPoint, targetDistanceMeters, waypoints = []) {
        if (waypoints.length > 0) {
            return this.generateOneWayWithWaypoints(startPoint, targetDistanceMeters, waypoints);
        }
        return this.generateOneWaySimple(startPoint, targetDistanceMeters);
    }

    // =====================================================
    // 🆕 경유지 포함 왕복: 출발→경유지들→반환점→출발 = 목표거리
    // =====================================================
    async generateRoundTripWithWaypoints(startPoint, targetDistanceMeters, waypoints) {
        console.log(`🗺️ Round trip with ${waypoints.length} waypoint(s), target: ${(targetDistanceMeters / 1000).toFixed(1)}km`);

        const lastWaypoint = waypoints[waypoints.length - 1];

        // Step 1: 출발→경유지→출발 기본 루프 거리 측정
        const loopPoints = [startPoint, ...waypoints, startPoint];
        const loopCoords = loopPoints.map(p => `${p.lng},${p.lat}`).join(';');
        const loopRadiuses = loopPoints.map(() => '1000').join(';');
        const loopUrl = `${this.osrm.baseUrl}/route/v1/foot/${loopCoords}?overview=false&geometries=geojson&radiuses=${loopRadiuses}&steps=false`;

        let waypointLoopDistance = 0;
        try {
            const loopData = await this.osrm.fetchRoute(loopUrl, 15000);
            if (loopData.routes && loopData.routes.length > 0) {
                waypointLoopDistance = loopData.routes[0].distance;
            }
        } catch (e) {
            console.warn("Could not measure waypoint loop distance:", e);
        }

        console.log(`📏 Waypoint loop distance (start→WPs→start): ${(waypointLoopDistance / 1000).toFixed(2)}km`);

        // Step 2: 남은 거리 계산 — 반환점까지 왕복으로 추가해야 할 거리
        const remainingDistance = targetDistanceMeters - waypointLoopDistance;

        if (remainingDistance <= 500) {
            // 경유지만으로 이미 목표 거리에 가까움 → 경유지 루프만 반환
            console.log("✅ Waypoint loop already meets target distance");
            const fullCoords = loopPoints.map(p => `${p.lng},${p.lat}`).join(';');
            const fullRadiuses = loopPoints.map(() => '1000').join(';');
            const fullUrl = `${this.osrm.baseUrl}/route/v1/foot/${fullCoords}?overview=full&geometries=geojson&exclude=motorway,trunk&radiuses=${fullRadiuses}&steps=false`;
            const fullData = await this.osrm.fetchRoute(fullUrl, 15000);
            if (fullData.routes && fullData.routes.length > 0) {
                const route = fullData.routes[0];
                return {
                    startPoint,
                    turnaroundPoint: lastWaypoint,
                    routePath: route.geometry.coordinates.map(c => [c[1], c[0]])
                };
            }
        }

        // Step 3: 마지막 경유지 기준으로 반환점 계산
        // 반환점에서 마지막 경유지까지 왕복 = remainingDistance
        // → 반환점까지 편도 거리 = remainingDistance / 2
        console.log(`🔄 Need ${(remainingDistance / 1000).toFixed(2)}km more beyond waypoints`);

        let currentExtraDistance = remainingDistance;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                // 마지막 경유지에서 반환점 계산 (편도 거리)
                const turnaroundPoint = await this.turnaroundCalculator.calculateTurnaround(
                    lastWaypoint,
                    currentExtraDistance // turnaround 내부에서 /2 처리
                );

                // 전체 경로: 출발→경유지들→반환점→출발
                const fullPoints = [startPoint, ...waypoints, turnaroundPoint, startPoint];
                const fullCoords = fullPoints.map(p => `${p.lng},${p.lat}`).join(';');
                const fullRadiuses = fullPoints.map(() => '1000').join(';');
                const primaryUrl = `${this.osrm.baseUrl}/route/v1/foot/${fullCoords}?overview=full&geometries=geojson&exclude=motorway,trunk&radiuses=${fullRadiuses}&steps=false`;
                const fallbackUrl = `${this.osrm.baseUrl}/route/v1/foot/${fullCoords}?overview=full&geometries=geojson&steps=false`;

                let routeData;
                try {
                    routeData = await this.osrm.fetchRoute(primaryUrl, 15000);
                    if (!routeData.routes || routeData.routes.length === 0) throw new Error("No routes");
                } catch (e) {
                    routeData = await this.osrm.fetchRoute(fallbackUrl, 15000);
                }

                if (routeData.routes && routeData.routes.length > 0) {
                    const route = routeData.routes[0];
                    const actualDistance = route.distance;
                    const routePath = route.geometry.coordinates.map(c => [c[1], c[0]]);

                    const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                    console.log(`[WP Attempt ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                    if (errorRatio < bestError) {
                        bestError = errorRatio;
                        bestResult = { startPoint, turnaroundPoint, routePath };
                    }

                    if (errorRatio <= DISTANCE_TOLERANCE) {
                        console.log("✅ Waypoint route within tolerance!");
                        return bestResult;
                    }

                    // 보정
                    const correctionFactor = targetDistanceMeters / actualDistance;
                    currentExtraDistance = currentExtraDistance * correctionFactor;
                    currentExtraDistance = Math.max(currentExtraDistance, 500);
                }
            } catch (error) {
                console.warn(`[WP Attempt ${attempt + 1}] Failed:`, error);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate waypoint course");
    }

    // =====================================================
    // 🆕 경유지 포함 편도: 출발→경유지들→종점 = 목표거리
    // =====================================================
    async generateOneWayWithWaypoints(startPoint, targetDistanceMeters, waypoints) {
        console.log(`🗺️ One-way with ${waypoints.length} waypoint(s), target: ${(targetDistanceMeters / 1000).toFixed(1)}km`);

        const lastWaypoint = waypoints[waypoints.length - 1];

        // Step 1: 출발→경유지들 거리 측정
        const pathPoints = [startPoint, ...waypoints];
        const pathCoords = pathPoints.map(p => `${p.lng},${p.lat}`).join(';');
        const pathRadiuses = pathPoints.map(() => '1000').join(';');
        const pathUrl = `${this.osrm.baseUrl}/route/v1/foot/${pathCoords}?overview=false&geometries=geojson&radiuses=${pathRadiuses}&steps=false`;

        let waypointPathDistance = 0;
        try {
            const pathData = await this.osrm.fetchRoute(pathUrl, 15000);
            if (pathData.routes && pathData.routes.length > 0) {
                waypointPathDistance = pathData.routes[0].distance;
            }
        } catch (e) {
            console.warn("Could not measure waypoint path distance:", e);
        }

        const remainingDistance = targetDistanceMeters - waypointPathDistance;

        if (remainingDistance <= 300) {
            // 경유지까지가 이미 목표 거리
            const fullCoords = pathPoints.map(p => `${p.lng},${p.lat}`).join(';');
            const fullRadiuses = pathPoints.map(() => '1000').join(';');
            const fullUrl = `${this.osrm.baseUrl}/route/v1/foot/${fullCoords}?overview=full&geometries=geojson&exclude=motorway,trunk&radiuses=${fullRadiuses}&steps=false`;
            const fullData = await this.osrm.fetchRoute(fullUrl, 15000);
            if (fullData.routes && fullData.routes.length > 0) {
                const route = fullData.routes[0];
                return {
                    startPoint,
                    endPoint: lastWaypoint,
                    turnaroundPoint: lastWaypoint,
                    routePath: route.geometry.coordinates.map(c => [c[1], c[0]])
                };
            }
        }

        // Step 2: 마지막 경유지에서 남은 거리만큼 더 가서 종점 계산
        console.log(`🔄 Need ${(remainingDistance / 1000).toFixed(2)}km more beyond last waypoint`);

        let currentExtraDistance = remainingDistance;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                // 마지막 경유지에서 종점 계산
                const endPoint = await this.turnaroundCalculator.calculateTurnaround(
                    lastWaypoint,
                    currentExtraDistance * 2  // turnaround 내부에서 /2 처리
                );

                const fullPoints = [startPoint, ...waypoints, endPoint];
                const fullCoords = fullPoints.map(p => `${p.lng},${p.lat}`).join(';');
                const fullRadiuses = fullPoints.map(() => '1000').join(';');
                const primaryUrl = `${this.osrm.baseUrl}/route/v1/foot/${fullCoords}?overview=full&geometries=geojson&exclude=motorway,trunk&radiuses=${fullRadiuses}&steps=false`;

                let routeData;
                try {
                    routeData = await this.osrm.fetchRoute(primaryUrl, 15000);
                    if (!routeData.routes || routeData.routes.length === 0) throw new Error("No routes");
                } catch (e) {
                    const fallbackUrl = `${this.osrm.baseUrl}/route/v1/foot/${fullCoords}?overview=full&geometries=geojson&steps=false`;
                    routeData = await this.osrm.fetchRoute(fallbackUrl, 15000);
                }

                if (routeData.routes && routeData.routes.length > 0) {
                    const route = routeData.routes[0];
                    const actualDistance = route.distance;
                    const routePath = route.geometry.coordinates.map(c => [c[1], c[0]]);

                    const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                    console.log(`[OneWay WP Attempt ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                    if (errorRatio < bestError) {
                        bestError = errorRatio;
                        bestResult = { startPoint, endPoint, turnaroundPoint: endPoint, routePath };
                    }

                    if (errorRatio <= DISTANCE_TOLERANCE) {
                        console.log("✅ One-way waypoint route within tolerance!");
                        return bestResult;
                    }

                    const correctionFactor = targetDistanceMeters / actualDistance;
                    currentExtraDistance = currentExtraDistance * correctionFactor;
                    currentExtraDistance = Math.max(currentExtraDistance, 300);
                }
            } catch (error) {
                console.warn(`[OneWay WP Attempt ${attempt + 1}] Failed:`, error);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate one-way waypoint course");
    }

    // =====================================================
    // 기본 왕복 (경유지 없음)
    // =====================================================
    async generateRoundTripSimple(startPoint, targetDistanceMeters) {
        let currentTargetDistance = targetDistanceMeters;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                console.log(`[Attempt ${attempt + 1}] Target: ${(currentTargetDistance / 1000).toFixed(2)}km`);

                const turnaroundPoint = await this.turnaroundCalculator.calculateTurnaround(
                    startPoint, currentTargetDistance
                );

                const routeResult = await this.osrm.getRoundTrip(startPoint, turnaroundPoint);
                const actualDistance = routeResult.distanceMeters;
                const routePath = routeResult.path;

                const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                console.log(`[Attempt ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                if (errorRatio < bestError) {
                    bestError = errorRatio;
                    bestResult = { startPoint, turnaroundPoint, routePath };
                }

                if (errorRatio <= DISTANCE_TOLERANCE) {
                    console.log("✅ Within tolerance. Done.");
                    return bestResult;
                }

                const correctionFactor = targetDistanceMeters / actualDistance;
                currentTargetDistance = currentTargetDistance * correctionFactor;
                currentTargetDistance = Math.max(currentTargetDistance, targetDistanceMeters * 0.3);
                currentTargetDistance = Math.min(currentTargetDistance, targetDistanceMeters * 2.0);
            } catch (error) {
                console.warn(`[Attempt ${attempt + 1}] Failed:`, error);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate course");
    }

    // =====================================================
    // 기본 편도 (경유지 없음)
    // =====================================================
    async generateOneWaySimple(startPoint, targetDistanceMeters) {
        let currentTargetDistance = targetDistanceMeters;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                console.log(`[OneWay Attempt ${attempt + 1}] Target: ${(currentTargetDistance / 1000).toFixed(2)}km`);

                const endPoint = await this.turnaroundCalculator.calculateTurnaround(
                    startPoint, currentTargetDistance * 2
                );

                const routeResult = await this.osrm.getOneWayRoute(startPoint, endPoint);
                const actualDistance = routeResult.distanceMeters;
                const routePath = routeResult.path;

                const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                console.log(`[OneWay Attempt ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                if (errorRatio < bestError) {
                    bestError = errorRatio;
                    bestResult = { startPoint, endPoint, turnaroundPoint: endPoint, routePath };
                }

                if (errorRatio <= DISTANCE_TOLERANCE) {
                    return bestResult;
                }

                const correctionFactor = targetDistanceMeters / actualDistance;
                currentTargetDistance = currentTargetDistance * correctionFactor;
                currentTargetDistance = Math.max(currentTargetDistance, targetDistanceMeters * 0.3);
                currentTargetDistance = Math.min(currentTargetDistance, targetDistanceMeters * 2.0);
            } catch (error) {
                console.warn(`[OneWay Attempt ${attempt + 1}] Failed:`, error);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate one-way course");
    }
}
