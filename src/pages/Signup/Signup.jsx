import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import axios from 'axios'
import './Signup.css'

export default function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)

  const [hint, setHint] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setHint('')

    if (password !== password2) {
      setHint('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setHint('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      const uid = userCredential.user.uid

      await axios.post('http://localhost:8080/api/users', {
        userId: uid,
        email,
        name,
        major: department,
        grade: Number(grade),
        studentNumber,
        phoneNumber
      })

      window.alert('회원가입 성공!')
      navigate('/')
    } catch (error) {
      console.error(error)
      window.alert(
        '회원가입 실패: ' +
          (error.response?.data || '서버 오류가 발생했습니다.')
      )
    }
  }

  return (
  <div className="Signup">
    <div className="inner">

      <div className="brand">
        <div className="logo">🎓</div>
        <h1 className="title">Lumos</h1>
        <p className="sub">대학 생활 맞춤 대시보드</p>
      </div>

      <div className="card">
        <div className="cardHead">
          <h2 className="cardTitle">회원가입</h2>
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

          <label className="label" htmlFor="su-std">
            학번
          </label>
          <input
            id="su-std"
            className="input"
            type="text"
            placeholder="20260000"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
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

          <label className="label" htmlFor="su-phone">
            전화번호
          </label>
          <input
            id="su-phone"
            className="input"
            type="tel"
            placeholder="010-0000-0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />

          <label className="label" htmlFor="su-dept">
            학과(전공)
          </label>
          <input
            id="su-dept"
            className="input"
            type="text"
            placeholder="예: 컴퓨터공학과"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />

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
          <Link to="/">로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  </div>
  )
}