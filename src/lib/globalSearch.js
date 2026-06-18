/**
 * 전역 검색 인덱스·검색 로직.
 * 정적(메뉴·장학금·캠퍼스맵) + 동적(과제·시간표·일정 세션) 인덱스를 합쳐 검색합니다.
 */
import places from '../data/places'
import { allScholarships } from '../data/scholarships'
import { getStoredAssignmentTasks } from './useAssignmentTasks'
import { getCalendarSession } from './calendar/session'
import { getStoredUser } from './session'
import { getTimetableSession } from './timetable/session'

const NAV_ITEMS = [
  {
    id: 'nav-dashboard',
    title: '대시보드',
    subtitle: '맞춤 홈 화면',
    path: '/',
    category: 'page',
    keywords: ['대시보드', '홈', '메인'],
  },
  {
    id: 'nav-timetable',
    title: '시간표',
    subtitle: '수업 일정 확인',
    path: '/timetable',
    category: 'page',
    keywords: ['시간표', '수업'],
  },
  {
    id: 'nav-schedule',
    title: '일정',
    subtitle: '학사 및 개인 일정',
    path: '/schedule',
    category: 'page',
    keywords: ['일정', '캘린더', '학사'],
  },
  {
    id: 'nav-assignment',
    title: '과제',
    subtitle: '마감 과제 관리',
    path: '/assignment',
    category: 'page',
    keywords: ['과제', '숙제', '마감'],
  },
  {
    id: 'nav-scholarship',
    title: '장학금',
    subtitle: '장학금 추천',
    path: '/scholarship',
    category: 'page',
    keywords: ['장학금', '장학'],
  },
  {
    id: 'nav-map',
    title: '캠퍼스맵',
    subtitle: '교내 시설 찾기',
    path: '/mappage',
    category: 'page',
    keywords: ['캠퍼스맵', '지도', '시설', '건물'],
  },
  {
    id: 'nav-mypage',
    title: '마이페이지',
    subtitle: '프로필 및 설정',
    path: '/mypage',
    category: 'page',
    keywords: ['마이페이지', '프로필', '설정'],
  },
]

const CATEGORY_LABELS = {
  page: '페이지',
  assignment: '과제',
  scholarship: '장학금',
  place: '캠퍼스맵',
  course: '시간표',
  event: '일정',
}

const CATEGORY_ORDER = ['page', 'course', 'event', 'assignment', 'scholarship', 'place']

/** 검색어·대상 문자열을 소문자·공백 제거 후 비교용으로 정규화합니다. */
function normalize(text) {
  return String(text ?? '').toLowerCase().trim().replace(/\s+/g, '')
}

/** 정규화된 쿼리가 필드 중 하나에 포함되는지 검사합니다. */
function matchesQuery(query, ...fields) {
  const normalizedQuery = normalize(query)
  if (!normalizedQuery) return false
  return fields.some((field) => normalize(field).includes(normalizedQuery))
}

/** 공통 데이터 인덱스: 앱 메뉴·장학금·캠퍼스 시설 */
function buildStaticIndex() {
  const scholarships = allScholarships.map((scholarship) => ({
    id: `scholarship-${scholarship.id}`,
    title: scholarship.name,
    subtitle: `${scholarship.provider} · ${scholarship.amount}`,
    path: '/scholarship',
    category: 'scholarship',
    keywords: [scholarship.name, scholarship.provider, scholarship.tag, scholarship.amount],
  }))

  const mapPlaces = places.map((place) => ({
    id: `place-${place.id}`,
    title: place.name,
    subtitle: `${place.type}${place.building?.length ? ` · ${place.building.join(', ')}` : ''}`,
    path: `/mappage?q=${encodeURIComponent(place.name)}`,
    category: 'place',
    keywords: [place.name, place.type, ...(place.building ?? [])],
  }))

  return [...NAV_ITEMS, ...scholarships, ...mapPlaces]
}

/** 개인 데이터 인덱스: 과제·시간표·일정 세션 캐시 (로그인 시만) */
function buildDynamicIndex() {
  const items = []

  if (getStoredUser()) {
    for (const task of getStoredAssignmentTasks()) {
      items.push({
        id: `assignment-${task.id}`,
        title: task.title,
        subtitle: `${task.course} · 마감 ${task.deadline}`,
        path: '/assignment',
        category: 'assignment',
        keywords: [task.title, task.course, task.deadline],
      })
    }
  }

  const timetableSession = getTimetableSession()
  if (timetableSession?.courses?.length) {
    for (const course of timetableSession.courses) {
      const title = course.title ?? course.name ?? ''
      const professor = course.professor ?? ''
      const room = course.classroom ?? course.room ?? ''

      items.push({
        id: `course-${course.id}`,
        title,
        subtitle: [professor, room].filter(Boolean).join(' · '),
        path: '/timetable',
        category: 'course',
        keywords: [title, professor, room],
      })
    }
  }

  const calendarSession = getCalendarSession()
  if (calendarSession?.events?.length) {
    for (const event of calendarSession.events) {
      const title = event.title ?? ''
      const content = event.content ?? ''
      const date = String(event.date ?? '').slice(0, 10)

      items.push({
        id: `event-${event.id ?? `${title}-${date}`}`,
        title,
        subtitle: [date, content].filter(Boolean).join(' · '),
        path: `/schedule?q=${encodeURIComponent(title)}`,
        category: 'event',
        keywords: [title, content, date, event.category],
      })
    }
  }

  return items
}

/**
 * 전역 검색을 수행합니다.
 * @param {string} query
 * @param {{ limit?: number }} [options]
 * @returns {Array<{id, title, subtitle, path, category, keywords}>}
 */
export function searchGlobal(query, { limit = 20 } = {}) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) return []

  const index = [...buildStaticIndex(), ...buildDynamicIndex()]

  const results = index.filter((item) => matchesQuery(trimmedQuery, ...item.keywords, item.title, item.subtitle))

  return results.slice(0, limit)
}

/**
 * 검색 결과를 카테고리별 그룹으로 묶어 UI 표시 순서에 맞게 반환합니다.
 * @param {Array} results
 */
export function groupSearchResults(results) {
  const groups = new Map()

  for (const result of results) {
    const category = result.category
    if (!groups.has(category)) {
      groups.set(category, [])
    }
    groups.get(category).push(result)
  }

  return CATEGORY_ORDER
    .filter((category) => groups.has(category))
    .map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: groups.get(category),
    }))
}
