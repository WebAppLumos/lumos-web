import api from '../api'

export function getWeekRange(referenceDate = new Date()) {
  const now = new Date(referenceDate)
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export function getTodayDateString(referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0')
  const day = String(referenceDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function normalizeEventDate(date) {
  if (!date) return ''
  return String(date).slice(0, 10)
}

export function getTodayEvents(events, referenceDate = new Date()) {
  const today = getTodayDateString(referenceDate)
  return events.filter((event) => normalizeEventDate(event.date) === today)
}

export function getWeekEvents(events, referenceDate = new Date()) {
  const { start, end } = getWeekRange(referenceDate)

  return events
    .filter((event) => {
      const itemDate = new Date(normalizeEventDate(event.date))
      return itemDate >= start && itemDate <= end
    })
    .sort((a, b) => {
      const dateCompare = new Date(a.date) - new Date(b.date)
      if (dateCompare !== 0) return dateCompare

      const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 }
      return (weights[b.priority] ?? 0) - (weights[a.priority] ?? 0)
    })
}

export function filterCalendarEvents(events, { keyword = '', category = '' } = {}) {
  const trimmedKeyword = keyword.trim()

  return events.filter((event) => {
    if (category && event.category !== category) return false

    if (trimmedKeyword) {
      const haystack = `${event.title ?? ''} ${event.content ?? ''}`
      if (!haystack.includes(trimmedKeyword)) return false
    }

    return true
  })
}

export function buildCalendarSessionSnapshot(events) {
  const todayEvents = getTodayEvents(events)
  const weekEvents = getWeekEvents(events)

  return {
    events,
    todayEvents,
    todayCount: todayEvents.length,
    weekEvents,
    weekCount: weekEvents.length,
  }
}

export async function fetchCalendarEvents(params = {}) {
  const userId = localStorage.getItem('lumos_uid')
  if (!userId) return []

  const { data } = await api.get('/api/calendar/events', {
    params: { userId, ...params },
  })

  return data || []
}

export async function fetchInitialCalendarSession() {
  const events = await fetchCalendarEvents()
  return buildCalendarSessionSnapshot(events)
}
