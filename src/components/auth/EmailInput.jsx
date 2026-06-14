import { useState } from 'react'
import { EMAIL_DOMAIN_OPTIONS } from '../../lib/auth'
import './EmailInput.css'

const CUSTOM_DOMAIN = '__custom__'

function sanitizeEmailLocalPart(value) {
  return String(value ?? '').replace(/[@\s]/g, '')
}

function sanitizeCustomDomain(value) {
  return String(value ?? '').replace(/[@\s]/g, '').toLowerCase()
}

function parseEmail(email) {
  const trimmed = String(email ?? '').trim()
  const at = trimmed.lastIndexOf('@')

  if (at < 0) {
    return {
      localPart: trimmed,
      domainChoice: EMAIL_DOMAIN_OPTIONS[0],
      customDomain: '',
    }
  }

  const localPart = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1).toLowerCase()

  if (EMAIL_DOMAIN_OPTIONS.includes(domain)) {
    return { localPart, domainChoice: domain, customDomain: '' }
  }

  return { localPart, domainChoice: CUSTOM_DOMAIN, customDomain: domain }
}

export default function EmailInput({
  id,
  value,
  onChange,
  required = false,
}) {
  const parsed = parseEmail(value)
  const [localPart, setLocalPart] = useState(parsed.localPart)
  const [domainChoice, setDomainChoice] = useState(parsed.domainChoice)
  const [customDomain, setCustomDomain] = useState(parsed.customDomain)

  const isCustom = domainChoice === CUSTOM_DOMAIN

  const emitEmail = (nextLocal, choice, nextCustom) => {
    const sanitizedLocal = sanitizeEmailLocalPart(nextLocal)
    const domain = choice === CUSTOM_DOMAIN
      ? sanitizeCustomDomain(nextCustom)
      : choice

    if (!sanitizedLocal || !domain) {
      onChange('')
      return
    }

    onChange(`${sanitizedLocal}@${domain}`)
  }

  const handleLocalChange = (event) => {
    const nextLocal = sanitizeEmailLocalPart(event.target.value)
    setLocalPart(nextLocal)
    emitEmail(nextLocal, domainChoice, customDomain)
  }

  const handleDomainChoiceChange = (event) => {
    const nextChoice = event.target.value
    setDomainChoice(nextChoice)
    emitEmail(localPart, nextChoice, customDomain)
  }

  const handleCustomDomainChange = (event) => {
    const nextCustom = sanitizeCustomDomain(event.target.value)
    setCustomDomain(nextCustom)
    emitEmail(localPart, CUSTOM_DOMAIN, nextCustom)
  }

  return (
    <div className="emailInput">
      <div className="emailInputRow">
        <input
          id={id}
          className="emailInputLocal"
          type="text"
          placeholder="아이디"
          value={localPart}
          onChange={handleLocalChange}
          autoComplete="username"
          required={required}
        />
        <span className="emailInputAt" aria-hidden="true">@</span>
        {isCustom ? (
          <input
            id={`${id}-domain`}
            className="emailInputCustomDomain"
            type="text"
            placeholder="example.com"
            value={customDomain}
            onChange={handleCustomDomainChange}
            aria-label="이메일 도메인 직접 입력"
            required={required}
          />
        ) : null}
        <select
          id={`${id}-domain-select`}
          className={`emailInputDomainSelect ${isCustom ? 'emailInputDomainSelect--compact' : ''}`}
          value={domainChoice}
          onChange={handleDomainChoiceChange}
          aria-label="이메일 도메인 선택"
          required={required}
        >
          <option value={CUSTOM_DOMAIN}>직접 입력</option>
          {EMAIL_DOMAIN_OPTIONS.map((domain) => (
            <option key={domain} value={domain}>
              {domain}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
