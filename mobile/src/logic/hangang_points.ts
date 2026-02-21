/**
 * Safe running points — parks, streams, riverside paths in Seoul
 */

export interface SafePoint {
  name: string;
  lat: number;
  lng: number;
  type: string;
}

export const HANGANG_POINTS: SafePoint[] = [
  { name: 'Gwangnaru Park', lat: 37.5501, lng: 127.1213, type: 'park' },
  { name: 'Jamsil Park', lat: 37.5181, lng: 127.0864, type: 'park' },
  { name: 'Ttukseom Park (South View)', lat: 37.5292, lng: 127.07, type: 'park' },
  { name: 'Jamwon Park', lat: 37.5204, lng: 127.0121, type: 'park' },
  { name: 'Banpo Park', lat: 37.5097, lng: 126.9946, type: 'park' },
  { name: 'Yeouido Park (River)', lat: 37.5266, lng: 126.9348, type: 'park' },
  { name: 'Yanghwa Park', lat: 37.5408, lng: 126.8993, type: 'park' },
  { name: 'Gangseo Park', lat: 37.5815, lng: 126.8122, type: 'park' },
  { name: 'Guri Park', lat: 37.5707, lng: 127.1328, type: 'park' },
  { name: 'Ttukseom Park', lat: 37.5317, lng: 127.0667, type: 'park' },
  { name: 'Ichon Park', lat: 37.5165, lng: 126.9723, type: 'park' },
  { name: 'Mangwon Park', lat: 37.5546, lng: 126.8959, type: 'park' },
  { name: 'Nanji Park', lat: 37.5694, lng: 126.8745, type: 'park' },
  { name: 'Jamsil Bridge', lat: 37.5255, lng: 127.0905, type: 'bridge' },
  { name: 'Cheongdam Bridge', lat: 37.53, lng: 127.062, type: 'bridge' },
  { name: 'Yeongdong Bridge', lat: 37.536, lng: 127.054, type: 'bridge' },
  { name: 'Seongsu Bridge', lat: 37.5375, lng: 127.0345, type: 'bridge' },
  { name: 'Dongho Bridge', lat: 37.54, lng: 127.021, type: 'bridge' },
  { name: 'Hannam Bridge', lat: 37.529, lng: 127.01, type: 'bridge' },
  { name: 'Banpo Bridge', lat: 37.515, lng: 126.996, type: 'bridge' },
  { name: 'Dongjak Bridge', lat: 37.511, lng: 126.982, type: 'bridge' },
  { name: 'Hangang Bridge', lat: 37.516, lng: 126.958, type: 'bridge' },
  { name: 'Wonhyo Bridge', lat: 37.5305, lng: 126.945, type: 'bridge' },
  { name: 'Mapo Bridge', lat: 37.537, lng: 126.938, type: 'bridge' },
  { name: 'Seogang Bridge', lat: 37.545, lng: 126.929, type: 'bridge' },
  { name: 'Yanghwa Bridge', lat: 37.544, lng: 126.903, type: 'bridge' },
  { name: 'Seongsan Bridge', lat: 37.553, lng: 126.892, type: 'bridge' },
  { name: 'Gayang Bridge', lat: 37.57, lng: 126.86, type: 'bridge' },
];

export const STREAM_POINTS: SafePoint[] = [
  { name: '중랑천 상류(노원)', lat: 37.6543, lng: 127.0592, type: 'stream' },
  { name: '중랑천 중류(중랑구)', lat: 37.605, lng: 127.082, type: 'stream' },
  { name: '중랑천 하류(성동구)', lat: 37.5608, lng: 127.0425, type: 'stream' },
  { name: '중랑천 합류점', lat: 37.541, lng: 127.04, type: 'stream' },
  { name: '양재천 상류(양재역)', lat: 37.4844, lng: 127.035, type: 'stream' },
  { name: '양재천 중류(도곡동)', lat: 37.487, lng: 127.053, type: 'stream' },
  { name: '양재천 하류(탄천합류)', lat: 37.495, lng: 127.077, type: 'stream' },
  { name: '탄천 상류(분당)', lat: 37.382, lng: 127.119, type: 'stream' },
  { name: '탄천 중류(수서)', lat: 37.489, lng: 127.102, type: 'stream' },
  { name: '탄천 하류(잠실합류)', lat: 37.512, lng: 127.093, type: 'stream' },
  { name: '안양천 상류(금천구)', lat: 37.452, lng: 126.899, type: 'stream' },
  { name: '안양천 중류(구로구)', lat: 37.488, lng: 126.883, type: 'stream' },
  { name: '안양천 하류(영등포합류)', lat: 37.523, lng: 126.883, type: 'stream' },
  { name: '불광천(은평구)', lat: 37.609, lng: 126.92, type: 'stream' },
  { name: '불광천 하류(마포)', lat: 37.57, lng: 126.91, type: 'stream' },
  { name: '홍제천(서대문구)', lat: 37.582, lng: 126.935, type: 'stream' },
  { name: '홍제천 하류', lat: 37.566, lng: 126.925, type: 'stream' },
  { name: '청계천 광장', lat: 37.57, lng: 126.978, type: 'stream' },
  { name: '청계천 중류', lat: 37.569, lng: 127.01, type: 'stream' },
  { name: '청계천 하류(성동구)', lat: 37.562, lng: 127.035, type: 'stream' },
];

export const PARK_POINTS: SafePoint[] = [
  { name: '올림픽공원', lat: 37.5209, lng: 127.1215, type: 'park' },
  { name: '서울숲', lat: 37.5445, lng: 127.0374, type: 'park' },
  { name: '보라매공원', lat: 37.4924, lng: 126.9216, type: 'park' },
  { name: '남산공원', lat: 37.5512, lng: 126.9882, type: 'park' },
  { name: '여의도공원', lat: 37.5265, lng: 126.922, type: 'park' },
  { name: '월드컵공원', lat: 37.57, lng: 126.885, type: 'park' },
  { name: '하늘공원', lat: 37.573, lng: 126.876, type: 'park' },
  { name: '북서울꿈의숲', lat: 37.621, lng: 127.044, type: 'park' },
  { name: '어린이대공원', lat: 37.5481, lng: 127.0823, type: 'park' },
  { name: '용산공원', lat: 37.527, lng: 126.974, type: 'park' },
  { name: '경의선숲길', lat: 37.555, lng: 126.922, type: 'park' },
  { name: '독립공원(서대문)', lat: 37.572, lng: 126.958, type: 'park' },
  { name: '양재시민의숲', lat: 37.471, lng: 127.038, type: 'park' },
  { name: '일산호수공원', lat: 37.671, lng: 126.771, type: 'park' },
  { name: '관악산 입구', lat: 37.444, lng: 126.96, type: 'park' },
  { name: '북악스카이웨이 입구', lat: 37.595, lng: 126.98, type: 'park' },
];

export const ALL_SAFE_POINTS: SafePoint[] = [...HANGANG_POINTS, ...STREAM_POINTS, ...PARK_POINTS];
