import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/,"/api"),
        }
      },
    // alias: {
    //     '@backend': path.resolve(__dirname, 'backend'),
    //   }
      
    },
  },
);
