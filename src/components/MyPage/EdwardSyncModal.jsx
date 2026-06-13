import { useEffect, useState } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { auth } from '../../lib/firebase'
import {
  getExtensionSetupHint,
  isExtensionConfigured,
  pingExtension,
  syncTimetableViaExtension,
} from '../../lib/edwardExtension'
import './EdwardSyncModal.css'

export default function EdwardSyncModal({ open, onClose, onSuccess }) {
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState('')
  const [extensionReady, setExtensionReady] = useState(false)
  const [checkingExtension, setCheckingExtension] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }

    setError('')
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

    setSyncing(true)
    try {
      const token = await user.getIdToken()
      const result = await syncTimetableViaExtension(token)

      alert(
        `${result.semesterTitle} 시간표 동기화가 완료되었습니다.\n`
        + `수업 ${result.courseCount}개, 시간표 슬롯 ${result.entryCount}개를 가져왔습니다.`,
      )
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
          EDWARD 비밀번호는 Lumos 서버로 전송되지 않습니다. 같은 브라우저에서 EDWARD에 로그인되어 있어야 합니다.
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
          <li>아래 동기화 버튼 클릭</li>
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
