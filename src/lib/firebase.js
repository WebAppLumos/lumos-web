// Firebase SDK
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'

// Firebase 설정 (학습용: .env 분리 없이 파일에 직접 작성)
const firebaseConfig = {
  apiKey: 'AIzaSyAykGNS2GvJRJshwRz55klv2L8CQX4VTcU',
  authDomain: 'lumos-auth.firebaseapp.com',
  projectId: 'lumos-auth',
  storageBucket: 'lumos-auth.firebasestorage.app',
  messagingSenderId: '1033076551089',
  appId: '1:1033076551089:web:6f5a0da0fc4a93fb65a190',
  measurementId: 'G-BSK2CP9PWW',
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)

// 필요한 서비스 export
export const analytics = getAnalytics(app)
export const auth = getAuth(app)
