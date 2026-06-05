import { useState } from 'react';
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

  const handleAdd = async () => {
    if (!title) return;

    try {
      // 🔥 로그인 유저 UID 통일
      const userId = localStorage.getItem('lumos_uid');

      await axios.post('http://localhost:8080/api/calendar/events', {
        userId: userId,
        date,
        title,
        content,
        category
      });

      fetchData();

      setTitle('');
      setContent('');
      setCategory('OTHER');

    } catch (error) {
      console.error("일정 추가 실패:", error);
    }
  };

  return (
    <ReactModal
      isOpen={modalOpen}
      onRequestClose={closeModal}
      style={{
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 9999
        },
        content: {
          inset: '50% auto auto 50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          padding: '20px',
          borderRadius: '10px',
          width: '400px',
          maxHeight: '80vh',
          overflow: 'auto'
        }
      }}
    >
      <h2>📅 날짜: {date}</h2>

      {/* 기존 일정 */}
      {scheduleItems.length > 0 ? (
        scheduleItems.map((item) => (
          <div key={item.scheduleId} style={{ marginBottom: '10px' }}>
            <span className={`category-tag ${item.category}`}>
              {item.category}
            </span>

            <p>제목: {item.title}</p>
            <p>내용: {item.content}</p>
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#999' }}>
          등록된 일정이 없습니다.
        </p>
      )}

      {/* 입력 폼 */}
      <div className="schedule-form">

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목"
        />

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="일정 내용"
        />

        {/* 🔥 카테고리 추가 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="STUDY">학업</option>
          <option value="WORK">알바/업무</option>
          <option value="PRIVATE">개인 약속</option>
          <option value="OTHER">기타</option>
        </select>

        <button onClick={handleAdd} className="add-btn">
          추가
        </button>
      </div>

      <button onClick={closeModal} className="close-btn">
        닫기
      </button>
    </ReactModal>
  );
}

export default EventModal;