# Schedule Module

이 모듈은 FullCalendar 라이브러리를 사용하여 구현된 일정 관리 UI 구조입니다.

---

## 📦 설치 및 준비 사항

이 프로젝트에서 사용된 FullCalendar 관련 라이브러리들을 설치해야 합니다.

npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction

---

## 📁 구성 요소

현재 src/schedule 폴더 구조:

```text
src/schedule/
├── README.md
└── components/
    ├── Calendar.jsx      # 메인 달력 컴포넌트
    ├── Calendar.css      # 달력 스타일
    ├── TodoList.jsx      # 할 일 리스트 UI
    ├── TodoList.css      # TodoList 스타일
    └── EventModal.jsx    # 모달 컴포넌트 (UI만 존재)
```

---

## 🧩 컴포넌트 설명

### Calendar.jsx
FullCalendar 기반의 달력 컴포넌트입니다.

- 월별 달력 UI 구현
- 기본 헤더 및 스타일 설정
- 이벤트 기능은 아직 미구현

---

### TodoList.jsx
할 일 리스트를 표시하는 컴포넌트입니다.

- 정적 리스트 UI 구현
- 체크/추가/삭제 기능은 미구현
- 데이터 연동 없음

---

### EventModal.jsx
날짜 선택 시 사용할 모달 컴포넌트입니다.

- 모달 UI만 구현됨
- 열기/닫기 및 데이터 연동 기능 미구현

---

## 🖥️ 레이아웃 설명

메인 페이지(App.jsx)는 2단 Grid 구조입니다:

- 왼쪽 (1.5fr)
  → Calendar 컴포넌트

- 오른쪽 (1fr)
  → TodoList 컴포넌트

EventModal은 현재 UI만 존재하며 실제 동작은 연결되지 않은 상태입니다.

---

## 🚀 현재 상태

현재 프로젝트는 다음 단계입니다:

- UI 구성 완료
- 컴포넌트 분리 완료
- 레이아웃(Grid) 구성 완료

👉 **UI만 완성된 초기 상태**

---

## 🔜 다음 개발 계획

- 캘린더 날짜 클릭 이벤트 구현
- EventModal open/close 기능 구현
- Todo 데이터 상태 관리 추가
- 날짜별 Todo 연결
- Todo 추가 / 삭제 기능 구현
- 상태 관리 구조 개선 (useState 기반 → 확장 예정)

---

## 📌 참고

이 프로젝트는 UI 기반으로 먼저 구조를 잡고  
이후 인터랙션 및 데이터 로직을 단계적으로 추가하는 방식으로 개발됩니다.