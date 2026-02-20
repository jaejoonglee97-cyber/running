/**
 * Sheets API Client
 * Communicates with Google Apps Script Web App for course sharing.
 *
 * ⚠️ 배포 후 아래 URL을 실제 Apps Script 웹 앱 URL로 교체하세요!
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzjez6Q7J9eP0YLXsdG2KYs6GJnWsLhOYPoc1B9aUjJKjmKpHgZH0G45WWbYGjTdw5V/exec';

/**
 * 전체 공유 코스 목록 가져오기 (최신순)
 * @returns {Promise<Array>} 코스 목록 (routePath 제외 — 경량)
 */
export async function fetchSharedCourses() {
    try {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=list`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        return json.data || [];
    } catch (err) {
        console.error('코스 목록 불러오기 실패:', err);
        return [];
    }
}

/**
 * 특정 코스 상세 조회 (routePath 포함)
 * @param {string} id - 코스 ID
 * @returns {Promise<Object|null>}
 */
export async function fetchCourseDetail(id) {
    try {
        const res = await fetch(`${APPS_SCRIPT_URL}?action=get&id=${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        return json.data;
    } catch (err) {
        console.error('코스 상세 조회 실패:', err);
        return null;
    }
}

/**
 * 새 코스 저장
 * @param {Object} courseData
 * @param {string} courseData.courseName - 사용자가 지은 코스 이름
 * @param {string} courseData.runMode - 'roundTrip' | 'oneWay'
 * @param {number} courseData.distanceKm
 * @param {number} courseData.startLat
 * @param {number} courseData.startLng
 * @param {number} courseData.endLat
 * @param {number} courseData.endLng
 * @param {Array}  courseData.routePath - [[lat,lng], ...]
 * @param {string} courseData.title - 자동 생성된 코스 제목
 * @param {string} courseData.subtitle
 * @param {Array}  courseData.tags
 * @param {string} courseData.authorName
 * @returns {Promise<Object>} { id, createdAt }
 */
export async function saveCourse(courseData) {
    const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
            action: 'save',
            data: courseData
        })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '저장 실패');
    return json.data;
}

/**
 * 코스 좋아요 +1
 * @param {string} id - 코스 ID
 * @returns {Promise<Object>} { id, likes }
 */
export async function likeCourse(id) {
    const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
            action: 'like',
            id
        })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || '좋아요 실패');
    return json.data;
}
