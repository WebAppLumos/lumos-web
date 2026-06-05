import { useMemo, useState } from 'react'

import {
  DAYS,
  mockCourses,
  mockSemesters,
  mockTimetableEntries,
  mockTimetables,
} from '../../lib/mock-data'

import DashboardHeader from '../../components/Dashboard/DashboardHeader'
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard'
import DashboardNav from '../../components/Dashboard/DashboardNav'
import DashboardWidgetEditor from '../../components/Dashboard/DashboardWidgetEditor'
import TodayTimetableWidget from '../../components/Dashboard/TodayTimetableWidget'

import './Dashboard.css'

const dashboardWidgets = [
  {
    id: 'today-timetable',
    title: '오늘의 시간표',
    type: 'timetable',
    visible: true,
  },
]

export default function Dashboard() {
  const [user, setUser] = useState(() => {
    // 원본 파일처럼 앱 로그인 상태는 localStorage의 사용자 정보로 판단
    const storedUser = localStorage.getItem('lumos_user_info')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [widgets, setWidgets] = useState(dashboardWidgets) // 대시보드 위젯 표시 상태
  const [isEditing, setIsEditing] = useState(false) // 위젯 편집 모드

  // 현재 학기의 기본 시간표에 포함된 수업만 대시보드에 표시
  const todayCourses = useMemo(() => {
    const semesterId = mockSemesters.find((s) => s.isActive)?.id ?? mockSemesters[0].id
    const timetableId = mockTimetables.find((t) => (
      t.semesterId === semesterId && t.isDefault
    ))?.id ?? mockTimetables[0].id

    const courseIds = mockTimetableEntries
      .filter((entry) => entry.timetableId === timetableId)
      .map((entry) => entry.courseId)

    return mockCourses
      .filter((course) => course.semesterId === semesterId && courseIds.includes(course.id))
      .slice(0, 4)
  }, [])

  const visibleWidgets = widgets.filter((widget) => widget.visible)

  // 선택한 위젯을 대시보드에 보이거나 숨김
  const onToggleWidget = (id) => {
    setWidgets(widgets.map((widget) => (
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    )))
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
          <DashboardHeader
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
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
            <div className="widgetGrid">
              {visibleWidgets.map((widget) => (
                <div key={widget.id} className="widgetItem">
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

                  {widget.type === 'timetable' && (
                    <TodayTimetableWidget
                      DAYS={DAYS}
                      courses={todayCourses}
                      isEditing={isEditing}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
