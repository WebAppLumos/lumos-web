import Calendar from './components/Calendar';
import TodoList from './components/Todolist';
import EventModal from './components/EventModal';
import useSchedule from './hooks/useSchedule';

function Schedule() {
  const {
    selectedDate,
    modalOpen,
    ledgerItems,
    addLedgerItem,
    deleteLedgerItem,
    updateLedgerItem,
    openModal,
    closeModal,
  } = useSchedule();

  return (
    <div className="main-content-grid">

      <div className="calendar-section">
        <Calendar onDateClick={openModal} />
      </div>

      <div className="side-section">
        <TodoList selectedDate={selectedDate} />
      </div>

      <EventModal
        modalOpen={modalOpen}
        closeModal={closeModal}
        date={selectedDate}
        ledgerItems={ledgerItems}
        addLedgerItem={addLedgerItem}
        deleteLedgerItem={deleteLedgerItem}
        updateLedgerItem={updateLedgerItem}
      />
    </div>
  );
}

export default Schedule;