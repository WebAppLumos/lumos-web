import { useEffect, useState } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { auth } from '../../lib/firebase'
import {
  getExtensionSetupHint,
  isExtensionConfigured,
  pingExtension,
  syncCtlAssignmentsViaExtension,
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
    key: 'profile',
    label: '학적 정보',
    description: '학번, 학년, 소속학부/과(전공)',
  },
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
  {
    key: 'assignments',
    label: 'CTL 과제',
    description: '진행 중인 미제출 과제',
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
  for (const item of [result?.profile, result?.timetable, result?.grades]) {
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

function buildCtlResult(itemResult) {
  if (!itemResult) {
    return null
  }

  if (itemResult.ok) {
    const { fetchedCount = 0, createdCount = 0, updatedCount = 0 } = itemResult.data ?? {}
    if (fetchedCount === 0) {
      return { status: 'success', message: '과제 없음' }
    }
    return { status: 'success', message: `${createdCount + updatedCount}건 반영` }
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
    profile: true,
    timetable: true,
    grades: true,
    assignments: true,
  })
  const [syncResults, setSyncResults] = useState({
    profile: null,
    timetable: null,
    grades: null,
    assignments: null,
  })
  const [extensionNotice, setExtensionNotice] = useState('')

  useEffect(() => {
    if (!open) {
      return
    }

    setError('')
    setExtensionNotice('')
    setSyncResults({ profile: null, timetable: null, grades: null, assignments: null })
    setYear(new Date().getFullYear())
    setTermCode(guessDefaultTermCode())
    setSyncTargets({ profile: true, timetable: true, grades: true, assignments: true })
    setCheckingExtension(true)
    pingExtension()
      .then(({ installed }) => setExtensionReady(installed))
      .finally(() => setCheckingExtension(false))
  }, [open])

  if (!open) return null

  const syncProfile = syncTargets.profile
  const syncTimetable = syncTargets.timetable
  const syncGrades = syncTargets.grades
  const syncAssignments = syncTargets.assignments

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

    if (!syncProfile && !syncTimetable && !syncGrades && !syncAssignments) {
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
      profile: syncProfile ? { status: 'pending', message: null } : null,
      timetable: syncTimetable ? { status: 'pending', message: null } : null,
      grades: syncGrades ? { status: 'pending', message: null } : null,
      assignments: syncAssignments ? { status: 'pending', message: null } : null,
    })

    try {
      const token = await user.getIdToken()
      const tasks = []

      if (syncProfile || syncTimetable || syncGrades) {
        tasks.push(
          syncEdwardViaExtension(token, {
            syncProfile,
            syncTimetable,
            syncGrades,
            year: syncTimetable ? parsedYear : undefined,
            termCode: syncTimetable ? termCode : undefined,
          }).then((data) => ({ type: 'edward', data })),
        )
      }

      if (syncAssignments) {
        tasks.push(
          syncCtlAssignmentsViaExtension(token)
            .then((data) => ({ type: 'ctl', data: { ok: true, data } }))
            .catch((err) => ({ type: 'ctl', data: { ok: false, error: err.message } })),
        )
      }

      const settled = await Promise.all(tasks)
      const edwardPayload = settled.find((item) => item.type === 'edward')?.data ?? null
      const ctlPayload = settled.find((item) => item.type === 'ctl')?.data ?? null

      const nextResults = {
        profile: syncProfile ? buildItemResult(edwardPayload?.profile) : null,
        timetable: syncTimetable ? buildItemResult(edwardPayload?.timetable) : null,
        grades: syncGrades ? buildItemResult(edwardPayload?.grades) : null,
        assignments: syncAssignments ? buildCtlResult(ctlPayload) : null,
      }
      setSyncResults(nextResults)

      const refreshNotice = extensionReady && edwardPayload ? extractRefreshNotice(edwardPayload) : null
      setExtensionNotice(refreshNotice || '')

      const otherError = edwardPayload
        ? [edwardPayload.profile, edwardPayload.timetable, edwardPayload.grades]
            .filter((item) => item && !item.ok && !(refreshNotice && isPageRefreshError(item.error)))
            .map((item) => item.error)[0]
        : null
      const ctlError = ctlPayload && !ctlPayload.ok ? ctlPayload.error : null
      setError(otherError || ctlError || '')

      if (edwardPayload?.timetable?.ok) {
        clearTimetableSession()
      }

      const hasSuccess = Boolean(
        edwardPayload?.profile?.ok
        || edwardPayload?.timetable?.ok
        || edwardPayload?.grades?.ok
        || ctlPayload?.ok,
      )
      if (hasSuccess) {
        onSuccess?.({
          syncProfile: Boolean(edwardPayload?.profile?.ok),
          syncTimetable: Boolean(edwardPayload?.timetable?.ok),
          syncGrades: Boolean(edwardPayload?.grades?.ok),
          syncAssignments: Boolean(ctlPayload?.ok),
        })
      }
    } catch (err) {
      console.error(err)
      const message = err.message || '학사 정보 동기화에 실패했습니다.'
      if (extensionReady && isPageRefreshError(message)) {
        setExtensionNotice(PAGE_REFRESH_NOTICE)
        setError('')
      } else {
        setExtensionNotice('')
        setError(message)
      }
      setSyncResults({
        profile: syncProfile ? { status: 'error', message: '실패' } : null,
        timetable: syncTimetable ? { status: 'error', message: '실패' } : null,
        grades: syncGrades ? { status: 'error', message: '실패' } : null,
        assignments: syncAssignments ? { status: 'error', message: '실패' } : null,
      })
    } finally {
      setSyncing(false)
    }
  }

  const openPortal = () => {
    window.open('https://portal.kmu.ac.kr/', '_blank', 'noopener,noreferrer')
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
            <h2>학사 정보 동기화</h2>
            <p>계명대 포털 SSO로 EDWARD·CTL 학사 정보를 가져옵니다.</p>
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
          비밀번호는 Lumos 서버로 전송되지 않습니다. <br/>
          같은 브라우저에서 <strong>portal.kmu.ac.kr</strong>에 로그인되어 있어야 합니다.
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
          <li>Lumos Sync 확장 프로그램 설치</li>
          <li>
            계명대 포털 로그인
            <button type="button" className="edwardSyncLinkBtn" onClick={openPortal}>
              <ExternalLink size={14} aria-hidden="true" />
              portal.kmu.ac.kr
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
