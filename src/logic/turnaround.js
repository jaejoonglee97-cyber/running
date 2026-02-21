
/**
 * Turnaround Point Calculator
 * Logic to calculate a virtual turnaround point based on target distance.
 * 
 * 🆕 개선: 한강뿐 아니라 서울 전역 하천·공원을 우선으로
 *         안전한 러닝 코스를 생성합니다.
 */

import { OsrmNode } from './osrm';
import { HANGANG_POINTS, ALL_SAFE_POINTS } from './hangang_points';

export class TurnaroundCalculator {
    constructor() {
        this.osrm = new OsrmNode();
    }

    /**
     * Calculates a virtual turnaround point.
     * 우선순위: 하천/공원 방향 > 랜덤 방향
     */
    async calculateTurnaround(startPoint, targetDistanceMeters) {
        const user_lat = startPoint.lat;
        const user_lng = startPoint.lng;
        const target_distance_km = targetDistanceMeters / 1000;
        const radius = target_distance_km / 2;

        // 더 넓은 범위(3km)로 안전 포인트 탐색
        const isNearSafePath = this.isNearSafePoint(user_lat, user_lng, 3.0);
        const isNearRiver = this.isNearHangang(user_lat, user_lng, 2.0);

        console.log(`Near safe path: ${isNearSafePath}, Near Han River: ${isNearRiver}`);

        let waypoint_lat, waypoint_lng;
        let usedSafeLogic = false;

        if (isNearSafePath) {
            try {
                // SAFE PATH MODE: 하천/공원 방향으로 반환점 선택
                // 24방향(15도 간격)으로 후보 탐색 — 더 세밀하게
                let bestCandidate = null;
                let bestScore = Infinity;

                for (let i = 0; i < 24; i++) {
                    const angleRad = (i * 15) * (Math.PI / 180);
                    const offset = radius / 111;

                    const candLat = user_lat + (offset * Math.cos(angleRad));
                    const candLng = user_lng + (offset * Math.sin(angleRad) / Math.cos(user_lat * (Math.PI / 180)));

                    // 후보 지점에서 가장 가까운 안전 포인트까지의 거리
                    const distToSafe = this.getDistanceToNearestSafePoint(candLat, candLng);

                    // 점수: 안전 포인트에 가까울수록 낮은 점수 (좋음)
                    // 한강 근처 보정: 한강 포인트가 더 가까우면 보너스
                    const distToRiver = this.getDistanceToNearestHangangPoint(candLat, candLng);
                    const score = distToSafe * 0.7 + distToRiver * 0.3;

                    if (score < bestScore) {
                        bestScore = score;
                        bestCandidate = { lat: candLat, lng: candLng };
                    }
                }

                if (bestCandidate) {
                    waypoint_lat = bestCandidate.lat;
                    waypoint_lng = bestCandidate.lng;
                    console.log("Selected safe-path optimized turnaround (score:", bestScore.toFixed(2), ")");
                    usedSafeLogic = true;
                }
            } catch (err) {
                console.warn("Safe path logic failed, falling back to standard.", err);
                usedSafeLogic = false;
            }
        }

        if (!usedSafeLogic) {
            // STANDARD MODE: 그래도 약간의 안전 선호를 적용
            // 8방향 중 가장 안전한 방향을 선택
            let bestCandidate = null;
            let bestDist = Infinity;

            for (let i = 0; i < 8; i++) {
                const angleRad = (i * 45 + Math.random() * 30 - 15) * (Math.PI / 180);
                const offset = radius / 111;

                const candLat = user_lat + (offset * Math.cos(angleRad));
                const candLng = user_lng + (offset * Math.sin(angleRad) / Math.cos(user_lat * (Math.PI / 180)));

                const distToSafe = this.getDistanceToNearestSafePoint(candLat, candLng);

                if (distToSafe < bestDist) {
                    bestDist = distToSafe;
                    bestCandidate = { lat: candLat, lng: candLng };
                }
            }

            if (bestCandidate) {
                waypoint_lat = bestCandidate.lat;
                waypoint_lng = bestCandidate.lng;
            } else {
                // 완전한 fallback: 랜덤
                const random_angle_rad = Math.random() * 2 * Math.PI;
                const offset = radius / 111;
                waypoint_lat = user_lat + (offset * Math.cos(random_angle_rad));
                waypoint_lng = user_lng + (offset * Math.sin(random_angle_rad) / Math.cos(user_lat * (Math.PI / 180)));
            }
        }

        try {
            // Snap to nearest road using OSRM
            const nearest = await this.osrm.getNearest(waypoint_lat, waypoint_lng);
            if (nearest && nearest.waypoints && nearest.waypoints.length > 0) {
                const snappedPoint = nearest.waypoints[0].location; // [lng, lat]
                return {
                    lat: snappedPoint[1],
                    lng: snappedPoint[0]
                };
            }
            return { lat: waypoint_lat, lng: waypoint_lng };
        } catch (e) {
            console.warn("Could not snap to road, using raw calculation", e);
            return { lat: waypoint_lat, lng: waypoint_lng };
        }
    }

    /**
     * 🆕 루프(순환) 코스용 경유지 생성
     * 시작점 주변에 원형으로 3~4개의 경유지를 배치하여
     * 자연스러운 순환 코스(예: 여의도 한바퀴, 보라매공원 한바퀴)를 만듦
     * 
     * @param {Object} startPoint - { lat, lng }
     * @param {number} targetDistanceMeters - 전체 목표 거리
     * @param {number} numWaypoints - 경유지 개수 (기본 3, 긴 거리는 4)
     * @returns {Promise<Array>} [{ lat, lng }, ...] 경유지 배열
     */
    async calculateLoopWaypoints(startPoint, targetDistanceMeters, numWaypoints = 3) {
        const user_lat = startPoint.lat;
        const user_lng = startPoint.lng;
        const target_distance_km = targetDistanceMeters / 1000;

        // 루프 반지름 계산
        // 원둘레 = 2πR, 도로 네트워크는 직선보다 ~30% 더 길어짐
        // R = D / (2π × 1.3)
        const radius_km = target_distance_km / (2 * Math.PI * 1.3);
        const offset = radius_km / 111; // degree offset

        const angleStep = 360 / numWaypoints;

        // 6가지 회전 방향 시도 → 안전 포인트에 가장 가까운 방향 선택
        let bestWaypoints = [];
        let bestScore = Infinity;

        for (let rotation = 0; rotation < 6; rotation++) {
            // 랜덤 기반 + 60도 회전으로 다양성 확보
            const baseAngle = (Math.random() * 60) + (rotation * 60);
            const candidates = [];
            let totalScore = 0;

            for (let i = 0; i < numWaypoints; i++) {
                const angleDeg = baseAngle + (i * angleStep);
                const angleRad = angleDeg * (Math.PI / 180);

                // 약간의 랜덤 변이 추가 (±15%)로 매번 다른 코스 생성
                const jitter = 0.85 + Math.random() * 0.3;
                const candLat = user_lat + (offset * jitter * Math.cos(angleRad));
                const candLng = user_lng + (offset * jitter * Math.sin(angleRad) / Math.cos(user_lat * (Math.PI / 180)));

                const distToSafe = this.getDistanceToNearestSafePoint(candLat, candLng);
                const distToRiver = this.getDistanceToNearestHangangPoint(candLat, candLng);
                totalScore += distToSafe * 0.7 + distToRiver * 0.3;

                candidates.push({ lat: candLat, lng: candLng });
            }

            if (totalScore < bestScore) {
                bestScore = totalScore;
                bestWaypoints = candidates;
            }
        }

        // 각 경유지를 도로에 스냅
        const snappedWaypoints = [];
        for (const wp of bestWaypoints) {
            try {
                const nearest = await this.osrm.getNearest(wp.lat, wp.lng);
                if (nearest?.waypoints?.length > 0) {
                    snappedWaypoints.push({
                        lat: nearest.waypoints[0].location[1],
                        lng: nearest.waypoints[0].location[0]
                    });
                } else {
                    snappedWaypoints.push(wp);
                }
            } catch (e) {
                console.warn("Waypoint snap failed, using raw:", e.message);
                snappedWaypoints.push(wp);
            }
        }

        console.log(`🔵 Generated ${snappedWaypoints.length} loop waypoints (R=${radius_km.toFixed(2)}km)`);
        return snappedWaypoints;
    }

    // Helper: Haversine distance in KM
    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = this.deg2rad(lat2 - lat1);
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    // Check if user is near Han River
    isNearHangang(lat, lng, thresholdKm) {
        const nearest = this.getDistanceToNearestHangangPoint(lat, lng);
        return nearest <= thresholdKm;
    }

    // 🆕 Check if user is near ANY safe running point
    isNearSafePoint(lat, lng, thresholdKm) {
        const nearest = this.getDistanceToNearestSafePoint(lat, lng);
        return nearest <= thresholdKm;
    }

    getDistanceToNearestHangangPoint(lat, lng) {
        let min = Infinity;
        for (const p of HANGANG_POINTS) {
            const d = this.getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
            if (d < min) min = d;
        }
        return min;
    }

    // 🆕 모든 안전 포인트(한강 + 하천 + 공원) 중 가장 가까운 거리
    getDistanceToNearestSafePoint(lat, lng) {
        let min = Infinity;
        for (const p of ALL_SAFE_POINTS) {
            const d = this.getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
            if (d < min) min = d;
        }
        return min;
    }
}
