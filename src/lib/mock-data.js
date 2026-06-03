// 시간표 화면용 더미 데이터
// (학습용: API/DB 대신 여기 데이터로 화면만 그립니다.)

export const mockSemesters = [
  {
    id: 'sem-1',
    name: '2024년 1학기',
    isActive: true,
  },
  {
    id: 'sem-2',
    name: '2023년 2학기',
    isActive: false,
  },
]

export const mockCourses = [
  {
    id: 'course-1',
    semesterId: 'sem-1',
    name: '운영체제',
    professor: '김교수',
    room: '공학관 101호',
    color: '#6366f1',
    difficulty: 4,
    note: '중간고사 범위: 1~5장, 기말고사 범위: 6~10장.',
    schedules: [
      { day: 0, startTime: '09:00', endTime: '10:30' },
      { day: 2, startTime: '09:00', endTime: '10:30' },
    ],
  },
  {
    id: 'course-2',
    semesterId: 'sem-1',
    name: '데이터베이스',
    professor: '이교수',
    room: '공학관 202호',
    color: '#10b981',
    difficulty: 3,
    note: 'SQL 실습 노트북 필수.',
    schedules: [
      { day: 1, startTime: '13:00', endTime: '14:30' },
      { day: 3, startTime: '13:00', endTime: '14:30' },
    ],
  },
  {
    id: 'course-3',
    semesterId: 'sem-1',
    name: '알고리즘',
    professor: '박교수',
    room: '공학관 301호',
    color: '#f59e0b',
    difficulty: 5,
    note: '매주 코딩테스트.',
    schedules: [
      { day: 0, startTime: '13:00', endTime: '14:30' },
      { day: 2, startTime: '13:00', endTime: '14:30' },
    ],
  },
  {
    id: 'course-4',
    semesterId: 'sem-1',
    name: '컴퓨터네트워크',
    professor: '최교수',
    room: '공학관 401호',
    color: '#ec4899',
    difficulty: 3,
    note: 'Wireshark 설치.',
    schedules: [
      { day: 1, startTime: '09:00', endTime: '10:30' },
      { day: 3, startTime: '09:00', endTime: '10:30' },
    ],
  },
  {
    id: 'course-5',
    semesterId: 'sem-1',
    name: '소프트웨어공학',
    professor: '정교수',
    room: '공학관 501호',
    color: '#8b5cf6',
    difficulty: 2,
    note: '팀 프로젝트.',
    schedules: [{ day: 4, startTime: '10:00', endTime: '12:00' }],
  },
]

// 시간표 목록
export const mockTimetables = [
  { id: 'tt-1', semesterId: 'sem-1', name: '기본 시간표', isDefault: true },
  { id: 'tt-2', semesterId: 'sem-1', name: '대체 시간표', isDefault: false },
]

// 시간표에 어떤 수업이 들어갔는지(매핑)
export const mockTimetableEntries = [
  { timetableId: 'tt-1', courseId: 'course-1' },
  { timetableId: 'tt-1', courseId: 'course-2' },
  { timetableId: 'tt-1', courseId: 'course-3' },
  { timetableId: 'tt-1', courseId: 'course-4' },
  { timetableId: 'tt-1', courseId: 'course-5' },
]

// 요일/시간 라벨
export const DAYS = ['월', '화', '수', '목', '금']

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

// 회원가입 화면에서 보여줄 학과 리스트(샘플)
export const DEPARTMENTS = [
  '컴퓨터공학과',
  '소프트웨어학과',
  '전자공학과',
  '기계공학과',
  '경영학과',
]
