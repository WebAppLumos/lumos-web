import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { DEPARTMENTS } from '../../lib/mock-data'
import './Signup.css'

export default function Signup() {
  const [name, setName] = useState('') // 이름
  const [email, setEmail] = useState('') // 이메일(ID)
  const [password, setPassword] = useState('') // 비밀번호
  const [password2, setPassword2] = useState('') // 비밀번호 확인
  const [department, setDepartment] = useState('') // 학과
  const [grade, setGrade] = useState('') // 학년
  const [showPw, setShowPw] = useState(false) // PW 표시 여부(true/false)
  const [showPw2, setShowPw2] = useState(false) // PW 표시 여부(true/false)
  const [hint, setHint] = useState('') // 각 항목에 대한 입력 방법 힌트 표시

  // 비밀번호 일치 여부 검증 및 회원가입 요청
  const onSubmit = (e) => {
    e.preventDefault()
    setHint('')

    // 비밀번호 검증 (개발 중엔 간단하게만 검증)
    if (password !== password2) {
      setHint('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      setHint('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    // 회원가입 요청 (Firebase Auth)
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        // 회원가입 성공
        window.alert('회원가입 성공!')
      })
      .catch(() => {
        // 회원가입 실패
        window.alert('회원가입에 실패했습니다.')
      })
  }

  return (
    <div className="Signup">
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
            <h2 className="cardTitle">회원가입</h2>
            <p className="cardDesc">Lumos에 가입하고 맞춤형 대시보드를 만들어보세요</p>
          </div>

          <form className="form" onSubmit={onSubmit}>
            {hint ? <p className="hint">{hint}</p> : null}
            <label className="label" htmlFor="su-name">
              이름
            </label>
            <input
              id="su-name"
              className="input"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label className="label" htmlFor="su-email">
              이메일
            </label>
            <input
              id="su-email"
              className="input"
              type="email"
              placeholder="example@university.ac.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="row">
              <div className="col">
                <label className="label" htmlFor="su-dept">
                  학과
                </label>
                <select
                  id="su-dept"
                  className="input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">학과 선택</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label className="label" htmlFor="su-grade">
                  학년
                </label>
                <select
                  id="su-grade"
                  className="input"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                >
                  <option value="">학년</option>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                  <option value="4">4학년</option>
                </select>
              </div>
            </div>

            <label className="label" htmlFor="su-pw">
              비밀번호
            </label>
            <div className="passwordWrap">
              <input
                id="su-pw"
                className="input inputGrow"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="togglePw"
                // 비밀번호 보기/숨김
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? '숨김' : '보기'}
              </button>
            </div>

            <label className="label" htmlFor="su-pw2">
              비밀번호 확인
            </label>
            <div className="passwordWrap">
              <input
                id="su-pw2"
                className="input inputGrow"
                type={showPw2 ? 'text' : 'password'}
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
              />
              <button
                type="button"
                className="togglePw"
                // 비밀번호 보기/숨김
                onClick={() => setShowPw2((v) => !v)}
              >
                {showPw2 ? '숨김' : '보기'}
              </button>
            </div>

            <button type="submit" className="submit">
              회원가입
            </button>
          </form>

          <p className="foot">
            이미 계정이 있으신가요?{' '}
            <span className="muted">로그인은 Signin.jsx</span>
          </p>
        </div>

        <p className="legal">
          회원가입하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
