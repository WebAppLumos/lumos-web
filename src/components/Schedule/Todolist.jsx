import React from 'react';
import axios from 'axios';
import './Todolist.css';

function TodoList({ items = [], fetchData }) {
  // 이번 주 범위 계산 (일요일 ~ 토요일)
  const getWeekRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // 이번 주 일요일
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6); // 이번 주 토요일
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const { start, end } = getWeekRange();

  // 이번 주 일정만 필터링
  const weeklyItems = items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleToggle = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/api/calendar/events/${id}/toggle`);
      fetchData();
    } catch (error) {
      console.error("토글 실패:", error);
    }
  };

  return (
    <div className="todo-card">
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
  );
}

export default TodoList;