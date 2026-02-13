
/**
 * Course Manager
 * Orchestrates the sequence of generating a random running course.
 * Sequence: GPS -> Turnaround Logic -> OSRM API
 */

import { GpsNode } from './gps';
import { TurnaroundCalculator } from './turnaround';
import { OsrmNode } from './osrm';

export class CourseManager {
    constructor() {
        this.gps = new GpsNode();
        this.turnaroundCalculator = new TurnaroundCalculator();
        this.osrm = new OsrmNode();
    }

    /**
     * Generates a full course: start -> random waypoint -> start
     * @param {number} targetDistanceMeters - Desired total distance
     * @returns {Promise<Object>} { startPoint, turnaroundPoint, routePath }
     */
    async generateCourse(targetDistanceMeters) {
        try {
            // 1. Get current position (Start Point)
            console.log("Acquiring GPS position...");
            const startPoint = await this.gps.getCurrentPosition();

            // 2. Calculate virtual turnaround point
            console.log("Calculating turnaround point...");
            const turnaroundPoint = await this.turnaroundCalculator.calculateTurnaround(startPoint, targetDistanceMeters);

            // 3. Get round trip route path
            console.log("Fetching route from OSRM...");
            const routePath = await this.osrm.getRoundTrip(startPoint, turnaroundPoint);

            return {
                startPoint,
                turnaroundPoint,
                routePath
            };
        } catch (error) {
            console.error("Course Generation Failed:", error);
            throw error;
        }
    }
}
