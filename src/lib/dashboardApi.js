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

export function setCachedDashboardWidgets(widgets) {
  localStorage.setItem(
    DASHBOARD_WIDGETS_CACHE_KEY,
    JSON.stringify(widgets.map(({ id, visible }) => ({ id, visible }))),
  )
}

export function clearCachedDashboardWidgets() {
  localStorage.removeItem(DASHBOARD_WIDGETS_CACHE_KEY)
}

export async function fetchDashboardWidgets() {
  const { data } = await api.get('/api/users/me/dashboard/widgets')
  return mergeDashboardWidgets(data)
}

export async function saveDashboardWidgets(widgets) {
  const { data } = await api.put('/api/users/me/dashboard/widgets', {
    widgets: widgets.map(({ id, visible }) => ({ id, visible })),
  })
  return mergeDashboardWidgets(data)
}
