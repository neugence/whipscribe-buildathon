import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tauri's devUrl is http://localhost:1420, so Vite must listen on exactly that port.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: 1420, strictPort: true, host: '127.0.0.1' },
  build: { target: 'es2022' },
});
