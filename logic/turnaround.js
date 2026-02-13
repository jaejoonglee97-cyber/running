
/**
 * Turnaround Point Calculator
 * Logic to calculate a virtual turnaround point based on target distance.
 */

import { OsrmNode } from './osrm';

export class TurnaroundCalculator {
    constructor() {
        this.osrm = new OsrmNode();
    }

    /**
     * Calculates a virtual turnaround point approx. half the target distance away.
     * simplified logic:
     * 1. Get current location.
     * 2. Pick a random direction (or user defined).
     * 3. Estimate coordinate at distance/2.
     * 4. Snap to nearest road using OSRM.
     * 5. Verify route distance.
     * 
     * @param {Object} startPoint - { lat, lng }
     * @param {number} targetDistanceMeters - Total target distance (round trip)
     */
    async calculateTurnaround(startPoint, targetDistanceMeters) {
        // Implementation of the simplified limit:
        // Input: user_lat, user_lng, target_distance
        // Formula:
        // random_angle = random(0, 360)
        // offset = target_distance / 2 / 111 (1 degree lat approx 111km)
        // waypoint_lat = user_lat + (offset * cos(random_angle))
        // waypoint_lng = user_lng + (offset * sin(random_angle) / cos(user_lat))

        const user_lat = startPoint.lat;
        const user_lng = startPoint.lng;

        // Convert distance to km for the formula
        const target_distance_km = targetDistanceMeters / 1000;

        const random_angle_deg = Math.random() * 360;
        const random_angle_rad = random_angle_deg * (Math.PI / 180);

        const offset = target_distance_km / 2 / 111;

        const waypoint_lat = user_lat + (offset * Math.cos(random_angle_rad));

        // user_lat needs to be in radians for Math.cos in the longitude calculation
        const user_lat_rad = user_lat * (Math.PI / 180);
        const waypoint_lng = user_lng + (offset * Math.sin(random_angle_rad) / Math.cos(user_lat_rad));

        try {
            // Snap to nearest road using OSRM
            const nearest = await this.osrm.getNearest(waypoint_lat, waypoint_lng);
            if (nearest && nearest.waypoints && nearest.waypoints.length > 0) {
                const snappedPoint = nearest.waypoints[0].location; // [lng, lat]
                return {
                    lat: snappedPoint[1],
                    lng: snappedPoint[0],
                    originalGuess: { lat: waypoint_lat, lng: waypoint_lng }
                };
            }
            return { lat: waypoint_lat, lng: waypoint_lng };
        } catch (e) {
            console.warn("Could not snap to road, using raw calculation", e);
            return { lat: waypoint_lat, lng: waypoint_lng };
        }
    }
}
