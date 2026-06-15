import './ScholarshipHero.css'

export default function ScholarshipHero({ onStartCuration }) {
  return (
    <div className="hero-section">
      <h1>당신에게 딱 맞는 장학금을 찾아보세요</h1>
      <p>개인 맞춤형 장학금 큐레이션 서비스를 시작합니다.</p>
      <button className="curation-start-btn" onClick={onStartCuration}>
        장학금 큐레이션 시작하기
      </button>
    </div>
  )
}
