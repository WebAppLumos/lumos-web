import { Link } from 'react-router-dom'
import { ClipboardCheck, ClipboardX } from 'lucide-react'
import { getDaysUntilDeadline, getDeadlineLabel } from '../../lib/assignmentNotifications'
import './TodayTimetableWidget.css'

function getUpcomingTasks(tasks) {
  return tasks
    .filter((task) => !task.isCompleted)
    .map((task) => ({
      ...task,
      diffDays: getDaysUntilDeadline(task.deadline),
    }))
    .filter((task) => task.diffDays >= 0)
    .sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
    .slice(0, 3)
}

export default function AssignmentSummaryWidget({ tasks, isEditing, isLoading }) {
  const upcomingTasks = getUpcomingTasks(tasks ?? [])
  const incompleteCount = (tasks ?? []).filter((task) => !task.isCompleted).length

  return (
    <div className={`dashboardCard summaryWidget summaryWidget-assignment ${isEditing ? 'editing' : ''}`}>
      <div className="cardHead">
        <h3 className="cardTitle">
          <ClipboardCheck className="summaryIcon" size={18} strokeWidth={2.2} aria-hidden="true" />
          과제
        </h3>
        <Link to="/assignment" className="cardLink">과제 보기</Link>
      </div>

      <div className="cardContent">
        {isLoading ? (
          <div className="classLoading" aria-live="polite" aria-busy="true">
            <span className="classLoadingSpinner" aria-hidden="true" />
            <span className="classLoadingText">로딩 중...</span>
          </div>
        ) : incompleteCount === 0 ? (
          <div className="classEmpty">
            <ClipboardX className="classEmptyIcon" size={28} strokeWidth={1.8} aria-hidden="true" />
            <p className="classEmptyText">남은 과제가 없습니다.</p>
          </div>
        ) : (
          <>
            <p className="summaryDescription">
              미완료 과제 {incompleteCount}개
            </p>
            <ul className="classList">
              {upcomingTasks.map((task) => (
                <li key={task.id} className="classItem">
                  <span className="classDot scheduleDot" style={{ background: '#111827' }} />
                  <div className="classInfo">
                    <div className="className">{task.title}</div>
                    <div className="classDetails">
                      {task.course}
                      <span className="classSeparator">·</span>
                      {getDeadlineLabel(task.diffDays)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
