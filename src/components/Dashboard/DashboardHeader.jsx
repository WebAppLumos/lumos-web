import './DashboardHeader.css'

/**
 * 대시보드 페이지 상단 헤더.
 * 제목·부제와 위젯 편집 모드 토글 버튼을 제공합니다.
 */
export default function DashboardHeader({ isEditing, onToggleEdit }) {
  return (
    // 대시보드 페이지 상단 제목과 편집 버튼
    <div className="dashboardHeader">
      <div>
        <h1 className="dashboardTitle">마이 대시보드</h1>
        <p className="dashboardSubtitle">
          나만의 관심사로 조립하는 대학 생활 맞춤 화면
        </p>
      </div>

      {onToggleEdit && (
        <button
          type="button"
          className={`btnEdit ${isEditing ? 'editing' : ''}`}
          // 대시보드 위젯 편집 모드 전환
          onClick={onToggleEdit}
        >
          <span aria-hidden="true">⚙</span>
          {isEditing ? '편집 완료' : '위젯 편집'}
        </button>
      )}
    </div>
  )
}
