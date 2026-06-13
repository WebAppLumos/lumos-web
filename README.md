# Lumos Web (UniDash)

대학 생활을 한곳에서 관리하는 **맞춤형 대시보드 웹 애플리케이션**입니다.  
시간표, 일정, 과제, 장학금, 캠퍼스맵을 통합하고, 사용자가 원하는 위젯만 골라 대시보드를 구성할 수 있습니다.

> UI 브랜드명: **UniDash** · 프로젝트명: **Lumos**

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [사전 요구 사항](#사전-요구-사항)
- [실행 방법](#실행-방법)
- [환경 변수](#환경-변수)
- [디렉토리 구조](#디렉토리-구조)
- [페이지 및 라우팅](#페이지-및-라우팅)
- [인증 및 세션](#인증-및-세션)
- [백엔드 API 연동](#백엔드-api-연동)
- [EDWARD 확장 프로그램 연동](#edward-확장-프로그램-연동)
- [전역 검색](#전역-검색)
- [개발 스크립트](#개발-스크립트)
- [빌드 및 배포](#빌드-및-배포)

---

## 주요 기능

### 대시보드 (`/`)
- 로그인 후 개인 맞춤 홈 화면 제공
- 위젯 편집 모드: 표시/숨김, 드래그 앤 드롭 순서 변경
- 위젯 종류
  - **오늘의 시간표** — 당일 수업 요약
  - **일정** — 오늘 일정 요약
  - **과제** — 과제 현황 요약
  - **장학금** — 장학금 추천 요약
  - **캠퍼스맵** — 교내 시설 안내 요약
- 위젯 설정은 백엔드 API에 저장되며, `localStorage` 캐시로 초기 로딩 속도 개선

### 시간표 (`/timetable`)
- 학기·시간표 탭 관리
- 주간 그리드 UI로 수업 배치
- 수업 추가/삭제, 노트 작성, 난이도 표시
- 온라인 수업·학점 정보 UI
- **EDWARD 동기화**: Chrome 확장 프로그램을 통해 학교 포털 시간표 자동 연동

### 일정 (`/schedule`)
- FullCalendar 기반 월간 캘린더
- 학사/개인 일정 CRUD
- 키워드·카테고리 필터 검색
- 할 일(Todo) 완료 토글

### 과제 (`/assignment`)
- 과제 등록·수정·삭제
- 마감 임박(D-Day) 과제 강조 표시
- 미완료 과제 수 집계

### 장학금 (`/scholarship`)
- 프로필(학점, 학점 수, 토익, 자격증 등) 기반 장학금 적합도 판별
- 추천 장학금 목록 및 상세 정보

### 캠퍼스맵 (`/mappage`)
- Leaflet + OpenStreetMap 기반 교내 지도
- 카테고리(카페, 도서관, 건물 등) 필터
- 시설 검색, 길찾기, 다음 수업까지 예상 이동 시간

### 마이페이지 (`/mypage`)
- 프로필 조회·수정, 프로필 이미지 변경
- 학기 학점 조회
- EDWARD 시간표 동기화 모달
- 회원 탈퇴

### 전역 검색 (상단 네비게이션)
- 모든 페이지 공통 검색 아이콘
- 페이지, 과제, 장학금, 캠퍼스 시설, 수업, 일정 통합 검색
- 키보드 내비게이션(↑/↓, Enter, ESC) 지원

### 인증
- Firebase Authentication (이메일/비밀번호)
- 로그인 후 백엔드 사용자 정보 연동
- 세션 만료 시 자동 로그아웃 및 로그인 페이지 리다이렉트

---

## 기술 스택

### Frontend Core
| 구분 | 기술 | 버전 |
|------|------|------|
| UI 프레임워크 | React | ^19.2 |
| 빌드 도구 | Vite | ^8.0 |
| 라우팅 | React Router DOM | ^7.16 |
| HTTP 클라이언트 | Axios | ^1.17 |

### 인증 · 백엔드 연동
| 구분 | 기술 |
|------|------|
| 인증 | Firebase Auth |
| 분석 | Firebase Analytics |
| REST API | Lumos 백엔드 (`VITE_API_BASE_URL`) |

### UI · 지도 · 캘린더
| 구분 | 기술 |
|------|------|
| 아이콘 | Lucide React |
| 모달 | Radix UI Dialog, React Modal |
| 지도 | Leaflet, React Leaflet, OpenStreetMap |
| 캘린더 | FullCalendar (daygrid, interaction) |

### 개발 도구
| 구분 | 기술 |
|------|------|
| 린터 | ESLint 10 (flat config) |
| React 플러그인 | @vitejs/plugin-react |

---

## 사전 요구 사항

실행 전 아래 환경이 준비되어 있어야 합니다.

1. **Node.js** 18 이상 (권장: 20 LTS)
2. **npm** (또는 호환 패키지 매니저)
3. **Lumos 백엔드 API 서버** — 기본 주소 `http://localhost:8080`
4. **Firebase 프로젝트** — `src/lib/firebase.js`에 설정된 `lumos-auth` 프로젝트
5. *(선택)* **Lumos EDWARD Chrome 확장** — 학교 포털 시간표 동기화 시 필요

---

## 실행 방법

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd lumos-web
npm install
```

### 2. 환경 변수 설정

루트 디렉토리에 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

`.env` 내용을 환경에 맞게 수정합니다. (자세한 설명은 [환경 변수](#환경-변수) 참고)

### 3. 백엔드 서버 실행

Lumos API 서버를 `VITE_API_BASE_URL`에 맞는 주소에서 실행합니다.  
기본값은 `http://localhost:8080`입니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

터미널에 표시되는 주소(기본: `http://localhost:5173`)로 접속합니다.

### 5. 프로덕션 빌드 미리보기 *(선택)*

```bash
npm run build
npm run preview
```

---

## 환경 변수

`.env.example` 기준으로 사용하는 변수입니다.

| 변수명 | 필수 | 기본값 | 설명 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | 권장 | `http://localhost:8080` | Lumos 백엔드 API 베이스 URL |
| `VITE_LUMOS_EXTENSION_ID` | 선택 | *(없음)* | EDWARD Chrome 확장 프로그램 ID. 미설정 시 확장 연동 기능 비활성 |

### 예시

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_LUMOS_EXTENSION_ID=your-chrome-extension-id
```

> Vite 환경 변수는 `VITE_` 접두사가 붙은 값만 클라이언트 코드에서 접근할 수 있습니다.

---

## 디렉토리 구조

```
lumos-web/
├── public/                     # 정적 자산
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.jsx                # React 앱 엔트리포인트
│   ├── App.jsx                 # BrowserRouter, 세션 가드, 데이터 프리페치
│   ├── Router.jsx              # 페이지 라우트 정의
│   ├── index.css               # 전역 스타일
│   │
│   ├── pages/                  # 페이지 단위 컴포넌트
│   │   ├── Dashboard/          # 메인 대시보드
│   │   ├── Timetable/          # 시간표
│   │   ├── Calendar/           # 일정 (Schedule.jsx)
│   │   ├── Assignment/         # 과제
│   │   ├── Scholarship/        # 장학금
│   │   ├── MapPage/            # 캠퍼스맵
│   │   ├── Signin/             # 로그인
│   │   ├── Signup/             # 회원가입
│   │   └── MyPage/             # 마이페이지
│   │
│   ├── components/             # 재사용 UI 컴포넌트
│   │   ├── Dashboard/          # 네비게이션, 위젯, 검색 모달 등
│   │   │   ├── DashboardNav.jsx
│   │   │   ├── DashboardHeader.jsx
│   │   │   ├── DashboardWidgetEditor.jsx
│   │   │   ├── DashboardLoginCard.jsx
│   │   │   ├── GlobalSearchModal.jsx
│   │   │   ├── TodayTimetableWidget.jsx
│   │   │   └── ScheduleSummaryWidget.jsx
│   │   ├── Timetable/          # 시간표 그리드, 수업 목록, 컨트롤
│   │   ├── Calendar/           # 캘린더, 일정 모달, 투두리스트
│   │   ├── Assignment/         # 과제 카드, 등록 폼, 목록
│   │   ├── Scholarship/        # 장학금 폼, 결과, 히어로
│   │   ├── Map/                # 지도 카테고리, 장소 목록
│   │   └── MyPage/             # EDWARD 동기화 모달
│   │
│   ├── lib/                    # 비즈니스 로직 · API · 유틸
│   │   ├── api.js              # Axios 인스턴스, Firebase 토큰 인터셉터
│   │   ├── firebase.js         # Firebase 초기화
│   │   ├── auth.js             # 회원가입 유효성·에러 메시지
│   │   ├── session.js          # localStorage 세션 관리
│   │   ├── useStoredUser.js    # 사용자 상태 커스텀 훅
│   │   ├── dashboardApi.js     # 대시보드 위젯 API
│   │   ├── globalSearch.js     # 전역 검색 인덱스·검색 로직
│   │   ├── edwardExtension.js  # Chrome 확장 연동
│   │   ├── mock-data.js        # 시간표 더미 데이터
│   │   ├── calendar/
│   │   │   ├── api.js          # 일정 API, 필터, 세션 스냅샷
│   │   │   └── session.js      # 일정 세션 캐시
│   │   └── timetable/
│   │       ├── api.js          # 시간표·학기·수업·노트 API
│   │       ├── session.js      # 시간표 세션 캐시
│   │       └── constants.js    # 시간표 그리드 상수
│   │
│   └── data/                   # 정적 데이터
│       ├── places.js           # 캠퍼스 시설·건물 좌표
│       ├── scholarships.js     # 장학금 목록·적합도 로직
│       ├── assignmentTasks.js  # 과제 초기 데이터
│       └── certifications.json # 자격증 목록
│
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── .env.example
└── README.md
```

### 디렉토리 역할 요약

| 경로 | 역할 |
|------|------|
| `src/pages/` | URL 단위 화면. 데이터 로딩·상태 관리의 진입점 |
| `src/components/` | 페이지에서 재사용하는 UI 단위 |
| `src/lib/` | API 호출, 인증, 세션 캐시, 공통 유틸 |
| `src/data/` | 프론트엔드 정적 데이터 (지도, 장학금, 과제 시드) |
| `public/` | 빌드 시 그대로 복사되는 정적 파일 |

---

## 페이지 및 라우팅

`src/Router.jsx`에 정의된 라우트입니다.

| 경로 | 페이지 | 로그인 필요 |
|------|--------|-------------|
| `/` | 대시보드 | 기능 이용 시 필요 (비로그인 시 안내 카드) |
| `/timetable` | 시간표 | 기능 이용 시 필요 |
| `/schedule` | 일정 | 기능 이용 시 필요 |
| `/assignment` | 과제 | 기능 이용 시 필요 |
| `/scholarship` | 장학금 | 기능 이용 시 필요 |
| `/mappage` | 캠퍼스맵 | 기능 이용 시 필요 |
| `/mypage` | 마이페이지 | 기능 이용 시 필요 |
| `/login` | 로그인 | 불필요 |
| `/signup` | 회원가입 | 불필요 |

### 공통 레이아웃

대부분의 페이지는 `DashboardNav` 상단 네비게이션을 공유합니다.

- 브랜드 로고 · 메뉴 링크
- 전역 검색 버튼
- 사용자 아바타 · 마이페이지 · 로그아웃

---

## 인증 및 세션

### 로그인 흐름

1. Firebase `signInWithEmailAndPassword`로 인증
2. Firebase ID 토큰을 Axios 인터셉터가 API 요청 `Authorization` 헤더에 자동 첨부
3. `GET /api/users/me`로 사용자 프로필 조회
4. `localStorage`에 `lumos_uid`, `lumos_user_info` 저장

### 회원가입 흐름

1. Firebase 계정 생성
2. `POST /api/auth/login`으로 백엔드 사용자 등록
3. 로그인과 동일하게 세션 저장

### 세션 관리

| 키 | 저장 내용 |
|----|-----------|
| `lumos_uid` | Firebase UID |
| `lumos_user_info` | 사용자 프로필 JSON |
| `lumos_dashboard_widgets` | 대시보드 위젯 캐시 |

- API 401/403 응답 또는 Firebase 인증 만료 시 `lumos:session-expired` 이벤트 발생
- `App.jsx`의 `SessionGuard`가 로그인 페이지로 리다이렉트

---

## 백엔드 API 연동

Axios 인스턴스(`src/lib/api.js`)가 모든 API 요청을 처리합니다.

### 사용자
| 메서드 | 엔드포인트 | 용도 |
|--------|------------|------|
| `GET` | `/api/users/me` | 내 정보 조회 |
| `PATCH` | `/api/users/me` | 프로필 수정 |
| `PATCH` | `/api/users/me/profile-image` | 프로필 이미지 변경 |
| `DELETE` | `/api/users/me` | 회원 탈퇴 |
| `GET` | `/api/users/me/dashboard/widgets` | 대시보드 위젯 조회 |
| `PUT` | `/api/users/me/dashboard/widgets` | 대시보드 위젯 저장 |

### 인증
| 메서드 | 엔드포인트 | 용도 |
|--------|------------|------|
| `POST` | `/api/auth/login` | 회원가입 후 백엔드 등록 |

### 일정
| 메서드 | 엔드포인트 | 용도 |
|--------|------------|------|
| `GET` | `/api/calendar/events` | 일정 목록 조회 |
| `POST` | `/api/calendar/events` | 일정 생성 |
| `PATCH` | `/api/calendar/events/:id` | 일정 수정 |
| `DELETE` | `/api/calendar/events/:id` | 일정 삭제 |
| `PATCH` | `/api/calendar/events/:id/toggle` | 완료 토글 |

### 시간표
| 메서드 | 엔드포인트 | 용도 |
|--------|------------|------|
| `GET` | `/api/semesters` | 학기 목록 |
| `PATCH` | `/api/semesters/:id` | 학기 이름 수정 |
| `PUT` | `/api/semesters/reorder` | 학기 순서 변경 |
| `GET` | `/api/semesters/:id/timetables` | 시간표 목록 |
| `POST` | `/api/semesters/:id/timetables` | 시간표 생성 |
| `PATCH` | `/api/timetables/:id` | 시간표 이름 수정 |
| `DELETE` | `/api/timetables/:id` | 시간표 삭제 |
| `PUT` | `/api/semesters/:id/timetables/reorder` | 시간표 순서 변경 |
| `GET` | `/api/semesters/:id/courses` | 수업 목록 |
| `GET` | `/api/timetables/:id/entries` | 시간표 엔트리 |
| `POST` | `/api/timetables/:id/entries` | 수업 배치 추가 |
| `DELETE` | `/api/entries/:id` | 수업 배치 삭제 |
| `GET` | `/api/courses/:id/notes` | 수업 노트 조회 |
| `POST` | `/api/courses/:id/notes` | 노트 생성 |
| `PATCH` | `/api/notes/:id` | 노트 수정 |
| `PATCH` | `/api/notes/:id/pin` | 노트 고정 |
| `DELETE` | `/api/notes/:id` | 노트 삭제 |

### 세션 캐시 전략

대시보드 초기 로딩 속도를 위해 아래 모듈이 메모리·`localStorage` 캐시를 사용합니다.

- `lib/timetable/session.js` — 시간표·오늘 수업 스냅샷
- `lib/calendar/session.js` — 일정·오늘/이번 주 일정 스냅샷
- `lib/dashboardApi.js` — 위젯 설정 캐시

`App.jsx`의 `DashboardWidgetsPrefetch`가 로그인 직후 위 데이터를 백그라운드에서 미리 불러옵니다.

---

## EDWARD 확장 프로그램 연동

학교 포털(EDWARD)에서 시간표를 자동으로 가져오는 Chrome 확장 프로그램과 연동합니다.

### 설정 방법

1. Lumos EDWARD Chrome 확장 프로그램 설치
2. `.env`에 확장 ID 설정

```env
VITE_LUMOS_EXTENSION_ID=abcdefghijklmnopabcdefghijklmnop
```

3. 마이페이지 또는 시간표 화면에서 **EDWARD 동기화** 실행

### 관련 파일

- `src/lib/edwardExtension.js` — 확장 ping, 시간표 동기화 메시지
- `src/components/MyPage/EdwardSyncModal.jsx` — 동기화 UI 모달

---

## 전역 검색

상단 네비게이션의 검색 아이콘을 클릭하면 전역 검색 모달이 열립니다.

### 검색 대상

| 카테고리 | 데이터 소스 |
|----------|-------------|
| 페이지 | 앱 내 주요 메뉴 |
| 시간표 | 시간표 세션 캐시의 수업 목록 |
| 일정 | 캘린더 세션 캐시의 이벤트 |
| 과제 | `data/assignmentTasks.js` |
| 장학금 | `data/scholarships.js` |
| 캠퍼스맵 | `data/places.js` |

### 관련 파일

- `src/components/Dashboard/GlobalSearchModal.jsx`
- `src/lib/globalSearch.js`

캠퍼스맵·일정 검색 결과 클릭 시 `?q=` 쿼리 파라미터가 전달되어 해당 페이지 검색창에 키워드가 자동 입력됩니다.

---

## 개발 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 실행 (HMR 지원) |
| `npm run build` | 프로덕션 빌드 (`dist/` 생성) |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |
| `npm run lint` | ESLint 검사 |

---

## 빌드 및 배포

### 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

### 배포 시 참고 사항

- SPA이므로 웹 서버에서 모든 경로를 `index.html`로 fallback 처리해야 합니다.
- `VITE_API_BASE_URL`, `VITE_LUMOS_EXTENSION_ID`는 **빌드 시점**에 주입되므로, 환경별로 별도 빌드가 필요합니다.
- Firebase 설정은 현재 `src/lib/firebase.js`에 직접 작성되어 있습니다. 운영 환경에서는 환경 변수 분리를 권장합니다.

---

## 로컬 스토리지 키 정리

| 키 | 설명 |
|----|------|
| `lumos_uid` | Firebase 사용자 UID |
| `lumos_user_info` | 로그인 사용자 프로필 |
| `lumos_dashboard_widgets` | 대시보드 위젯 표시 설정 캐시 |

---

## 라이선스

이 프로젝트의 라이선스는 저장소 설정을 따릅니다.
