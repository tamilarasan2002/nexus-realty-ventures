import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// HashRouter keeps deep links working on any static host (GitHub Pages, S3,
// plain nginx) without server-side rewrite rules.
import { HashRouter } from 'react-router-dom'
import App from './App'
import { ScrollToTop } from './components/ScrollToTop'
import './styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <ScrollToTop />
      <App />
    </HashRouter>
  </StrictMode>,
)
