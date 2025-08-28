// src/pages/Dashboard.jsx
import * as React from 'react'
import {
  Box, Grid, Paper, Typography, Stack, Chip, Button, Divider,
  Avatar, CircularProgress, Snackbar
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { apiFetch } from '../api/wcAuth'

const TENANT = window.location.host

export default function Dashboard() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [me, setMe] = React.useState(null)
  const [cfg, setCfg] = React.useState(null)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    let alive = true
      ; (async () => {
        setLoading(true); setError('')
        try {
          // 1) Usuario actual (privado) — apiFetch maneja 401/403 y redirige a /login
          const meData = await apiFetch('/tenants/webconstructor/me')
          // 2) Config pública (para preview)
          const cfgData = await apiFetch('/tenants/webconstructor/site/config')

          if (!alive) return
          setMe(meData)
          setCfg({
            primaryColor: cfgData?.primaryColor || '#2563eb',
            secondaryColor: cfgData?.secondaryColor || '#111827',
            logoUrl: cfgData?.logoUrl || '',
            fontFamily: cfgData?.fontFamily || 'Inter, sans-serif'
          })
        } catch (e) {
          if (!alive) return
          setError(String(e.message || 'Error al cargar el tablero'))
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => { alive = false }
  }, [])

  if (loading) {
    return (
      <Stack sx={{ py: 6, alignItems: 'center', color: 'text.secondary' }} spacing={2}>
        <CircularProgress size={24} />
        <Typography variant="body2">Cargando tablero…</Typography>
      </Stack>
    )
  }

  if (error) {
    return <Typography color="error">{error}</Typography>
  }

  const publicDomain = (TENANT === 'localhost:5173')
    ? 'restaurantlocal.com'
    : (TENANT.replace(/^panel\./, '') || '—')

  const copyPreviewUrl = async () => {
    const url = `https://${publicDomain}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch { /* ignore */ }
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Typography variant="h5">Hola, {me?.displayName || me?.email || 'Admin'} 👋</Typography>
        <Typography variant="body2" color="text.secondary">
          Bienvenido al constructor de sitios — administración del tenant
        </Typography>
      </Box>

      {/* Fila de “métricas” simples */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary">Estado del sitio</Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
              <Chip size="small" label="Activo" color="success" />
              <Typography variant="caption" color="text.secondary">
                Dominio: {publicDomain}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button size="small" onClick={copyPreviewUrl}>Copiar URL</Button>
              <Button size="small" variant="outlined" href={`https://${publicDomain}`} target="_blank" rel="noreferrer">
                Abrir sitio
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary">Tu cuenta</Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
              <Avatar sx={{ width: 36, height: 36 }}>
                {(me?.displayName?.[0] || me?.email?.[0] || 'A').toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ lineHeight: 1.2 }}>{me?.displayName || '—'}</Typography>
                <Typography variant="caption" color="text.secondary">{me?.email}</Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="text.secondary">
              Permisos: {Array.isArray(me?.permissions) && me.permissions.length ? me.permissions.join(', ') : '—'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary">Atajos</Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1 }}>
              <Button size="small" component={RouterLink} to="/site-config">Configurar sitio</Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Accede rápido a las secciones clave
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Vista previa mini del sitio con los colores actuales */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" color="text.secondary">Vista previa (mini)</Typography>
        <Divider sx={{ my: 1.5 }} />
        <Box
          sx={{
            border: '1px dashed #e5e7eb',
            borderRadius: 2,
            p: 2,
            display: 'grid',
            gap: 1.5,
            background: '#fff',
            fontFamily: cfg?.fontFamily || 'Inter, sans-serif'
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {cfg?.logoUrl
              ? <Box component="img" src={cfg.logoUrl} alt="logo" sx={{ width: 42, height: 42, objectFit: 'contain' }} />
              : <Avatar sx={{ bgcolor: cfg?.secondaryColor || '#111827' }}>W</Avatar>
            }
            <Typography variant="h6" sx={{ color: cfg?.secondaryColor || '#111827', mb: 0 }}>
              WebConstructor
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Esta vista previa usa los colores y la tipografía configurados.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button sx={{ bgcolor: cfg?.primaryColor || '#2563eb', '&:hover': { bgcolor: cfg?.primaryColor || '#2563eb' } }}>
              Botón primario
            </Button>
            <Button variant="outlined" sx={{ color: cfg?.secondaryColor || '#111827', borderColor: cfg?.secondaryColor || '#111827' }}>
              Botón secundario
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={1200}
        onClose={() => setCopied(false)}
        message="URL copiada al portapapeles"
      />
    </Stack>
  )
}