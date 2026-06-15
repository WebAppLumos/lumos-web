import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard'
import ScholarshipHero from '../../components/Scholarship/ScholarshipHero'
import ScholarshipForm from '../../components/Scholarship/ScholarshipForm'
import ScholarshipResult from '../../components/Scholarship/ScholarshipResult'
import certificationsData from '../../data/certifications.json'
import { scholarshipApi } from '../../lib/scholarshipApi'
import { useAuth } from '../../app/providers/AuthProvider'
import { useScholarship } from '../../app/providers/ScholarshipProvider'
import '../Dashboard/Dashboard.css'
import './Scholarship.css'

export default function Scholarship() {
  const location = useLocation()
  const { user, updateUser, refreshUser } = useAuth()
  const {
    session,
    isLoading,
    refreshSession,
    updateUserProfile,
    setCurationCompleted,
  } = useScholarship()
  const [viewOverride, setViewOverride] = useState(null)

  const [selectedCertId, setSelectedCertId] = useState('')
  const [certAcquisitionDate, setCertAcquisitionDate] = useState('')

  const userProfile = session?.userProfile
  const eligibleScholarships = session?.eligibleScholarships ?? []
  const defaultView = user?.scholarshipCurationCompleted ? 'results' : 'hero'
  const view = viewOverride ?? (isLoading && !session ? 'loading' : defaultView)

  useEffect(() => {
    if (!user?.scholarshipCurationCompleted) {
      setViewOverride(null)
    }
  }, [location.pathname, user?.scholarshipCurationCompleted])

  useEffect(() => {
    if (!user) return
    refreshSession()
  }, [location.pathname, user, refreshSession])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    const readOnlyFields = ['major', 'grade', 'gpa', 'credits']
    if (readOnlyFields.includes(name)) {
      return
    }
    updateUserProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCertificate = async () => {
    if (!selectedCertId || !certAcquisitionDate) {
      alert('자격증과 취득일을 모두 선택해주세요.')
      return
    }

    const certInfo = certificationsData.find((c) => c.id === parseInt(selectedCertId, 10))
    if (!certInfo) return

    const isDuplicate = userProfile?.certificates?.some((cert) => cert.name === certInfo.name)
    if (isDuplicate) {
      alert('이미 등록된 자격증입니다.')
      setSelectedCertId('')
      setCertAcquisitionDate('')
      return
    }

    try {
      const uid = localStorage.getItem('lumos_uid')
      await scholarshipApi.addCertification(uid, {
        certName: certInfo.name,
        issueDate: certAcquisitionDate,
      })

      await refreshSession()

      setSelectedCertId('')
      setCertAcquisitionDate('')
    } catch (error) {
      console.error('Failed to add certification:', error)
      alert('자격증 추가 중 오류가 발생했습니다.')
    }
  }

  const handleRemoveCertificate = async (index) => {
    const certToRemove = userProfile.certificates[index]

    if (certToRemove.certId) {
      try {
        await scholarshipApi.deleteCertification(certToRemove.certId)
        await refreshSession()
      } catch (error) {
        console.error('Failed to delete certification:', error)
        alert('자격증 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleSave = async () => {
    if (!userProfile) return

    try {
      const uid = localStorage.getItem('lumos_uid')
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentYear = now.getFullYear()
      const currentSemester = (now.getMonth() + 1 >= 3 && now.getMonth() + 1 <= 8) ? '1학기' : '2학기'

      const newIds = {
        currentExamId: userProfile.currentExamId,
        prevExamId: userProfile.prevExamId,
      }

      if (userProfile.toeic) {
        const currentExamData = {
          examCategory: 'TOEIC',
          score: userProfile.toeic,
          examDate: today,
          year: currentYear,
          semester: currentSemester,
          expiryDate: new Date(new Date().setFullYear(currentYear + 2)).toISOString().split('T')[0],
        }
        if (userProfile.currentExamId) {
          await scholarshipApi.updateLanguageExam(userProfile.currentExamId, currentExamData)
        } else {
          const res = await scholarshipApi.addLanguageExam(uid, currentExamData)
          newIds.currentExamId = res.data.examId
        }
      }

      if (userProfile.prevToeic) {
        const prevYear = currentSemester === '1학기' ? currentYear - 1 : currentYear
        const prevSemester = currentSemester === '1학기' ? '2학기' : '1학기'
        const prevExamData = {
          examCategory: 'TOEIC',
          score: userProfile.prevToeic,
          examDate: today,
          year: prevYear,
          semester: prevSemester,
          expiryDate: new Date(new Date().setFullYear(currentYear + 2)).toISOString().split('T')[0],
        }
        if (userProfile.prevExamId) {
          await scholarshipApi.updateLanguageExam(userProfile.prevExamId, prevExamData)
        } else {
          const res = await scholarshipApi.addLanguageExam(uid, prevExamData)
          newIds.prevExamId = res.data.examId
        }
      }

      const profilePayload = { scholarshipCurationCompleted: true }
      if (userProfile.incomeBracket) {
        profilePayload.incomeBracket = userProfile.incomeBracket
      }
      const response = await scholarshipApi.updateUserProfile(profilePayload)
      const updatedUser = response.data

      updateUser(updatedUser)

      updateUserProfile((prev) => ({
        ...prev,
        currentExamId: newIds.currentExamId,
        prevExamId: newIds.prevExamId,
      }))

      setCurationCompleted(true)
      await refreshSession(updatedUser)
      setViewOverride('results')
    } catch (error) {
      console.error('Failed to save scholarship profile:', error)
      alert('정보 저장 중 오류가 발생했습니다.')
    }
  }

  if (!user) {
    return (
      <div className="dashboardPage">
        <main className="dashboardMain">
          <div className="Dashboard">
            <div className="dashboardHeader">
              <div>
                <h1 className="dashboardTitle">장학금</h1>
                <p className="dashboardSubtitle">내 조건에 맞는 장학금 추천을 확인하세요</p>
              </div>
            </div>
            <DashboardLoginCard description="장학금 추천과 맞춤 정보를 확인하려면 로그인해주세요." />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="scholarshipPage">
      <main className="scholarshipMain">
        {view === 'loading' && (
          <p className="scholarshipLoadingText">장학금 정보를 불러오는 중...</p>
        )}

        {view === 'hero' && (
          <ScholarshipHero onStartCuration={() => setViewOverride('form')} />
        )}

        {view === 'form' && userProfile && (
          <ScholarshipForm
            userProfile={userProfile}
            handleProfileChange={handleProfileChange}
            handleRemoveCertificate={handleRemoveCertificate}
            selectedCertId={selectedCertId}
            setSelectedCertId={setSelectedCertId}
            certAcquisitionDate={certAcquisitionDate}
            setCertAcquisitionDate={setCertAcquisitionDate}
            handleAddCertificate={handleAddCertificate}
            handleSave={handleSave}
            showBackButton={Boolean(user.scholarshipCurationCompleted)}
            onBack={() => setViewOverride('results')}
          />
        )}

        {view === 'results' && userProfile && (
          <ScholarshipResult
            user={user}
            userProfile={userProfile}
            eligibleScholarships={eligibleScholarships}
            onEditProfile={() => setViewOverride('form')}
          />
        )}
      </main>
    </div>
  )
}
