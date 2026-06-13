import { useState } from 'react';
import './AssignmentAdd.css';

export default function AssignmentAdd({ onAdd, onCancel }) {
  const [course, setCourse] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!course || !title || !deadline) {
      alert('모든 항목을 입력해주세요.');
      return;
    }
    onAdd({ course, title, deadline });
    setCourse(''); setTitle(''); setDeadline('');
  };
  return (
    <form className="assignmentAdd toss-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>과목명</label>
        <input type="text" placeholder="예: 소프트웨어공학"
          value={course} onChange={(e) => setCourse(e.target.value)}/>
      </div>
      <div className="input-group">
        <label>과제명</label>
        <input type="text" placeholder="과제 내용을 입력하세요"
          value={title} onChange={(e) => setTitle(e.target.value)}/>
      </div>
      <div className="input-group">
        <label>마감일</label>
        <input type="date" value={deadline}
          onChange={(e) => setDeadline(e.target.value)}/>
      </div>
      <div className="button-group">
        <button type="button" className="btn-cancel" onClick={onCancel}>취소</button>
        <button type="submit" className="btn-submit">추가하기</button>
      </div>
    </form>
  );
}