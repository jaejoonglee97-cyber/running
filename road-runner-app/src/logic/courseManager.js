
/**
 * Course Manager
 * Orchestrates the sequence of generating a random running course.
 * 
 * 🆕 경유지(Waypoints): 경유지를 거친 후 남은 거리만큼 더 나가서 반환점 계산
 * 🆕 반복 보정(iterative correction)으로 거리 정확도 향상
 * 🔧 OSRM public 서버 안정성 대응: exclude 제거, 재시도 로직 사용
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
     * Helper: OSRM 멀티포인트 라우팅 (재시도 포함, exclude 제거)
     */
    async fetchMultiPointRoute(points, overview = 'full') {
        const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
        const url = `${this.osrm.baseUrl}/route/v1/foot/${coords}?overview=${overview}&geometries=geojson&steps=false`;
        return await this.osrm.fetchWithRetry(url, 20000, 2);
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
    // 경유지 포함 왕복: 출발→경유지들→반환점→출발 = 목표거리
    // =====================================================
    async generateRoundTripWithWaypoints(startPoint, targetDistanceMeters, waypoints) {
        console.log(`🗺️ Round trip with ${waypoints.length} waypoint(s), target: ${(targetDistanceMeters / 1000).toFixed(1)}km`);

        const lastWaypoint = waypoints[waypoints.length - 1];

        // Step 1: 출발→경유지→출발 기본 루프 거리 측정
        const loopPoints = [startPoint, ...waypoints, startPoint];

        let waypointLoopDistance = 0;
        try {
            const loopData = await this.fetchMultiPointRoute(loopPoints, 'false');
            if (loopData.routes && loopData.routes.length > 0) {
                waypointLoopDistance = loopData.routes[0].distance;
            }
        } catch (e) {
            console.warn("Could not measure waypoint loop distance:", e.message);
        }

        console.log(`📏 Waypoint loop: ${(waypointLoopDistance / 1000).toFixed(2)}km`);

        // Step 2: 남은 거리 계산
        const remainingDistance = targetDistanceMeters - waypointLoopDistance;

        if (remainingDistance <= 500) {
            console.log("✅ Waypoint loop already meets target distance");
            try {
                const fullData = await this.fetchMultiPointRoute(loopPoints);
                if (fullData.routes && fullData.routes.length > 0) {
                    const route = fullData.routes[0];
                    return {
                        startPoint,
                        turnaroundPoint: lastWaypoint,
                        routePath: route.geometry.coordinates.map(c => [c[1], c[0]])
                    };
                }
            } catch (e) {
                console.warn("Fallback loop route failed:", e.message);
            }
        }

        // Step 3: 마지막 경유지에서 반환점 계산 + 반복 보정
        console.log(`🔄 Need ${(remainingDistance / 1000).toFixed(2)}km more beyond waypoints`);

        let currentExtraDistance = remainingDistance;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                const turnaroundPoint = await this.turnaroundCalculator.calculateTurnaround(
                    lastWaypoint, currentExtraDistance
                );

                const fullPoints = [startPoint, ...waypoints, turnaroundPoint, startPoint];
                const routeData = await this.fetchMultiPointRoute(fullPoints);

                if (routeData.routes && routeData.routes.length > 0) {
                    const route = routeData.routes[0];
                    const actualDistance = route.distance;
                    const routePath = route.geometry.coordinates.map(c => [c[1], c[0]]);

                    const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                    console.log(`[WP ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                    if (errorRatio < bestError) {
                        bestError = errorRatio;
                        bestResult = { startPoint, turnaroundPoint, routePath };
                    }

                    if (errorRatio <= DISTANCE_TOLERANCE) {
                        console.log("✅ Waypoint route within tolerance!");
                        return bestResult;
                    }

                    const correctionFactor = targetDistanceMeters / actualDistance;
                    currentExtraDistance = currentExtraDistance * correctionFactor;
                    currentExtraDistance = Math.max(currentExtraDistance, 500);
                }
            } catch (error) {
                console.warn(`[WP ${attempt + 1}] Failed:`, error.message);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate waypoint course");
    }

    // =====================================================
    // 경유지 포함 편도: 출발→경유지들→종점 = 목표거리
    // =====================================================
    async generateOneWayWithWaypoints(startPoint, targetDistanceMeters, waypoints) {
        console.log(`🗺️ One-way with ${waypoints.length} waypoint(s), target: ${(targetDistanceMeters / 1000).toFixed(1)}km`);

        const lastWaypoint = waypoints[waypoints.length - 1];

        // Step 1: 출발→경유지들 거리 측정
        const pathPoints = [startPoint, ...waypoints];

        let waypointPathDistance = 0;
        try {
            const pathData = await this.fetchMultiPointRoute(pathPoints, 'false');
            if (pathData.routes && pathData.routes.length > 0) {
                waypointPathDistance = pathData.routes[0].distance;
            }
        } catch (e) {
            console.warn("Could not measure waypoint path:", e.message);
        }

        const remainingDistance = targetDistanceMeters - waypointPathDistance;

        if (remainingDistance <= 300) {
            try {
                const fullData = await this.fetchMultiPointRoute(pathPoints);
                if (fullData.routes && fullData.routes.length > 0) {
                    const route = fullData.routes[0];
                    return {
                        startPoint,
                        endPoint: lastWaypoint,
                        turnaroundPoint: lastWaypoint,
                        routePath: route.geometry.coordinates.map(c => [c[1], c[0]])
                    };
                }
            } catch (e) {
                console.warn("Fallback path route failed:", e.message);
            }
        }

        // Step 2: 마지막 경유지에서 남은 거리만큼 종점 계산
        console.log(`🔄 Need ${(remainingDistance / 1000).toFixed(2)}km more beyond last waypoint`);

        let currentExtraDistance = remainingDistance;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                const endPoint = await this.turnaroundCalculator.calculateTurnaround(
                    lastWaypoint, currentExtraDistance * 2
                );

                const fullPoints = [startPoint, ...waypoints, endPoint];
                const routeData = await this.fetchMultiPointRoute(fullPoints);

                if (routeData.routes && routeData.routes.length > 0) {
                    const route = routeData.routes[0];
                    const actualDistance = route.distance;
                    const routePath = route.geometry.coordinates.map(c => [c[1], c[0]]);

                    const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                    console.log(`[OneWay WP ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                    if (errorRatio < bestError) {
                        bestError = errorRatio;
                        bestResult = { startPoint, endPoint, turnaroundPoint: endPoint, routePath };
                    }

                    if (errorRatio <= DISTANCE_TOLERANCE) {
                        return bestResult;
                    }

                    const correctionFactor = targetDistanceMeters / actualDistance;
                    currentExtraDistance = currentExtraDistance * correctionFactor;
                    currentExtraDistance = Math.max(currentExtraDistance, 300);
                }
            } catch (error) {
                console.warn(`[OneWay WP ${attempt + 1}] Failed:`, error.message);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate one-way waypoint course");
    }

    // =====================================================
    // 🆕 기본 왕복 → 루프(순환) 코스 생성
    // 여의도 한바퀴, 보라매공원 한바퀴 같은 순환 루프
    // A→B→C→D→A 형태로 가는길/오는길이 다르게 생성
    // =====================================================
    async generateRoundTripSimple(startPoint, targetDistanceMeters) {
        let currentTargetDistance = targetDistanceMeters;
        let bestResult = null;
        let bestError = Infinity;

        // 거리에 따라 경유지 수 결정
        const distKm = targetDistanceMeters / 1000;
        const numWaypoints = distKm >= 8 ? 4 : 3;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                console.log(`[Loop ${attempt + 1}] Target: ${(currentTargetDistance / 1000).toFixed(2)}km (${numWaypoints} waypoints)`);

                // 원형으로 경유지 생성
                const loopWaypoints = await this.turnaroundCalculator.calculateLoopWaypoints(
                    startPoint, currentTargetDistance, numWaypoints
                );

                // 루프 라우팅: Start → WP1 → WP2 → WP3 → Start
                const fullPoints = [startPoint, ...loopWaypoints, startPoint];
                const routeData = await this.fetchMultiPointRoute(fullPoints);

                if (routeData.routes && routeData.routes.length > 0) {
                    const route = routeData.routes[0];
                    const actualDistance = route.distance;
                    const routePath = route.geometry.coordinates.map(c => [c[1], c[0]]);

                    // 가장 먼 경유지를 turnaroundPoint로 사용 (지도 마커용)
                    let farthestWp = loopWaypoints[0];
                    let farthestDist = 0;
                    for (const wp of loopWaypoints) {
                        const d = Math.sqrt(
                            Math.pow(wp.lat - startPoint.lat, 2) +
                            Math.pow(wp.lng - startPoint.lng, 2)
                        );
                        if (d > farthestDist) {
                            farthestDist = d;
                            farthestWp = wp;
                        }
                    }

                    const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                    console.log(`[Loop ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                    if (errorRatio < bestError) {
                        bestError = errorRatio;
                        bestResult = { startPoint, turnaroundPoint: farthestWp, routePath };
                    }

                    if (errorRatio <= DISTANCE_TOLERANCE) {
                        console.log("✅ Loop route within tolerance!");
                        return bestResult;
                    }

                    const correctionFactor = targetDistanceMeters / actualDistance;
                    currentTargetDistance = currentTargetDistance * correctionFactor;
                    currentTargetDistance = Math.max(currentTargetDistance, targetDistanceMeters * 0.3);
                    currentTargetDistance = Math.min(currentTargetDistance, targetDistanceMeters * 2.0);
                }
            } catch (error) {
                console.warn(`[Loop ${attempt + 1}] Failed:`, error.message);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate loop course");
    }

    // =====================================================
    // 🆕 프리셋 추천 코스 경로 생성
    // 경유지 좌표 기반으로 OSRM 실제 도로 경로 생성
    // =====================================================
    async generatePresetCourse(presetCourse) {
        const { startPoint, waypoints } = presetCourse;
        const waypointCoords = waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));

        // 순환 코스: Start → WP1 → WP2 → ... → Start
        const fullPoints = [startPoint, ...waypointCoords, startPoint];

        try {
            console.log(`📍 Generating preset course: ${presetCourse.courseName}`);
            const routeData = await this.fetchMultiPointRoute(fullPoints);

            if (routeData.routes && routeData.routes.length > 0) {
                const route = routeData.routes[0];
                const routePath = route.geometry.coordinates.map(c => [c[1], c[0]]);

                // 가장 먼 경유지를 turnaroundPoint로 사용
                let farthestWp = waypointCoords[0];
                let farthestDist = 0;
                for (const wp of waypointCoords) {
                    const d = Math.sqrt(
                        Math.pow(wp.lat - startPoint.lat, 2) +
                        Math.pow(wp.lng - startPoint.lng, 2)
                    );
                    if (d > farthestDist) {
                        farthestDist = d;
                        farthestWp = wp;
                    }
                }

                return {
                    startPoint,
                    turnaroundPoint: farthestWp,
                    routePath,
                    actualDistanceMeters: route.distance
                };
            }
            throw new Error("OSRM returned no routes for preset course");
        } catch (error) {
            console.error("Preset course generation failed:", error.message);
            throw error;
        }
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
                console.log(`[OneWay ${attempt + 1}] Target: ${(currentTargetDistance / 1000).toFixed(2)}km`);

                const endPoint = await this.turnaroundCalculator.calculateTurnaround(
                    startPoint, currentTargetDistance * 2
                );

                const routeResult = await this.osrm.getOneWayRoute(startPoint, endPoint);
                const actualDistance = routeResult.distanceMeters;
                const routePath = routeResult.path;

                const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                console.log(`[OneWay ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

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
                console.warn(`[OneWay ${attempt + 1}] Failed:`, error.message);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) return bestResult;
        throw new Error("Failed to generate one-way course");
    }
}
