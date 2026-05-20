# Schedule Module

이 모듈은 FullCalendar 라이브러리를 사용하여 구현된 일정 관리 UI 및 인터랙션 구조입니다.

---

## 📦 설치 및 준비 사항

이 프로젝트에서 사용된 주요 라이브러리들입니다.

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction react-modal
```

---

## 📁 구성 요소

현재 `src/schedule` 폴더 구조:

```text
src/schedule/
├── README.md
├── Schedule.jsx        # 메인 컨테이너 컴포넌트
├── components/
│   ├── Calendar.jsx    # 메인 달력 컴포넌트
│   ├── Calendar.css    # 달력 스타일
│   ├── Todolist.jsx    # 할 일 리스트 UI
│   ├── Todolist.css    # Todolist 스타일
│   ├── EventModal.jsx  # 모달 컴포넌트
│   └── EventModal.css  # 모달 스타일
└── hooks/
    └── useSchedule.js  # 캘린더 상태 관리 커스텀 훅
```

---

## 🧩 기능 설명

### Schedule.jsx
- 전체 레이아웃을 관리하며 `useSchedule` 훅을 통해 상태를 제어합니다.

### hooks/useSchedule.js
- 모달의 열림/닫힘 상태를 관리합니다.
- 선택된 날짜(`selectedDate`)를 추적합니다.

### components/Calendar.jsx
- FullCalendar 기반의 달력 컴포넌트입니다.
- 날짜 클릭 시 `openModal` 함수를 호출하여 모달을 띄웁니다.

### components/EventModal.jsx
- `react-modal`을 사용한 팝업창입니다.
- 선택된 날짜를 표시하며, 제목과 내용을 입력받을 수 있는 확장성을 고려하여 설계되었습니다.

### components/Todolist.jsx
- 선택된 날짜에 따른 할 일 리스트를 표시하는 UI입니다.

---

## 🖥️ 레이아웃 설명

메인 페이지는 2단 Grid 구조입니다:

- 왼쪽 (1.5fr): `Calendar` 컴포넌트
- 오른쪽 (1fr): `Todolist` 컴포넌트
- 중앙: `EventModal` (조건부 렌더링)

---

## 🚀 현재 상태

- [x] UI 구성 및 컴포넌트 분리 완료
- [x] 레이아웃(Grid) 구성 완료
- [x] `useSchedule` 커스텀 훅 구현 (로컬 상태 관리)
- [x] 캘린더 날짜 클릭 시 모달 열기 기능 구현
- [x] 모달 내 선택 날짜 표시 기능 구현
- [x] EventModal 내 제목/내용 입력 필드 추가 완료
- [x] 로컬 상태 기반 일정 추가 / 수정 / 삭제(CRUD) 기능 구현

👉 **프론트엔드 기능 및 인터랙션이 완성된 독립적인 뼈대 상태**

---

## 🔜 다음 개발 계획

- 백엔드(API) 및 데이터베이스(DB) 연동
- 날짜별 데이터 영속성 관리 (Persistent Storage)
- UI 디테일 개선 및 사용자 피드백 반영 (애니메이션 등)
- 사용자 인증(로그인) 기능 연동 고려

---

## 📌 참고

이 프로젝트는 UI 기반으로 먼저 구조를 잡고 이후 인터랙션 및 데이터 로직을 단계적으로 추가하는 방식으로 개발됩니다.