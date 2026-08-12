import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Em desenvolvimento o front chama /api no mesmo host e o Vite repassa
    // para o Express. Assim o codigo do cliente nao precisa saber a porta da
    // API e nao existe CORS no ambiente local.
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
});
