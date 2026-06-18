/**
 * 대시보드 위젯 설정 API + localStorage 캐시.
 */
import api from './api'

export const DEFAULT_DASHBOARD_WIDGETS = [
  {
    id: 'today-timetable',
    title: '오늘의 시간표',
    type: 'timetable',
    visible: true,
  },
  {
    id: 'schedule',
    title: '일정',
    type: 'schedule',
    visible: true,
  },
  {
    id: 'assignment',
    title: '과제',
    type: 'assignment',
    visible: true,
  },
  {
    id: 'scholarship',
    title: '장학금',
    type: 'scholarship',
    visible: true,
  },
  {
    id: 'campus-map',
    title: '캠퍼스맵',
    type: 'campus-map',
    visible: true,
  },
]

const WIDGET_CATALOG = Object.fromEntries(
  DEFAULT_DASHBOARD_WIDGETS.map((widget) => [widget.id, widget]),
)

export const DASHBOARD_WIDGETS_CACHE_KEY = 'lumos_dashboard_widgets'

/**
 * API 응답(id, visible, sortOrder)을 프론트 위젯 카탈로그와 병합합니다.
 * @param {Array<{id: string, visible: boolean, sortOrder: number}>} apiWidgets
 */
export function mergeDashboardWidgets(apiWidgets) {
  return [...apiWidgets]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, visible }) => ({
      ...WIDGET_CATALOG[id],
      id,
      visible,
    }))
    .filter((widget) => widget.type)
}

/** localStorage 에 캐시된 위젯 설정을 읽습니다. 없거나 파싱 실패 시 null. */
export function getCachedDashboardWidgets() {
  try {
    const raw = localStorage.getItem(DASHBOARD_WIDGETS_CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null

    return mergeDashboardWidgets(parsed.map((widget, index) => ({
      id: widget.id,
      visible: widget.visible ?? true,
      sortOrder: index,
    })))
  } catch {
    return null
  }
}

/** 위젯 표시/순서를 localStorage 에 캐시합니다. */
export function setCachedDashboardWidgets(widgets) {
  localStorage.setItem(
    DASHBOARD_WIDGETS_CACHE_KEY,
    JSON.stringify(widgets.map(({ id, visible }) => ({ id, visible }))),
  )
}

/** 위젯 localStorage 캐시를 제거합니다. */
export function clearCachedDashboardWidgets() {
  localStorage.removeItem(DASHBOARD_WIDGETS_CACHE_KEY)
}

/** GET /api/users/me/dashboard/widgets — 서버에서 위젯 설정을 조회합니다. */
export async function fetchDashboardWidgets() {
  const { data } = await api.get('/api/users/me/dashboard/widgets', {
    skipSessionExpired: true,
  })
  return mergeDashboardWidgets(data)
}

/** PUT /api/users/me/dashboard/widgets — 위젯 표시/순서를 서버에 저장합니다. */
export async function saveDashboardWidgets(widgets) {
  const { data } = await api.put('/api/users/me/dashboard/widgets', {
    widgets: widgets.map(({ id, visible }) => ({ id, visible })),
  })
  return mergeDashboardWidgets(data)
}
