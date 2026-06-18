/**
 * 로그인 페이지.
 * Firebase 인증 성공 후 syncBackendLogin 으로 백엔드 users 행을 조회·동기화합니다.
 */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import PasswordInput from '../../components/auth/PasswordInput'
import { getSigninErrorMessage, syncBackendLogin } from '../../lib/auth'
import { runWithBackendSync } from '../../lib/backendSync'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../app/providers/AuthProvider'
import './Signin.css'

export default function Signin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { updateUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (e) => {
    // Firebase 로그인 → syncBackendLogin → updateUser. 실패 시 signOut 롤백
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await runWithBackendSync(async () => {
        const credential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

        const profile = await syncBackendLogin(credential.user)
        updateUser(profile)
      })

      setSuccessMessage('로그인 성공!')

      const redirectPath = location.state?.from && location.state.from !== '/login'
        ? location.state.from
        : '/'

      setTimeout(() => {
        navigate(redirectPath, { replace: true })
      }, 1000)
    } catch (error) {
      // 백엔드 동기화 실패 시 Firebase만 로그인된 상태를 방지
      if (auth.currentUser) {
        await signOut(auth).catch(() => {})
      }
      setErrorMessage(getSigninErrorMessage(error))
    }
  }

  return (
    <div className="Signin">
      <div className="inner">
        <div className="brand">
          <div className="logo">🎓</div>
          <h1 className="title">Lumos</h1>
          <p className="sub">대학 생활 맞춤 대시보드</p>
        </div>

        <div className="card">
          <div className="cardHead">
            <h2 className="cardTitle">로그인</h2>
            <p className="cardDesc">
              계정에 로그인하여 대시보드를 이용하세요
            </p>
          </div>

          <form className="form" onSubmit={onSubmit}>
            {successMessage ? (
              <p className="successMessage">{successMessage}</p>
            ) : null}
            {errorMessage ? (
              <p className="errorMessage">{errorMessage}</p>
            ) : null}

            <label className="label">이메일</label>
            <input
              className="input"
              placeholder="example@university.ac.kr"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="label">비밀번호</label>

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="submit">
              로그인
            </button>
          </form>

          <p className="foot">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="muted">
              회원가입
            </Link>
          </p>
        </div>

        <p className="legal">
          로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
