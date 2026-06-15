import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const kakaoRestApiKey = env.KAKAO_REST_API_KEY

  return {
    plugins: [react()],
    server: {
      proxy: kakaoRestApiKey
        ? {
            '/kakao-mobility': {
              target: 'https://apis-navi.kakaomobility.com',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/kakao-mobility/, ''),
              headers: {
                Authorization: `KakaoAK ${kakaoRestApiKey}`,
              },
            },
          }
        : undefined,
    },
  }
})
