import React from 'react';
import './TodoList.css';

function TodoList(){
  return (
    <div className="todo-card">
      <h3>Today Todo</h3>

      <ul>
        <li>운동하기</li>
        <li>공부 2시간</li>
        <li>프로젝트 작업</li>
      </ul>
    </div>
  );
};

export default TodoList;