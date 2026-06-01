# Hooks 및 Events 사용 현황

각 페이지와 주요 컴포넌트에서 사용된 React Hooks, Event Handler를 정리한 문서입니다.

---

## 1. Signin.jsx

### Hooks

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useNavigate` | `navigate` | 로그인 성공 후 대시보드 이동 | function |
| `useState` | `email` | 이메일 입력값 저장 | string |
| `useState` | `password` | 비밀번호 입력값 저장 | string |
| `useState` | `showPassword` | 비밀번호 표시/숨김 상태 | boolean |

### Events

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onSubmit` | form | 로그인 제출 | Firebase 로그인 호출, `unidash_user` 저장, `/` 이동 |
| `onChange` | email input | 이메일 상태 업데이트 | `setEmail(e.target.value)` |
| `onChange` | password input | 비밀번호 상태 업데이트 | `setPassword(e.target.value)` |
| `onClick` | 비밀번호 보기 버튼 | 비밀번호 표시 토글 | `setShowPassword((v) => !v)` |

---

## 2. Signup.jsx

### Hooks

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useNavigate` | `navigate` | 회원가입 성공 후 대시보드 이동 | function |
| `useState` | `name` | 이름 입력값 저장 | string |
| `useState` | `email` | 이메일 입력값 저장 | string |
| `useState` | `password` | 비밀번호 입력값 저장 | string |
| `useState` | `password2` | 비밀번호 확인 입력값 저장 | string |
| `useState` | `department` | 학과 선택값 저장 | string |
| `useState` | `grade` | 학년 선택값 저장 | string |
| `useState` | `showPw` | 비밀번호 표시/숨김 상태 | boolean |
| `useState` | `showPw2` | 비밀번호 확인 표시/숨김 상태 | boolean |
| `useState` | `hint` | 검증 메시지 저장 | string |

### Events

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onSubmit` | form | 회원가입 제출 | 비밀번호 검증, Firebase 회원가입 호출, `unidash_user` 저장, `/` 이동 |
| `onChange` | name input | 이름 상태 업데이트 | `setName(e.target.value)` |
| `onChange` | email input | 이메일 상태 업데이트 | `setEmail(e.target.value)` |
| `onChange` | department select | 학과 상태 업데이트 | `setDepartment(e.target.value)` |
| `onChange` | grade select | 학년 상태 업데이트 | `setGrade(e.target.value)` |
| `onChange` | password input | 비밀번호 상태 업데이트 | `setPassword(e.target.value)` |
| `onChange` | password2 input | 비밀번호 확인 상태 업데이트 | `setPassword2(e.target.value)` |
| `onClick` | 비밀번호 보기 버튼 | 비밀번호 표시 토글 | `setShowPw((v) => !v)` |
| `onClick` | 비밀번호 확인 보기 버튼 | 비밀번호 확인 표시 토글 | `setShowPw2((v) => !v)` |

---

## 3. Dashboard.jsx

### Hooks

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useState` | `user` | `localStorage` 기반 로그인 사용자 저장 | object \| null |
| `useState` | `widgets` | 대시보드 위젯 표시 상태 저장 | Array |
| `useState` | `isEditing` | 위젯 편집 모드 상태 | boolean |
| `useMemo` | `todayCourses` | 기본 시간표에 포함된 수업 목록 계산 | Array |

### Events

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onToggleEdit` | DashboardHeader | 위젯 편집 모드 전환 | `setIsEditing(!isEditing)` |
| `onToggleWidget` | DashboardWidgetEditor | 위젯 표시/숨김 전환 | 선택한 위젯의 `visible` 값 반전 |
| `onClick` | 위젯 삭제 버튼 | 편집 모드에서 위젯 숨김 | `onToggleWidget(widget.id)` |
| `onLogout` | DashboardNav | 로그아웃 후 사용자 상태 초기화 | `setUser(null)` |

---

## 4. DashboardNav.jsx

### Hooks

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useNavigate` | `navigate` | 로그아웃 후 대시보드 이동 | function |
| `useState` | `isDropdownOpen` | 사용자 메뉴 열림 상태 | boolean |

### Events

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onClick` | 사용자 아바타 버튼 | 사용자 메뉴 토글 | `setIsDropdownOpen(!isDropdownOpen)` |
| `onClick` | 메뉴 배경 버튼 | 사용자 메뉴 닫기 | `setIsDropdownOpen(false)` |
| `onClick` | 로그아웃 버튼 | 로그아웃 처리 | `localStorage` 제거, Firebase `signOut`, `/` 이동 |

---

## 5. Timetable.jsx

### Hooks

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useState` | `user` | `localStorage` 기반 로그인 사용자 저장 | object \| null |
| `useState` | `semesterId` | 선택된 학기 저장 | string |
| `useState` | `timetableId` | 선택된 시간표 저장 | string |
| `useState` | `view` | 보기 모드 저장 (`info`, `note`, `difficulty`) | string |
| `useState` | `entries` | 시간표-수업 매핑 데이터 저장 | Array |
| `useState` | `selectedCourseId` | 추가할 수업 ID 저장 | string |
| `useMemo` | `coursesOnBoard` | 현재 시간표에 배치된 수업 목록 계산 | Array |
| `useMemo` | `availableCourses` | 현재 시간표에 추가 가능한 수업 목록 계산 | Array |

### Events

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onChangeSemester` | 학기 select | 학기 변경 | 학기 변경 후 해당 학기의 첫 시간표 선택 |
| `onChangeTimetable` | 시간표 select | 시간표 변경 | `setTimetableId(e.target.value)` |
| `onChangeCourse` | 수업 select | 추가할 수업 선택 | `setSelectedCourseId(e.target.value)` |
| `onAddCourse` | 수업 추가 버튼 | 선택 수업을 현재 시간표에 추가 | `entries`에 새 매핑 추가 |
| `onDeleteCourse` | 삭제 버튼 | 현재 시간표에서 수업 제거 | `entries`에서 해당 매핑 제거 |
| `onLogout` | DashboardNav | 로그아웃 후 사용자 상태 초기화 | `setUser(null)` |

---

## 6. TimetableControls.jsx

### Hooks

| Hook | 상태명 | 목적 | 타입 |
|------|--------|------|------|
| `useState` | `isCourseModalOpen` | 수업 추가 모달 열림 상태 | boolean |

### Events

| Event | 위치 | 목적 | 처리 |
|-------|------|------|------|
| `onClick` | `+ 수업 추가` 버튼 | 모달 열기 | `setIsCourseModalOpen(true)` |
| `onClick` | 모달 닫기 버튼 | 모달 닫기 | `setIsCourseModalOpen(false)` |
| `onSubmit` | 모달 form | 기본 제출 방지 | `e.preventDefault()` |
| `onClick` | 모달 추가 버튼 | 수업 추가 후 모달 닫기 | `onAddCourse()`, `setIsCourseModalOpen(false)` |
| `onChange` | 학기/시간표/수업 select | 선택 상태 변경 | 부모 컴포넌트 handler 호출 |

---

## 요약

### 주요 상태 관리

- 인증 페이지는 폼 입력값과 비밀번호 표시 상태를 관리합니다.
- 대시보드는 사용자 로그인 상태, 위젯 목록, 편집 모드를 관리합니다.
- 시간표는 학기/시간표 선택값, 보기 모드, 수업 매핑 데이터를 관리합니다.

### 주요 이벤트 패턴

- 폼 제출은 `onSubmit`에서 `e.preventDefault()` 후 처리합니다.
- 입력값은 `onChange`로 즉시 상태에 반영합니다.
- UI 토글은 `onClick`과 boolean 상태로 처리합니다.
- 인증 성공/로그아웃은 `localStorage`의 `unidash_user`와 라우팅 이동을 함께 처리합니다.
