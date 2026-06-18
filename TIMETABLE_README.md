# 시간표 · 학사 연동

Lumos Web의 **시간표** 화면과 **EDWARD/CTL 학사 연동** 기능 문서입니다.

---

## 개요

시간표는 백엔드 API와 PostgreSQL에 저장된 **개인 데이터**를 사용합니다. 초기 개발 단계의 `mock-data.js` 더미 데이터는 제거되었으며, 모든 학기·수업·배치·노트는 API를 통해 관리합니다.

학교 포털 데이터는 **Lumos Sync Chrome 확장**이 수집하고, 백엔드 `sync` 모듈이 파싱·저장합니다.

---

## 시간표 화면 (`/timetable`)

### 주요 기능

- 학기 탭 선택 및 순서 변경
- 시간표 탭 생성·이름 수정·삭제·순서 변경
- 주간 그리드에 수업 배치 표시
- 수업 추가/삭제, 노트 작성·고정, 난이도(1~5) 설정
- 온라인 수업·학점 정보 표시
- `수업 정보` / `노트` / `난이도` 보기 모드 전환

### 관련 파일

| 파일 | 역할 |
|------|------|
| `src/pages/Timetable/Timetable.jsx` | 시간표 페이지 진입점 |
| `src/components/Timetable/*` | 그리드, 수업 목록, 컨트롤, 모달 |
| `src/lib/timetable/api.js` | 학기·시간표·수업·노트·엔트리 API |
| `src/lib/timetable/session.js` | 세션 캐시 (대시보드·전역 검색 공유) |
| `src/lib/timetable/constants.js` | 그리드 시간 상수 |

### API 연동

| 동작 | 메서드 | 엔드포인트 |
|------|--------|------------|
| 학기 목록 | GET | `/api/semesters` |
| 학기 순서 변경 | PUT | `/api/semesters/reorder` |
| 시간표 목록 | GET | `/api/semesters/{id}/timetables` |
| 시간표 생성 | POST | `/api/semesters/{id}/timetables` |
| 수업 목록 | GET | `/api/semesters/{id}/courses` |
| 엔트리 목록 | GET | `/api/timetables/{id}/entries` |
| 수업 배치 추가 | POST | `/api/timetables/{id}/entries` |
| 노트 CRUD | * | `/api/courses/{id}/notes`, `/api/notes/{id}` |

상세 스펙은 [`lumos-api` 도메인 README](../lumos-api/README.md)를 참고하세요.

### 세션 캐시

`lib/timetable/session.js`는 로그인 직후 `App.jsx`의 프리페치로 시간표 스냅샷을 저장합니다. 대시보드 **오늘의 시간표** 위젯과 **전역 검색**의 수업 카테고리가 이 캐시를 사용합니다.

---

## 학사 연동 (EDWARD · CTL)

### 동기화 흐름

```text
1. 사용자: 마이페이지 → 학사 정보 동기화
2. lumos-web: Firebase ID 토큰 + 옵션을 Chrome 확장에 전달
3. lumos-extension: portal.kmu.ac.kr SSO로 EDWARD/CTL 데이터 수집
4. lumos-extension → lumos-api: import API 호출
5. lumos-api: 파싱 후 DB 저장 (users, semesters, courses, entries, grades, assignments)
6. lumos-web: 세션 캐시 갱신 후 UI 반영
```

### 동기화 항목

| UI 라벨 | 확장 키 | 백엔드 API | 저장 대상 |
|---------|---------|------------|-----------|
| 학적 정보 | `profile` | `POST /api/sync/profile/import` | 학번, 학년, 전공(학부/과) |
| 시간표 | `timetable` | `POST /api/sync/timetable/import` | 학기, 수업, 시간표, 엔트리 |
| 성적 정보 | `grades` | `POST /api/sync/grades/import` | 학기별 GPA, 이수학점, 학사경고 |
| CTL 과제 | `assignments` | `POST /api/sync/assignments/import` | 진행 중·미제출 과제 |

### 관련 파일

| 파일 | 역할 |
|------|------|
| `src/components/MyPage/EdwardSyncModal.jsx` | 동기화 UI (학년도·학기·항목 선택) |
| `src/lib/edwardExtension.js` | 확장 ping, 메시지 전송 |
| `lumos-extension/lib/edwardSync.js` | EDWARD SSV/MML 수집 |
| `lumos-extension/lib/ctlSync.js` | CTL 과제 수집 |
| `lumos-api/.../sync/` | 파서·서비스·import 컨트롤러 |

### 선행 조건

1. Lumos에 로그인
2. **Lumos Sync** Chrome 확장 설치 (개발자 모드 unpacked)
3. 동일 브라우저에서 `portal.kmu.ac.kr` SSO 로그인 유지

확장 ID: `mjbkpdkmolfjmkfaollkpnjfhejnahop` (manifest `key`로 고정)

### EDWARD 시간표 파싱

1. **수강신청확인 SSV** — 정확한 강의 시간
2. **수강신청확인서 MML** — 학점 보강
3. SSV 실패 시 MML 확인서로 fallback (`ConfirmationMmlParser`)

동기화된 시간표는 `"EDWARD 동기화"` 이름의 시간표 탭에 반영됩니다.

---

## 마이페이지 연동 정보

마이페이지(`/mypage`)에서 학사 연동 결과를 확인할 수 있습니다.

| 영역 | 데이터 소스 |
|------|-------------|
| 학번·학년·전공 | `GET /api/users/me` (EDWARD profile sync 후 갱신) |
| 신청 학점 (활성 학기) | 활성 학기 수업 `credit` 합산 |
| 성적 요약 | `GET /api/users/me/semester-grades` |
| 학사 동기화 버튼 | `EdwardSyncModal` |

---

## 대시보드 연동

- **오늘의 시간표** 위젯: `lib/timetable/session.js`의 오늘 수업 스냅샷
- EDWARD 동기화 시간표가 있으면 해당 시간표를 우선 표시 (`pickDashboardTimetable`)

---

## 데이터 정책

- **개인 데이터** (시간표, 성적, 프로필): 백엔드 API + DB. 프론트엔드 목데이터 미사용.
- **공통 데이터** (장학금, 캠퍼스 시설, 자격증 마스터): `src/data/` 정적 파일 유지.

---

## 추가 문서

- [lumos-web/README.md](README.md) — 프론트엔드 전체
- [lumos-extension/README.md](../lumos-extension/README.md) — 확장 설치·배포
- [lumos-api/sync/README.md](../lumos-api/src/main/java/com/group4/lumos_api/sync/README.md) — 동기화 API 상세
