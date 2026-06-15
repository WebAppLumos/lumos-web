import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import './TodayTimetableWidget.css'

function buildSummaryItems(session) {
  if (!session) {
    return ['장학금 정보를 불러오는 중입니다.']
  }

  if (!session.curationCompleted) {
    return [
      '장학금 정보 입력이 필요합니다',
      '소득분위·어학·자격증을 입력하면 추천됩니다',
    ]
  }

  const count = session.eligibleScholarships.length
  if (count === 0) {
    return [
      '현재 조건에 맞는 장학금이 없습니다',
      '정보를 수정하면 다시 확인할 수 있습니다',
    ]
  }

  const topNames = session.eligibleScholarships
    .slice(0, 2)
    .map((scholarship) => scholarship.name)

  return [
    `추천 가능 장학금 ${count}개`,
    ...topNames,
  ]
}

export default function ScholarshipSummaryWidget({ session, isLoading, isEditing }) {
  const items = buildSummaryItems(session)
  const description = session?.curationCompleted
    ? '입력한 정보를 바탕으로 수혜 가능한 장학금을 보여줍니다.'
    : '장학금 페이지에서 정보를 입력하면 맞춤 추천을 받을 수 있습니다.'

  return (
    <div className={`dashboardCard summaryWidget summaryWidget-scholarship ${isEditing ? 'editing' : ''}`}>
      <div className="cardHead">
        <h3 className="cardTitle">
          <GraduationCap className="summaryIcon" size={18} strokeWidth={2.2} aria-hidden="true" />
          장학금
        </h3>
        <Link to="/scholarship" className="cardLink">장학금 보기</Link>
      </div>

      <div className="cardContent">
        {isLoading && !session ? (
          <div className="classLoading" aria-live="polite" aria-busy="true">
            <span className="classLoadingSpinner" aria-hidden="true" />
            <span className="classLoadingText">로딩 중...</span>
          </div>
        ) : (
          <>
            <p className="summaryDescription">{description}</p>
            <ul className="summaryList">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
