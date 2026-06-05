import React from 'react';
import axios from 'axios';
import './Todolist.css';

function TodoList({ items = [], fetchData }) {
  const handleToggle = async (id) => {
    try {
      // 백엔드 PATCH 요청 (토글)
      await axios.patch(`http://localhost:8080/api/calendar/events/${id}/toggle`);
      fetchData(); // 서버 데이터 다시 가져오기
    } catch (error) {
      console.error("토글 실패:", error);
    }
  };

  return (
    <div className="todo-card">
      <h3>Today Todo</h3>
      <ul className="todo-list">
        {items.map((item) => (
          <li key={item.scheduleId} style={{ opacity: item.isCompleted ? 0.6 : 1 }}>
            <input 
              type="checkbox" 
              checked={item.isCompleted} 
              onChange={() => handleToggle(item.scheduleId)} 
            />
            <span className="todo-text">{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;