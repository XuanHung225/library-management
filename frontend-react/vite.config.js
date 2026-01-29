import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // 1. Import plugin Tailwind v4

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Thay bằng port backend của bạn
        changeOrigin: true,
      },
    },
  },
  // ... các config khác

  plugins: [
    react(),
    tailwindcss(), // 2. Thêm vào mảng plugins
  ],
});
