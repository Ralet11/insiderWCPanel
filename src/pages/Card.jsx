import * as React from 'react'
import { Paper, Typography, Stack, Button, Chip, Divider, CircularProgress } from '@mui/material'
import { getQueueCount, getActiveCard, claimNext, markDelivered, revealCard } from '../api/vcc'
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react'

function maskCard(num = '') {
  const s = String(num || '').replace(/\D/g, '')
  if (s.length < 4) return '**** **** **** ****'
  return `**** **** **** ${s.slice(-4)}`
}

export default function CardPage() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [queue, setQueue] = React.useState({ pending: 0, locked: 0, awaitingApproval: 0 })
  const [active, setActive] = React.useState(null)
  const [busy, setBusy] = React.useState(false)
  const [secret, setSecret] = React.useState(null) // { pan, cvv, exp_month, exp_year, holder_name }

  const refresh = React.useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [q, a] = await Promise.all([
        getQueueCount().catch(() => ({ pending: 0, locked: 0, awaitingApproval: 0 })),
        getActiveCard().catch(() => null),
      ])
      setQueue(q || { pending: 0, locked: 0, awaitingApproval: 0 })
      setActive(a || null)
      setSecret(null) // si cambió la card, escondé secretos previos
    } catch (e) {
      setError(String(e.message || 'Failed to load cards'))
    } finally { setLoading(false) }
  }, [])

  React.useEffect(() => { refresh() }, [refresh])

  const onClaim = async () => {
    setBusy(true)
    try {
      await claimNext()
      await refresh()
    } catch (e) {
      setError(String(e.message || 'Claim failed'))
    } finally { setBusy(false) }
  }

  const onDeliver = async () => {
    if (!active?.id) return
    setBusy(true)
    try {
      await markDelivered(active.id)
      await refresh()
    } catch (e) {
      setError(String(e.message || 'Mark failed'))
    } finally { setBusy(false) }
  }

  const onReveal = async () => {
    if (!active?.id) return
    setBusy(true)
    try {
      const s = await revealCard(active.id)
      setSecret(s)
      setTimeout(() => setSecret(null), 60000) // auto-ocultar a los 60s
    } catch (e) {
      setError(String(e.message || 'Reveal failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="h6">Operator — Virtual Cards</Typography>
        <Typography variant="body2" color="text.secondary">
          Claim, load to Stripe manually, then mark as delivered for admin review.
        </Typography>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper sx={{ p: 2.5, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">Queue</Typography>
          <Divider sx={{ my: 1.5 }} />
          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading…</Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5}>
              <Chip label={`Pending: ${queue.pending}`} />
              <Chip label={`Locked: ${queue.locked}`} />
              <Chip label={`Awaiting approval: ${queue.awaitingApproval}`} />
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 2.5, flex: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Current Card</Typography>
          <Divider sx={{ my: 1.5 }} />
          {loading ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading…</Typography>
            </Stack>
          ) : active ? (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CreditCard size={18} />
                <Typography variant="body2">
                  {maskCard(active.card_number)} — {String(active.holder_name || '').toUpperCase()}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Exp: {String(active.exp_month).padStart(2, '0')}/{active.exp_year}
              </Typography>
              {active.amount && (
                <Typography variant="body2" color="text.secondary">
                  Amount: {active.amount} {active.currency || ''}
                </Typography>
              )}

              {!secret ? (
                <Stack direction="row" spacing={1.5}>
                  <Button variant="outlined" onClick={onReveal} disabled={busy || active.status !== 'claimed'}>
                    {busy ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />} Reveal
                  </Button>
                  <Button variant="contained" onClick={onDeliver} disabled={busy || active.status !== 'claimed'}>
                    {busy ? <Loader2 size={16} className="spin" /> : <CheckCircle size={16} />} Mark as delivered
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  <Typography variant="body2"><b>PAN:</b> {secret.pan}</Typography>
                  <Typography variant="body2"><b>CVV:</b> {secret.cvv}</Typography>
                  <Typography variant="body2">
                    <b>Exp:</b> {String(secret.exp_month).padStart(2, '0')}/{secret.exp_year}
                  </Typography>
                  <Stack direction="row" spacing={1.5}>
                    <Button size="small" onClick={async () => { try { await navigator.clipboard.writeText(secret.pan) } catch {} }}>
                      Copy PAN
                    </Button>
                    <Button size="small" onClick={async () => { try { await navigator.clipboard.writeText(secret.cvv) } catch {} }}>
                      Copy CVV
                    </Button>
                    <Button size="small" onClick={() => setSecret(null)}>Hide</Button>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Hidden in 60s automatically.</Typography>
                </Stack>
              )}

              {active.status === 'delivered' && (
                <Typography variant="caption" color="text.secondary">
                  Delivered. Waiting for admin approval before next card unlocks.
                </Typography>
              )}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">No active card.</Typography>
              <Button variant="contained" onClick={onClaim} disabled={busy || queue.pending === 0}>
                {busy ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />} Claim next
              </Button>
            </Stack>
          )}
        </Paper>
      </Stack>

      {error && (
        <Paper sx={{ p: 2, border: '1px solid #fee2e2', bgcolor: '#fff' }}>
          <Typography color="error" variant="body2">{error}</Typography>
        </Paper>
      )}
    </Stack>
  )
}
