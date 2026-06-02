export default function TimetableTabs({ view, setView }) {
  return (
    // 시간표 블록과 하단 목록에 표시할 정보 종류 선택
    <div className="tabs">
      <button
        type="button"
        className={view === 'info' ? 'active' : ''}
        onClick={() => setView('info')}
      >
        수업 정보
      </button>
      <button
        type="button"
        className={view === 'note' ? 'active' : ''}
        onClick={() => setView('note')}
      >
        노트
      </button>
      <button
        type="button"
        className={view === 'difficulty' ? 'active' : ''}
        onClick={() => setView('difficulty')}
      >
        난이도
      </button>
    </div>
  )
}
