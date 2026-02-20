
/**
 * Course Manager
 * Orchestrates the sequence of generating a random running course.
 * Supports both round-trip and one-way modes.
 * 
 * 🆕 개선: 반복 보정(iterative correction)으로 거리 정확도 향상
 *         - OSRM 실제 거리와 목표 거리를 비교
 *         - 오차가 15% 이상이면 반환점을 조정하여 재시도 (최대 3회)
 */

import { GpsNode } from './gps';
import { TurnaroundCalculator } from './turnaround';
import { OsrmNode } from './osrm';

// 허용 오차 비율 (15%)
const DISTANCE_TOLERANCE = 0.15;
// 최대 보정 시도 횟수
const MAX_CORRECTION_ATTEMPTS = 3;

export class CourseManager {
    constructor() {
        this.gps = new GpsNode();
        this.turnaroundCalculator = new TurnaroundCalculator();
        this.osrm = new OsrmNode();
    }

    /**
     * Generates a full round-trip course: start -> random waypoint -> start
     * @param {number} targetDistanceMeters - Desired total distance
     * @returns {Promise<Object>} { startPoint, turnaroundPoint, routePath }
     */
    async generateCourse(targetDistanceMeters) {
        try {
            console.log("Acquiring GPS position...");
            const startPoint = await this.gps.getCurrentPosition();
            return this.generateCourseFromPoint(startPoint, targetDistanceMeters);
        } catch (error) {
            console.error("Course Generation Failed:", error);
            throw error;
        }
    }

    /**
     * Generates round-trip course from a given start point
     * with iterative distance correction
     */
    async generateCourseFromPoint(startPoint, targetDistanceMeters) {
        let currentTargetDistance = targetDistanceMeters;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                console.log(`[Attempt ${attempt + 1}] Target distance: ${(currentTargetDistance / 1000).toFixed(2)}km`);

                // 1. 반환점 계산
                const turnaroundPoint = await this.turnaroundCalculator.calculateTurnaround(
                    startPoint,
                    currentTargetDistance
                );

                // 2. OSRM 경로 가져오기 (실제 거리 포함)
                const routeResult = await this.osrm.getRoundTrip(startPoint, turnaroundPoint);
                const actualDistance = routeResult.distanceMeters;
                const routePath = routeResult.path;

                const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                console.log(`[Attempt ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                // 현재까지 가장 좋은 결과 저장
                if (errorRatio < bestError) {
                    bestError = errorRatio;
                    bestResult = {
                        startPoint,
                        turnaroundPoint,
                        routePath
                    };
                }

                // 오차가 허용 범위 내면 바로 반환
                if (errorRatio <= DISTANCE_TOLERANCE) {
                    console.log(`✅ Distance within ${(DISTANCE_TOLERANCE * 100)}% tolerance. Done.`);
                    return bestResult;
                }

                // 보정: 실제 거리와 목표 거리의 비율로 다음 목표 조정
                // 예: 목표 5km인데 실제 6km가 나왔으면 → 다음엔 5 * (5/6) ≈ 4.17km로 목표 줄임
                const correctionFactor = targetDistanceMeters / actualDistance;
                currentTargetDistance = currentTargetDistance * correctionFactor;

                // 보정된 거리가 너무 작거나 크면 제한
                currentTargetDistance = Math.max(currentTargetDistance, targetDistanceMeters * 0.3);
                currentTargetDistance = Math.min(currentTargetDistance, targetDistanceMeters * 2.0);

                console.log(`🔄 Corrected target: ${(currentTargetDistance / 1000).toFixed(2)}km (factor: ${correctionFactor.toFixed(3)})`);

            } catch (error) {
                console.warn(`[Attempt ${attempt + 1}] Failed:`, error);
                if (bestResult) break; // 이전에 성공한 결과가 있으면 그걸 사용
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        // 최선의 결과 반환 (완벽하지 않더라도)
        if (bestResult) {
            console.log(`📍 Best result: error ${(bestError * 100).toFixed(1)}%`);
            return bestResult;
        }

        throw new Error("Failed to generate a course within distance tolerance");
    }

    /**
     * Generates a one-way course from a given start point
     * with iterative distance correction
     */
    async generateOneWayCourse(startPoint, targetDistanceMeters) {
        let currentTargetDistance = targetDistanceMeters;
        let bestResult = null;
        let bestError = Infinity;

        for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
            try {
                console.log(`[OneWay Attempt ${attempt + 1}] Target: ${(currentTargetDistance / 1000).toFixed(2)}km`);

                // 편도: turnaround calculator에 2배 전달 (내부에서 반으로 나누므로)
                const endPoint = await this.turnaroundCalculator.calculateTurnaround(
                    startPoint,
                    currentTargetDistance * 2
                );

                const routeResult = await this.osrm.getOneWayRoute(startPoint, endPoint);
                const actualDistance = routeResult.distanceMeters;
                const routePath = routeResult.path;

                const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
                console.log(`[OneWay Attempt ${attempt + 1}] Actual: ${(actualDistance / 1000).toFixed(2)}km, Error: ${(errorRatio * 100).toFixed(1)}%`);

                if (errorRatio < bestError) {
                    bestError = errorRatio;
                    bestResult = {
                        startPoint,
                        endPoint,
                        routePath
                    };
                }

                if (errorRatio <= DISTANCE_TOLERANCE) {
                    console.log(`✅ One-way distance within tolerance. Done.`);
                    return bestResult;
                }

                // 보정
                const correctionFactor = targetDistanceMeters / actualDistance;
                currentTargetDistance = currentTargetDistance * correctionFactor;
                currentTargetDistance = Math.max(currentTargetDistance, targetDistanceMeters * 0.3);
                currentTargetDistance = Math.min(currentTargetDistance, targetDistanceMeters * 2.0);

                console.log(`🔄 Corrected one-way target: ${(currentTargetDistance / 1000).toFixed(2)}km`);

            } catch (error) {
                console.warn(`[OneWay Attempt ${attempt + 1}] Failed:`, error);
                if (bestResult) break;
                if (attempt === MAX_CORRECTION_ATTEMPTS) throw error;
            }
        }

        if (bestResult) {
            console.log(`📍 Best one-way result: error ${(bestError * 100).toFixed(1)}%`);
            return bestResult;
        }

        throw new Error("Failed to generate a one-way course within distance tolerance");
    }
}
