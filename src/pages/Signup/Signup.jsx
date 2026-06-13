import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  deleteUser
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import api from '../../lib/api'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTrimmedSignupForm = () => ({
    name: name.trim(),
    email: email.trim(),
    department: department.trim(),
    studentNumber: studentNumber.trim(),
    phoneNumber: phoneNumber.trim()
  })

  const getSignupErrorMessage = (error) => {
    const firebaseMessages = {
      'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인해 주세요.',
      'auth/invalid-email': '이메일 형식을 확인해 주세요.',
      'auth/invalid-credential': '이미 가입된 이메일이거나 비밀번호가 일치하지 않습니다.',
      'auth/weak-password': '비밀번호는 최소 6자 이상이어야 합니다.',
      'auth/wrong-password': '이미 가입된 이메일이거나 비밀번호가 일치하지 않습니다.',
      'auth/network-request-failed': '네트워크 연결을 확인해 주세요.'
    }

    if (error.code && firebaseMessages[error.code]) {
      return firebaseMessages[error.code]
    }

    const serverMessage = error.response?.data?.message
    if (serverMessage) {
      return serverMessage
    }

    if (error.response?.status === 401) {
      return '인증에 실패했습니다. 다시 시도해 주세요.'
    }

    if (error.response?.status === 409) {
      return '이미 등록된 회원 정보가 있습니다.'
    }

    return '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  }

  const validateSignupForm = ({ studentNumber }) => {
    if (!/^\d{7}$/.test(studentNumber)) {
      return '학번은 숫자 7자리로 입력해 주세요. 예: 2024001'
    }

    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setHint('')

    if (isSubmitting) {
      return
    }

    const form = getTrimmedSignupForm()
    const validationMessage = validateSignupForm(form)

    if (validationMessage) {
      setHint(validationMessage)
      return
    }

    if (password !== password2) {
      setHint('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      setHint('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setIsSubmitting(true)

    let rollbackFirebaseUser = null

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        password
      )
      rollbackFirebaseUser = userCredential.user

      const idToken = await userCredential.user.getIdToken()

      const response = await api.post('/api/auth/login', {
        idToken,
        name: form.name,
        department: form.department,
        grade: Number(grade),
        studentNumber: form.studentNumber,
        phoneNumber: form.phoneNumber
      })

      localStorage.setItem('lumos_uid', userCredential.user.uid)
      localStorage.setItem('lumos_user_info', JSON.stringify(response.data.user))

      window.alert('회원가입 성공!')
      navigate('/')
    } catch (error) {
      console.error(error)

      if (rollbackFirebaseUser && error.response) {
        try {
          await deleteUser(rollbackFirebaseUser)
        } catch (deleteError) {
          console.error('Failed to rollback Firebase user:', deleteError)
        }
      }

      setHint(getSignupErrorMessage(error))
    } finally {
      setIsSubmitting(false)
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
            placeholder="2024001"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
            inputMode="numeric"
            pattern="\d{7}"
            maxLength={7}
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
              autoComplete="new-password"
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
              autoComplete="new-password"
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

          <button type="submit" className="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '회원가입'}
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
