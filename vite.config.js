import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// base './' keeps the build relocatable (works from a sub-path on the NAS).
export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
});
