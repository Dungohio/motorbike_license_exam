import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình Vite: proxy các request /api sang backend để tránh lỗi CORS khi dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000', // ảnh avatar đã upload
    },
  },
});
