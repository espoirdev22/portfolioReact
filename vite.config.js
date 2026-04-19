// vite.config.js
// Configuration de Vite : outil de build ultra-rapide pour React
import { defineConfig } from 'vite'   // Fonction utilitaire pour l'autocomplétion
import react from '@vitejs/plugin-react' // Plugin qui active JSX + Fast Refresh

export default defineConfig({
  plugins: [react()], // Active le support React (JSX, HMR)
  server: {
    port: 3000,       // Port du serveur de développement
    // Proxy : redirige /api vers json-server (port 3001)
    // Évite les erreurs CORS entre le front (3000) et l'API (3001)
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Adresse de json-server
        changeOrigin: true,              // Modifie l'en-tête Host
        rewrite: (path) => path.replace(/^\/api/, '') // Supprime /api du chemin
        // Ex : /api/projets → http://localhost:3001/projets
      }
    }
  }
})