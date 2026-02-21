/**
 * Course description generator — Korean titles and tags
 */

import { HANGANG_POINTS } from './hangang_points';
import type { CourseDescription } from '../types/course';
import type { LatLng } from '../types/course';

const LANDMARK_NAMES_KR: Record<string, string> = {
  'Gwangnaru Park': '광나루 한강공원',
  'Jamsil Park': '잠실 한강공원',
  'Ttukseom Park (South View)': '뚝섬 한강공원(남)',
  'Jamwon Park': '잠원 한강공원',
  'Banpo Park': '반포 한강공원',
  'Yeouido Park (River)': '여의도 한강공원',
  'Yanghwa Park': '양화 한강공원',
  'Gangseo Park': '강서 한강공원',
  'Guri Park': '구리 한강공원',
  'Ttukseom Park': '뚝섬 한강공원',
  'Ichon Park': '이촌 한강공원',
  'Mangwon Park': '망원 한강공원',
  'Nanji Park': '난지 한강공원',
  'Jamsil Bridge': '잠실대교',
  'Cheongdam Bridge': '청담대교',
  'Yeongdong Bridge': '영동대교',
  'Seongsu Bridge': '성수대교',
  'Dongho Bridge': '동호대교',
  'Hannam Bridge': '한남대교',
  'Banpo Bridge': '반포대교',
  'Dongjak Bridge': '동작대교',
  'Hangang Bridge': '한강대교',
  'Wonhyo Bridge': '원효대교',
  'Mapo Bridge': '마포대교',
  'Seogang Bridge': '서강대교',
  'Yanghwa Bridge': '양화대교',
  'Seongsan Bridge': '성산대교',
  'Gayang Bridge': '가양대교',
};

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestLandmark(
  lat: number,
  lng: number,
  maxDistanceKm: number = 1.5
): { name: string; nameKr: string; distance: number } | null {
  let nearest: (typeof HANGANG_POINTS)[0] | null = null;
  let minDist = Infinity;
  for (const p of HANGANG_POINTS) {
    const d = getDistanceKm(lat, lng, p.lat, p.lng);
    if (d < minDist) {
      minDist = d;
      nearest = p;
    }
  }
  if (nearest && minDist <= maxDistanceKm) {
    return { name: nearest.name, nameKr: LANDMARK_NAMES_KR[nearest.name] ?? nearest.name, distance: minDist };
  }
  return null;
}

function isRouteAlongRiver(routePath: LatLng[] | [number, number][]): boolean {
  if (!routePath || routePath.length < 5) return false;
  const step = Math.floor(routePath.length / Math.min(10, routePath.length));
  let nearRiverCount = 0;
  for (let i = 0; i < routePath.length; i += step) {
    const pt = routePath[i];
    const lat = Array.isArray(pt) ? pt[0] : pt.lat;
    const lng = Array.isArray(pt) ? pt[1] : pt.lng;
    const nearest = findNearestLandmark(lat, lng, 1.0);
    if (nearest) nearRiverCount++;
  }
  return nearRiverCount >= (routePath.length / step) * 0.4;
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=ko&addressdetails=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'RoadRunnerApp/1.0' } });
    const data = (await res.json()) as { address?: Record<string, string> };
    if (data?.address) {
      const addr = data.address;
      return addr.leisure ?? addr.amenity ?? addr.tourism ?? addr.building ?? addr.road ?? addr.neighbourhood ?? addr.suburb ?? addr.city_district ?? '';
    }
  } catch {
    // ignore
  }
  return null;
}

export interface GenerateCourseDescriptionParams {
  startPoint: LatLng;
  endPoint: LatLng;
  routePath: LatLng[] | [number, number][];
  runMode: 'roundTrip' | 'oneWay';
  distanceMeters: number;
}

export async function generateCourseDescription(params: GenerateCourseDescriptionParams): Promise<CourseDescription> {
  const { startPoint, endPoint, routePath, runMode, distanceMeters } = params;
  const distanceKm = (distanceMeters / 1000).toFixed(1);
  const isRoundTrip = runMode === 'roundTrip';
  const isAlongRiver = isRouteAlongRiver(routePath);

  const startLandmark = findNearestLandmark(startPoint.lat, startPoint.lng, 2.0);
  const endLandmark = findNearestLandmark(endPoint.lat, endPoint.lng, 2.0);
  let startName = startLandmark?.nameKr ?? null;
  let endName = endLandmark?.nameKr ?? null;

  const [startGeo, endGeo] = await Promise.all([
    !startName ? reverseGeocode(startPoint.lat, startPoint.lng) : Promise.resolve(null),
    !endName ? reverseGeocode(endPoint.lat, endPoint.lng) : Promise.resolve(null),
  ]);
  if (!startName && startGeo) startName = startGeo;
  if (!endName && endGeo) endName = endGeo;
  if (!startName) startName = '출발지';
  if (!endName) endName = '목적지';

  let title = '';
  let subtitle = '';
  const tags: string[] = [];

  if (isRoundTrip) {
    title = startName === endName || !endName || endName === '목적지' ? `${startName} 주변 ${distanceKm}km 왕복 코스` : `${endName}까지 찍고 돌아오는 코스`;
  } else {
    title = endName && endName !== '목적지' ? `${endName}까지 ${distanceKm}km 편도 코스` : `${distanceKm}km 편도 코스`;
  }

  if (isAlongRiver) {
    subtitle = '한강변을 따라 달리는 코스 🌊';
    tags.push('한강변');
  } else {
    subtitle = isRoundTrip
      ? `${startName}에서 출발하여 ${endName} 방면으로 갔다 돌아옵니다`
      : `${startName}에서 ${endName}까지 한 방향으로 달립니다`;
  }
  tags.push(isRoundTrip ? '왕복' : '편도');
  tags.push(`${distanceKm}km`);
  if (endLandmark) {
    if (endLandmark.name.includes('Bridge')) tags.push('다리');
    if (endLandmark.name.includes('Park')) tags.push('공원');
  }
  return { title, subtitle, tags };
}
