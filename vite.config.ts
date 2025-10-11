import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import vercel from 'vite-plugin-vercel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), vercel()],
  server: {
    cors: false,
    allowedHosts: [
      "immune-noticeably-tortoise.ngrok-free.app",
      "terry.shapework.hk",
      "api.longcat.chat",
      "shapework-personal-default-rtdb.asia-southeast1.firebasedatabase.app"
    ],
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Set long cache for background images
          if (assetInfo.name && (assetInfo.name.includes('bg_1_resize') || assetInfo.name.includes('bg_chat'))) {
            return 'assets/bg/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
