// src/api/wcAuth.js
const API_URL = import.meta.env.VITE_API_URL
const TENANT = window.location.host
const TOKEN_KEY = 'panel_jwt'

// Redux store para poder hacer logout global
import { store } from '../store'
import { logout } from '../store/auth'

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY)
}
export function saveToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY)
}

function isJwtExpired(token) {
    try {
        const [, payload] = token.split('.')
        const { exp } = JSON.parse(atob(payload))
        return typeof exp === 'number' && (Date.now() / 1000) >= (exp - 30)
    } catch {
        return false
    }
}

function redirectToLogin() {
    const here = window.location.pathname + window.location.search
    const next = encodeURIComponent(here)
    if (!window.location.pathname.startsWith('/login')) {
        window.location.replace(`/login?next=${next}`)
    }
}

async function readErrorMessage(res) {
    try {
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
            const j = await res.json()
            return j.error || j.message || `HTTP ${res.status}`
        }
        return await res.text()
    } catch {
        return `HTTP ${res.status}`
    }
}

export async function apiFetch(path, options = {}) {
    const { method = 'GET', headers = {}, body, ...rest } = options
    const token = getToken()

    if (token && isJwtExpired(token)) {
        store.dispatch(logout())
        redirectToLogin()
        throw new Error('Sesión expirada')
    }

    const isForm = (typeof FormData !== 'undefined') && (body instanceof FormData)
    const finalHeaders = {
        'X-Tenant-Domain': TENANT,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isForm ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
    }

    const res = await fetch(`${API_URL}${path}`, { method, headers: finalHeaders, body, ...rest })

    if (res.status === 401 || res.status === 403) {
        store.dispatch(logout())
        redirectToLogin()
        throw new Error(await readErrorMessage(res))
    }

    if (!res.ok) throw new Error(await readErrorMessage(res))

    const ct = res.headers.get('content-type') || ''
    return ct.includes('application/json') ? res.json() : res.text()
}

// ====== APIs ======

export async function loginApi(email, password) {
    const res = await fetch(`${API_URL}/tenants/webconstructor/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': TENANT
        },
        body: JSON.stringify({ email, password })
    })
    const ct = res.headers.get('content-type') || ''
    if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
            if (ct.includes('application/json')) {
                const j = await res.json(); msg = j.error || j.message || msg
            } else {
                const t = await res.text(); msg = t || msg
            }
        } catch { }
        throw new Error(msg)
    }
    return ct.includes('application/json') ? res.json() : res.text()
}

export function meApi() {
    return apiFetch('/tenants/webconstructor/me')
}
