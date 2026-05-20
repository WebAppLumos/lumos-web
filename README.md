# Lumos Web - Schedule Management

Lumos Web은 React와 Vite를 기반으로 한 개인 일정 관리 애플리케이션입니다.

## 🛠️ 기술 스택

- **Frontend**: React 19, Vite
- **Libraries**: FullCalendar, React-Modal
- **Styling**: Vanilla CSS

## 📋 주요 기능

- **월별 캘린더**: FullCalendar를 이용한 직관적인 일정 확인
- **인터랙티브 모달**: 날짜 클릭 시 해당 날짜의 일정을 추가, 수정, 삭제할 수 있는 기능 제공
- **로컬 상태 관리**: 백엔드 연동 전, React State를 활용한 독립적인 데이터 CRUD 구현
- **투두 리스트**: 선택된 날짜의 할 일 목록 확인 및 관리 (개발 중)

## 🚀 시작하기

### 설치

```bash
npm install
```

### 실행

```bash
npm run dev
```

## 📂 프로젝트 구조

```text
src/
├── schedule/          # 일정 관리 모듈 (핵심 로직)
│   ├── components/    # UI 컴포넌트
│   ├── hooks/         # 커스텀 훅 (상태 관리)
│   └── Schedule.jsx   # 모달/캘린더 통합 컨테이너
└── App.jsx            # 메인 엔트리
```

자세한 내용은 [src/schedule/README.md](./src/schedule/README.md)를 참고하세요.
