import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import api from '../../lib/api'
import './Signin.css'

export default function Signin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      const uid = userCredential.user.uid

      const response = await api.get('/api/users/me')

      localStorage.setItem('lumos_uid', uid)

      localStorage.setItem(
        'lumos_user_info',
        JSON.stringify(response.data)
      )

      window.alert('로그인 성공!')
      navigate('/')
    } catch (error) {
      console.error(error)
      console.error('LOGIN ERROR:', error)
      console.error('STATUS:', error.response?.status)
      console.error('DATA:', error.response?.data)
      window.alert('로그인 실패: 아이디 또는 비밀번호를 확인하세요.')
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

            <div className="passwordWrap">
              <input
                className="input inputGrow"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="togglePw"
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