import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  MapPinned,
} from 'lucide-react'
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

const dashboardSummaries = {
  schedule: {
    Icon: CalendarDays,
    title: '일정',
    link: '/schedule',
    linkText: '일정 보기',
    description: '오늘 해야 할 일정과 캘린더를 확인하세요.',
    items: ['오늘 일정 0개', '이번 주 주요 일정 확인'],
  },
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

function renderDashboardWidget(widget, { DAYS, todayCourses, isEditing }) {
  if (widget.type === 'timetable') {
    return (
      <TodayTimetableWidget
        DAYS={DAYS}
        courses={todayCourses}
        isEditing={isEditing}
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

                  {renderDashboardWidget(widget, { DAYS, todayCourses, isEditing })}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
