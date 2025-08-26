// src/pages/SiteConfig.jsx
import * as React from 'react'
import {
  Grid, Paper, Typography, TextField, Stack, Button, Alert,
  InputAdornment, Divider, Box, Avatar, Snackbar, CircularProgress,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material'
import ColorizeIcon from '@mui/icons-material/Colorize'
import ImageIcon from '@mui/icons-material/Image'
import FontDownloadIcon from '@mui/icons-material/FontDownload'

const API_URL = import.meta.env.VITE_API_URL
const TENANT = import.meta.env.VITE_TENANT_DOMAIN || window.location.host
const TOKEN_KEY = 'panel_jwt'

/* -------------------- NUEVO: defaults + normalizador -------------------- */
const DEFAULT_CFG = Object.freeze({
  primaryColor: '#2563eb',
  secondaryColor: '#111827',
  logoUrl: '',
  faviconUrl: '',
  fontFamily: 'Inter, sans-serif',
  templateKey: 'classic',
  stars: 0
})

/** Combina datos del server con defaults (y sanea estrellas) */
function normalizeCfg(input) {
  const src = input || {}
  const starsNum = Number(src.stars ?? DEFAULT_CFG.stars)
  const stars = Number.isFinite(starsNum) ? Math.max(0, Math.min(5, starsNum)) : 0
  return {
    ...DEFAULT_CFG,
    ...src,
    stars
  }
}
/* ----------------------------------------------------------------------- */

export default function SiteConfig() {
  // estado
  const [cfg, setCfg] = React.useState(null)
  const [templates, setTemplates] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [saved, setSaved] = React.useState(false)

  // helpers locales
  const token = () => sessionStorage.getItem(TOKEN_KEY)
  const handle = async (res) => {
    if (res.ok) {
      const ct = res.headers.get('content-type') || ''
      return ct.includes('application/json') ? res.json() : res.text()
    }
    let msg = `HTTP ${res.status}`
    try {
      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const j = await res.json(); msg = j.error || j.message || msg
      } else {
        const t = await res.text(); msg = t || msg
      }
    } catch { }
    throw new Error(msg)
  }

  // cargar al entrar: config + templates
  React.useEffect(() => {
    let alive = true
      ; (async () => {
        setLoading(true); setError('')
        try {
          // 1) Config privada
          const res1 = await fetch(`${API_URL}/tenants/webconstructor/site-config`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token()}`,
              'X-Tenant-Domain': TENANT
            }
          })
          const data = await handle(res1)

          // 2) Catálogo de plantillas
          const res2 = await fetch(`${API_URL}/tenants/webconstructor/templates`, {
            headers: {
              'Authorization': `Bearer ${token()}`,
              'X-Tenant-Domain': TENANT
            }
          })
          const tpls = await handle(res2)

          if (!alive) return
          setTemplates(Array.isArray(tpls) ? tpls : [])
          setCfg(normalizeCfg(data))  // 👈 un solo lugar define defaults
        } catch (e) {
          if (!alive) return
          setError(String(e.message || 'Error al cargar'))
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => { alive = false }
  }, [])

  // acciones
  const onSave = async () => {
    if (!cfg) return
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch(`${API_URL}/tenants/webconstructor/site-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
          'X-Tenant-Domain': TENANT
        },
        body: JSON.stringify(cfg)
      })
      const data = await handle(res)
      setCfg(normalizeCfg(data))  // 👈 sin duplicar claves
      setSaved(true)
    } catch (e) {
      setError(String(e.message || 'Error al guardar'))
    } finally {
      setSaving(false)
    }
  }

  const onRestore = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/tenants/webconstructor/site-config`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token()}`,
          'X-Tenant-Domain': TENANT
        }
      })
      const data = await handle(res)
      setCfg(normalizeCfg(data))   // 👈 idem
    } catch (e) {
      setError(String(e.message || 'Error al restaurar'))
    } finally {
      setLoading(false)
    }
  }

  // UI
  if (loading) {
    return (
      <Stack sx={{ py: 6, alignItems: 'center', color: 'text.secondary' }} spacing={2}>
        <CircularProgress size={24} />
        <Typography variant="body2">Cargando configuración…</Typography>
      </Stack>
    )
  }
  if (!cfg) return <Alert severity="error">{error || 'No se pudo cargar la configuración'}</Alert>

  const Field = ({ label, value, onChange, startIcon, type = 'text' }) => (
    <TextField
      label={label}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      fullWidth
      InputProps={startIcon ? { startAdornment: <InputAdornment position="start">{startIcon}</InputAdornment> } : undefined}
      type={type}
    />
  )

  return (
    <Stack spacing={2}>
      <div>
        <Typography variant="h6">Configuración del sitio</Typography>
        <Typography variant="body2" color="text.secondary">Colores, logos, tipografía y plantilla</Typography>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              {/* Plantilla */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="tpl-label">Plantilla</InputLabel>
                  <Select
                    labelId="tpl-label"
                    label="Plantilla"
                    value={cfg.templateKey || 'classic'}
                    onChange={(e) => setCfg({ ...cfg, templateKey: e.target.value })}
                  >
                    {templates.map(t => (
                      <MenuItem key={t.key} value={t.key}>
                        {t.name} {t.version ? `(${t.version})` : ''}
                      </MenuItem>
                    ))}
                    {!templates.length && <MenuItem value="classic">Clásico (por defecto)</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>

              {/* Estrellas */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="stars-label">Estrellas</InputLabel>
                  <Select
                    labelId="stars-label"
                    value={cfg.stars || 0}
                    label="Estrellas"
                    onChange={(e) => setCfg({ ...cfg, stars: Number(e.target.value) })}
                  >
                    {[0, 1, 2, 3, 4, 5].map(n => (
                      <MenuItem key={n} value={n}>{n} {n === 1 ? 'estrella' : 'estrellas'}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Colores */}
              <Grid item xs={12} md={4}>
                <Field
                  label="Color primario"
                  value={cfg.primaryColor}
                  onChange={(v) => setCfg({ ...cfg, primaryColor: v })}
                  startIcon={<ColorizeIcon fontSize="small" />}
                />
                <Box sx={{ mt: 1 }}>
                  <input
                    type="color"
                    value={cfg.primaryColor || DEFAULT_CFG.primaryColor}
                    onChange={(e) => setCfg({ ...cfg, primaryColor: e.target.value })}
                    style={{ width: 48, height: 32, border: '1px solid #e5e7eb', borderRadius: 6, padding: 2, background: '#fff' }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Field
                  label="Color secundario"
                  value={cfg.secondaryColor}
                  onChange={(v) => setCfg({ ...cfg, secondaryColor: v })}
                  startIcon={<ColorizeIcon fontSize="small" />}
                />
                <Box sx={{ mt: 1 }}>
                  <input
                    type="color"
                    value={cfg.secondaryColor || DEFAULT_CFG.secondaryColor}
                    onChange={(e) => setCfg({ ...cfg, secondaryColor: e.target.value })}
                    style={{ width: 48, height: 32, border: '1px solid #e5e7eb', borderRadius: 6, padding: 2, background: '#fff' }}
                  />
                </Box>
              </Grid>

              {/* Assets */}
              <Grid item xs={12}>
                <Field
                  label="Logo URL"
                  value={cfg.logoUrl}
                  onChange={(v) => setCfg({ ...cfg, logoUrl: v })}
                  startIcon={<ImageIcon fontSize="small" />}
                />
              </Grid>

              <Grid item xs={12}>
                <Field
                  label="Favicon URL"
                  value={cfg.faviconUrl}
                  onChange={(v) => setCfg({ ...cfg, faviconUrl: v })}
                  startIcon={<ImageIcon fontSize="small" />}
                />
              </Grid>

              {/* Tipografía */}
              <Grid item xs={12}>
                <Field
                  label="Tipografía (CSS font-family)"
                  value={cfg.fontFamily}
                  onChange={(v) => setCfg({ ...cfg, fontFamily: v })}
                  startIcon={<FontDownloadIcon fontSize="small" />}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              <Button onClick={onSave} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
              <Button variant="outlined" onClick={onRestore} disabled={saving}>Restaurar</Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary">Vista previa</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                border: '1px dashed #e5e7eb',
                borderRadius: 2,
                p: 2,
                display: 'grid',
                gap: 1.5,
                background: '#fff',
                fontFamily: cfg.fontFamily
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {cfg.logoUrl
                  ? <Box component="img" src={cfg.logoUrl} alt="logo" sx={{ width: 42, height: 42, objectFit: 'contain' }} />
                  : <Avatar sx={{ bgcolor: cfg.secondaryColor || DEFAULT_CFG.secondaryColor }}>W</Avatar>
                }
                <Typography variant="h6" sx={{ color: cfg.secondaryColor || DEFAULT_CFG.secondaryColor, mb: 0 }}>
                  {cfg.templateKey === 'classic' ? 'Clásico' : (cfg.templateKey || 'WebConstructor')}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Esta vista previa usa los colores, tipografía y plantilla seleccionados.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button sx={{ bgcolor: cfg.primaryColor || DEFAULT_CFG.primaryColor, '&:hover': { bgcolor: cfg.primaryColor || DEFAULT_CFG.primaryColor } }}>
                  Botón primario
                </Button>
                <Button variant="outlined" sx={{ color: (cfg.secondaryColor || DEFAULT_CFG.secondaryColor), borderColor: (cfg.secondaryColor || DEFAULT_CFG.secondaryColor) }}>
                  Botón secundario
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={saved}
        onClose={() => setSaved(false)}
        autoHideDuration={1600}
        message="Configuración guardada"
      />
    </Stack>
  )
}
