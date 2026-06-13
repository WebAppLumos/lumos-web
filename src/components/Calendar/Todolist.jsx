import api from '../../lib/api'
import { getWeekEvents, getWeekRange } from '../../lib/calendar/api'
import './Todolist.css'

function TodoList({ items = [], onEventsChange }) {
  const weeklyItems = getWeekEvents(items)
  const { start, end } = getWeekRange()

  const handleToggle = async (id) => {
    try {
      await api.patch(`/api/calendar/events/${id}/toggle`)
      await onEventsChange?.()
    } catch (error) {
      console.error('토글 실패:', error)
    }
  }

  return (
    <div className="todo-card calendar-todo-card">
      <h3>Weekly Todo</h3>
      <div className="week-info">
        {start.toLocaleDateString()} ~ {end.toLocaleDateString()}
      </div>
      <ul className="todo-list">
        {weeklyItems.length === 0 ? (
          <li className="empty-msg">이번 주 일정이 없습니다.</li>
        ) : (
          weeklyItems.map((item) => (
            <li key={item.scheduleId} className={item.isCompleted ? 'completed' : ''}>
              <div className="todo-item-content">
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggle(item.scheduleId)}
                />
                <div className="todo-text-wrapper">
                  <span className="todo-date">{item.date.slice(5)}</span>
                  <span className="todo-text">{item.title}</span>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default TodoList
