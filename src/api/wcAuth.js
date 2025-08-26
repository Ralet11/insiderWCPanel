const API_URL = import.meta.env.VITE_API_URL
const TENANT = import.meta.env.VITE_TENANT_DOMAIN || window.location.host
const TOKEN_KEY = 'panel_jwt'

function getToken() {
    return sessionStorage.getItem(TOKEN_KEY)
}

async function handle(res) {
    if (res.ok) {
        const ct = res.headers.get('content-type') || ''
        return ct.includes('application/json') ? res.json() : res.text()
    }
    const ct = res.headers.get('content-type') || ''
    let msg = `HTTP ${res.status}`
    try {
        if (ct.includes('application/json')) {
            const j = await res.json()
            msg = j.error || j.message || msg
        } else {
            const t = await res.text()
            msg = t || msg
        }
    } catch { }
    throw new Error(msg)
}

export async function loginApi(email, password) {
    const res = await fetch(`${API_URL}/tenants/webconstructor/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Domain': TENANT
        },
        body: JSON.stringify({ email, password })
    })
    return handle(res) // -> { token }
}

export async function meApi() {
    const token = getToken()
    const res = await fetch(`${API_URL}/tenants/webconstructor/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': TENANT
        }
    })
    return handle(res)
}

export function saveToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY)
}
