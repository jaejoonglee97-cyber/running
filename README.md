# 🏃 달려라 하니 (Road Runner)

> 한강 러닝 코스 추천 웹앱 — 출발지와 거리를 설정하면 실제 도로 기반 왕복/편도 러닝 코스를 자동 생성해줍니다.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)](https://leafletjs.com)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🗺️ **코스 자동 생성** | OSRM API를 활용해 실제 도로 기반 러닝 경로를 생성합니다 |
| 📍 **두 가지 출발 모드** | 현재 GPS 위치 또는 지도에서 직접 출발지를 선택할 수 있습니다 |
| 🔄 **왕복/편도 선택** | 왕복(round-trip) 또는 편도(one-way) 코스를 설정할 수 있습니다 |
| 📏 **거리 설정** | 1km ~ 42km까지 0.5km 단위로 목표 거리를 조절합니다 |
| 🏞️ **프리셋 코스** | 광화문, 여의도, 반포 등 12개 추천 코스가 내장되어 있습니다 |
| 📤 **코스 공유** | 생성된 코스를 Web Share API로 친구에게 공유할 수 있습니다 |
| 💾 **코스 저장** | Google Sheets 연동으로 코스를 저장하고 불러올 수 있습니다 |

---

## 🛠️ 기술 스택

- **Frontend**: React 19 + Vite 7
- **지도**: Leaflet + React-Leaflet
- **경로 엔진**: [OSRM](http://project-osrm.org/) (Open Source Routing Machine)
- **백엔드**: Google Apps Script (코스 저장/불러오기)
- **배포**: Vercel / GitHub Pages (정적 빌드)

---

## 📂 프로젝트 구조

```
├── apps-script/         # Google Apps Script 백엔드 코드
│   └── Code.gs
├── public/              # 정적 파일
├── src/
│   ├── assets/          # 앱 아이콘, 마커, 배경 이미지
│   ├── components/      # React 컴포넌트
│   │   ├── StartPage.jsx          # 시작 화면 (모드 선택)
│   │   ├── MainPage.jsx           # 메인 지도 + 코스 생성
│   │   ├── FullMap.jsx            # 전체 화면 지도
│   │   ├── DistanceBottomSheet.jsx # 거리 설정 패널
│   │   ├── SaveCourseModal.jsx    # 코스 저장 모달
│   │   └── SharedCoursesPanel.jsx # 공유 코스 패널
│   ├── logic/           # 핵심 비즈니스 로직
│   │   ├── courseManager.js       # 코스 생성 관리
│   │   ├── osrm.js                # OSRM API 통신 (재시도/백오프)
│   │   ├── turnaround.js          # 반환점 계산
│   │   ├── gps.js                 # GPS 위치 수신
│   │   ├── courseDescription.js   # 코스 설명 생성
│   │   ├── hangang_points.js      # 한강 주요 지점 데이터
│   │   ├── presetCourses.js       # 프리셋 코스 데이터
│   │   └── sheetsApi.js           # Google Sheets API 연동
│   ├── App.jsx          # 앱 진입점
│   ├── App.css          # 앱 스타일
│   ├── index.css        # 글로벌 스타일
│   └── main.jsx         # React DOM 렌더링
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## 🚀 시작하기

### 사전 요구사항

- [Node.js](https://nodejs.org/) 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 1. 레포지토리 클론
git clone https://github.com/jaejoonglee97-cyber/running.git
cd running

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 프로덕션 빌드

```bash
npm run build    # dist/ 폴더에 빌드 결과물 생성
npm run preview  # 빌드 결과 미리보기
```

---

## 📱 사용 방법

1. **시작 화면**에서 왕복 또는 편도 모드를 선택합니다
2. **출발 방식**을 선택합니다 (현재 위치 / 지도에서 선택)
3. **목표 거리**를 설정합니다 (0.5km 단위)
4. **코스 생성** 버튼을 누르면 실제 도로 기반 러닝 코스가 표시됩니다
5. 마음에 드는 코스를 **저장**하거나 **공유**할 수 있습니다

---

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

## 👤 만든 사람

**JJ (이재중)**

