import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { data } from './core/seeds/user-data'

class DpDashInsights extends HTMLElement {
  connectedCallback() {
    setTimeout(() => {
      let clientId: string | null = null
      let companyId: string | null = null
      let projectId: string | null = null

      const raw = this.getAttribute('user-data')
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          clientId = parsed.client_id ?? null
          companyId = parsed.company_id ?? null
          projectId = parsed.project_id ?? null
        } catch {
          // malformed userdata — proceed without clientId/companyId/projectId
        }
      }

      const mountPoint = document.createElement('div')
      this.appendChild(mountPoint)

      createRoot(mountPoint).render(
        <React.StrictMode>
          <App clientId={clientId} companyId={companyId} projectId={projectId} />
        </React.StrictMode>
      )
    }, 0)
  }
}

customElements.define('dp-dash-insights', DpDashInsights)

// ✅ Dev preview support
const devRoot = document.getElementById('root')
if (devRoot) {
  const el = document.createElement('dp-dash-insights')
  el.setAttribute('user-data', JSON.stringify(data))
  devRoot.appendChild(el)
}
