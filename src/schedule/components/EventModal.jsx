import { useState } from 'react';
import ReactModal from 'react-modal';
import './EventModal.css';

ReactModal.setAppElement('#root');

function EventModal({ modalOpen, closeModal, date, ledgerItems = [], addLedgerItem, deleteLedgerItem, updateLedgerItem }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleAdd = () => {
    if (!title) return;

    addLedgerItem({
      ledger_date: date,
      ledger_title: title,
      ledger_content: content,
    });

    setTitle('');
    setContent('');
  };

  const startEditing = (item) => {
    setEditingId(item.ledger_ID);
    setEditTitle(item.ledger_title);
    setEditContent(item.ledger_content);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleUpdate = (id) => {
    updateLedgerItem({
      ledger_ID: id,
      ledger_date: date,
      ledger_title: editTitle,
      ledger_content: editContent,
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

      <div className="ledger-list">
        {ledgerItems.length > 0 ? (
          ledgerItems.map((item) => (
            <div key={item.ledger_ID} className="ledger-item">
              {editingId === item.ledger_ID ? (
                <div className="edit-form">
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
                    <button onClick={() => handleUpdate(item.ledger_ID)} className="save-btn">저장</button>
                    <button onClick={cancelEditing} className="cancel-btn">취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <p><strong>제목:</strong> {item.ledger_title}</p>
                  <p><strong>내용:</strong> {item.ledger_content}</p>
                  <div className="btn-group">
                    <button onClick={() => startEditing(item)} className="edit-btn">수정</button>
                    <button onClick={() => deleteLedgerItem(item.ledger_ID)} className="delete-btn">삭제</button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#999', margin: '20px 0' }}>등록된 일정이 없습니다.</p>
        )}
      </div>

      <div className="ledger-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (title)"
        />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용 (content)"
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