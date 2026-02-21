/**
 * Sheets API — Google Apps Script Web App client
 */

import Constants from 'expo-constants';
import type {
  SharedCourseListItem,
  CourseDetail,
  SaveCoursePayload,
  ApiResponse,
  SaveCourseResponse,
  LikeCourseResponse,
} from '../types/sheets';

function getAppsScriptUrl(): string {
  const url = Constants.expoConfig?.extra?.APPS_SCRIPT_URL as string | undefined;
  if (!url) throw new Error('APPS_SCRIPT_URL is not configured');
  return url;
}

export async function fetchSharedCourses(): Promise<SharedCourseListItem[]> {
  try {
    const url = getAppsScriptUrl();
    const res = await fetch(`${url}?action=list`);
    const json: ApiResponse<SharedCourseListItem[]> = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data ?? [];
  } catch (err) {
    console.error('코스 목록 불러오기 실패:', err);
    return [];
  }
}

export async function fetchCourseDetail(id: string): Promise<CourseDetail | null> {
  try {
    const url = getAppsScriptUrl();
    const res = await fetch(`${url}?action=get&id=${id}`);
    const json: ApiResponse<CourseDetail> = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data ?? null;
  } catch (err) {
    console.error('코스 상세 조회 실패:', err);
    return null;
  }
}

export async function saveCourse(courseData: SaveCoursePayload): Promise<SaveCourseResponse> {
  const url = getAppsScriptUrl();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'save', data: courseData }),
  });
  const json: ApiResponse<SaveCourseResponse> = await res.json();
  if (!json.success) throw new Error(json.error ?? '저장 실패');
  return json.data!;
}

export async function likeCourse(id: string): Promise<LikeCourseResponse> {
  const url = getAppsScriptUrl();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'like', id }),
  });
  const json: ApiResponse<LikeCourseResponse> = await res.json();
  if (!json.success) throw new Error(json.error ?? '좋아요 실패');
  return json.data!;
}
