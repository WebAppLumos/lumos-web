export default function TimetableControls({
  semesterId,
  timetableId,
  mockSemesters,
  semTimetables,
  availableCourses,
  selectedCourseId,
  onChangeSemester,
  onChangeTimetable,
  onChangeCourse,
  onAddCourse,
}) {
  return (
    // 학기/시간표 선택과 수업 추가 버튼 영역
    <div className="controls">
      <select
        className="select"
        value={semesterId}
        // 학기 변경 시: 해당 학기의 첫 번째 시간표로 자동 선택
        onChange={onChangeSemester}
      >
        {mockSemesters.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
            {s.isActive ? ' (현재)' : ''}
          </option>
        ))}
      </select>

      <select
        className="select"
        value={timetableId}
        onChange={onChangeTimetable}
      >
        {semTimetables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
            {t.isDefault ? ' (기본)' : ''}
          </option>
        ))}
      </select>

      <select
        className="select"
        value={selectedCourseId}
        // 현재 시간표에 추가할 수업 선택
        onChange={onChangeCourse}
        disabled={availableCourses.length === 0}
      >
        {availableCourses.length === 0 ? (
          <option value="">추가할 수업 없음</option>
        ) : (
          availableCourses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))
        )}
      </select>

      <button
        type="button"
        className="btn-primary"
        onClick={onAddCourse}
        disabled={availableCourses.length === 0}
      >
        + 수업 추가
      </button>
    </div>
  )
}
