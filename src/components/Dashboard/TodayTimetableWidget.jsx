import { Link } from 'react-router-dom'

export default function TodayTimetableWidget({ DAYS, courses, isEditing }) {
  return (
    // 오늘의 시간표 위젯 카드
    <div className={`dashboardCard ${isEditing ? 'editing' : ''}`}>
      <div className="cardHead">
        <h3 className="cardTitle">
          <span aria-hidden="true">◷</span>
          오늘의 시간표
        </h3>
        <Link to="/timetable" className="cardLink">전체보기</Link>
      </div>

      <div className="cardContent">
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
      </div>
    </div>
  )
}
