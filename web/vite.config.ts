import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages deploys to /<repo-name>/ by default
  base: '/threads_bot/',
});
