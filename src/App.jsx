import { useEffect } from 'react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './lib/firebase'
import {
  clearStoredSession,
  hasStoredSession,
  SESSION_EXPIRED_EVENT,
} from './lib/session'
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

export default function App() {
  return (
    <BrowserRouter>
      <SessionGuard />
      <Router />
    </BrowserRouter>
  )
}
