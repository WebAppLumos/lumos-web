import React, { useState } from 'react';
import './Todolist.css';

function TodoList() {
  const [textArray, setTextArray] = useState([
    { id: -3, content: '운동하기', done: false },
    { id: -2, content: '공부 2시간', done: false },
    { id: -1, content: '프로젝트 작업', done: false },
  ]);

  function handleToggle(id) {
    setTextArray(
      textArray.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            done: !item.done
          };
        }
        return item;
      })
    );
  }

  const allMission = textArray.length;
  const completedMission = textArray.filter((item) => item.done === true).length;
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
        {textArray.map((item) => (
          <li 
            key={item.id} 
            style={{ 
              textDecoration: item.done ? "line-through" : "none", 
              color: item.done ? "gray" : "inherit",
              opacity: item.done ? 0.6 : 1
            }}
          >
            <input 
              type="checkbox" 
              checked={item.done} 
              onChange={() => handleToggle(item.id)} 
            />
            <span className="todo-text">{item.content}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;