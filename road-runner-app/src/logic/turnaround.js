
/**
 * Turnaround Point Calculator
 * Logic to calculate a virtual turnaround point based on target distance.
 */

import { OsrmNode } from './osrm';
import { HANGANG_POINTS } from './hangang_points';

export class TurnaroundCalculator {
    constructor() {
        this.osrm = new OsrmNode();
    }

    /**
     * Calculates a virtual turnaround point.
     * Prioritizes Han River if the user is close to it.
     */
    async calculateTurnaround(startPoint, targetDistanceMeters) {
        const user_lat = startPoint.lat;
        const user_lng = startPoint.lng;
        const target_distance_km = targetDistanceMeters / 1000;
        const radius = target_distance_km / 2;

        const isNearRiver = this.isNearHangang(user_lat, user_lng, 2.0); // Within 2km

        console.log(`User is near Han River: ${isNearRiver}`);

        let waypoint_lat, waypoint_lng;

        // Check if we should use Han River Logic (Best Effort)
        let usedHanRiverLogic = false;

        if (isNearRiver) {
            try {
                // HAN RIVER MODE: Pull turnaround point towards Han River
                // Strategy: Sample multiple points at 'radius' distance and pick the one closest to a Han River point.

                let bestCandidate = null;
                let minDistanceToRiver = Infinity;

                // Try 12 directions (every 30 degrees)
                for (let i = 0; i < 12; i++) {
                    const angleRad = (i * 30) * (Math.PI / 180);
                    const offset = radius / 111; // degrees approx

                    const candLat = user_lat + (offset * Math.cos(angleRad));
                    const candLng = user_lng + (offset * Math.sin(angleRad) / Math.cos(user_lat * (Math.PI / 180)));

                    // Check how close this candidate is to any Han River point
                    const distToRiver = this.getDistanceToNearestHangangPoint(candLat, candLng);

                    if (distToRiver < minDistanceToRiver) {
                        minDistanceToRiver = distToRiver;
                        bestCandidate = { lat: candLat, lng: candLng };
                    }
                }

                if (bestCandidate) {
                    waypoint_lat = bestCandidate.lat;
                    waypoint_lng = bestCandidate.lng;
                    console.log("Selected Han River optimized turnaround");
                    usedHanRiverLogic = true;
                }
            } catch (err) {
                console.warn("Han River logic failed, falling back to standard.", err);
                usedHanRiverLogic = false;
            }
        }

        if (!usedHanRiverLogic) {
            // STANDARD MODE: Random direction
            const random_angle_rad = Math.random() * 2 * Math.PI;
            const offset = radius / 111;

            waypoint_lat = user_lat + (offset * Math.cos(random_angle_rad));
            waypoint_lng = user_lng + (offset * Math.sin(random_angle_rad) / Math.cos(user_lat * (Math.PI / 180)));
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

    // Helper: Haversine distance in KM
    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2 - lat1);
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
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

    getDistanceToNearestHangangPoint(lat, lng) {
        let min = Infinity;
        for (const p of HANGANG_POINTS) {
            const d = this.getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
            if (d < min) min = d;
        }
        return min;
    }
}
