import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  deleteUser
} from 'firebase/auth'
import { auth } from '../../lib/firebase'
import {
  getSignupErrorMessage,
  syncBackendLogin,
  trimSignupForm,
  validateSignupForm,
} from '../../lib/auth'
import { runWithBackendSync } from '../../lib/backendSync'
import PasswordInput from '../../components/auth/PasswordInput'
import EmailInput from '../../components/auth/EmailInput'
import { formatPhoneNumber } from '../../lib/phoneNumber'
import { sanitizeNameInput } from '../../lib/name'
import { useAuth } from '../../app/providers/AuthProvider'
import './Signup.css'

export default function Signup() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [department, setDepartment] = useState('')
  const [grade, setGrade] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [incomeBracket, setIncomeBracket] = useState('5')

  const [hint, setHint] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setHint('')
    setSuccessMessage('')

    if (isSubmitting) {
      return
    }

    const form = trimSignupForm({ name, email, department, studentNumber, phoneNumber })
    const validationMessage = validateSignupForm({ ...form, grade })

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
      await runWithBackendSync(async () => {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          form.email,
          password
        )
        rollbackFirebaseUser = userCredential.user

        const profile = await syncBackendLogin(userCredential.user, {
          name: form.name || undefined,
          department: form.department,
          grade: Number(grade),
          studentNumber: form.studentNumber,
          phoneNumber: form.phoneNumber,
          incomeBracket: Number(incomeBracket),
        })

        updateUser(profile)
      })

      setSuccessMessage('회원가입 성공!')
      setTimeout(() => {
        navigate('/')
      }, 1000)
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
          {successMessage ? (
            <p className="successMessage">{successMessage}</p>
          ) : null}
          {hint ? <p className="hint">{hint}</p> : null}

          <label className="label" htmlFor="su-name">
            이름
          </label>
          <input
            id="su-name"
            className="input"
            type="text"
            placeholder="홍길동 (선택)"
            value={name}
            onChange={(e) => setName(sanitizeNameInput(e.target.value))}
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
          <EmailInput
            id="su-email"
            value={email}
            onChange={setEmail}
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
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            inputMode="numeric"
            autoComplete="tel"
            maxLength={13}
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

          <label className="label" htmlFor="su-income">
            소득 분위
          </label>
          <select
            id="su-income"
            className="input"
            value={incomeBracket}
            onChange={(e) => setIncomeBracket(e.target.value)}
            required
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}구간</option>
            ))}
          </select>

          <label className="label" htmlFor="su-pw">
            비밀번호
          </label>
          <PasswordInput
            id="su-pw"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <label className="label" htmlFor="su-pw2">
            비밀번호 확인
          </label>
          <PasswordInput
            id="su-pw2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            autoComplete="new-password"
            required
          />

          <button type="submit" className="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '회원가입'}
          </button>
        </form>

        <p className="foot">
          <Link to="/login" className="muted">로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  </div>
  )
}
