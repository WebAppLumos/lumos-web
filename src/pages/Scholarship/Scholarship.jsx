import { useState, useMemo, useEffect } from 'react'
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard'
import ScholarshipHero from '../../components/Scholarship/ScholarshipHero'
import ScholarshipForm from '../../components/Scholarship/ScholarshipForm'
import ScholarshipResult from '../../components/Scholarship/ScholarshipResult'
import certificationsData from '../../data/certifications.json'
import { allScholarships } from '../../data/scholarships'
import { scholarshipApi } from '../../lib/scholarshipApi'
import { useAuth } from '../../app/providers/AuthProvider'
import '../Dashboard/Dashboard.css'
import './Scholarship.css'

export default function Scholarship() {
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [selectedCertId, setSelectedCertId] = useState('')
  const [certAcquisitionDate, setCertAcquisitionDate] = useState('')

  const [userProfile, setUserProfile] = useState({
    major: '',
    grade: '',
    gpa: '',
    credits: '',
    incomeBracket: '5구간',
    certificates: [],
    toeic: '',
    prevToeic: '',
    scoreId: null,
    currentExamId: null,
    prevExamId: null
  })

  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      try {
        const uid = localStorage.getItem('lumos_uid')
        
        // 1. 직전 학기 성적 조회
        const gpaRes = await scholarshipApi.getPreviousSemesterScores(uid)
        const latestScoreEntry = gpaRes.data.length > 0 ? gpaRes.data[0] : null
        const latestGpa = latestScoreEntry ? latestScoreEntry.score : ''
        const scoreId = latestScoreEntry ? latestScoreEntry.gradeId : null
        
        // 2. 보유 자격증 조회
        const certRes = await scholarshipApi.getCertifications(uid)
        const mappedCertificates = (certRes.data || []).map(dbCert => {
          const certInfo = certificationsData.find(c => c.name === dbCert.certName)
          return {
            certId: dbCert.certId,
            name: dbCert.certName,
            date: dbCert.issueDate,
            score: certInfo ? certInfo.score : 0
          }
        })
        
        // 3. 최근 학기 이수 학점 조회
        const creditRes = await scholarshipApi.getRecentSemesterCredits()
        const totalCredits = (creditRes.data && typeof creditRes.data === 'object') 
          ? (creditRes.data.totalCredits || creditRes.data.credits || '') 
          : (creditRes.data ?? '')

        // 4. 어학 성적 조회 (TOEIC)
        const examRes = await scholarshipApi.getLanguageExams(uid)
        // 최신순으로 정렬하여 중복 데이터가 있을 경우 가장 최근 것만 사용하도록 함
        const exams = (examRes.data || []).sort((a, b) => b.examId - a.examId)
        
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentSemester = (now.getMonth() + 1 >= 3 && now.getMonth() + 1 <= 8) ? '1학기' : '2학기'
        
        // 현재 학기 토익
        const currentExam = exams.find(e => e.year === currentYear && e.semester === currentSemester && e.examCategory === 'TOEIC')
        // 이전 학기 토익 (현재 학기 제외하고 가장 최근 것)
        const prevExam = exams
          .filter(e => !(e.year === currentYear && e.semester === currentSemester) && e.examCategory === 'TOEIC')
          .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.semester.localeCompare(a.semester)))[0]
        
        setUserProfile(prev => ({
          ...prev,
          major: user.major || user.department || '',
          grade: user.grade ? `${user.grade}학년` : '',
          gpa: latestGpa.toString(),
          credits: totalCredits.toString(),
          certificates: mappedCertificates,
          scoreId: scoreId,
          toeic: currentExam ? currentExam.score.toString() : '',
          prevToeic: prevExam ? prevExam.score.toString() : '',
          currentExamId: currentExam ? currentExam.examId : null,
          prevExamId: prevExam ? prevExam.examId : null
        }))
      } catch (error) {
        console.error('Failed to fetch user scholarship profile:', error)
        setUserProfile(prev => ({
          ...prev,
          major: user.major || user.department || '',
          grade: user.grade ? `${user.grade}학년` : '',
        }))
      }
    }

    fetchUserData()
  }, [user])

  const eligibleScholarships = useMemo(() => {
    return allScholarships.filter(s => s.checkEligibility(userProfile))
  }, [userProfile])

  const handleStartCuration = () => {
    setShowProfile(true)
    setShowResults(false)
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setUserProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleAddCertificate = async () => {
    if (!selectedCertId || !certAcquisitionDate) {
      alert('자격증과 취득일을 모두 선택해주세요.')
      return
    }

    const certInfo = certificationsData.find(c => c.id === parseInt(selectedCertId))
    if (certInfo) {
      try {
        const uid = localStorage.getItem('lumos_uid')
        const newCertData = {
          certName: certInfo.name,
          issueDate: certAcquisitionDate
        }
        
        const res = await scholarshipApi.addCertification(uid, newCertData)
        
        const savedCert = {
          certId: res.data.certId,
          name: res.data.certName,
          date: res.data.issueDate,
          score: certInfo.score
        }
        
        setUserProfile(prev => ({
          ...prev,
          certificates: [...prev.certificates, savedCert]
        }))
        
        setSelectedCertId('')
        setCertAcquisitionDate('')
      } catch (error) {
        console.error('Failed to add certification:', error)
        alert('자격증 추가 중 오류가 발생했습니다.')
      }
    }
  }

  const handleRemoveCertificate = async (index) => {
    const certToRemove = userProfile.certificates[index]
    
    if (certToRemove.certId) {
      try {
        await scholarshipApi.deleteCertification(certToRemove.certId)
      } catch (error) {
        console.error('Failed to delete certification:', error)
        alert('자격증 삭제 중 오류가 발생했습니다.')
        return
      }
    }

    setUserProfile(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      const uid = localStorage.getItem('lumos_uid')
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentYear = now.getFullYear()
      const currentSemester = (now.getMonth() + 1 >= 3 && now.getMonth() + 1 <= 8) ? '1학기' : '2학기'
      
      const newIds = {
        scoreId: userProfile.scoreId,
        currentExamId: userProfile.currentExamId,
        prevExamId: userProfile.prevExamId
      }

      // 1. 직전학기 성적 저장 (GPA)
      if (userProfile.gpa) {
        const scoreData = {
          score: parseFloat(userProfile.gpa),
          year: today,
          semester: '1학기'
        }

        if (userProfile.scoreId) {
          await scholarshipApi.updatePreviousSemesterScore(userProfile.scoreId, scoreData)
        } else {
          const res = await scholarshipApi.addPreviousSemesterScore(uid, scoreData)
          newIds.scoreId = res.data.gradeId
        }
      }

      // 2. 현재 학기 토익 성적 저장
      if (userProfile.toeic) {
        const currentExamData = {
          examCategory: 'TOEIC',
          score: userProfile.toeic,
          examDate: today,
          year: currentYear,
          semester: currentSemester,
          expiryDate: new Date(new Date().setFullYear(currentYear + 2)).toISOString().split('T')[0]
        }
        if (userProfile.currentExamId) {
          await scholarshipApi.updateLanguageExam(userProfile.currentExamId, currentExamData)
        } else {
          const res = await scholarshipApi.addLanguageExam(uid, currentExamData)
          newIds.currentExamId = res.data.examId
        }
      }

      // 3. 이전 학기 토익 성적 저장
      if (userProfile.prevToeic) {
        const prevYear = currentSemester === '1학기' ? currentYear - 1 : currentYear
        const prevSemester = currentSemester === '1학기' ? '2학기' : '1학기'
        const prevExamData = {
          examCategory: 'TOEIC',
          score: userProfile.prevToeic,
          examDate: today,
          year: prevYear,
          semester: prevSemester,
          expiryDate: new Date(new Date().setFullYear(currentYear + 2)).toISOString().split('T')[0]
        }
        if (userProfile.prevExamId) {
          await scholarshipApi.updateLanguageExam(userProfile.prevExamId, prevExamData)
        } else {
          const res = await scholarshipApi.addLanguageExam(uid, prevExamData)
          newIds.prevExamId = res.data.examId
        }
      }

      // 로컬 상태 업데이트 (중복 방지 및 즉시 반영)
      setUserProfile(prev => ({
        ...prev,
        scoreId: newIds.scoreId,
        currentExamId: newIds.currentExamId,
        prevExamId: newIds.prevExamId
      }))

      setShowResults(true)
      setShowProfile(false)
    } catch (error) {
      console.error('Failed to save scholarship profile:', error)
      alert('정보 저장 중 오류가 발생했습니다.')
      setShowResults(true)
      setShowProfile(false)
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
        {!showProfile && !showResults ? (
          <ScholarshipHero onStartCuration={handleStartCuration} />
        ) : showProfile ? (
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
            onBack={() => setShowProfile(false)}
          />
        ) : (
          <ScholarshipResult 
            user={user}
            userProfile={userProfile}
            eligibleScholarships={eligibleScholarships}
            onEditProfile={() => { setShowProfile(true); setShowResults(false); }}
            onBackToHome={() => setShowResults(false)}
          />
        )}
      </main>
    </div>
  )
}
