# Lumos Web — 프런트엔드

Lumos 프로토타입용 경량 학생 지원 포털 SPA(Single Page Application)입니다. 현재 목데이터를 사용하며, 백엔드 API 연결은 추후 예정입니다.

## 기술 스택

| 항목 | 기술 |
|------|------|
| **프레임워크** | React 18+ |
| **번들러** | Vite |
| **라우팅** | React Router DOM (v6, JSX 기반) |
| **스타일링** | CSS Modules |
| **상태 관리** | React Context API (인증) |
| **데이터** | 목데이터 (Mock Data) |

## 주요 특징

- **프로토타입 단계**: 실제 백엔드 API 없이 목데이터로 동작
- **경량 구조**: 최소한의 의존성, 빠른 개발 속도
- **컴포넌트 범위 스타일**: CSS Modules로 스타일 격리
- **인증 시스템**: `AuthContext`를 통한 간단한 회원가입/로그인 // 추후 수정 예정
- **다중 페이지**: Dashboard, Diary, Scholarships, Timetable 등 구성

## 빠른 시작

### 필수사항
- Node.js v18+ 이상
- npm 또는 pnpm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (기본 포트: http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 프로젝트 구조

```
src/
├── main.jsx              # React 진입점
├── App.jsx               # 최상위 컴포넌트 + 라우터 정의
├── index.css             # 전역 스타일
├── store.js              # 전역 상태 (필요시 확장)
├── routes.jsx            # 레거시 라우터 (참고용)
├── contexts/
│   └── AuthContext.jsx   # 인증 제공자 (signup, login, logout)
├── pages/
│   ├── Root.jsx          # 레이아웃 래퍼
│   ├── Login.jsx         # 로그인 페이지
│   ├── Signup.jsx        # 회원가입 페이지
│   ├── Dashboard.jsx     # 대시보드
│   ├── Diary.jsx         # 일지
│   ├── Scholarships.jsx  # 장학금
│   ├── TimetableView.jsx # 시간표
│   └── [각 페이지].module.css  # 페이지별 스타일
└── assets/              # 이미지, 폰트 등
```

## Router (라우팅)

**사용 라이브러리**: `react-router-dom` (v6+, JSX 기반)

라우트는 [src/App.jsx](src/App.jsx)에 정의되어 있으며, `BrowserRouter` + `Routes` + `Route` 구조를 사용합니다.

```jsx
// src/App.jsx 예시
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Root />}>
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="dashboard" element={<Dashboard />} />
      {/* 기타 라우트 */}
    </Route>
  </Routes>
</BrowserRouter>
```

## CSS 구조

**사용 기술**: CSS Modules

- 각 페이지는 `*.module.css` 파일을 가지며, 해당 페이지에서 import하여 사용합니다.
- 클래스명이 자동으로 고유하게 변환되어 스타일 충돌을 방지합니다.
- 전역 스타일은 [src/index.css](src/index.css)에서 관리합니다.

```jsx
// 예: Dashboard.jsx
import styles from './Dashboard.module.css';

export default function Dashboard() {
  return <div className={styles.container}>...</div>;
}
```

## 인증 시스템

[src/contexts/AuthContext.jsx](src/contexts/AuthContext.jsx)에서 제공하는 `AuthProvider`를 통해 회원가입, 로그인, 로그아웃을 관리합니다.

- **signup(email, password)** — 회원가입
- **login(email, password)** — 로그인
- **logout()** — 로그아웃
- **user** — 현재 로그인한 사용자 정보

현재는 로컬 메모리에 사용자 정보를 저장하며, 백엔드 API 연결 시 업데이트할 예정입니다.

## 목데이터 및 백엔드 연결 계획

**현재 상태**:
- 모든 데이터는 목데이터(Mock Data)입니다.
- 실제 백엔드 서버와의 API 연결은 아직 구현되지 않았습니다.

**향후 계획**:
- 백엔드 API가 준비되면, 해당 엔드포인트를 `fetch` 또는 `axios`를 통해 호출하도록 변경합니다.
- 환경 변수(`.env`)를 통해 백엔드 URL을 관리할 예정입니다.

**참고 사항**:
- Web UI/UX의 변경 사항이 있을 경우 자유롭게 말해주세요. 임시 UI입니다.
- 아직 개발 중인 Branch입니다. 