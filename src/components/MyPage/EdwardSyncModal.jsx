import { useEffect, useState } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { auth } from '../../lib/firebase'
import {
  getExtensionSetupHint,
  isExtensionConfigured,
  pingExtension,
  syncEdwardViaExtension,
} from '../../lib/edwardExtension'
import { clearTimetableSession } from '../../lib/timetable/session'
import './EdwardSyncModal.css'

const TERM_OPTIONS = [
  { value: '1', label: '1학기' },
  { value: '2', label: '2학기' },
  { value: '3', label: '하계학기' },
  { value: '4', label: '동계학기' },
]

const SYNC_OPTIONS = [
  {
    key: 'timetable',
    label: '시간표',
    description: '선택한 학년도·학기의 수강 시간표',
  },
  {
    key: 'grades',
    label: '성적 정보',
    description: '학기별 이수학점, 평균학점, 학사경고',
  },
]

const PAGE_REFRESH_NOTICE = 'EDWARD 페이지를 새로고침했습니다. 로그인 상태를 확인한 뒤 다시 시도해 주세요.'

function guessDefaultTermCode() {
  const month = new Date().getMonth() + 1
  return month >= 3 && month <= 8 ? '1' : '2'
}

function isPageRefreshError(message) {
  return typeof message === 'string' && message.includes('새로고침')
}

function extractRefreshNotice(result) {
  for (const item of [result?.timetable, result?.grades]) {
    if (item && !item.ok && isPageRefreshError(item.error)) {
      return PAGE_REFRESH_NOTICE
    }
  }
  return null
}

function buildItemResult(itemResult) {
  if (!itemResult) {
    return null
  }

  if (itemResult.ok) {
    return { status: 'success', message: '성공' }
  }

  return { status: 'error', message: '실패' }
}

export default function EdwardSyncModal({ open, onClose, onSuccess }) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [extensionReady, setExtensionReady] = useState(false)
  const [checkingExtension, setCheckingExtension] = useState(false)
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [termCode, setTermCode] = useState(guessDefaultTermCode)
  const [syncTargets, setSyncTargets] = useState({
    timetable: true,
    grades: true,
  })
  const [syncResults, setSyncResults] = useState({
    timetable: null,
    grades: null,
  })
  const [extensionNotice, setExtensionNotice] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    setError('')
    setExtensionNotice('')
    setSyncResults({ timetable: null, grades: null })
    setYear(new Date().getFullYear())
    setTermCode(guessDefaultTermCode())
    setSyncTargets({ timetable: true, grades: true })
    setCheckingExtension(true)
    pingExtension()
      .then(({ installed }) => setExtensionReady(installed))
      .finally(() => setCheckingExtension(false))
  }, [open])

  if (!open) return null

  const syncTimetable = syncTargets.timetable
  const syncGrades = syncTargets.grades

  const toggleSyncTarget = (key) => {
    setSyncTargets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    setSyncResults((prev) => ({
      ...prev,
      [key]: null,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const user = auth.currentUser
    if (!user) {
      setError('Lumos 로그인이 필요합니다.')
      return
    }

    if (!isExtensionConfigured()) {
      setError(getExtensionSetupHint())
      return
    }

    if (!syncTimetable && !syncGrades) {
      setError('동기화할 항목을 하나 이상 선택해 주세요.')
      return
    }

    const parsedYear = Number.parseInt(String(year), 10)
    if (syncTimetable && (!Number.isFinite(parsedYear) || parsedYear < 2000 || parsedYear > 2100)) {
      setError('올바른 학년도를 입력해 주세요.')
      return
    }

    setSyncing(true)
    setExtensionNotice('')
    setSyncResults({
      timetable: syncTimetable ? { status: 'pending', message: null } : null,
      grades: syncGrades ? { status: 'pending', message: null } : null,
    })

    try {
      const token = await user.getIdToken()
      const result = await syncEdwardViaExtension(token, {
        syncTimetable,
        syncGrades,
        year: syncTimetable ? parsedYear : undefined,
        termCode: syncTimetable ? termCode : undefined,
      })

      const nextResults = {
        timetable: syncTimetable ? buildItemResult(result.timetable) : null,
        grades: syncGrades ? buildItemResult(result.grades) : null,
      }
      setSyncResults(nextResults)

      const refreshNotice = extensionReady ? extractRefreshNotice(result) : null
      setExtensionNotice(refreshNotice || '')

      const otherError = [result.timetable, result.grades]
        .filter((item) => item && !item.ok && !(refreshNotice && isPageRefreshError(item.error)))
        .map((item) => item.error)[0]
      setError(otherError || '')

      if (result.timetable?.ok) {
        clearTimetableSession()
      }

      const hasSuccess = Boolean(result.timetable?.ok || result.grades?.ok)
      if (hasSuccess) {
        onSuccess?.({
          syncTimetable: Boolean(result.timetable?.ok),
          syncGrades: Boolean(result.grades?.ok),
        })
      }
    } catch (err) {
      console.error(err)
      const message = err.message || 'EDWARD 동기화에 실패했습니다.'
      if (extensionReady && isPageRefreshError(message)) {
        setExtensionNotice(PAGE_REFRESH_NOTICE)
        setError('')
      } else {
        setExtensionNotice('')
        setError(message)
      }
      setSyncResults({
        timetable: syncTimetable ? { status: 'error', message: '실패' } : null,
        grades: syncGrades ? { status: 'error', message: '실패' } : null,
      })
    } finally {
      setSyncing(false)
    }
  }

  const openEdward = () => {
    window.open('https://edward.kmu.ac.kr/nx/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="edwardSyncOverlay" onClick={onClose}>
      <form
        className="edwardSyncModal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edwardSyncHead">
          <div>
            <h2>EDWARD 동기화</h2>
            <p>브라우저 확장을 통해 EDWARD 세션으로 학업 정보를 가져옵니다.</p>
          </div>
          <button
            type="button"
            className="edwardSyncClose"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="edwardSyncNotice">
          EDWARD 비밀번호는 Lumos 서버로 전송되지 않습니다. <br/>
          같은 브라우저에서 EDWARD에 로그인되어 있어야 합니다.
        </div>

        <fieldset className="edwardSyncOptions">
          <legend>동기화 항목</legend>
          {SYNC_OPTIONS.map((option) => {
            const itemResult = syncResults[option.key]

            return (
              <div key={option.key} className="edwardSyncOptionRow">
                <label className="edwardSyncOption">
                  <input
                    type="checkbox"
                    checked={syncTargets[option.key]}
                    onChange={() => toggleSyncTarget(option.key)}
                    disabled={syncing}
                  />
                  <span className="edwardSyncOptionText">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
                {itemResult && itemResult.status !== 'pending' && (
                  <span className={`edwardSyncStatus edwardSyncStatus--${itemResult.status}`}>
                    {itemResult.message}
                  </span>
                )}
              </div>
            )
          })}
        </fieldset>

        {syncTimetable && (
          <div className="edwardSyncFieldRow">
            <div className="edwardSyncField">
              <label htmlFor="edwardSyncYear">학년도</label>
              <input
                id="edwardSyncYear"
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={syncing}
              />
            </div>
            <div className="edwardSyncField">
              <label htmlFor="edwardSyncTerm">학기</label>
              <select
                id="edwardSyncTerm"
                value={termCode}
                onChange={(e) => setTermCode(e.target.value)}
                disabled={syncing}
              >
                {TERM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <ol className="edwardSyncSteps">
          <li>Lumos EDWARD Sync 확장 프로그램 설치</li>
          <li>
            EDWARD 포털 로그인
            <button type="button" className="edwardSyncLinkBtn" onClick={openEdward}>
              <ExternalLink size={14} aria-hidden="true" />
              edward.kmu.ac.kr 열기
            </button>
          </li>
          <li>동기화할 항목을 선택한 뒤 동기화 버튼을 클릭</li>
        </ol>

        {!isExtensionConfigured() && (
          <p className="edwardSyncWarn">{getExtensionSetupHint()}</p>
        )}

        {checkingExtension ? (
          <p className="edwardSyncHint">확장 프로그램 확인 중...</p>
        ) : (
          <div className="edwardSyncExtensionStatus">
            {extensionReady && (
              <p className="edwardSyncOk">확장 프로그램이 연결되었습니다.</p>
            )}
            {extensionReady && extensionNotice && (
              <p className="edwardSyncRefreshNotice">{extensionNotice}</p>
            )}
          </div>
        )}

        {error && <p className="edwardSyncError">{error}</p>}

        <div className="edwardSyncActions">
          <button type="button" className="edwardSyncCancel" onClick={onClose} disabled={syncing}>
            취소
          </button>
          <button type="submit" className="edwardSyncSubmit" disabled={syncing}>
            <RefreshCw size={16} className={syncing ? 'edwardSyncSpin' : ''} aria-hidden="true" />
            {syncing ? '동기화 중...' : '동기화하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
