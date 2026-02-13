
/**
 * Course Manager
 * Orchestrates the sequence of generating a random running course.
 * Supports both round-trip and one-way modes.
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
     */
    async generateCourseFromPoint(startPoint, targetDistanceMeters) {
        try {
            console.log("Calculating turnaround point...");
            const turnaroundPoint = await this.turnaroundCalculator.calculateTurnaround(startPoint, targetDistanceMeters);

            console.log("Fetching round-trip route from OSRM...");
            const routePath = await this.osrm.getRoundTrip(startPoint, turnaroundPoint);

            return {
                startPoint,
                turnaroundPoint,
                routePath
            };
        } catch (error) {
            console.error("Course Generation From Point Failed:", error);
            throw error;
        }
    }

    /**
     * Generates a one-way course from a given start point
     * Uses the full target distance as the one-way distance (no halving)
     */
    async generateOneWayCourse(startPoint, targetDistanceMeters) {
        try {
            console.log("Calculating one-way endpoint...");
            // For one-way, the target distance IS the full distance, so we pass it as-is
            // The turnaround calculator uses half distance for radius, but for one-way
            // we want the full distance, so we multiply by 2 to compensate
            const endPoint = await this.turnaroundCalculator.calculateTurnaround(startPoint, targetDistanceMeters * 2);

            console.log("Fetching one-way route from OSRM...");
            const routePath = await this.osrm.getOneWayRoute(startPoint, endPoint);

            return {
                startPoint,
                endPoint,
                routePath
            };
        } catch (error) {
            console.error("One-Way Course Generation Failed:", error);
            throw error;
        }
    }
}
