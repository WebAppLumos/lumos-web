# Lumos Web

대학생을 위한 학습용 대시보드 웹 앱입니다. Vite + React 기반으로 인증, 대시보드, 시간표 관리 화면을 제공합니다.

**기술 스택**

- React 19
- Vite
- React Router
- Firebase Auth / Analytics
- ESLint

## 빠른 시작

요구사항: Node.js 16 이상, npm

```bash
npm install
npm run dev
```

빌드 및 미리보기:

```bash
npm run build
npm run preview
```

코드 스타일 검사:

```bash
npm run lint
```

## 라우팅

라우터는 [src/Router.jsx](src/Router.jsx)에서 관리합니다.

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | Dashboard | 메인 대시보드 |
| `/timetable` | Timetable | 시간표 관리 |
| `/login` | Signin | 로그인 |
| `/signup` | Signup | 회원가입 |

## 주요 기능

### 인증

- [src/pages/Signin/Signin.jsx](src/pages/Signin/Signin.jsx)
  - 이메일/비밀번호 로그인
  - Firebase `signInWithEmailAndPassword` 사용
  - 로그인 성공 시 `localStorage`에 `unidash_user` 저장
  - 성공 후 `/` 대시보드로 이동

- [src/pages/Signup/Signup.jsx](src/pages/Signup/Signup.jsx)
  - 이름, 이메일, 비밀번호, 학과, 학년 입력
  - 비밀번호 확인 및 최소 길이 검증
  - Firebase `createUserWithEmailAndPassword` 사용
  - 회원가입 성공 시 `localStorage`에 `unidash_user` 저장
  - 성공 후 `/` 대시보드로 이동

### 대시보드

- [src/pages/Dashboard/Dashboard.jsx](src/pages/Dashboard/Dashboard.jsx)
  - `localStorage`의 `unidash_user`를 기준으로 로그인 상태 판단
  - 비로그인 사용자는 로그인 안내 카드 표시
  - 로그인 사용자는 대시보드 위젯 표시
  - 위젯 편집 모드에서 위젯 표시/숨김 가능
  - 기본 시간표 데이터를 이용해 오늘의 시간표 위젯 표시

대시보드 컴포넌트:

- `DashboardNav` — 공통 상단 내비게이션, 로그인/회원가입/로그아웃 UI
- `DashboardHeader` — 대시보드 제목 및 위젯 편집 버튼
- `DashboardLoginCard` — 비로그인 사용자 안내 카드
- `DashboardWidgetEditor` — 위젯 표시 상태 편집
- `TodayTimetableWidget` — 오늘의 시간표 요약 카드

### 시간표

- [src/pages/Timetable/Timetable.jsx](src/pages/Timetable/Timetable.jsx)
  - `src/lib/mock-data.js`의 더미 데이터 사용
  - 학기 및 시간표 선택
  - 수업 추가 모달에서 선택한 수업을 현재 시간표에 추가
  - 시간표 그리드와 수업 카드 목록에서 수업 삭제 가능
  - `수업 정보`, `노트`, `난이도` 보기 모드 제공
  - 공통 대시보드 내비게이션 사용

## 프로젝트 구조

```text
src/
  App.jsx
  Router.jsx
  lib/
    firebase.js
    mock-data.js
  components/
    Dashboard/
    Timetable/
  pages/
    Dashboard/
    Signin/
    Signup/
    Timetable/
```

## 환경 변수 권장 사항

현재 [src/lib/firebase.js](src/lib/firebase.js)에는 Firebase 설정값이 직접 작성되어 있습니다. 추후 배포 시에는 Key를 새로 발급 받은 후 `.env.local`에 `VITE_` 접두사 환경변수를 분리해야 합니다.

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## 개발 메모

- 현재 사용자 세션은 학습용으로 `localStorage`의 `unidash_user`에 저장합니다.
- 시간표 데이터는 실제 DB가 아닌 mock 데이터 기반입니다.
- 인증은 Firebase Auth를 사용하지만 사용자 프로필 정보는 별도 DB에 저장하지 않습니다.
