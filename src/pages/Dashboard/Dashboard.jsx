import { Link } from 'react-router-dom'
import {
  ClipboardCheck,
  GraduationCap,
  MapPinned,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { DAYS } from '../../lib/timetable/constants'
import {
  DEFAULT_DASHBOARD_WIDGETS,
  fetchDashboardWidgets,
  getCachedDashboardWidgets,
  saveDashboardWidgets,
  setCachedDashboardWidgets,
} from '../../lib/dashboardApi'
import {
  clearCalendarSession,
  ensureCalendarSession,
  getCalendarSession,
} from '../../lib/calendar/session'
import {
  clearTimetableSession,
  ensureTimetableSession,
  getTimetableSession,
} from '../../lib/timetable/session'
import { getStoredUser } from '../../lib/session'
import { useStoredUser } from '../../lib/useStoredUser'

import DashboardHeader from '../../components/Dashboard/DashboardHeader'
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard'
import DashboardNav from '../../components/Dashboard/DashboardNav'
import DashboardWidgetEditor from '../../components/Dashboard/DashboardWidgetEditor'
import ScheduleSummaryWidget from '../../components/Dashboard/ScheduleSummaryWidget'
import TodayTimetableWidget from '../../components/Dashboard/TodayTimetableWidget'

import './Dashboard.css'

const dashboardSummaries = {
  assignment: {
    Icon: ClipboardCheck,
    title: '과제',
    link: '/assignment',
    linkText: '과제 보기',
    description: '마감이 가까운 과제를 놓치지 않도록 관리하세요.',
    items: ['미완료 과제 2개', '가장 가까운 마감: 데이터베이스 ERD 설계'],
  },
  scholarship: {
    Icon: GraduationCap,
    title: '장학금',
    link: '/scholarship',
    linkText: '장학금 보기',
    description: '내 조건에 맞는 장학금 추천을 확인하세요.',
    items: ['추천 가능 장학금 3개', '프로필을 입력하면 더 정확해져요'],
  },
  'campus-map': {
    Icon: MapPinned,
    title: '캠퍼스맵',
    link: '/mappage',
    linkText: '지도 보기',
    description: '교내 시설 위치와 다음 수업 이동 경로를 확인하세요.',
    items: ['주요 시설 바로 찾기', '다음 수업까지 예상 이동 시간 확인'],
  },
}

function DashboardSummaryWidget({ summary, type, isEditing }) {
  const { Icon } = summary

  return (
    <div className={`dashboardCard summaryWidget summaryWidget-${type} ${isEditing ? 'editing' : ''}`}>
      <div className="cardHead">
        <h3 className="cardTitle">
          <Icon className="summaryIcon" size={18} strokeWidth={2.2} aria-hidden="true" />
          {summary.title}
        </h3>
        <Link to={summary.link} className="cardLink">{summary.linkText}</Link>
      </div>

      <div className="cardContent">
        <p className="summaryDescription">{summary.description}</p>
        <ul className="summaryList">
          {summary.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function renderDashboardWidget(widget, {
  DAYS,
  todayCourses,
  todayEvents,
  isEditing,
  isWeekend,
  isLoadingTodayTimetable,
  isLoadingSchedule,
}) {
  if (widget.type === 'timetable') {
    return (
      <TodayTimetableWidget
        DAYS={DAYS}
        courses={todayCourses}
        isEditing={isEditing}
        isWeekend={isWeekend}
        isLoading={isLoadingTodayTimetable}
      />
    )
  }

  if (widget.type === 'schedule') {
    return (
      <ScheduleSummaryWidget
        events={todayEvents}
        isEditing={isEditing}
        isLoading={isLoadingSchedule}
      />
    )
  }

  return (
    <DashboardSummaryWidget
      summary={dashboardSummaries[widget.type]}
      type={widget.type}
      isEditing={isEditing}
    />
  )
}

export default function Dashboard() {
  const timetableSession = getTimetableSession()
  const calendarSession = getCalendarSession()

  const [user, setUser] = useStoredUser()
  const [widgets, setWidgets] = useState(() => {
    if (!getStoredUser()) return DEFAULT_DASHBOARD_WIDGETS
    return getCachedDashboardWidgets() ?? DEFAULT_DASHBOARD_WIDGETS
  })
  const [isEditing, setIsEditing] = useState(false)
  const [todayCourses, setTodayCourses] = useState(() => timetableSession?.todayCourses ?? [])
  const [todayEvents, setTodayEvents] = useState(() => calendarSession?.todayEvents ?? [])
  const [isWeekend, setIsWeekend] = useState(() => timetableSession?.isWeekend ?? false)
  const [isLoadingTodayTimetable, setIsLoadingTodayTimetable] = useState(
    () => !!getStoredUser() && !timetableSession,
  )
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(
    () => !!getStoredUser() && !calendarSession,
  )
  const [isInitialLoading, setIsInitialLoading] = useState(
    () => !!getStoredUser() && (!timetableSession || !calendarSession),
  )
  const [dragWidgetId, setDragWidgetId] = useState(null)
  const [dragOverWidgetId, setDragOverWidgetId] = useState(null)

  useEffect(() => {
    if (!user) {
      clearTimetableSession()
      clearCalendarSession()
      setTodayCourses([])
      setTodayEvents([])
      setIsWeekend(false)
      setIsLoadingTodayTimetable(false)
      setIsLoadingSchedule(false)
      setIsInitialLoading(false)
      setWidgets(DEFAULT_DASHBOARD_WIDGETS)
      return
    }

    const cachedTimetable = getTimetableSession()
    const cachedCalendar = getCalendarSession()

    if (cachedTimetable) {
      setTodayCourses(cachedTimetable.todayCourses ?? [])
      setIsWeekend(cachedTimetable.isWeekend ?? false)
      setIsLoadingTodayTimetable(false)
    }

    if (cachedCalendar) {
      setTodayEvents(cachedCalendar.todayEvents ?? [])
      setIsLoadingSchedule(false)
    }

    if (cachedTimetable && cachedCalendar) {
      setIsInitialLoading(false)
    }

    let cancelled = false

    if (!cachedTimetable) {
      setIsInitialLoading(true)
      setIsLoadingTodayTimetable(true)
    }

    if (!cachedCalendar) {
      setIsInitialLoading(true)
      setIsLoadingSchedule(true)
    }

    const loadDashboardData = async () => {
      try {
        const [nextTimetable, nextCalendar, savedWidgets] = await Promise.all([
          cachedTimetable ? Promise.resolve(cachedTimetable) : ensureTimetableSession(),
          cachedCalendar ? Promise.resolve(cachedCalendar) : ensureCalendarSession(),
          fetchDashboardWidgets().catch(() => DEFAULT_DASHBOARD_WIDGETS),
        ])

        if (cancelled) return

        setTodayCourses(nextTimetable.todayCourses ?? [])
        setIsWeekend(nextTimetable.isWeekend ?? false)
        setTodayEvents(nextCalendar.todayEvents ?? [])
        setWidgets(savedWidgets)
        setCachedDashboardWidgets(savedWidgets)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setTodayCourses([])
          setTodayEvents([])
          setIsWeekend(false)
        }
      } finally {
        if (!cancelled) {
          setIsInitialLoading(false)
          setIsLoadingTodayTimetable(false)
          setIsLoadingSchedule(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      cancelled = true
    }
  }, [user])

  const persistWidgets = useCallback(async (nextWidgets) => {
    const previous = widgets
    setWidgets(nextWidgets)

    try {
      const saved = await saveDashboardWidgets(nextWidgets)
      setWidgets(saved)
      setCachedDashboardWidgets(saved)
    } catch (err) {
      console.error(err)
      setWidgets(previous)
    }
  }, [widgets])

  const visibleWidgets = widgets.filter((widget) => widget.visible)

  const onToggleWidget = (id) => {
    persistWidgets(widgets.map((widget) => (
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    )))
  }

  const onReorderWidgets = (fromId, toId) => {
    if (fromId === toId) return

    const fromIndex = widgets.findIndex((widget) => widget.id === fromId)
    const toIndex = widgets.findIndex((widget) => widget.id === toId)
    if (fromIndex < 0 || toIndex < 0) return

    const next = [...widgets]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    persistWidgets(next)
  }

  const clearWidgetDrag = () => {
    setDragWidgetId(null)
    setDragOverWidgetId(null)
  }

  // 로그인하지 않은 경우 로그인 요청 메시지 표시
  if (!user) {
    return (
      <div className="dashboardPage">
        <DashboardNav user={user} />
        <main className="dashboardMain">
          <div className="Dashboard">
            <DashboardHeader />
            <DashboardLoginCard />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboardPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
      <main className="dashboardMain">
        <div className="Dashboard">
          {isInitialLoading ? (
            <div className="dashboardInitialLoading" aria-live="polite" aria-busy="true">
              <span className="dashboardInitialLoadingSpinner" aria-hidden="true" />
              <span className="dashboardInitialLoadingText">로딩 중...</span>
            </div>
          ) : (
            <>
              <DashboardHeader
                isEditing={isEditing}
                onToggleEdit={() => {
                  setIsEditing(!isEditing)
                  clearWidgetDrag()
                }}
              />

              {isEditing && (
                <DashboardWidgetEditor
                  widgets={widgets}
                  onToggleWidget={onToggleWidget}
                />
              )}

              {visibleWidgets.length === 0 ? (
                <div className="emptyState">
                  <div className="emptyIcon">⚙</div>
                  <p>표시할 위젯이 없습니다. 위젯을 추가해주세요.</p>
                </div>
              ) : (
                <div className={`widgetGrid ${isEditing ? 'widgetGrid--editing' : ''}`}>
                  {visibleWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className={[
                        'widgetItem',
                        isEditing ? 'widgetItem--editable' : '',
                        dragWidgetId === widget.id ? 'dragging' : '',
                        dragOverWidgetId === widget.id && dragWidgetId !== widget.id ? 'dragOver' : '',
                      ].filter(Boolean).join(' ')}
                      draggable={isEditing}
                      onDragStart={(event) => {
                        if (!isEditing) return
                        setDragWidgetId(widget.id)
                        event.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragEnd={clearWidgetDrag}
                      onDragOver={(event) => {
                        if (!isEditing || dragWidgetId === widget.id) return
                        event.preventDefault()
                        setDragOverWidgetId(widget.id)
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (dragWidgetId && dragWidgetId !== widget.id) {
                          onReorderWidgets(dragWidgetId, widget.id)
                        }
                        clearWidgetDrag()
                      }}
                    >
                      {isEditing && (
                        <button
                          type="button"
                          className="widgetRemoveBtn"
                          // 편집 모드에서 해당 위젯 숨기기
                          onClick={() => onToggleWidget(widget.id)}
                          aria-label={`${widget.title} 숨기기`}
                        >
                          ×
                        </button>
                      )}

                      {renderDashboardWidget(widget, {
                        DAYS,
                        todayCourses,
                        todayEvents,
                        isEditing,
                        isWeekend,
                        isLoadingTodayTimetable,
                        isLoadingSchedule,
                      })}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
