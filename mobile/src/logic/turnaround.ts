/**
 * Turnaround point calculator — safe running routes preference
 */

import { OsrmNode } from './osrm';
import { HANGANG_POINTS, ALL_SAFE_POINTS } from './hangang_points';
import type { LatLng } from '../types/course';

export class TurnaroundCalculator {
  private osrm: OsrmNode;

  constructor() {
    this.osrm = new OsrmNode();
  }

  async calculateTurnaround(startPoint: LatLng, targetDistanceMeters: number): Promise<LatLng> {
    const user_lat = startPoint.lat;
    const user_lng = startPoint.lng;
    const target_distance_km = targetDistanceMeters / 1000;
    const radius = target_distance_km / 2;

    const isNearSafePath = this.isNearSafePoint(user_lat, user_lng, 3.0);
    let waypoint_lat = user_lat;
    let waypoint_lng = user_lng;
    let usedSafeLogic = false;

    if (isNearSafePath) {
      try {
        let bestCandidate: LatLng | null = null;
        let bestScore = Infinity;
        for (let i = 0; i < 24; i++) {
          const angleRad = (i * 15) * (Math.PI / 180);
          const offset = radius / 111;
          const candLat = user_lat + offset * Math.cos(angleRad);
          const candLng = user_lng + (offset * Math.sin(angleRad)) / Math.cos((user_lat * Math.PI) / 180);
          const distToSafe = this.getDistanceToNearestSafePoint(candLat, candLng);
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
          usedSafeLogic = true;
        }
      } catch {
        usedSafeLogic = false;
      }
    }

    if (!usedSafeLogic) {
      let bestCandidate: LatLng | null = null;
      let bestDist = Infinity;
      for (let i = 0; i < 8; i++) {
        const angleRad = ((i * 45 + Math.random() * 30 - 15) * Math.PI) / 180;
        const offset = radius / 111;
        const candLat = user_lat + offset * Math.cos(angleRad);
        const candLng = user_lng + (offset * Math.sin(angleRad)) / Math.cos((user_lat * Math.PI) / 180);
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
        const random_angle_rad = Math.random() * 2 * Math.PI;
        const offset = radius / 111;
        waypoint_lat = user_lat + offset * Math.cos(random_angle_rad);
        waypoint_lng = user_lng + (offset * Math.sin(random_angle_rad)) / Math.cos((user_lat * Math.PI) / 180);
      }
    }

    try {
      const nearest = await this.osrm.getNearest(waypoint_lat, waypoint_lng);
      if (nearest?.waypoints?.length) {
        const loc = nearest.waypoints[0].location;
        return { lat: loc[1], lng: loc[0] };
      }
    } catch {
      // fallback
    }
    return { lat: waypoint_lat, lng: waypoint_lng };
  }

  async calculateLoopWaypoints(
    startPoint: LatLng,
    targetDistanceMeters: number,
    numWaypoints: number = 3
  ): Promise<LatLng[]> {
    const user_lat = startPoint.lat;
    const user_lng = startPoint.lng;
    const target_distance_km = targetDistanceMeters / 1000;
    const radius_km = target_distance_km / (2 * Math.PI * 1.3);
    const offset = radius_km / 111;
    const angleStep = 360 / numWaypoints;

    let bestWaypoints: LatLng[] = [];
    let bestScore = Infinity;

    for (let rotation = 0; rotation < 6; rotation++) {
      const baseAngle = Math.random() * 60 + rotation * 60;
      const candidates: LatLng[] = [];
      let totalScore = 0;
      for (let i = 0; i < numWaypoints; i++) {
        const angleDeg = baseAngle + i * angleStep;
        const angleRad = (angleDeg * Math.PI) / 180;
        const jitter = 0.85 + Math.random() * 0.3;
        const candLat = user_lat + offset * jitter * Math.cos(angleRad);
        const candLng = user_lng + (offset * jitter * Math.sin(angleRad)) / Math.cos((user_lat * Math.PI) / 180);
        totalScore += this.getDistanceToNearestSafePoint(candLat, candLng) * 0.7 + this.getDistanceToNearestHangangPoint(candLat, candLng) * 0.3;
        candidates.push({ lat: candLat, lng: candLng });
      }
      if (totalScore < bestScore) {
        bestScore = totalScore;
        bestWaypoints = candidates;
      }
    }

    const snapped: LatLng[] = [];
    for (const wp of bestWaypoints) {
      try {
        const nearest = await this.osrm.getNearest(wp.lat, wp.lng);
        if (nearest?.waypoints?.length) {
          const loc = nearest.waypoints[0].location;
          snapped.push({ lat: loc[1], lng: loc[0] });
        } else snapped.push(wp);
      } catch {
        snapped.push(wp);
      }
    }
    return snapped;
  }

  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  getDistanceToNearestHangangPoint(lat: number, lng: number): number {
    let min = Infinity;
    for (const p of HANGANG_POINTS) {
      const d = this.getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
      if (d < min) min = d;
    }
    return min;
  }

  getDistanceToNearestSafePoint(lat: number, lng: number): number {
    let min = Infinity;
    for (const p of ALL_SAFE_POINTS) {
      const d = this.getDistanceFromLatLonInKm(lat, lng, p.lat, p.lng);
      if (d < min) min = d;
    }
    return min;
  }

  isNearHangang(lat: number, lng: number, thresholdKm: number): boolean {
    return this.getDistanceToNearestHangangPoint(lat, lng) <= thresholdKm;
  }

  isNearSafePoint(lat: number, lng: number, thresholdKm: number): boolean {
    return this.getDistanceToNearestSafePoint(lat, lng) <= thresholdKm;
  }
}
