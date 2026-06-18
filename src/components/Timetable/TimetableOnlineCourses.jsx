import './TimetableOnlineCourses.css'

/**
 * 온라인 수업 전용 카드.
 * 그리드에 배치하지 않고 별도 목록으로 표시하며, 삭제 시 시간표 엔트리도 함께 제거됩니다.
 */
export default function TimetableOnlineCourses({ onlineCourses, onDeleteCourse }) {
  if (onlineCourses.length === 0) {
    return null
  }

  return (
    <div className="onlineCoursesCard">
      <div className="onlineCoursesHead">
        <span className="onlineCoursesTitle">온라인 수업</span>
        <span className="onlineCoursesSub">{onlineCourses.length}개</span>
      </div>
      <ul className="onlineCoursesList">
        {onlineCourses.map((course) => (
          <li key={course.id} className="onlineCoursesItem">
            <span className="onlineCoursesDot" style={{ background: course.color }} />
            <div className="onlineCoursesBody">
              <span className="onlineCoursesName">{course.name}</span>
              <span className="onlineCoursesMeta">
                {[
                  course.professor,
                  course.credit != null ? `${course.credit}학점` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
            <button
              type="button"
              className="onlineCoursesDelete"
              onClick={() => onDeleteCourse(course.id)}
              aria-label={`${course.name} 삭제`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
