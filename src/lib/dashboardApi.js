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
