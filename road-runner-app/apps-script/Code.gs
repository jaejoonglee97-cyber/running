/**
 * Road Runner — Shared Courses API
 * Google Apps Script (Web App)
 *
 * 스프레드시트 ID: 1hGMDJ3CufDJ6qvURsH8Sg9EPyRiBEGH06WKJwKsa94k
 * 시트 이름: SharedCourses
 *
 * 배포 방법:
 * 1. 스프레드시트 열기 → 확장 프로그램 → Apps Script
 * 2. 이 코드를 Code.gs에 붙여넣기
 * 3. 배포 → 새 배포 → 웹 앱
 *    - 실행 주체: 본인
 *    - 액세스 권한: 누구나
 * 4. 배포 URL을 복사하여 sheetsApi.js의 APPS_SCRIPT_URL에 붙여넣기
 */

const SHEET_NAME = 'SharedCourses';

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

/**
 * GET 요청 처리 — 코스 목록 조회
 * ?action=list           → 전체 목록
 * ?action=get&id=xxx     → 특정 코스 조회
 */
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'list';

    if (action === 'get') {
      const id = e.parameter.id;
      const course = getCourseById(id);
      return jsonResponse({ success: true, data: course });
    }

    // Default: list all
    const courses = getAllCourses();
    return jsonResponse({ success: true, data: courses });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * POST 요청 처리 — 코스 저장 / 좋아요
 * action=save   → 새 코스 저장
 * action=like   → 좋아요 +1
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || 'save';

    if (action === 'save') {
      const course = saveCourse(body.data);
      return jsonResponse({ success: true, data: course });
    }

    if (action === 'like') {
      const result = likeCourse(body.id);
      return jsonResponse({ success: true, data: result });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * 전체 코스 목록 가져오기 (최신순)
 */
function getAllCourses() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // header only

  const headers = data[0];
  const courses = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    // routePath는 JSON 문자열 → 너무 크면 목록에서 제외 (경량화)
    if (row.routePath && typeof row.routePath === 'string') {
      try {
        row.routePathLength = JSON.parse(row.routePath).length;
      } catch (_) {
        row.routePathLength = 0;
      }
      // 목록 조회에서는 routePath 제외 (크기 절약)
      delete row.routePath;
    }
    courses.push(row);
  }

  // 최신순 정렬
  courses.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return courses;
}

/**
 * ID로 특정 코스 조회 (routePath 포함)
 */
function getCourseById(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      // routePath JSON 파싱
      if (row.routePath && typeof row.routePath === 'string') {
        try {
          row.routePath = JSON.parse(row.routePath);
        } catch (_) {
          row.routePath = [];
        }
      }
      return row;
    }
  }

  throw new Error('Course not found: ' + id);
}

/**
 * 새 코스 저장
 */
function saveCourse(data) {
  const sheet = getSheet();
  const id = Date.now().toString();
  const now = new Date().toISOString();

  const routePathStr = typeof data.routePath === 'string'
    ? data.routePath
    : JSON.stringify(data.routePath || []);

  const tagsStr = Array.isArray(data.tags)
    ? data.tags.join(',')
    : (data.tags || '');

  const row = [
    id,                              // id
    data.courseName || '',           // courseName
    data.runMode || 'roundTrip',     // runMode
    data.distanceKm || 0,            // distanceKm
    data.startLat || 0,              // startLat
    data.startLng || 0,              // startLng
    data.endLat || 0,                // endLat
    data.endLng || 0,                // endLng
    routePathStr,                    // routePath (JSON string)
    data.title || '',                // title
    data.subtitle || '',             // subtitle
    tagsStr,                         // tags
    data.authorName || '익명 러너',   // authorName
    0,                               // likes
    now                              // createdAt
  ];

  sheet.appendRow(row);

  return { id, createdAt: now };
}

/**
 * 좋아요 +1
 */
function likeCourse(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      const likesCol = 14; // N열 (0-indexed = 13, 1-indexed = 14)
      const currentLikes = Number(data[i][13]) || 0;
      sheet.getRange(i + 1, likesCol).setValue(currentLikes + 1);
      return { id, likes: currentLikes + 1 };
    }
  }

  throw new Error('Course not found: ' + id);
}

/**
 * JSON 응답 헬퍼
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
