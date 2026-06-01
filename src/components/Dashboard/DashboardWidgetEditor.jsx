export default function DashboardWidgetEditor({ widgets, onToggleWidget }) {
  return (
    // 대시보드에 표시할 위젯 선택 영역
    <div className="widgetEditor">
      <h3 className="widgetEditorTitle">
        <span aria-hidden="true">＋</span>
        대시보드에 표시할 위젯을 선택하세요
      </h3>
      <div className="widgetEditorButtons">
        {widgets.map((widget) => (
          <button
            key={widget.id}
            type="button"
            className={`widgetToggleBtn ${widget.visible ? 'active' : ''}`}
            // 선택한 위젯의 표시 상태 변경
            onClick={() => onToggleWidget(widget.id)}
          >
            {widget.title} {widget.visible && '✓'}
          </button>
        ))}
      </div>
    </div>
  )
}
