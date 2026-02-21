/**
 * Google Apps Script / Sheets API types
 */

import type { RunMode } from './course';

export interface SharedCourseListItem {
  id: string;
  courseName?: string;
  title?: string;
  subtitle?: string;
  tags?: string | string[];
  authorName?: string;
  likes?: number;
  createdAt?: string;
  distanceKm?: number;
  runMode?: RunMode;
  routePathLength?: number;
}

export interface CourseDetail extends SharedCourseListItem {
  routePath: [number, number][] | string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
}

export interface SaveCoursePayload {
  courseName: string;
  runMode: RunMode;
  distanceKm: number | string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  routePath: [number, number][];
  title?: string;
  subtitle?: string;
  tags?: string[];
  authorName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SaveCourseResponse {
  id: string;
  createdAt: string;
}

export interface LikeCourseResponse {
  id: string;
  likes: number;
}
