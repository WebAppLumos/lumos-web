import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import axios from 'axios';
import './EventModal.css';

ReactModal.setAppElement('#root');

function EventModal({
  modalOpen,
  closeModal,
  date,
  scheduleItems = [],
  fetchData
}) {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [priority, setPriority] = useState('MEDIUM');
  const [editId, setEditId] = useState(null);
  const currentUserId = localStorage.getItem('lumos_uid');

  useEffect(() => {
    if (!modalOpen) {
      setTitle('');
      setContent('');
      setCategory('OTHER');
      setPriority('MEDIUM');
      setEditId(null);
    }
  }, [modalOpen]);

  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:8080/api/calendar/events', {
        userId: currentUserId,
        date,
        title,
        content,
        category,
        priority
      });
      setTitle('');
      setContent('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || '일정 추가에 실패했습니다.');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `http://localhost:8080/api/calendar/events/${editId}`,
        {
          userId: currentUserId,
          date,
          title,
          content,
          category,
          priority
        }
      );
      setEditId(null);
      setTitle('');
      setContent('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || '일정 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/calendar/events/${id}`);
      if (editId === id) {
        setEditId(null);
        setTitle('');
        setContent('');
      }
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || '일정 삭제에 실패했습니다.');
    }
  };

  const startEdit = (item) => {
    setEditId(item.scheduleId);
    setTitle(item.title);
    setContent(item.content || '');
    setCategory(item.category || 'OTHER');
    setPriority(item.priority || 'MEDIUM');
  };

  const cancelEdit = () => {
    setEditId(null);
    setTitle('');
    setContent('');
    setCategory('OTHER');
    setPriority('MEDIUM');
  };

  return (
    <ReactModal
      isOpen={modalOpen}
      onRequestClose={closeModal}
      className="event-modal-content"
      overlayClassName="event-modal-overlay"
    >
      <div className="modal-header">
        <h3>📅 {date}</h3>
        <button className="close-btn" onClick={closeModal}>×</button>
      </div>

      <div className="event-list">
        {scheduleItems.length === 0 ? (
          <p className="empty-msg">일정이 없습니다.</p>
        ) : (
          [...scheduleItems]
            .sort((a, b) => {
              const weights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
              return weights[b.priority] - weights[a.priority];
            })
            .map(item => {
              const isOwner = item.userId === currentUserId;
              const isAdmin = item.userId === 'admin';

              return (
                <div key={item.scheduleId} className={`event-item ${isAdmin ? 'admin-event' : ''}`}>
                <div className="event-info">
                  <span className={`priority-badge ${item.priority}`}>{item.priority}</span>
                  <span className="event-title">{item.title}</span>
                  {item.content && <p className="event-content">{item.content}</p>}
                </div>
                {isOwner && (
                  <div className="event-actions">
                    <button onClick={() => startEdit(item)}>수정</button>
                    <button onClick={() => handleDelete(item.scheduleId)}>삭제</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="event-form">
        <h4>{editId ? '일정 수정' : '새 일정 추가'}</h4>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="제목 (최대 100자)" 
          maxLength={100}
        />
        <textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          placeholder="내용"
        />

        <div className="form-row">
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="ACADEMIC">학사</option>
            <option value="HOLIDAY">공휴일</option>
            <option value="STUDY">학업</option>
            <option value="WORK">알바</option>
            <option value="PRIVATE">개인</option>
            <option value="OTHER">기타</option>
          </select>

          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="HIGH">높음</option>
            <option value="MEDIUM">중간</option>
            <option value="LOW">낮음</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="submit-btn" onClick={editId ? handleUpdate : handleAdd}>
            {editId ? '수정 완료' : '추가하기'}
          </button>
          {editId && (
            <button className="cancel-btn" onClick={cancelEdit}>취소</button>
          )}
        </div>
      </div>
    </ReactModal>
  );
}

export default EventModal;