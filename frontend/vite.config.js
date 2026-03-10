import { defineConfig } from 'vite'; // השורה הזו כנראה חסרה אצלך
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true, // משנה את מקור הבקשה ל-5000
        secure: false,      // מאפשר עבודה גם אם אין SSL (HTTP רגיל)
      }
    }
  }
})