const API_URL = import.meta.env.VITE_API_URL
const TENANT = import.meta.env.VITE_TENANT_DOMAIN || window.location.host
const TOKEN_KEY = 'panel_jwt'
const token = () => sessionStorage.getItem(TOKEN_KEY)

async function handle(res) {
    if (res.ok) return res.json()
    const ct = res.headers.get('content-type') || ''
    let msg = `HTTP ${res.status}`
    try {
        if (ct.includes('application/json')) { const j = await res.json(); msg = j.error || j.message || msg }
        else { const t = await res.text(); msg = t || msg }
    } catch { }
    throw new Error(msg)
}

export async function getSiteConfig() {
    const res = await fetch(`${API_URL}/tenants/webconstructor/site-config`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
            'X-Tenant-Domain': TENANT
        }
    })
    return handle(res)
}

export async function updateSiteConfig(payload) {
    const res = await fetch(`${API_URL}/tenants/webconstructor/site-config`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
            'X-Tenant-Domain': TENANT
        },
        body: JSON.stringify(payload)
    })
    return handle(res)
}
