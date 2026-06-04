import { useState } from 'react';
import ReactModal from 'react-modal';
import './EventModal.css';

ReactModal.setAppElement('#root');

function EventModal({ 
  modalOpen, 
  closeModal, 
  date, 
  scheduleItems = [], 
  addScheduleItem, 
  deleteScheduleItem, 
  updateScheduleItem 
}) {
  const categories = [
    { key: 'STUDY', label: '학업' },
    { key: 'WORK', label: '알바/업무' },
    { key: 'PRIVATE', label: '개인 약속' },
    { key: 'OTHER', label: '기타' }
  ];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('OTHER');

  const handleAdd = () => {
    if (!title) return;

    addScheduleItem({
      date: date,
      title: title,
      content: content,
      category: category,
    });

    setTitle('');
    setContent('');
    setCategory('OTHER');
  };

  const startEditing = (item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditCategory(item.category || 'OTHER');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = (id) => {
    updateScheduleItem({
      id: id,
      date: date,
      title: editTitle,
      content: editContent,
      category: editCategory,
    });
    setEditingId(null);
  };

  return (
    <ReactModal
      isOpen={modalOpen}
      onRequestClose={closeModal}
      shouldCloseOnOverlayClick={true}
      className="modal-container"
      overlayClassName="modal-overlay"
    >
      <h3>날짜: {date}</h3>

      <div className="schedule-list">
        {scheduleItems.length > 0 ? (
          scheduleItems.map((item) => (
            <div key={item.id} className="schedule-item">
              {editingId === item.id ? (
                <div className="edit-form">
                  <div className="category-buttons">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        className={`category-btn ${editCategory === cat.key ? 'active' : ''}`}
                        onClick={() => setEditCategory(cat.key)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="제목"
                  />
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="내용"
                  />
                  <div className="btn-group">
                    <button onClick={() => handleUpdate(item.id)} className="save-btn">저장</button>
                    <button onClick={cancelEditing} className="cancel-btn">취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="item-header">
                    <span className={`category-tag ${item.category}`}>
                      {categories.find(c => c.key === item.category)?.label || '기타'}
                    </span>
                    <p><strong>제목:</strong> {item.title}</p>
                  </div>
                  <p><strong>내용:</strong> {item.content}</p>
                  <div className="btn-group">
                    <button onClick={() => startEditing(item)} className="edit-btn">수정</button>
                    <button onClick={() => deleteScheduleItem(item.id)} className="delete-btn">삭제</button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#999', margin: '20px 0' }}>등록된 일정이 없습니다.</p>
        )}
      </div>

      <div className="schedule-form">
        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`category-btn ${category === cat.key ? 'active' : ''}`}
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
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
        <button onClick={handleAdd} className="add-btn">추가</button>
      </div>

      <button onClick={closeModal} className="close-btn" style={{ marginTop: '10px' }}>
        닫기
      </button>
    </ReactModal>
  );
}

export default EventModal;
