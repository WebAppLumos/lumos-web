import { Link } from 'react-router-dom'
import { CalendarDays, CalendarOff } from 'lucide-react'
import './TodayTimetableWidget.css'

/** 일정 우선순위 API 값 → 한글 라벨 */
const PRIORITY_LABELS = {
  HIGH: '높음',
  MEDIUM: '중간',
  LOW: '낮음',
}

/**
 * 오늘의 일정 대시보드 위젯.
 * calendar/session의 todayEvents를 우선순위·내용과 함께 표시합니다.
 */
export default function ScheduleSummaryWidget({ events, isEditing, isLoading }) {
  return (
    <div className={`dashboardCard ${isEditing ? 'editing' : ''}`}>
      <div className="cardHead">
        <h3 className="cardTitle">
          <CalendarDays className="summaryIcon" size={18} strokeWidth={2.2} aria-hidden="true" />
          일정
        </h3>
        <Link to="/schedule" className="cardLink">일정 보기</Link>
      </div>

      <div className="cardContent">
        {isLoading ? (
          <div className="classLoading" aria-live="polite" aria-busy="true">
            <span className="classLoadingSpinner" aria-hidden="true" />
            <span className="classLoadingText">로딩 중...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="classEmpty">
            <CalendarOff className="classEmptyIcon" size={28} strokeWidth={1.8} aria-hidden="true" />
            <p className="classEmptyText">오늘 예정된 일정이 없습니다.</p>
          </div>
        ) : (
          <ul className="classList">
            {events.map((event) => (
              <li key={event.scheduleId} className="classItem">
                <span className="classDot scheduleDot" style={{ background: '#2563eb' }} />
                <div className="classInfo">
                  <div className="className">{event.title}</div>
                  <div className="classDetails">
                    {PRIORITY_LABELS[event.priority] ?? event.priority}
                    {event.content ? (
                      <>
                        <span className="classSeparator">·</span>
                        {event.content}
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
