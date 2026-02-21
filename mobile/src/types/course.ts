/**
 * Course & route types for Road Runner
 */

export type RunMode = 'roundTrip' | 'oneWay';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CourseData {
  startPoint: LatLng | null;
  turnaroundPoint: LatLng | null;
  routePath: LatLng[];
}

export interface CourseDescription {
  title: string;
  subtitle: string;
  tags: string[];
}

export interface CourseGenerationResult {
  startPoint: LatLng;
  turnaroundPoint: LatLng;
  routePath: LatLng[];
  endPoint?: LatLng;
  actualDistanceMeters?: number;
}

export interface PresetWaypoint {
  name: string;
  lat: number;
  lng: number;
}

export interface PresetCourse {
  id: string;
  area: string;
  courseName: string;
  distanceKm: string;
  subtitle: string;
  tags: string[];
  runMode: RunMode;
  startPoint: LatLng;
  waypoints: PresetWaypoint[];
}
