// src/api/vcc.js
import { apiFetch } from './wcAuth'

export function getQueueCount() {
  return apiFetch('/tenants/webconstructor/vcc/queue/count')
}

export function getActiveCard() {
  return apiFetch('/tenants/webconstructor/vcc/active')
}

export function claimNext() {
  return apiFetch('/tenants/webconstructor/vcc/queue/claim', { method: 'POST' })
}

export function markDelivered(id) {
  return apiFetch(`/tenants/webconstructor/vcc/${id}/deliver`, { method: 'POST' })
}

export function revealCard(id) {
  return apiFetch(`/tenants/webconstructor/vcc/${id}/reveal`)
}
