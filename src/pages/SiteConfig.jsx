// src/pages/SiteConfig.jsx
import * as React from 'react'
import {
  Grid, Paper, Typography, TextField, Stack, Button, Alert,
  InputAdornment, Divider, Box, Avatar, Chip, Slider, LinearProgress
} from '@mui/material'

// Íconos
import ColorizeIcon from '@mui/icons-material/Colorize'
import ImageIcon from '@mui/icons-material/Image'
import FontDownloadIcon from '@mui/icons-material/FontDownload'
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'
import TwitterIcon from '@mui/icons-material/Twitter'
import LanguageIcon from '@mui/icons-material/Language' // TikTok
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

// API
import {
  getSiteConfig as apiGetSiteConfig,
  updateSiteConfig as apiUpdateSiteConfig
} from '../api/wcSiteConfig'

/* ============================
   Mapear server <-> form
   ============================ */
function fromServer(cfg) {
  const s = cfg || {}
  return {
    brandName: s.brandName ?? '',
    primaryColor: s.primaryColor ?? '#2563eb',
    secondaryColor: s.secondaryColor ?? '#111827',
    logoUrl: s.logoUrl ?? '',
    faviconUrl: s.faviconUrl ?? '',
    fontFamily:
      s.fontFamily ??
      'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    templateKey: s.templateKey ?? 'classic',
    stars: Number.isFinite(Number(s.stars)) ? Number(s.stars) : 0,
    social: {
      facebookUrl: s.facebookUrl ?? '',
      instagramUrl: s.instagramUrl ?? '',
      tiktokUrl: s.tiktokUrl ?? '',
      youtubeUrl: s.youtubeUrl ?? '',
      xUrl: s.xUrl ?? '',
      linkedinUrl: s.linkedinUrl ?? '',
    },
    __supportsBrandName: Object.prototype.hasOwnProperty.call(s, 'brandName'),
  }
}

function toServer(form) {
  const base = {
    primaryColor: form.primaryColor || null,
    secondaryColor: form.secondaryColor || null,
    logoUrl: (form.logoUrl || '').trim() || null,
    faviconUrl: (form.faviconUrl || '').trim() || null,
    fontFamily: (form.fontFamily || '').trim() || null,
    templateKey: (form.templateKey || '').trim() || null,
    stars: Number.isFinite(Number(form.stars)) ? Number(form.stars) : 0,
    facebookUrl: (form.social?.facebookUrl || '').trim() || null,
    instagramUrl: (form.social?.instagramUrl || '').trim() || null,
    tiktokUrl: (form.social?.tiktokUrl || '').trim() || null,
    youtubeUrl: (form.social?.youtubeUrl || '').trim() || null,
    xUrl: (form.social?.xUrl || '').trim() || null,
    linkedinUrl: (form.social?.linkedinUrl || '').trim() || null,
  }
  if (form.__supportsBrandName) base.brandName = (form.brandName || '').trim() || null
  return base
}

/* ============================
   ColorField con color picker
   ============================ */
function ColorField({ label, value, onChange }) {
  const ref = React.useRef(null)
  return (
    <>
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" sx={{ alignItems: 'center' }}>
              <ColorizeIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ alignItems: 'center' }}>
              <Box
                aria-label={`Elegir ${label}`}
                onClick={() => ref.current?.click()}
                sx={{
                  width: 22, height: 22, borderRadius: '6px',
                  border: '1px solid #e5e7eb', cursor: 'pointer',
                  bgcolor: value || '#ffffff',
                }}
              />
            </InputAdornment>
          )
        }}
      />
      <input
        ref={ref}
        type="color"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        tabIndex={-1}
      />
    </>
  )
}

/* ============================
   FilePickerRow (logo / favicon)
   ============================ */
function FilePickerRow({ label, value, fileKey, previewSize = 32, setField, setFiles }) {
  const ref = React.useRef(null)
  const [localPreview, setLocalPreview] = React.useState(null)

  const pick = () => ref.current?.click()

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Guardar el File para enviar en el PUT
    setFiles(prev => ({ ...prev, [fileKey]: f }))

    // ObjectURL para ver el cambio ANTES de guardar
    const url = URL.createObjectURL(f)
    setLocalPreview(url)

    // Actualizar el form para que el <Preview /> lo muestre al instante
    setField(fileKey + 'Url', url)
  }

  React.useEffect(() => {
    return () => { if (localPreview) URL.revokeObjectURL(localPreview) }
  }, [localPreview])

  const previewSrc = localPreview || value

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        {previewSrc
          ? <Box
            component="img"
            src={previewSrc}
            alt={label}
            sx={{ width: previewSize, height: previewSize, objectFit: 'contain', border: '1px solid #eee', borderRadius: 1 }}
          />
          : <Avatar variant="rounded" sx={{ width: previewSize, height: previewSize }}>
            <ImageIcon fontSize="small" />
          </Avatar>
        }
        <Button size="small" variant="outlined" onClick={pick}>Elegir archivo</Button>
        <TextField
          value={value}
          onChange={(e) => setField(fileKey + 'Url', e.target.value)} // logoUrl / faviconUrl
          placeholder="https://..."
          fullWidth
          size="small"
          sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ImageIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Stack>
      <input ref={ref} type="file" accept="image/*" hidden onChange={onFile} />
    </Stack>
  )
}

/* ============================
   PREVIEW (memo)
   ============================ */
const Preview = React.memo(function Preview({ cfg }) {
  const stars = Math.max(0, Math.min(5, Number(cfg.stars) || 0))
  const filled = Array.from({ length: stars })
  const empty = Array.from({ length: 5 - stars })

  return (
    <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 3, boxShadow: 4 }}>
      {/* Navbar */}
      <Box sx={{ px: 2, py: 1.25, bgcolor: cfg.primaryColor, color: '#fff', display: 'flex', alignItems: 'center', gap: 1 }}>
        {cfg.logoUrl ? (
          <Box component="img" src={cfg.logoUrl} alt="logo" sx={{ width: 28, height: 28, objectFit: 'contain' }} />
        ) : (
          <Avatar sx={{ width: 28, height: 28, bgcolor: '#fff', color: cfg.primaryColor, fontSize: 16 }}>
            {(cfg.brandName?.[0] || 'W').toUpperCase()}
          </Avatar>
        )}
        <Typography sx={{ fontWeight: 700, fontFamily: cfg.fontFamily }}>
          {cfg.brandName || 'Tu Marca'}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={0.25} alignItems="center" aria-label={`${stars} estrellas`}>
          {filled.map((_, i) => <StarIcon key={`f${i}`} fontSize="small" />)}
          {empty.map((_, i) => <StarBorderIcon key={`e${i}`} fontSize="small" />)}
        </Stack>
      </Box>

      {/* Hero */}
      <Box
        sx={{
          p: 3,
          display: 'grid',
          gap: 1.25,
          background: `linear-gradient(135deg, ${cfg.secondaryColor} 0%, ${cfg.primaryColor} 100%)`,
          color: 'rgba(255,255,255,0.92)',
          fontFamily: cfg.fontFamily,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Bienvenido a {cfg.brandName || 'nuestro hotel'}
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: 560, opacity: 0.9 }}>
          Explorá habitaciones, servicios y promociones exclusivas. Esta vista previa refleja tus colores, tipografía y branding.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button sx={{ bgcolor: '#fff', color: cfg.primaryColor, fontWeight: 600, '&:hover': { bgcolor: '#fff' } }}>
            Reservar ahora
          </Button>
          <Button variant="outlined" sx={{ borderColor: '#fff', color: '#fff', '&:hover': { borderColor: '#fff' } }}>
            Ver habitaciones
          </Button>
        </Stack>
      </Box>

      {/* Contenido */}
      <Box sx={{ p: 2, bgcolor: '#fff', display: 'grid', gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: cfg.fontFamily, color: cfg.secondaryColor }}>
            Habitación Deluxe
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Cama king, vista al mar y desayuno incluido.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label="Wifi" size="small" />
            <Chip label="Desayuno" size="small" />
            <Chip label="Piscina" size="small" />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button sx={{ bgcolor: cfg.primaryColor, color: '#fff', '&:hover': { bgcolor: cfg.primaryColor } }}>
              Reservar
            </Button>
            <Button variant="outlined" sx={{ color: cfg.secondaryColor, borderColor: cfg.secondaryColor }}>
              Ver más
            </Button>
          </Stack>
        </Paper>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">Seguinos</Typography>
          {cfg.social?.facebookUrl && <FacebookRoundedIcon fontSize="small" />}
          {cfg.social?.instagramUrl && <InstagramIcon fontSize="small" />}
          {cfg.social?.tiktokUrl && <LanguageIcon fontSize="small" />} {/* TikTok */}
          {cfg.social?.youtubeUrl && <YouTubeIcon fontSize="small" />}
          {cfg.social?.xUrl && <TwitterIcon fontSize="small" />}       {/* X */}
          {cfg.social?.linkedinUrl && <LinkedInIcon fontSize="small" />}
        </Stack>
      </Box>
    </Paper>
  )
})

/* ============================
   PAGE
   ============================ */
export default function SiteConfig() {
  const [form, setForm] = React.useState(() => fromServer({}))
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [savedMsg, setSavedMsg] = React.useState(null)
  const [files, setFiles] = React.useState({ logo: null, favicon: null }) // archivos pendientes

  // Carga inicial
  React.useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setError(null); setLoading(true)
          const data = await apiGetSiteConfig()
          if (!mounted) return
          setForm(fromServer(data))
        } catch (e) {
          setError(e?.message || 'No se pudo cargar la configuración')
        } finally {
          setLoading(false)
        }
      })()
    return () => { mounted = false }
  }, [])

  // Handlers
  const setField = React.useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }, [])
  const setSocial = React.useCallback((name, value) => {
    setForm(prev => ({ ...prev, social: { ...prev.social, [name]: value } }))
  }, [])

  // Preview sin romper foco
  const deferred = React.useDeferredValue(form)

  // Guardar (misma ruta PUT; enviamos multipart con archivos opcionales)
  const handleSave = React.useCallback(async () => {
    try {
      setSaving(true); setError(null)
      const payload = toServer(form)

      // Si hay archivos, el server setea las URLs finales; no enviemos los blob:
      if (files.logo) delete payload.logoUrl
      if (files.favicon) delete payload.faviconUrl

      const updated = await apiUpdateSiteConfig(payload, files)
      const next = fromServer(updated || payload)
      setForm(next)
      setFiles({ logo: null, favicon: null })
      setSavedMsg('Configuración guardada')
      setTimeout(() => setSavedMsg(null), 1600)
    } catch (e) {
      setError(e?.message || 'No se pudo guardar la configuración')
    } finally {
      setSaving(false)
    }
  }, [form, files])

  return (
    <Grid container spacing={2}>
      {/* FORM */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Configuración del sitio</Typography>

            {loading && <LinearProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {savedMsg && <Alert severity="success">{savedMsg}</Alert>}

            {/* Colores */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="flex-start"
            >
              <Box sx={{ flex: 1 }}>
                <ColorField
                  label="Color primario"
                  value={form.primaryColor}
                  onChange={(v) => setField('primaryColor', v)}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ColorField
                  label="Color secundario"
                  value={form.secondaryColor}
                  onChange={(v) => setField('secondaryColor', v)}
                />
              </Box>
            </Stack>

            {/* Assets: Logo y Favicon */}
            <FilePickerRow
              label="Logo"
              value={form.logoUrl}
              fileKey="logo"
              previewSize={36}
              setField={setField}
              setFiles={setFiles}
            />
            <FilePickerRow
              label="Favicon"
              value={form.faviconUrl}
              fileKey="favicon"
              previewSize={24}
              setField={setField}
              setFiles={setFiles}
            />

            {/* Tipografía */}
            <TextField
              label="Tipografía (CSS font-family)"
              value={form.fontFamily}
              onChange={(e) => setField('fontFamily', e.target.value)}
              fullWidth
              sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
              InputProps={{ startAdornment: <InputAdornment position="start"><FontDownloadIcon fontSize="small" /></InputAdornment> }}
            />

            {/* Estrellas */}
            <Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mb: .5 }}>
                Estrellas del hotel: {form.stars}
              </Typography>
              <Slider
                value={Number(form.stars) || 0}
                onChange={(_, v) => setField('stars', Number(v))}
                min={0} max={5} step={1}
                marks
              />
            </Stack>

            {/* Redes sociales */}
            <Divider />
            <Typography variant="subtitle2">Redes sociales</Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 1.5,
                alignItems: 'start',
              }}
            >
              <TextField
                label="Facebook"
                value={form.social.facebookUrl}
                onChange={(e) => setSocial('facebookUrl', e.target.value)}
                placeholder="https://... o @hotel"
                fullWidth
                sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><FacebookRoundedIcon fontSize="small" /></InputAdornment> }}
              />
              <TextField
                label="Instagram"
                value={form.social.instagramUrl}
                onChange={(e) => setSocial('instagramUrl', e.target.value)}
                placeholder="https://... o @hotel"
                fullWidth
                sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><InstagramIcon fontSize="small" /></InputAdornment> }}
              />
              <TextField
                label="TikTok"
                value={form.social.tiktokUrl}
                onChange={(e) => setSocial('tiktokUrl', e.target.value)}
                placeholder="https://... o @hotel"
                fullWidth
                sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" /></InputAdornment> }}
              />
              <TextField
                label="YouTube"
                value={form.social.youtubeUrl}
                onChange={(e) => setSocial('youtubeUrl', e.target.value)}
                placeholder="channel/... o @hotel"
                fullWidth
                sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><YouTubeIcon fontSize="small" /></InputAdornment> }}
              />
              <TextField
                label="X (Twitter)"
                value={form.social.xUrl}
                onChange={(e) => setSocial('xUrl', e.target.value)}
                placeholder="https://x.com/... o @hotel"
                fullWidth
                sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><TwitterIcon fontSize="small" /></InputAdornment> }}
              />
              <TextField
                label="LinkedIn"
                value={form.social.linkedinUrl}
                onChange={(e) => setSocial('linkedinUrl', e.target.value)}
                placeholder="company/... o in/usuario"
                fullWidth
                sx={{ '& .MuiInputBase-root': { alignItems: 'center' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon fontSize="small" /></InputAdornment> }}
              />
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* PREVIEW */}
      <Grid item xs={12} md={6}>
        <Preview cfg={deferred} />
      </Grid>
    </Grid>
  )
}
