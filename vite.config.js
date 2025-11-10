import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Habilita la reescritura de rutas para que las rutas de la API funcionen correctamente
    historyApiFallback: true,
    
    // Configuración de encabezados CORS
    headers: {
      'Access-Control-Allow-Origin': '*', // O especifica un origen si es necesario
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Permitir los métodos necesarios
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization', // Asegurarse de que se permitan los encabezados
    },

    // Habilitar CORS en el servidor de desarrollo
    cors: {
      origin: '*', // O especifica un origen si es necesario
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
      allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
      credentials: true, // Si necesitas enviar cookies o credenciales
    },

    // Si necesitas redirigir solicitudes a un servidor backend, puedes usar el proxy
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Cambia esto por la URL de tu servidor backend
        changeOrigin: true,
        secure: false, // Ajusta a 'true' si usas HTTPS
        rewrite: (path) => path.replace(/^\/api/, ''), // Reescribir la URL si es necesario
      },
    }
  }
})
