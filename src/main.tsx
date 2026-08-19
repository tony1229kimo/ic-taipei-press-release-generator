import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initLiff } from './lib/liff'

// Kick off LIFF init early — inside the LINE client it drives the login
// redirect. Rendering never waits on it; sharing awaits the same promise.
void initLiff()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
