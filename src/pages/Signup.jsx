import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, User as UserIcon, BookOpen } from 'lucide-react';
import styles from './Auth.module.css';

export function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    grade: '',
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.grade) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    const userData = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      department: formData.department,
      grade: parseInt(formData.grade),
    };

    signup(userData);
    navigate('/');
  };

  return (
    <div className={`${styles.authContainer} py-12`}>
      <div className={styles.authFormWrapper}>
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>
            <GraduationCap />
          </div>
          <h1 className={styles.authTitle}>UniDash</h1>
          <p className={styles.authSubtitle}>올인원 맞춤형 학사 대시보드</p>
        </div>

        <div className={styles.authCard}>
          <h2 className={styles.authCardTitle}>회원가입</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                이름 <span className={styles.formRequired}>*</span>
              </label>
              <div className={styles.formInputWrapper}>
                <UserIcon className={styles.formInputIcon} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="홍길동"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                이메일 <span className={styles.formRequired}>*</span>
              </label>
              <div className={styles.formInputWrapper}>
                <Mail className={styles.formInputIcon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="example@university.ac.kr"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                학과 <span className={styles.formRequired}>*</span>
              </label>
              <div className={styles.formInputWrapper}>
                <BookOpen className={styles.formInputIcon} />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="컴퓨터공학과"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                학년 <span className={styles.formRequired}>*</span>
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="">선택하세요</option>
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
                <option value="4">4학년</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                비밀번호 <span className={styles.formRequired}>*</span>
              </label>
              <div className={styles.formInputWrapper}>
                <Lock className={styles.formInputIcon} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="최소 6자 이상"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                비밀번호 확인 <span className={styles.formRequired}>*</span>
              </label>
              <div className={styles.formInputWrapper}>
                <Lock className={styles.formInputIcon} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.formInput}
                  placeholder="비밀번호를 다시 입력하세요"
                />
              </div>
            </div>

            <button type="submit" className={styles.btnSubmit} style={{ marginTop: '1.5rem' }}>
              회원가입
            </button>
          </form>

          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className={styles.authFooterLink}>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
