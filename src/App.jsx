import { useEffect } from 'react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './lib/firebase'
import { fetchDashboardWidgets, setCachedDashboardWidgets } from './lib/dashboardApi'
import { ensureCalendarSession } from './lib/calendar/session'
import { ensureTimetableSession } from './lib/timetable/session'
import {
  clearStoredSession,
  hasStoredSession,
  SESSION_EXPIRED_EVENT,
} from './lib/session'
import { AuthProvider, useAuth } from './app/providers/AuthProvider'
import Router from './Router.jsx'

const publicPaths = new Set(['/login', '/signup'])

function SessionGuard() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const redirectToLogin = () => {
      const shouldRedirect = !publicPaths.has(location.pathname)

      clearStoredSession()
      signOut(auth).catch(() => {})

      if (shouldRedirect) {
        navigate('/login', {
          replace: true,
          state: {
            from: `${location.pathname}${location.search}`,
            reason: 'session-expired',
          },
        })
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && hasStoredSession()) {
        redirectToLogin()
      }
    })

    window.addEventListener(SESSION_EXPIRED_EVENT, redirectToLogin)

    return () => {
      unsubscribe()
      window.removeEventListener(SESSION_EXPIRED_EVENT, redirectToLogin)
    }
  }, [location.pathname, location.search, navigate])

  return null
}

function DashboardWidgetsPrefetch() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return undefined

    Promise.all([
      fetchDashboardWidgets()
        .then(setCachedDashboardWidgets)
        .catch(() => {}),
      ensureCalendarSession().catch(() => {}),
      ensureTimetableSession().catch(() => {}),
    ])

    return undefined
  }, [user])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionGuard />
        <DashboardWidgetsPrefetch />
        <Router />
      </AuthProvider>
    </BrowserRouter>
  )
}
