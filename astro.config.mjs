// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
// https://astro.build/config
export default defineConfig({
  site: 'https://beings.com',
  
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],

  // Build optimization
  build: {
    inlineStylesheets: 'auto',
  },

  // Enable View Transitions for smooth navigation
  experimental: {
    // Add experimental features as needed
  },
});
