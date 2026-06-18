/** 시간표 그리드 요일 열 (월~금, UI·API 인덱스와 매핑) */
export const DAYS = ['월', '화', '수', '목', '금']

/** 1시간 단위 행 라벨 (09:00~17:00) */
export const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

/** 그리드 첫 행 시작 시각 — slotStyle 계산 기준 */
export const TIMETABLE_GRID_START_HOUR = 9

/** 시간당 그리드 행 높이(rem) — 수업 블록 top/height 계산에 사용 */
export const TIMETABLE_HOUR_HEIGHT_REM = 3.75
