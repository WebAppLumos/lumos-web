import ReactModal from 'react-modal';
import './EventModal.css';

ReactModal.setAppElement('#root');

function EventModal({ modalOpen, closeModal, date }) {
  return (
    <ReactModal
      isOpen={modalOpen}
      onRequestClose={closeModal}
      shouldCloseOnOverlayClick={true}
      className="modal-container"
      overlayClassName="modal-overlay"
    >
      <p>선택 날짜: {date}</p>

      <button onClick={closeModal}>
        닫기
      </button>
    </ReactModal>
  );
}

export default EventModal;