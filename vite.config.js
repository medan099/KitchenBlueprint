import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5173, strictPort: false },
  build: {
    rollupOptions: {
      input: {
        home: 'index.html',
        expertise: 'expertise.html',
        projects: 'projects.html',
        detail: 'project-detail.html',
        studio: 'studio.html',
        process: 'process.html',
        contact: 'contact.html'
      }
    }
  }
})
