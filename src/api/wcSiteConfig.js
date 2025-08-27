const API_URL = import.meta.env.VITE_API_URL
const TENANT = window.location.host
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

/**
 * files: { logo?: File, favicon?: File }
 */
export async function updateSiteConfig(payload, files = {}) {
    const fd = new FormData()

    // Aplanamos payload (ya viene "plano" desde toServer)
    for (const [k, v] of Object.entries(payload || {})) {
        // En FormData todo va como string; null/undefined => ''
        fd.append(k, v == null ? '' : String(v))
    }

    // Adjuntar archivos si hay
    if (files.logo instanceof File) fd.append('logo', files.logo)
    if (files.favicon instanceof File) fd.append('favicon', files.favicon)

    const res = await fetch(`${API_URL}/tenants/webconstructor/site-config`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token()}`,
            'X-Tenant-Domain': TENANT
            // Importante: NO seteamos Content-Type manualmente (lo hace el browser)
        },
        body: fd
    })
    return handle(res)
}
