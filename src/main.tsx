import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { LayoutBase } from '@antigravity/layout/LayoutBase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LayoutBase>
      <App />
    </LayoutBase>
  </StrictMode>,
)
