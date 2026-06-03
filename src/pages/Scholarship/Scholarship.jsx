import { useState, useMemo } from 'react'
import DashboardNav from '../../components/Dashboard/DashboardNav'
import ScholarshipHero from '../../components/Scholarship/ScholarshipHero'
import ScholarshipForm from '../../components/Scholarship/ScholarshipForm'
import ScholarshipResult from '../../components/Scholarship/ScholarshipResult'
import certificationsData from './certifications.json'
import './Scholarship.css'

export default function Scholarship() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('unidash_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const [showProfile, setShowProfile] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // 자격증 추가를 위한 상태
  const [selectedCertId, setSelectedCertId] = useState('')
  const [certAcquisitionDate, setCertAcquisitionDate] = useState('')

  const [userProfile, setUserProfile] = useState({
    major: '컴퓨터공학',
    grade: '3학년',
    gpa: '3.8',
    credits: '15',
    incomeBracket: '5구간',
    certificates: [
      { name: '정보처리기사', date: '2023-11-20', score: 100 }
    ],
    toeic: '850',
    prevToeic: '650'
  })

  const allScholarships = [
    {
      id: 1,
      name: '국가장학금 Ⅰ유형',
      provider: '한국장학재단',
      amount: '학기별 최대 260만원',
      tag: '소득연계',
      checkEligibility: (profile) => {
        const credits = parseInt(profile.credits) || 0
        const gpa = parseFloat(profile.gpa) || 0
        return credits >= 12 && gpa >= 2.51
      }
    },
    {
      id: 2,
      name: '성적우수 장학금',
      provider: '본교',
      amount: '등록금 전액',
      tag: '성적',
      checkEligibility: (profile) => {
        const credits = parseInt(profile.credits) || 0
        const gpa = parseFloat(profile.gpa) || 0
        return credits >= 15 && gpa >= 4.0
      }
    },
    {
      id: 3,
      name: '공인토익성적향상격려장학',
      provider: '본교',
      amount: '50만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        const currentToeic = parseInt(profile.toeic) || 0
        const prevToeic = parseInt(profile.prevToeic) || 0
        const isPrevInBracket = prevToeic >= 600 && prevToeic <= 699
        const isCurrentImproved = currentToeic >= 700 && currentToeic <= 990
        return isPrevInBracket && isCurrentImproved
      }
    },
    {
      id: 4,
      name: '자격증 취득 장학금 (A등급)',
      provider: '본교',
      amount: '50만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        return profile.certificates.some(cert => cert.score >= 90)
      }
    },
    {
      id: 5,
      name: '자격증 취득 장학금 (B등급)',
      provider: '본교',
      amount: '30만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        return profile.certificates.some(cert => cert.score >= 70 && cert.score < 90)
      }
    },
    {
      id: 6,
      name: '자격증 취득 장학금 (C등급)',
      provider: '본교',
      amount: '20만원',
      tag: '자기계발',
      checkEligibility: (profile) => {
        return profile.certificates.some(cert => cert.score >= 60 && cert.score < 70)
      }
    }
  ]

  const eligibleScholarships = useMemo(() => {
    return allScholarships.filter(s => s.checkEligibility(userProfile))
  }, [userProfile])

  const handleStartCuration = () => {
    if (!user) {
      alert('로그인이 필요한 서비스입니다.')
      return
    }
    setShowProfile(true)
    setShowResults(false)
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setUserProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleAddCertificate = () => {
    if (!selectedCertId || !certAcquisitionDate) {
      alert('자격증과 취득일을 모두 선택해주세요.')
      return
    }

    const certInfo = certificationsData.find(c => c.id === parseInt(selectedCertId))
    if (certInfo) {
      const newCert = {
        name: certInfo.name,
        date: certAcquisitionDate,
        score: certInfo.score
      }
      
      setUserProfile(prev => ({
        ...prev,
        certificates: [...prev.certificates, newCert]
      }))
      
      // 초기화
      setSelectedCertId('')
      setCertAcquisitionDate('')
    }
  }

  const handleRemoveCertificate = (index) => {
    setUserProfile(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    setShowResults(true)
    setShowProfile(false)
  }

  return (
    <div className="scholarshipPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
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
