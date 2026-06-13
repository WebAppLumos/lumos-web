import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import './TodayTimetableWidget.css'

export default function TodayTimetableWidget({ DAYS, courses, isEditing, isWeekend }) {
  const emptyMessage = isWeekend
    ? '오늘은 주말입니다.'
    : '오늘 예정된 수업이 없습니다.'

  return (
    // 오늘의 시간표 위젯 카드
    <div className={`dashboardCard ${isEditing ? 'editing' : ''}`}>
      <div className="cardHead">
        <h3 className="cardTitle">
          <CalendarClock className="summaryIcon timetableIcon" size={18} strokeWidth={2.2} aria-hidden="true" />
          오늘의 시간표
        </h3>
        <Link to="/timetable" className="cardLink">전체보기</Link>
      </div>

      <div className="cardContent">
        {courses.length === 0 ? (
          <p className="classEmpty">{emptyMessage}</p>
        ) : (
          <ul className="classList">
            {courses.map((course) => (
              <li key={course.id} className="classItem">
                <span className="classDot" style={{ background: course.color }} />
                <div className="classInfo">
                  <div className="className">{course.name}</div>
                  <div className="classDetails">
                    {course.schedules
                      .map((s) => `${DAYS[s.day]} ${s.startTime}-${s.endTime}`)
                      .join(', ')}
                    <span className="classSeparator">·</span>
                    {course.room}
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
