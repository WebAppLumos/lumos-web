import { Link } from 'react-router-dom'
import {
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
import { useAssignmentTasks } from '../../lib/useAssignmentTasks'
import { useAuth } from '../../app/providers/AuthProvider'
import { useScholarship } from '../../app/providers/ScholarshipProvider'

import DashboardHeader from '../../components/Dashboard/DashboardHeader'
import AssignmentSummaryWidget from '../../components/Dashboard/AssignmentSummaryWidget'
import DashboardWidgetEditor from '../../components/Dashboard/DashboardWidgetEditor'
import ScheduleSummaryWidget from '../../components/Dashboard/ScheduleSummaryWidget'
import ScholarshipSummaryWidget from '../../components/Dashboard/ScholarshipSummaryWidget'
import TodayTimetableWidget from '../../components/Dashboard/TodayTimetableWidget'

import './Dashboard.css'

const dashboardSummaries = {
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
  const Icon = summary.Icon

  return (
    <div className={`dashboardCard summaryWidget summaryWidget-${type} ${isEditing ? 'editing' : ''}`}>
      <div className="cardHead">
        <h3 className="cardTitle">
          {Icon ? (
            <Icon className="summaryIcon" size={18} strokeWidth={2.2} aria-hidden="true" />
          ) : null}
          {summary.title}
        </h3>
        <Link to={summary.link} className="cardLink">{summary.linkText}</Link>
      </div>

      <div className="cardContent">
        {summary.description ? (
          <p className="summaryDescription">{summary.description}</p>
        ) : null}
        {summary.items?.length ? (
          <ul className="summaryList">
            {summary.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

function renderDashboardWidget(widget, {
  DAYS,
  todayCourses,
  todayEvents,
  assignmentTasks,
  scholarshipSession,
  isEditing,
  isWeekend,
  isLoadingTodayTimetable,
  isLoadingSchedule,
  isLoadingAssignments,
  isLoadingScholarship,
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

  if (widget.type === 'scholarship') {
    return (
      <ScholarshipSummaryWidget
        session={scholarshipSession}
        isEditing={isEditing}
        isLoading={isLoadingScholarship}
      />
    )
  }

  if (widget.type === 'assignment') {
    return (
      <AssignmentSummaryWidget
        tasks={assignmentTasks}
        isEditing={isEditing}
        isLoading={isLoadingAssignments}
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
  const { session: scholarshipSession, isLoading: isLoadingScholarship } = useScholarship()

  const { user, isSessionReady } = useAuth()
  const [assignmentTasks, , { isLoading: isLoadingAssignments }] = useAssignmentTasks({
    enabled: !!user && isSessionReady,
  })
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
    if (!user || !isSessionReady) {
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
  }, [user, isSessionReady])

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

  return (
    <div className="dashboardPage">
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
                        assignmentTasks: user && isSessionReady ? assignmentTasks : [],
                        scholarshipSession,
                        isEditing,
                        isWeekend,
                        isLoadingTodayTimetable,
                        isLoadingSchedule,
                        isLoadingAssignments: !!user && isSessionReady && isLoadingAssignments,
                        isLoadingScholarship,
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
