import { useState } from 'react';

export default function useSchedule() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [ledgerItems, setLedgerItems] = useState([]);

  function addLedgerItem(newItem) {
    setLedgerItems((prev) => [...prev, { ...newItem, ledger_ID: Date.now() }]);
  }

  function deleteLedgerItem(id) {
    setLedgerItems((prev) => prev.filter((item) => item.ledger_ID !== id));
  }

  function updateLedgerItem(updatedItem) {
    setLedgerItems((prev) =>
      prev.map((item) => (item.ledger_ID === updatedItem.ledger_ID ? updatedItem : item))
    );
  }

  function openModal(date) {
    setSelectedDate(date);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedDate(null);
  }

  const selectedDateItems = ledgerItems.filter(item => item.ledger_date === selectedDate);

  return {
    selectedDate,
    modalOpen,
    ledgerItems: selectedDateItems,
    addLedgerItem,
    deleteLedgerItem,
    updateLedgerItem,
    openModal,
    closeModal,
  };
}