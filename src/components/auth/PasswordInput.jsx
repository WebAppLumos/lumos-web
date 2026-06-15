import { useState } from 'react'
import './PasswordInput.css'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  )
}

export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete,
  required = false,
}) {
  const [visible, setVisible] = useState(false)

  const reveal = () => setVisible(true)
  const conceal = () => setVisible(false)

  const handleTogglePointerDown = (event) => {
    event.preventDefault()
    reveal()
  }

  return (
    <div className="passwordField">
      <input
        id={id}
        className="passwordFieldInput"
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
      />
      <button
        type="button"
        className="passwordFieldToggle"
        aria-label="비밀번호 표시 (누르고 있는 동안만)"
        onPointerDown={handleTogglePointerDown}
        onPointerUp={conceal}
        onPointerLeave={conceal}
        onPointerCancel={conceal}
      >
        <EyeIcon />
      </button>
    </div>
  )
}
