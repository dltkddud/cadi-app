import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages는 https://dltkddud.github.io/cadi-app/ 하위 경로로 서빙되므로
  // 프로덕션 빌드에서 base를 '/cadi-app/'으로 지정하고, dev 서버는 '/'를 유지한다.
  //
  // `vite preview`는 command가 'serve'라서 isPreview를 함께 봐야 한다.
  // 이걸 빠뜨리면 dist/index.html은 '/cadi-app/assets/...'를 가리키는데
  // preview 서버는 '/'에서 서빙해 자바스크립트가 404가 되고 화면이 비어 보인다.
  base: command === 'build' || isPreview ? '/cadi-app/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
