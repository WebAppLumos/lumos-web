import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { DEPARTMENTS } from '../../lib/mock-data'
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
      // 1. Firebase 인증 시작
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid // Firebase 고유 ID 확보

      // 2. 우리 백엔드 서버로 데이터 전송 (Axios)
      // 서버의 User 엔티티 필드명과 일치하는지 확인해!
      await axios.post('http://localhost:8080/api/users', {
        userId: uid,           
        email: email,
        name: name,
        major: department,
        grade: Number(grade),
        studentNumber: studentNumber
      })

      window.alert('회원가입 성공!')
      navigate('/') // 메인 페이지로 이동
    } catch (error) {
      console.error(error)
      window.alert('회원가입 실패: ' + (error.response?.data || '서버 오류가 발생했습니다.'))
    }
  }

  return (
    <div className="Signup">
      <div className="inner">
        <div className="brand">
          <div className="logo" aria-hidden>🎓</div>
          <h1 className="title">Lumos</h1>
          <p className="sub">대학 생활 맞춤 대시보드</p>
        </div>

        <div className="card">
          <div className="cardHead">
            <h2 className="cardTitle">회원가입</h2>
          </div>

          <form className="form" onSubmit={onSubmit}>
            {hint ? <p className="hint">{hint}</p> : null}
            
            <label className="label" htmlFor="su-name">이름</label>
            <input id="su-name" className="input" type="text" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} required />

            <label className="label" htmlFor="su-std">학번</label>
            <input id="su-std" className="input" type="text" placeholder="20260000" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} required />

            <label className="label" htmlFor="su-email">이메일</label>
            <input id="su-email" className="input" type="email" placeholder="example@university.ac.kr" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <div className="row">
              <div className="col">
                <label className="label" htmlFor="su-dept">학과</label>
                <select id="su-dept" className="input" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                  <option value="">학과 선택</option>
                  {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
              </div>
              <div className="col">
                <label className="label" htmlFor="su-grade">학년</label>
                <select id="su-grade" className="input" value={grade} onChange={(e) => setGrade(e.target.value)} required>
                  <option value="">학년</option>
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                  <option value="4">4학년</option>
                </select>
              </div>
            </div>

            <label className="label" htmlFor="su-pw">비밀번호</label>
            <div className="passwordWrap">
              <input id="su-pw" className="input inputGrow" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" className="togglePw" onClick={() => setShowPw((v) => !v)}>{showPw ? '숨김' : '보기'}</button>
            </div>

            <label className="label" htmlFor="su-pw2">비밀번호 확인</label>
            <div className="passwordWrap">
              <input id="su-pw2" className="input inputGrow" type={showPw2 ? 'text' : 'password'} placeholder="••••••••" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
              <button type="button" className="togglePw" onClick={() => setShowPw2((v) => !v)}>{showPw2 ? '숨김' : '보기'}</button>
            </div>

            <button type="submit" className="submit">회원가입</button>
          </form>
        </div>
      </div>
    </div>
  )
}