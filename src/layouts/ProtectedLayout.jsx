import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../app/providers/AuthProvider'
import { getProtectedRouteHandle } from '../routes/protectedRouteHandles'
import DashboardHeader from '../components/Dashboard/DashboardHeader'
import DashboardLoginCard from '../components/Dashboard/DashboardLoginCard'
import DashboardNav from '../components/Dashboard/DashboardNav'
import '../pages/Dashboard/Dashboard.css'
import './ProtectedLayout.css'

function LoginGateHeader({ useDashboardHeader, loginTitle, loginSubtitle }) {
  if (useDashboardHeader) {
    return <DashboardHeader />
  }

  if (!loginTitle) {
    return null
  }

  return (
    <div className="dashboardHeader">
      <div>
        <h1 className="dashboardTitle">{loginTitle}</h1>
        {loginSubtitle ? (
          <p className="dashboardSubtitle">{loginSubtitle}</p>
        ) : null}
      </div>
    </div>
  )
}

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth()
  const { pathname } = useLocation()
  const handle = getProtectedRouteHandle(pathname)

  const {
    loginMessage = '대시보드의 시간표와 맞춤 정보를 확인하려면 로그인해주세요.',
    loginTitle,
    loginSubtitle,
    useDashboardHeader = false,
  } = handle

  return (
    <>
      <DashboardNav />
      {isLoading ? (
        <main className="dashboardMain authLoading" aria-live="polite" aria-busy="true">
          <div className="Dashboard">
            <span className="authLoadingSpinner" aria-hidden="true" />
            <p className="authLoadingText">로딩 중...</p>
          </div>
        </main>
      ) : !user ? (
        <main className="dashboardMain">
          <div className="Dashboard">
            <LoginGateHeader
              useDashboardHeader={useDashboardHeader}
              loginTitle={loginTitle}
              loginSubtitle={loginSubtitle}
            />
            <DashboardLoginCard description={loginMessage} />
          </div>
        </main>
      ) : (
        <Outlet />
      )}
    </>
  )
}
