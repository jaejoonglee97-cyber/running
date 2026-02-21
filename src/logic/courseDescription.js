
/**
 * Course Description Generator
 * Generates a natural Korean description for a running course.
 */

import { HANGANG_POINTS } from './hangang_points';

// Korean name mapping for known Han River landmarks
const LANDMARK_NAMES_KR = {
    "Gwangnaru Park": "광나루 한강공원",
    "Jamsil Park": "잠실 한강공원",
    "Ttukseom Park (South View)": "뚝섬 한강공원(남)",
    "Jamwon Park": "잠원 한강공원",
    "Banpo Park": "반포 한강공원",
    "Yeouido Park (River)": "여의도 한강공원",
    "Yanghwa Park": "양화 한강공원",
    "Gangseo Park": "강서 한강공원",
    "Guri Park": "구리 한강공원",
    "Ttukseom Park": "뚝섬 한강공원",
    "Ichon Park": "이촌 한강공원",
    "Mangwon Park": "망원 한강공원",
    "Nanji Park": "난지 한강공원",
    "Jamsil Bridge": "잠실대교",
    "Cheongdam Bridge": "청담대교",
    "Yeongdong Bridge": "영동대교",
    "Seongsu Bridge": "성수대교",
    "Dongho Bridge": "동호대교",
    "Hannam Bridge": "한남대교",
    "Banpo Bridge": "반포대교",
    "Dongjak Bridge": "동작대교",
    "Hangang Bridge": "한강대교",
    "Wonhyo Bridge": "원효대교",
    "Mapo Bridge": "마포대교",
    "Seogang Bridge": "서강대교",
    "Yanghwa Bridge": "양화대교",
    "Seongsan Bridge": "성산대교",
    "Gayang Bridge": "가양대교"
};

/**
 * Haversine distance in km
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find the nearest Han River landmark to a point
 * @returns {{ name: string, nameKr: string, distance: number } | null}
 */
function findNearestLandmark(lat, lng, maxDistanceKm = 1.5) {
    let nearest = null;
    let minDist = Infinity;

    for (const p of HANGANG_POINTS) {
        const d = getDistanceKm(lat, lng, p.lat, p.lng);
        if (d < minDist) {
            minDist = d;
            nearest = p;
        }
    }

    if (nearest && minDist <= maxDistanceKm) {
        return {
            name: nearest.name,
            nameKr: LANDMARK_NAMES_KR[nearest.name] || nearest.name,
            distance: minDist
        };
    }
    return null;
}

/**
 * Check if a route path runs along the Han River
 */
function isRouteAlongRiver(routePath) {
    if (!routePath || routePath.length < 5) return false;

    // Sample some points along the route and check how many are near the river
    const sampleCount = Math.min(10, routePath.length);
    const step = Math.floor(routePath.length / sampleCount);
    let nearRiverCount = 0;

    for (let i = 0; i < routePath.length; i += step) {
        const [lat, lng] = routePath[i];
        const nearest = findNearestLandmark(lat, lng, 1.0);
        if (nearest) nearRiverCount++;
    }

    return nearRiverCount >= sampleCount * 0.4; // 40% of sampled points near river
}

/**
 * Reverse geocode a point to get a readable address (Korean)
 * Uses Nominatim (OpenStreetMap) - free, no API key needed
 */
async function reverseGeocode(lat, lng) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&accept-language=ko&addressdetails=1`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'RoadRunnerApp/1.0' }
        });
        const data = await response.json();

        if (data && data.address) {
            const addr = data.address;
            // Try to get a meaningful short name
            const placeName = addr.leisure || addr.amenity || addr.tourism ||
                addr.building || addr.road || addr.neighbourhood ||
                addr.suburb || addr.city_district || '';
            return placeName;
        }
        return null;
    } catch (e) {
        console.warn("Reverse geocoding failed:", e);
        return null;
    }
}

/**
 * Generate a human-readable course description in Korean
 * @param {Object} params
 * @param {Object} params.startPoint - { lat, lng }
 * @param {Object} params.endPoint - { lat, lng } (turnaround or destination)
 * @param {Array} params.routePath - [[lat, lng], ...]
 * @param {string} params.runMode - 'roundTrip' | 'oneWay'
 * @param {number} params.distanceMeters - total distance
 * @returns {Promise<Object>} { title, subtitle, tags[] }
 */
export async function generateCourseDescription({ startPoint, endPoint, routePath, runMode, distanceMeters }) {
    const distanceKm = (distanceMeters / 1000).toFixed(1);
    const isRoundTrip = runMode === 'roundTrip';
    const isAlongRiver = isRouteAlongRiver(routePath);

    // Find landmarks near start and end points
    const startLandmark = findNearestLandmark(startPoint.lat, startPoint.lng, 2.0);
    const endLandmark = findNearestLandmark(endPoint.lat, endPoint.lng, 2.0);

    // Reverse geocode for more detail (async, best effort)
    let startName = startLandmark?.nameKr || null;
    let endName = endLandmark?.nameKr || null;

    // If no landmark nearby, try reverse geocoding
    const [startGeo, endGeo] = await Promise.all([
        !startName ? reverseGeocode(startPoint.lat, startPoint.lng) : Promise.resolve(null),
        !endName ? reverseGeocode(endPoint.lat, endPoint.lng) : Promise.resolve(null)
    ]);

    if (!startName && startGeo) startName = startGeo;
    if (!endName && endGeo) endName = endGeo;

    // Fallback names
    if (!startName) startName = '출발지';
    if (!endName) endName = '목적지';

    // === Build Description ===
    let title = '';
    let subtitle = '';
    const tags = [];

    // Main title
    if (isRoundTrip) {
        if (startName === endName || !endName || endName === '목적지') {
            title = `${startName} 주변 ${distanceKm}km 왕복 코스`;
        } else {
            title = `${endName}까지 찍고 돌아오는 코스`;
        }
    } else {
        // One-way
        if (endName && endName !== '목적지') {
            title = `${endName}까지 ${distanceKm}km 편도 코스`;
        } else {
            title = `${distanceKm}km 편도 코스`;
        }
    }

    // Subtitle
    if (isAlongRiver) {
        subtitle = '한강변을 따라 달리는 코스 🌊';
        tags.push('한강변');
    } else {
        subtitle = isRoundTrip
            ? `${startName}에서 출발하여 ${endName} 방면으로 갔다 돌아옵니다`
            : `${startName}에서 ${endName}까지 한 방향으로 달립니다`;
    }

    // Tags
    tags.push(isRoundTrip ? '왕복' : '편도');
    tags.push(`${distanceKm}km`);

    if (endLandmark) {
        // Check if it's a bridge or park
        if (endLandmark.name.includes('Bridge')) tags.push('다리');
        if (endLandmark.name.includes('Park')) tags.push('공원');
    }

    return { title, subtitle, tags };
}
