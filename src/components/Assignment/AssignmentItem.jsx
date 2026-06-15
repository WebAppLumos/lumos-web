import { useState } from 'react';
import './AssignmentItem.css';

export default function AssignmentItem({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editCourse, setEditCourse] = useState(task.course);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDeadline, setEditDeadline] = useState(task.deadline);

  const handleEditClick = () => {
    setEditCourse(task.course);
    setEditTitle(task.title);
    setEditDeadline(task.deadline);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editCourse || !editTitle || !editDeadline) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    onUpdate(task.id, {
      ...task,
      course: editCourse,
      title: editTitle,
      deadline: editDeadline
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className={`assignmentItem task-card ${task.isCompleted ? 'completed-card' : ''}`}>
      <input 
        type="checkbox" 
        checked={task.isCompleted}
        onChange={() => onUpdate(task.id, { ...task, isCompleted: !task.isCompleted })}
        className="task-checkbox"
      />
      <div className="task-info">
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              value={editCourse} 
              onChange={(e) => setEditCourse(e.target.value)}
              className="edit-input" 
              placeholder="과목명"
            />
            <input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)}
              className="edit-input" 
              placeholder="과제명"
            />
            <input 
              type="date" 
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)} 
              className="edit-input" 
            />
          </div>
        ) : (
          <>
            <div className={`task-course ${task.isCompleted ? 'completed-text' : ''}`}>{task.course}</div>
            <div className={`task-title ${task.isCompleted ? 'completed-text' : ''}`}>{task.title}</div>
            <div className={`task-meta ${task.isCompleted ? 'completed-text' : ''}`}>마감일: {task.deadline}</div>
          </>
        )}
      </div>
      <div className="actions">
        {isEditing ? (
          <>
            <button className="btn-toss btn-edit" onClick={handleSave}>저장</button>
            <button className="btn-toss btn-delete" onClick={handleCancelEdit}>취소</button>
          </>
        ) : (
          <button className="btn-toss btn-edit" onClick={handleEditClick}>수정</button>
        )}
        {!isEditing && (
          <button className="btn-toss btn-delete" onClick={() => onDelete(task.id)}>삭제</button>
        )}
      </div>
    </div>
  );
}