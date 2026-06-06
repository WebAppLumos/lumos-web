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
      className="scheduleModalContainer"
      overlayClassName="scheduleModalOverlay"
    >
      <h3>날짜: {date}</h3>

      <div className="scheduleModalList">
        {scheduleItems.length > 0 ? (
          scheduleItems.map((item) => (
            <div key={item.id} className="scheduleModalItem">
              {editingId === item.id ? (
                <div className="scheduleModalEditForm">
                  <div className="scheduleModalCategoryButtons">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        className={`scheduleModalCategoryBtn ${editCategory === cat.key ? 'active' : ''}`}
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
                  <div className="scheduleModalBtnGroup">
                    <button onClick={() => handleUpdate(item.id)} className="scheduleModalSaveBtn">저장</button>
                    <button onClick={cancelEditing} className="scheduleModalCancelBtn">취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="scheduleModalItemHeader">
                    <span className={`scheduleModalCategoryTag ${item.category}`}>
                      {categories.find(c => c.key === item.category)?.label || '기타'}
                    </span>
                    <p><strong>제목:</strong> {item.title}</p>
                  </div>
                  <p><strong>내용:</strong> {item.content}</p>
                  <div className="scheduleModalBtnGroup">
                    <button onClick={() => startEditing(item)} className="scheduleModalEditBtn">수정</button>
                    <button onClick={() => deleteScheduleItem(item.id)} className="scheduleModalDeleteBtn">삭제</button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#999', margin: '20px 0' }}>등록된 일정이 없습니다.</p>
        )}
      </div>

      <div className="scheduleModalForm">
        <div className="scheduleModalCategoryButtons">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`scheduleModalCategoryBtn ${category === cat.key ? 'active' : ''}`}
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
        <button onClick={handleAdd} className="scheduleModalAddBtn">추가</button>
      </div>

      <button onClick={closeModal} className="scheduleModalCloseBtn" style={{ marginTop: '10px' }}>
        닫기
      </button>
    </ReactModal>
  );
}

export default EventModal;
