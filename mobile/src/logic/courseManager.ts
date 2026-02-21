/**
 * Course manager — orchestrates OSRM, turnaround, GPS (expo-location)
 */

import { GpsNode } from './gps';
import { TurnaroundCalculator } from './turnaround';
import { OsrmNode } from './osrm';
import type { LatLng } from '../types/course';
import type { CourseGenerationResult } from '../types/course';
import type { PresetCourse } from '../types/course';

const DISTANCE_TOLERANCE = 0.15;
const MAX_CORRECTION_ATTEMPTS = 3;

export class CourseManager {
  gps: GpsNode;
  private turnaroundCalculator: TurnaroundCalculator;
  private osrm: OsrmNode;

  constructor() {
    this.gps = new GpsNode();
    this.turnaroundCalculator = new TurnaroundCalculator();
    this.osrm = new OsrmNode();
  }

  private async fetchMultiPointRoute(
    points: LatLng[],
    overview: 'full' | 'false' = 'full'
  ): Promise<{ routes?: { distance: number; geometry: { coordinates: [number, number][] } }[] }> {
    const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
    const url = `${this.osrm.baseUrl}/route/v1/foot/${coords}?overview=${overview}&geometries=geojson&steps=false`;
    return (await this.osrm.fetchWithRetry(url, 20000, 2)) as {
      routes?: { distance: number; geometry: { coordinates: [number, number][] } }[];
    };
  }

  async generateCourseFromPoint(
    startPoint: LatLng,
    targetDistanceMeters: number,
    waypoints: LatLng[] = []
  ): Promise<CourseGenerationResult> {
    if (waypoints.length > 0) {
      return this.generateRoundTripWithWaypoints(startPoint, targetDistanceMeters, waypoints);
    }
    return this.generateRoundTripSimple(startPoint, targetDistanceMeters);
  }

  async generateOneWayCourse(
    startPoint: LatLng,
    targetDistanceMeters: number,
    waypoints: LatLng[] = []
  ): Promise<CourseGenerationResult> {
    if (waypoints.length > 0) {
      return this.generateOneWayWithWaypoints(startPoint, targetDistanceMeters, waypoints);
    }
    return this.generateOneWaySimple(startPoint, targetDistanceMeters);
  }

  private async generateRoundTripWithWaypoints(
    startPoint: LatLng,
    targetDistanceMeters: number,
    waypoints: LatLng[]
  ): Promise<CourseGenerationResult> {
    const lastWaypoint = waypoints[waypoints.length - 1];
    const loopPoints = [startPoint, ...waypoints, startPoint];
    let waypointLoopDistance = 0;
    try {
      const loopData = await this.fetchMultiPointRoute(loopPoints, 'false');
      if (loopData.routes?.length) waypointLoopDistance = loopData.routes[0].distance;
    } catch {
      // ignore
    }
    const remainingDistance = targetDistanceMeters - waypointLoopDistance;
    if (remainingDistance <= 500 && waypoints.length) {
      try {
        const fullData = await this.fetchMultiPointRoute(loopPoints);
        if (fullData.routes?.length) {
          const route = fullData.routes[0];
          return {
            startPoint,
            turnaroundPoint: lastWaypoint,
            routePath: route.geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] })),
          };
        }
      } catch {
        // fallback
      }
    }

    let currentExtraDistance = remainingDistance;
    let bestResult: CourseGenerationResult | null = null;
    let bestError = Infinity;

    for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
      try {
        const turnaroundPoint = await this.turnaroundCalculator.calculateTurnaround(lastWaypoint, currentExtraDistance);
        const fullPoints = [startPoint, ...waypoints, turnaroundPoint, startPoint];
        const routeData = await this.fetchMultiPointRoute(fullPoints);
        if (routeData.routes?.length) {
          const route = routeData.routes[0];
          const actualDistance = route.distance;
          const routePath = route.geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] }));
          const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
          if (errorRatio < bestError) {
            bestError = errorRatio;
            bestResult = { startPoint, turnaroundPoint, routePath };
          }
          if (errorRatio <= DISTANCE_TOLERANCE) return bestResult!;
          const correctionFactor = targetDistanceMeters / actualDistance;
          currentExtraDistance = Math.max(currentExtraDistance * correctionFactor, 500);
        }
      } catch {
        if (bestResult) break;
        if (attempt === MAX_CORRECTION_ATTEMPTS) throw new Error('Failed to generate waypoint course');
      }
    }
    if (bestResult) return bestResult;
    throw new Error('Failed to generate waypoint course');
  }

  private async generateOneWayWithWaypoints(
    startPoint: LatLng,
    targetDistanceMeters: number,
    waypoints: LatLng[]
  ): Promise<CourseGenerationResult> {
    const lastWaypoint = waypoints[waypoints.length - 1];
    const pathPoints = [startPoint, ...waypoints];
    let waypointPathDistance = 0;
    try {
      const pathData = await this.fetchMultiPointRoute(pathPoints, 'false');
      if (pathData.routes?.length) waypointPathDistance = pathData.routes[0].distance;
    } catch {
      // ignore
    }
    const remainingDistance = targetDistanceMeters - waypointPathDistance;
    if (remainingDistance <= 300) {
      try {
        const fullData = await this.fetchMultiPointRoute(pathPoints);
        if (fullData.routes?.length) {
          const route = fullData.routes[0];
          return {
            startPoint,
            turnaroundPoint: lastWaypoint,
            routePath: route.geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] })),
          };
        }
      } catch {
        // fallback
      }
    }

    let currentExtraDistance = remainingDistance;
    let bestResult: CourseGenerationResult | null = null;
    let bestError = Infinity;

    for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
      try {
        const endPoint = await this.turnaroundCalculator.calculateTurnaround(lastWaypoint, currentExtraDistance * 2);
        const fullPoints = [startPoint, ...waypoints, endPoint];
        const routeData = await this.fetchMultiPointRoute(fullPoints);
        if (routeData.routes?.length) {
          const route = routeData.routes[0];
          const actualDistance = route.distance;
          const routePath = route.geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] }));
          const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
          if (errorRatio < bestError) {
            bestError = errorRatio;
            bestResult = { startPoint, turnaroundPoint: endPoint, routePath };
          }
          if (errorRatio <= DISTANCE_TOLERANCE) return bestResult!;
          const correctionFactor = targetDistanceMeters / actualDistance;
          currentExtraDistance = Math.max(currentExtraDistance * correctionFactor, 300);
        }
      } catch {
        if (bestResult) break;
        if (attempt === MAX_CORRECTION_ATTEMPTS) throw new Error('Failed to generate one-way waypoint course');
      }
    }
    if (bestResult) return bestResult;
    throw new Error('Failed to generate one-way waypoint course');
  }

  private async generateRoundTripSimple(startPoint: LatLng, targetDistanceMeters: number): Promise<CourseGenerationResult> {
    const distKm = targetDistanceMeters / 1000;
    const numWaypoints = distKm >= 8 ? 4 : 3;
    let currentTargetDistance = targetDistanceMeters;
    let bestResult: CourseGenerationResult | null = null;
    let bestError = Infinity;

    for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
      try {
        const loopWaypoints = await this.turnaroundCalculator.calculateLoopWaypoints(
          startPoint,
          currentTargetDistance,
          numWaypoints
        );
        const fullPoints = [startPoint, ...loopWaypoints, startPoint];
        const routeData = await this.fetchMultiPointRoute(fullPoints);
        if (routeData.routes?.length) {
          const route = routeData.routes[0];
          const actualDistance = route.distance;
          const routePath = route.geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] }));
          let farthestWp = loopWaypoints[0];
          let farthestDist = 0;
          for (const wp of loopWaypoints) {
            const d = Math.sqrt((wp.lat - startPoint.lat) ** 2 + (wp.lng - startPoint.lng) ** 2);
            if (d > farthestDist) {
              farthestDist = d;
              farthestWp = wp;
            }
          }
          const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
          if (errorRatio < bestError) {
            bestError = errorRatio;
            bestResult = { startPoint, turnaroundPoint: farthestWp, routePath };
          }
          if (errorRatio <= DISTANCE_TOLERANCE) return bestResult!;
          const correctionFactor = targetDistanceMeters / actualDistance;
          currentTargetDistance = Math.max(
            Math.min(currentTargetDistance * correctionFactor, targetDistanceMeters * 2),
            targetDistanceMeters * 0.3
          );
        }
      } catch {
        if (bestResult) break;
        if (attempt === MAX_CORRECTION_ATTEMPTS) throw new Error('Failed to generate loop course');
      }
    }
    if (bestResult) return bestResult;
    throw new Error('Failed to generate loop course');
  }

  private async generateOneWaySimple(startPoint: LatLng, targetDistanceMeters: number): Promise<CourseGenerationResult> {
    let currentTargetDistance = targetDistanceMeters;
    let bestResult: CourseGenerationResult | null = null;
    let bestError = Infinity;

    for (let attempt = 0; attempt <= MAX_CORRECTION_ATTEMPTS; attempt++) {
      try {
        const endPoint = await this.turnaroundCalculator.calculateTurnaround(startPoint, currentTargetDistance * 2);
        const routeResult = await this.osrm.getOneWayRoute(startPoint, endPoint);
        const actualDistance = routeResult.distanceMeters;
        const routePath = routeResult.path.map(([lat, lng]) => ({ lat, lng }));
        const errorRatio = Math.abs(actualDistance - targetDistanceMeters) / targetDistanceMeters;
        if (errorRatio < bestError) {
          bestError = errorRatio;
          bestResult = { startPoint, turnaroundPoint: endPoint, routePath };
        }
        if (errorRatio <= DISTANCE_TOLERANCE) return bestResult!;
        const correctionFactor = targetDistanceMeters / actualDistance;
        currentTargetDistance = Math.max(
          Math.min(currentTargetDistance * correctionFactor, targetDistanceMeters * 2),
          targetDistanceMeters * 0.3
        );
      } catch {
        if (bestResult) break;
        if (attempt === MAX_CORRECTION_ATTEMPTS) throw new Error('Failed to generate one-way course');
      }
    }
    if (bestResult) return bestResult;
    throw new Error('Failed to generate one-way course');
  }

  async generatePresetCourse(presetCourse: PresetCourse): Promise<CourseGenerationResult & { actualDistanceMeters?: number }> {
    const { startPoint, waypoints } = presetCourse;
    const waypointCoords = waypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }));
    const fullPoints = [startPoint, ...waypointCoords, startPoint];
    const routeData = await this.fetchMultiPointRoute(fullPoints);
    if (!routeData.routes?.length) throw new Error('OSRM returned no routes for preset course');
    const route = routeData.routes[0];
    const routePath = route.geometry.coordinates.map((c) => ({ lat: c[1], lng: c[0] }));
    let farthestWp = waypointCoords[0];
    let farthestDist = 0;
    for (const wp of waypointCoords) {
      const d = (wp.lat - startPoint.lat) ** 2 + (wp.lng - startPoint.lng) ** 2;
      if (d > farthestDist) {
        farthestDist = d;
        farthestWp = wp;
      }
    }
    return {
      startPoint,
      turnaroundPoint: farthestWp,
      routePath,
      actualDistanceMeters: route.distance,
    };
  }
}
