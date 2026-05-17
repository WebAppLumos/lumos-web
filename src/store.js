export const mockWidgets = [
  { id: 'w1', title: '오늘의 시간표', visible: true, type: 'timetable' },
  { id: 'w2', title: '맞춤 장학금 큐레이션', visible: true, type: 'scholarship' },
  { id: 'w3', title: '다가오는 일정', visible: true, type: 'schedule' },
  { id: 'w4', title: '최근 다이어리', visible: true, type: 'diary' },
];

export const mockScholarships = [
  { id: 's1', title: '2024년 1학기 국가장학금 2유형', organization: '한국장학재단', amount: '등록금 전액', deadline: '2024-04-15', tags: ['성적우수', '소득연계'], matchRate: 95 },
  { id: 's2', title: '미래인재육성 IT 특기자 장학금', organization: 'SW미래재단', amount: '2,000,000원', deadline: '2024-04-30', tags: ['IT/컴퓨터', '대외활동'], matchRate: 88 },
  { id: 's3', title: '지역인재 희망 장학금', organization: '서울특별시', amount: '1,500,000원', deadline: '2024-05-10', tags: ['지역거주', '생활비'], matchRate: 75 },
];

export const mockSchedules = [
  { id: 'sc1', title: '중간고사 기간', date: '2024-04-20', type: 'academic' },
  { id: 'sc2', title: '동아리 MT', date: '2024-05-01', type: 'club' },
  { id: 'sc3', title: '수강취소 마감', date: '2024-04-15', type: 'academic' },
];

export const mockDiaries = [
  { id: 'd1', date: '2024-04-10', title: '운영체제 과제 제출 완료!', content: '드디어 밤샘 과제가 끝났다. 이번 과제는 생각보다 포인터 개념이 많이 들어가서 어려웠지만 뿌듯하다.', mood: 'happy' },
  { id: 'd2', date: '2024-04-08', title: '장학금 신청 준비', content: '필요한 서류(주민등록등본, 성적증명서)를 다 발급받았다. 내일 꼭 제출해야지.', mood: 'normal' },
];

export const mockTodayClasses = [
  { id: 'c1', name: '운영체제', time: '09:00 - 10:30', room: '공학관 101호' },
  { id: 'c2', name: '데이터베이스', time: '13:00 - 14:30', room: '공학관 202호' },
];
