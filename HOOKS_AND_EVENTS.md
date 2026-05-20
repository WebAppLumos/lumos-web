# Hooks 및 Events 사용 현황

각 컴포넌트에서 사용된 React Hooks와 Event Handlers를 정리한 문서입니다.

---

## 1. Signin.jsx (로그인 페이지)

### Hooks 사용

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useState` | `email` | 이메일 입력값 저장 | string |
| `useState` | `password` | 비밀번호 입력값 저장 | string |
| `useState` | `showPassword` | 비밀번호 표시/숨김 토글 상태 | boolean |

### Events 사용

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onSubmit` | form 요소 | 로그인 폼 제출 | Firebase `signInWithEmailAndPassword()` 호출 및 성공/실패 알림 |
| `onChange` | email input | 이메일 입력값 업데이트 | `setEmail(e.target.value)` |
| `onChange` | password input | 비밀번호 입력값 업데이트 | `setPassword(e.target.value)` |
| `onClick` | 비밀번호 보기 버튼 | 비밀번호 표시 토글 | `setShowPassword((v) => !v)` |

---

## 2. Signup.jsx (회원가입 페이지)

### Hooks 사용

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useState` | `name` | 사용자 이름 입력값 저장 | string |
| `useState` | `email` | 이메일 입력값 저장 | string |
| `useState` | `password` | 비밀번호 입력값 저장 | string |
| `useState` | `password2` | 비밀번호 확인 입력값 저장 | string |
| `useState` | `department` | 선택된 학과 저장 | string |
| `useState` | `grade` | 선택된 학년 저장 | string |
| `useState` | `showPw` | 비밀번호 표시 토글 | boolean |
| `useState` | `showPw2` | 비밀번호 확인 표시 토글 | boolean |
| `useState` | `hint` | 입력 검증 오류 메시지 표시 | string |

### Events 사용

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onSubmit` | form 요소 | 회원가입 폼 제출 | 비밀번호 일치/길이 검증 후 Firebase `createUserWithEmailAndPassword()` 호출 |
| `onChange` | name input | 이름 입력값 업데이트 | `setName(e.target.value)` |
| `onChange` | email input | 이메일 입력값 업데이트 | `setEmail(e.target.value)` |
| `onChange` | department select | 학과 선택 업데이트 | `setDepartment(e.target.value)` |
| `onChange` | grade select | 학년 선택 업데이트 | `setGrade(e.target.value)` |
| `onChange` | password input | 비밀번호 입력값 업데이트 | `setPassword(e.target.value)` |
| `onChange` | password2 input | 비밀번호 확인 입력값 업데이트 | `setPassword2(e.target.value)` |

---

## 3. Timetable.jsx (시간표 & 일정 관리)

### Hooks 사용

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useState` | `semesterId` | 선택된 학기 저장 (초기값: 현재 학기) | string |
| `useState` | `timetableId` | 선택된 시간표 저장 (초기값: 첫 번째 시간표) | string |
| `useState` | `view` | 뷰 모드 설정 ('info', 'note', 'difficulty') | string |
| `useMemo` | `coursesOnBoard` | 현재 시간표에 배치된 수업 목록 필터링 (의존성: `semesterId`, `timetableId`) | Array |

**useMemo 상세:**
- **목적**: `semesterId`와 `timetableId` 변경 시에만 재계산하여 불필요한 필터링 연산 방지
- **로직**: mockTimetableEntries에서 일치하는 courseId를 찾아 mockCourses 필터링

### Events 사용

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onChange` | 학기 select | 학기 변경 | `setSemesterId()`로 상태 업데이트 + 해당 학기의 첫 시간표로 자동 선택 |
| `onChange` | 시간표 select | 시간표 변경 | `setTimetableId(e.target.value)` |
| `onClick` | 탭 버튼 ('info' / 'note' / 'difficulty') | 뷰 모드 전환 | `setView('info')` / `setView('note')` / `setView('difficulty')` |
| `onClick` | "+ 수업 추가" 버튼 | 수업 추가 모달/페이지 열기 | (구현 예정) |

---

## 요약

### Hooks 분류

**상태 관리 (State):**
- Signin: 3개 (입력값 2개, UI상태 1개)
- Signup: 9개 (입력값 6개, UI상태 3개)
- Timetable: 3개 (선택값 2개, 뷰상태 1개)

**성능 최적화:**
- Timetable에서만 `useMemo` 사용
- 목적: 복잡한 필터링 연산의 중복 실행 방지

### Events 패턴

- **폼 입력**: `onChange` 이벤트로 즉시 상태 업데이트
- **폼 제출**: `onSubmit` 이벤트로 기본 동작 방지(`e.preventDefault()`) 후 비즈니스 로직 실행
- **사용자 상호작용**: `onClick`으로 UI 상태(토글, 탭 전환) 변경
- **선택 변경**: `onChange`로 선택된 값 업데이트 + 연관 상태 자동 갱신 (학기 변경 시 시간표 자동 선택)
