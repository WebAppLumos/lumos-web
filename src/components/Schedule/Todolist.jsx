import React from 'react';
import './Todolist.css';

function TodoList({ items = [], onToggle }) {
  const allMission = items.length;
  const completedMission = items.filter((item) => item.isCompleted).length;
  const progress = allMission === 0 ? 0 : Math.round((completedMission / allMission) * 100);

  return (
    <div className="todo-card">
      <h3>Today Todo</h3>
      
      <div className="todo-stats">
        <span>전체 미션 수: {allMission}</span> <br/>
        <span>완료 한 미션 수: {completedMission}</span> <br/>
        <span>진행율: {progress}%</span>
      </div>

      <ul className="todo-list">
        {items.length > 0 ? (
          items.map((item) => (
            <li 
              key={item.scheduleId} 
              style={{ 
                textDecoration: item.isCompleted ? "line-through" : "none", 
                color: item.isCompleted ? "gray" : "inherit",
                opacity: item.isCompleted ? 0.6 : 1
              }}
            >
              <input 
                type="checkbox" 
                checked={item.isCompleted} 
                onChange={() => onToggle(item.scheduleId)} 
              />
              <span className="todo-text">{item.title}</span>
            </li>
          ))
        ) : (
          <li style={{ color: '#999', border: 'none', justifyContent: 'center' }}>
            오늘 등록된 일정이 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}

export default TodoList;