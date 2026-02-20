
/**
 * Safe Running Points — Parks, Streams, and Riverside paths in Seoul
 * Used by TurnaroundCalculator to prefer safe running routes
 * over regular roads.
 */

// =========================
// 한강 공원 및 다리 (기존)
// =========================
export const HANGANG_POINTS = [
    // --- South Side (Gangnam side) ---
    { name: "Gwangnaru Park", lat: 37.5501, lng: 127.1213, type: "park" },
    { name: "Jamsil Park", lat: 37.5181, lng: 127.0864, type: "park" },
    { name: "Ttukseom Park (South View)", lat: 37.5292, lng: 127.0700, type: "park" },
    { name: "Jamwon Park", lat: 37.5204, lng: 127.0121, type: "park" },
    { name: "Banpo Park", lat: 37.5097, lng: 126.9946, type: "park" },
    { name: "Yeouido Park (River)", lat: 37.5266, lng: 126.9348, type: "park" },
    { name: "Yanghwa Park", lat: 37.5408, lng: 126.8993, type: "park" },
    { name: "Gangseo Park", lat: 37.5815, lng: 126.8122, type: "park" },

    // --- North Side (Gangbuk side) ---
    { name: "Guri Park", lat: 37.5707, lng: 127.1328, type: "park" },
    { name: "Ttukseom Park", lat: 37.5317, lng: 127.0667, type: "park" },
    { name: "Ichon Park", lat: 37.5165, lng: 126.9723, type: "park" },
    { name: "Mangwon Park", lat: 37.5546, lng: 126.8959, type: "park" },
    { name: "Nanji Park", lat: 37.5694, lng: 126.8745, type: "park" },

    // --- Major Bridges (Midpoints/Approaches) ---
    { name: "Jamsil Bridge", lat: 37.5255, lng: 127.0905, type: "bridge" },
    { name: "Cheongdam Bridge", lat: 37.5300, lng: 127.0620, type: "bridge" },
    { name: "Yeongdong Bridge", lat: 37.5360, lng: 127.0540, type: "bridge" },
    { name: "Seongsu Bridge", lat: 37.5375, lng: 127.0345, type: "bridge" },
    { name: "Dongho Bridge", lat: 37.5400, lng: 127.0210, type: "bridge" },
    { name: "Hannam Bridge", lat: 37.5290, lng: 127.0100, type: "bridge" },
    { name: "Banpo Bridge", lat: 37.5150, lng: 126.9960, type: "bridge" },
    { name: "Dongjak Bridge", lat: 37.5110, lng: 126.9820, type: "bridge" },
    { name: "Hangang Bridge", lat: 37.5160, lng: 126.9580, type: "bridge" },
    { name: "Wonhyo Bridge", lat: 37.5305, lng: 126.9450, type: "bridge" },
    { name: "Mapo Bridge", lat: 37.5370, lng: 126.9380, type: "bridge" },
    { name: "Seogang Bridge", lat: 37.5450, lng: 126.9290, type: "bridge" },
    { name: "Yanghwa Bridge", lat: 37.5440, lng: 126.9030, type: "bridge" },
    { name: "Seongsan Bridge", lat: 37.5530, lng: 126.8920, type: "bridge" },
    { name: "Gayang Bridge", lat: 37.5700, lng: 126.8600, type: "bridge" }
];

// =========================
// 서울 주요 하천길 (산책로/자전거길)
// =========================
export const STREAM_POINTS = [
    // --- 중랑천 (Jungnangcheon) --- 북쪽 → 남쪽
    { name: "중랑천 상류(노원)", lat: 37.6543, lng: 127.0592, type: "stream" },
    { name: "중랑천 중류(중랑구)", lat: 37.6050, lng: 127.0820, type: "stream" },
    { name: "중랑천 하류(성동구)", lat: 37.5608, lng: 127.0425, type: "stream" },
    { name: "중랑천 합류점", lat: 37.5410, lng: 127.0400, type: "stream" },

    // --- 양재천 (Yangjaecheon) ---
    { name: "양재천 상류(양재역)", lat: 37.4844, lng: 127.0350, type: "stream" },
    { name: "양재천 중류(도곡동)", lat: 37.4870, lng: 127.0530, type: "stream" },
    { name: "양재천 하류(탄천합류)", lat: 37.4950, lng: 127.0770, type: "stream" },

    // --- 탄천 (Tancheon) ---
    { name: "탄천 상류(분당)", lat: 37.3820, lng: 127.1190, type: "stream" },
    { name: "탄천 중류(수서)", lat: 37.4890, lng: 127.1020, type: "stream" },
    { name: "탄천 하류(잠실합류)", lat: 37.5120, lng: 127.0930, type: "stream" },

    // --- 안양천 (Anyangcheon) ---
    { name: "안양천 상류(금천구)", lat: 37.4520, lng: 126.8990, type: "stream" },
    { name: "안양천 중류(구로구)", lat: 37.4880, lng: 126.8830, type: "stream" },
    { name: "안양천 하류(영등포합류)", lat: 37.5230, lng: 126.8830, type: "stream" },

    // --- 불광천 (Bulgwangcheon) ---
    { name: "불광천(은평구)", lat: 37.6090, lng: 126.9200, type: "stream" },
    { name: "불광천 하류(마포)", lat: 37.5700, lng: 126.9100, type: "stream" },

    // --- 홍제천 (Hongjecheon) ---
    { name: "홍제천(서대문구)", lat: 37.5820, lng: 126.9350, type: "stream" },
    { name: "홍제천 하류", lat: 37.5660, lng: 126.9250, type: "stream" },

    // --- 청계천 (Cheonggyecheon) ---
    { name: "청계천 광장", lat: 37.5700, lng: 126.9780, type: "stream" },
    { name: "청계천 중류", lat: 37.5690, lng: 127.0100, type: "stream" },
    { name: "청계천 하류(성동구)", lat: 37.5620, lng: 127.0350, type: "stream" },
];

// =========================
// 서울 주요 공원 (달리기 좋은 곳)
// =========================
export const PARK_POINTS = [
    // 대형 공원
    { name: "올림픽공원", lat: 37.5209, lng: 127.1215, type: "park" },
    { name: "서울숲", lat: 37.5445, lng: 127.0374, type: "park" },
    { name: "보라매공원", lat: 37.4924, lng: 126.9216, type: "park" },
    { name: "남산공원", lat: 37.5512, lng: 126.9882, type: "park" },
    { name: "여의도공원", lat: 37.5265, lng: 126.9220, type: "park" },
    { name: "월드컵공원", lat: 37.5700, lng: 126.8850, type: "park" },
    { name: "하늘공원", lat: 37.5730, lng: 126.8760, type: "park" },
    { name: "북서울꿈의숲", lat: 37.6210, lng: 127.0440, type: "park" },
    { name: "어린이대공원", lat: 37.5481, lng: 127.0823, type: "park" },
    { name: "용산공원", lat: 37.5270, lng: 126.9740, type: "park" },
    { name: "경의선숲길", lat: 37.5550, lng: 126.9220, type: "park" },
    { name: "독립공원(서대문)", lat: 37.5720, lng: 126.9580, type: "park" },
    { name: "양재시민의숲", lat: 37.4710, lng: 127.0380, type: "park" },
    { name: "일산호수공원", lat: 37.6710, lng: 126.7710, type: "park" },

    // 둘레길 주요 포인트
    { name: "관악산 입구", lat: 37.4440, lng: 126.9600, type: "park" },
    { name: "북악스카이웨이 입구", lat: 37.5950, lng: 126.9800, type: "park" },
];

/**
 * 모든 안전 러닝 포인트를 하나로 합침
 */
export const ALL_SAFE_POINTS = [
    ...HANGANG_POINTS,
    ...STREAM_POINTS,
    ...PARK_POINTS
];
