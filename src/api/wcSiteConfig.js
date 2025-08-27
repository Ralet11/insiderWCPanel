// src/api/wcSiteConfig.js
import { apiFetch } from './wcAuth'

/** GET privado */
export function getSiteConfig() {
    return apiFetch('/tenants/webconstructor/site-config')
}

export async function updateSiteConfig(payload, files = {}) {
    const fd = new FormData()
    for (const [k, v] of Object.entries(payload || {})) {
        fd.append(k, v == null ? '' : String(v))
    }
    if (files.logo instanceof File) fd.append('logo', files.logo)
    if (files.favicon instanceof File) fd.append('favicon', files.favicon)

    return apiFetch('/tenants/webconstructor/site-config', {
        method: 'PUT',
        body: fd
    })
}
