# Lumos Web

간단한 대학 생활 대시보드. Vite + React 기반으로, 학기별 시간표를 보고 간단한 인증(학습용 Firebase Auth) 흐름을 포함한다.

**변경 포인트:** 개발 편의상 일부 설정이 파일에 하드코딩되어 있으니 실제로 배포하거나 개발할 때는 환경변수(`VITE_` 접두사)를 사용하도록 `src/lib/firebase.js`를 수정해야 한다. 참고: [src/lib/firebase.js](src/lib/firebase.js)

**기술 스택**

- React 19 (UI)
- Vite (번들 및 개발 서버)
- Firebase (Auth, Analytics) — 현재는 `firebase` 패키지 사용
- ESLint (코드 품질 검사용)

## 빠른 시작 (개발 환경)

요구사항: Node.js 16 이상(권장), npm

설치 및 개발 서버 실행:

```bash
npm install
npm run dev
```

빌드 및 미리보기:

```bash
npm run build
npm run preview
```

코드 스타일 검사(로컬):

```bash
npm run lint
```

## 환경 변수(권장)

현재 [src/lib/firebase.js](src/lib/firebase.js)에는 샘플 값이 하드코딩되어 있다. 
배포 전 키를 재생성하여 다음 `VITE_` 접두사 환경변수를 사용해 분리해야 한다.

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

프로젝트 루트에 `.env` 파일을 만들어 값을 넣으면 `vite`가 자동으로 로드한다. (예: `.env.local`). 
Windows PowerShell에서도 동일하게 작동한다.

## 프로젝트 구조(주요 파일)

- `src/App.jsx` — 현재 페이지를 선택해서 렌더링합니다.
- `src/main.jsx` — 앱 진입점
- `src/lib/firebase.js` — Firebase 초기화 (학습용: 현재는 하드코딩)
- `src/lib/mock-data.js` — 시간표/과목 더미 데이터
- `src/pages/Signin/Signin.jsx` — 로그인 UI 및 로직
- `src/pages/Signup/Signup.jsx` — 회원가입 UI 및 로직
- `src/pages/Timetable/Timetable.jsx` — 시간표 UI 및 상호작용

자세한 파일 위치는 폴더를 참고하세요: [src/pages](src/pages)

## Pages & Flow

아래는 각 페이지의 현재 작동 방식과 흐름(구현된 동작 기반)입니다.

- **Signin** (`src/pages/Signin/Signin.jsx`)
  - 입력: 이메일, 비밀번호
  - 검증: HTML `required` 속성으로 기본 검증
  - 호출: `signInWithEmailAndPassword(auth, email, password)` (Firebase Auth)
  - 결과: 성공 시 `window.alert("로그인 성공!")`, 실패 시 에러 알림
  - 비고: 현재는 로그인 후 리다이렉트나 사용자 상태 저장 로직이 구현되어 있지 않습니다.

- **Signup** (`src/pages/Signup/Signup.jsx`)
  - 입력: 이름, 이메일, 비밀번호, 비밀번호 확인, 학과, 학년
  - 검증: 비밀번호 일치 여부 및 길이(최소 6자) 간단 검증
  - 호출: `createUserWithEmailAndPassword(auth, email, password)` (Firebase Auth)
  - 결과: 현재는 `then/catch` 후속 처리(알림/리다이렉트)가 추가되어 있지 않으므로 추후 필요에 따라 확장.

- **Timetable** (`src/pages/Timetable/Timetable.jsx`)
  - 데이터 소스: `src/lib/mock-data.js`의 더미 데이터
  - 주요 UI: 학기 선택, 시간표 선택, `+ 수업 추가` 버튼(현재 UI만 존재)
  - 표시 모드: `수업 정보`, `노트`, `난이도` 탭으로 블록 내용 전환
  - 시간 계산: `timeToNumber()`로 시간 문자열을 숫자로 변환해 블록 위치/높이를 계산
  - 상호작용: 학기를 변경하면 해당 학기의 첫 번째 시간표로 자동 선택됨.

## 주의 및 개선 제안

- `src/lib/firebase.js`의 하드코딩된 키는 배포 시 재생성하여 `.env`로 이동. (보안 및 협업 대비)
- `Signin`/`Signup` UX 개선 목적으로 컴포넌트에 인증 후 처리(사용자 상태 저장, 리다이렉트, 에러 상세 표시)를 추가 예정.
- `+ 수업 추가` 버튼은 현재 기능은 미구현 상태. 추후 구현 예정.

## 기여/개발 팁

- 로컬에서 빠르게 특정 페이지만 보려면 `src/App.jsx`에서 import를 변경하여 페이지를 로드해야 한다.

```jsx
// src/App.jsx
import Page from './pages/Timetable/Timetable.jsx'
// import Page from './pages/Signin/Signin.jsx'
// import Page from './pages/Signup/Signup.jsx'

export default function App() {
  return <Page />
}
```

- ESLint: `npm run lint`로 ESLint를 사용할 수 있다.

---