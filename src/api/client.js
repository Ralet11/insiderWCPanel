import { store } from '../store'

const API_URL = import.meta.env.VITE_API_URL

function tenantHost() {
  return window.location.host
}

export async function apiFetch(path, options = {}) {
  const { auth } = store.getState()
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Domain': tenantHost(),
    ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    ...(options.headers || {})
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try { const j = await res.json(); msg = j.error || j.message || msg } catch { }
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}
