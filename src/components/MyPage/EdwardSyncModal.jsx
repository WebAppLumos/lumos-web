import { useEffect, useState } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { auth } from '../../lib/firebase'
import {
  getExtensionSetupHint,
  isExtensionConfigured,
  pingExtension,
  syncTimetableViaExtension,
} from '../../lib/edwardExtension'
import { clearTimetableSession } from '../../lib/timetableSession'
import './EdwardSyncModal.css'

const TERM_OPTIONS = [
  { value: '1', label: '1학기' },
  { value: '2', label: '2학기' },
  { value: '3', label: '하계학기' },
  { value: '4', label: '동계학기' },
]

function guessDefaultTermCode() {
  const month = new Date().getMonth() + 1
  return month >= 3 && month <= 8 ? '1' : '2'
}

export default function EdwardSyncModal({ open, onClose, onSuccess }) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [extensionReady, setExtensionReady] = useState(false)
  const [checkingExtension, setCheckingExtension] = useState(false)
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [termCode, setTermCode] = useState(guessDefaultTermCode)

  useEffect(() => {
    if (!open) {
      return
    }

    setError('')
    setYear(new Date().getFullYear())
    setTermCode(guessDefaultTermCode())
    setCheckingExtension(true)
    pingExtension()
      .then(({ installed }) => setExtensionReady(installed))
      .finally(() => setCheckingExtension(false))
  }, [open])

  if (!open) return null

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

    const parsedYear = Number.parseInt(String(year), 10)
    if (!Number.isFinite(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      setError('올바른 학년도를 입력해 주세요.')
      return
    }

    setSyncing(true)
    try {
      const token = await user.getIdToken()
      const result = await syncTimetableViaExtension(token, {
        year: parsedYear,
        termCode,
      })

      alert(
        `${result.semesterTitle} 시간표 동기화가 완료되었습니다.\n`
        + `수업 ${result.courseCount}개, 시간표 슬롯 ${result.entryCount}개를 가져왔습니다.`,
      )
      clearTimetableSession()
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError(err.message || 'EDWARD 동기화에 실패했습니다.')
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
            <h2>EDWARD 시간표 동기화</h2>
            <p>브라우저 확장을 통해 EDWARD 세션으로 시간표를 가져옵니다.</p>
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

        <ol className="edwardSyncSteps">
          <li>Lumos EDWARD Sync 확장 프로그램 설치</li>
          <li>
            EDWARD 포털 로그인
            <button type="button" className="edwardSyncLinkBtn" onClick={openEdward}>
              <ExternalLink size={14} aria-hidden="true" />
              edward.kmu.ac.kr 열기
            </button>
          </li>
          <li>학년도·학기를 선택한 뒤 동기화 버튼을 클릭</li>
        </ol>

        {!isExtensionConfigured() && (
          <p className="edwardSyncWarn">{getExtensionSetupHint()}</p>
        )}

        {checkingExtension ? (
          <p className="edwardSyncHint">확장 프로그램 확인 중...</p>
        ) : (
          extensionReady && <p className="edwardSyncOk">확장 프로그램이 연결되었습니다.</p>
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
