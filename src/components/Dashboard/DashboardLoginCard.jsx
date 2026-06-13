import { Link } from 'react-router-dom'
import './DashboardLoginCard.css'

export default function DashboardLoginCard({
  description = '대시보드의 시간표와 맞춤 정보를 확인하려면 로그인해주세요.',
}) {
  return (
    // 로그인하지 않은 사용자에게 로그인/회원가입 진입점을 표시
    <div className="loginCard">
      <div className="loginContent">
        <div className="loginIcon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="40" height="40">
            <path
              d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="m10 17 5-5-5-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 12H4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="loginBody">
          <h2 className="loginTitle">로그인이 필요합니다</h2>
          <p className="loginText">
            {description}
            <br />
            아직 계정이 없으신가요? 회원가입을 진행해주세요.
          </p>
        </div>
        <div className="loginButtons">
          <Link to="/login" className="btnPrimary">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="m10 17 5-5-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            로그인하기
          </Link>
          <Link to="/signup" className="btnOutline">회원가입</Link>
        </div>
      </div>
    </div>
  )
}
