# Schedule Module

이 모듈은 FullCalendar 라이브러리를 사용하여 구현된 일정 관리 시스템의 UI 부분입니다.

## 설치 및 준비 사항

이 프로젝트에서 사용된 FullCalendar 관련 라이브러리들을 설치해야 합니다. 터미널에서 아래 명령어를 실행하세요.

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
```

## 구성 요소

현재 `src/schedule` 폴더는 다음과 같은 구조로 이루어져 있습니다:

```text
src/schedule/
├── README.md           # 모듈 설명 문서
└── components/         # 일정 관련 UI 컴포넌트
    ├── Calendar.jsx    # 메인 달력 컴포넌트
    └── Calendar.css    # 달력 전용 스타일시트
```

- **Calendar.jsx**: FullCalendar를 활용한 메인 달력 컴포넌트입니다. 월별 보기가 기본으로 설정되어 있으며, 컴팩트한 레이아웃을 위해 높이와 비율이 최적화되어 있습니다.
- **Calendar.css**: 달력 컴포넌트 전용 스타일시트입니다. 프로젝트의 테마 컬러(`--accent`, `--border` 등)를 반영하고 있으며, 토요일(파란색)과 일요일(빨간색) 색상 구분이 적용되어 있습니다.

## 레이아웃 설명

현재 메인 페이지(`App.jsx`)는 2단 그리드 레이아웃으로 구성되어 있습니다:
- **왼쪽 (1.5fr)**: `Calendar` 컴포넌트가 배치되어 있습니다.
- **오른쪽 (1fr)**: 현재는 비어있는 상태이며, 향후 다른 컴포넌트(일정 상세, 메모 등)를 추가할 수 있는 공간입니다.

---
*참고: 현재는 UI 중심의 프로토타입 단계이며, 데이터베이스 연동 및 이벤트 핸들링 로직은 제외되어 있습니다.*
