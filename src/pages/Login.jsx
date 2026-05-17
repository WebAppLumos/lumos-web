import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock } from 'lucide-react';
import styles from './Auth.module.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const userData = {
      id: '1',
      email: email,
      name: '김대학',
      department: '컴퓨터공학과',
      grade: 3,
    };

    login(userData);
    navigate('/');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authFormWrapper}>
        <div className={styles.authHeader}>
          <div className={styles.authIcon}>
            <GraduationCap />
          </div>
          <h1 className={styles.authTitle}>UniDash</h1>
          <p className={styles.authSubtitle}>올인원 맞춤형 학사 대시보드</p>
        </div>

        <div className={styles.authCard}>
          <h2 className={styles.authCardTitle}>로그인</h2>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>이메일</label>
              <div className={styles.formInputWrapper}>
                <Mail className={styles.formInputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.formInput}
                  placeholder="example@university.ac.kr"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>비밀번호</label>
              <div className={styles.formInputWrapper}>
                <Lock className={styles.formInputIcon} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.formInput}
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div className={styles.formCheckboxGroup}>
              <label className={styles.formCheckboxLabel}>
                <input type="checkbox" className={styles.formCheckbox} />
                로그인 상태 유지
              </label>
              <a href="#" className={styles.formLink}>
                비밀번호 찾기
              </a>
            </div>

            <button type="submit" className={styles.btnSubmit}>
              로그인
            </button>
          </form>

          <div className={styles.authFooter}>
            <p className={styles.authFooterText}>
              계정이 없으신가요?{' '}
              <Link to="/signup" className={styles.authFooterLink}>
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
