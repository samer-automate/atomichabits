import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Estilos base globales — App.jsx inyecta el resto via <style>
document.body.style.margin = '0';
document.body.style.background = '#080808';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
