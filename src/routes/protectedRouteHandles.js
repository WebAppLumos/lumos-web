export const protectedRouteHandles = {
  '/': {
    useDashboardHeader: true,
    loginMessage: '대시보드의 시간표와 맞춤 정보를 확인하려면 로그인해주세요.',
  },
  '/timetable': {
    loginTitle: '시간표 관리',
    loginSubtitle: '학기별 시간표와 수업을 관리합니다',
    loginMessage: '시간표와 수업 일정을 확인하려면 로그인해주세요.',
  },
  '/schedule': {
    loginTitle: '학사 및 개인 일정',
    loginSubtitle: '중요한 학사 일정과 나의 개인 일정을 한눈에 관리하세요',
    loginMessage: '일정과 캘린더를 확인하려면 로그인해주세요.',
  },
  '/assignment': {
    loginTitle: '과제 알림',
    loginSubtitle: '마감이 가까운 과제를 놓치지 않도록 관리하세요',
    loginMessage: '과제 목록과 마감 알림을 확인하려면 로그인해주세요.',
  },
  '/scholarship': {
    loginTitle: '장학금',
    loginSubtitle: '내 조건에 맞는 장학금 추천을 확인하세요',
    loginMessage: '장학금 추천과 맞춤 정보를 확인하려면 로그인해주세요.',
  },
  '/mappage': {
    loginTitle: '교내시설',
    loginSubtitle: '필요한 교내시설을 확인해보세요',
    loginMessage: '캠퍼스맵과 시설 정보를 확인하려면 로그인해주세요.',
  },
  '/mypage': {
    loginMessage: '마이페이지와 프로필 정보를 확인하려면 로그인해주세요.',
  },
}

const defaultHandle = {
  loginMessage: '대시보드의 시간표와 맞춤 정보를 확인하려면 로그인해주세요.',
}

export function getProtectedRouteHandle(pathname) {
  return protectedRouteHandles[pathname] ?? defaultHandle
}
