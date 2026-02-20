# 달려라 하니 — Frontend (React + Vite)

이 디렉토리는 **달려라 하니** 웹앱의 프론트엔드 소스입니다.

## 개발 서버 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build    # → dist/
npm run preview  # 빌드 결과 미리보기
```

## 주요 디렉토리

| 디렉토리 | 설명 |
|----------|------|
| `src/components/` | React UI 컴포넌트 (StartPage, MainPage, FullMap 등) |
| `src/logic/` | 비즈니스 로직 (코스 생성, OSRM API, GPS 등) |
| `src/assets/` | 이미지 리소스 (앱 아이콘, 마커, 배경 등) |
| `apps-script/` | Google Apps Script 백엔드 (코스 저장/불러오기) |

## 기술 스택

- React 19 + Vite 7
- Leaflet + React-Leaflet (지도)
- OSRM API (경로 계산)
- Google Apps Script (데이터 저장)
