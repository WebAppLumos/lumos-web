import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import './Signin.css'

export default function Signin() {
  const [email, setEmail] = useState('') // 이메일(ID)
  const [password, setPassword] = useState('') // 비밀번호
  const [showPassword, setShowPassword] = useState(false) // PW 표시 여부(true/false)

  // 로그인 성공여부에 따른 알림
  const onSubmit = (e) => {
    e.preventDefault()
    // 로그인 요청 (Firebase Auth)
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // 로그인 성공
        window.alert('로그인 성공!')
      })
      .catch(() => {
        // 로그인 실패
        window.alert('아이디 또는 비밀번호가 틀렸습니다.')
      })
  }

  return (
    <div className="Signin">
      <div className="inner">
        <div className="brand">
          <div className="logo" aria-hidden>
            🎓
          </div>
          <h1 className="title">Lumos</h1>
          <p className="sub">대학 생활 맞춤 대시보드</p>
        </div>

        <div className="card">
          <div className="cardHead">
            <h2 className="cardTitle">로그인</h2>
            <p className="cardDesc">계정에 로그인하여 대시보드를 이용하세요</p>
          </div>
          <form className="form" onSubmit={onSubmit}>
            <label className="label" htmlFor="signin-email">
              이메일
            </label>
            <input
              id="signin-email"
              className="input"
              type="email"
              placeholder="example@university.ac.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="Signin-label" htmlFor="signin-password">
              비밀번호
            </label>
            <div className="passwordWrap">
              <input
                id="signin-password"
                className="input inputGrow"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="togglePw"
                // 비밀번호 보기/숨김
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? '숨김' : '보기'}
              </button>
            </div>

            <button type="submit" className="submit">
              로그인
            </button>
          </form>
          <p className="foot">
            계정이 없으신가요? <span className="muted">회원가입 페이지는 Signup.jsx</span>
          </p>
        </div>

        <p className="legal">
          로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
