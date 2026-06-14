import { useState, useMemo } from 'react'
import ScholarshipHero from '../../components/Scholarship/ScholarshipHero'
import ScholarshipForm from '../../components/Scholarship/ScholarshipForm'
import ScholarshipResult from '../../components/Scholarship/ScholarshipResult'
import certificationsData from '../../data/certifications.json'
import { allScholarships } from '../../data/scholarships'
import { useAuth } from '../../app/providers/AuthProvider'
import './Scholarship.css'

export default function Scholarship() {
  const { user } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const [selectedCertId, setSelectedCertId] = useState('')
  const [certAcquisitionDate, setCertAcquisitionDate] = useState('')

  const [userProfile, setUserProfile] = useState({
    major: '컴퓨터공학',
    grade: '3학년',
    gpa: '3.8',
    credits: '15',
    incomeBracket: '5구간',
    certificates: [
      { name: '정보처리기사', date: '2023-11-20', score: 100 },
    ],
    toeic: '850',
    prevToeic: '650',
  })

  const eligibleScholarships = useMemo(
    () => allScholarships.filter((s) => s.checkEligibility(userProfile)),
    [userProfile],
  )

  const handleStartCuration = () => {
    setShowProfile(true)
    setShowResults(false)
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setUserProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCertificate = () => {
    if (!selectedCertId || !certAcquisitionDate) {
      alert('자격증과 취득일을 모두 선택해주세요.')
      return
    }

    const certInfo = certificationsData.find((c) => c.id === parseInt(selectedCertId))
    if (certInfo) {
      const newCert = {
        name: certInfo.name,
        date: certAcquisitionDate,
        score: certInfo.score,
      }

      setUserProfile((prev) => ({
        ...prev,
        certificates: [...prev.certificates, newCert],
      }))

      setSelectedCertId('')
      setCertAcquisitionDate('')
    }
  }

  const handleRemoveCertificate = (index) => {
    setUserProfile((prev) => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    setShowResults(true)
    setShowProfile(false)
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
            onEditProfile={() => { setShowProfile(true); setShowResults(false) }}
            onBackToHome={() => setShowResults(false)}
          />
        )}
      </main>
    </div>
  )
}
