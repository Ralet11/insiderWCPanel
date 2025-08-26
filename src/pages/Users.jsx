// src/pages/Users.jsx
import * as React from 'react'
import {
  Box, Paper, Typography, Stack, Button, Alert, CircularProgress,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormGroup, FormControlLabel, Checkbox, Tooltip, Snackbar, Divider
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

const API_URL = import.meta.env.VITE_API_URL
const TENANT = import.meta.env.VITE_TENANT_DOMAIN || window.location.host
const TOKEN_KEY = 'panel_jwt'

export default function Users() {
  // estado base
  const [rows, setRows] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [snack, setSnack] = React.useState('')

  // dialog create/edit
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState(null) // objeto cuenta o null
  const [email, setEmail] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isActive, setIsActive] = React.useState(true)
  const [roles, setRoles] = React.useState([])
  const [permissions, setPermissions] = React.useState([])

  // helpers
  const token = () => sessionStorage.getItem(TOKEN_KEY)
  const authHeaders = () => ({
    'Authorization': `Bearer ${token()}`,
    'X-Tenant-Domain': TENANT,
    'Content-Type': 'application/json'
  })
  const handle = async (res) => {
    if (res.ok) {
      const ct = res.headers.get('content-type') || ''
      return ct.includes('application/json') ? res.json() : res.text()
    }

    if (res.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY)
      // Si usás react-router:
      window.location.assign('/login')
      return
    }

    if (res.status === 403) {
      throw new Error('No tenés permiso para ver esta sección')
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

  // cargar lista
  const load = React.useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/tenants/webconstructor/accounts`, { headers: authHeaders() })
      /*const data = await handle(res)
      setRows(Array.isArray(data) ? data : [])*/
      const data = await handle(res)
      const normalize = (v) => {
        if (Array.isArray(v)) return v
        if (typeof v === 'string') {
          try { const j = JSON.parse(v); if (Array.isArray(j)) return j } catch { }
          return v.split(',').map(s => s.trim()).filter(Boolean)
        }
        return []
      }
      const rows = (Array.isArray(data) ? data : []).map(r => ({
        ...r,
        roles: normalize(r.roles),
        permissions: normalize(r.permissions),
      }))
      setRows(rows)
    } catch (e) {
      setError(String(e.message || 'Error al cargar usuarios'))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  // abrir modal (nuevo / editar)
  const openCreate = () => {
    setEditing(null)
    setEmail('')
    setDisplayName('')
    setPassword('')
    setIsActive(true)
    setRoles([])
    setPermissions([])
    setOpen(true)
  }
  const openEdit = (row) => {
    setEditing(row)
    setEmail(row.email || '')
    setDisplayName(row.displayName || '')
    setPassword('')
    setIsActive(!!row.isActive)
    const norm = (v) => Array.isArray(v) ? v : typeof v === 'string' && v
      ? (() => { try { const j = JSON.parse(v); return Array.isArray(j) ? j : v.split(',').map(s => s.trim()).filter(Boolean) } catch { return v.split(',').map(s => s.trim()).filter(Boolean) } })()
      : []
    setRoles(norm(row.roles))
    setPermissions(norm(row.permissions))
    setOpen(true)
  }

  // guardar (POST o PUT)
  const onSave = async () => {
    try {
      const body = {
        email,
        displayName,
        isActive,
        roles,
        permissions,
        ...(editing ? {} : { password }) // password obligatorio solo al crear
      }
      if (editing && password) body.password = password // si se lo cambian en edición

      const url = editing
        ? `${API_URL}/tenants/webconstructor/accounts/${editing.id}`
        : `${API_URL}/tenants/webconstructor/accounts`

      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
      })
      await handle(res)
      setOpen(false)
      setSnack(editing ? 'Usuario actualizado' : 'Usuario creado')
      await load()
    } catch (e) {
      setError(String(e.message || 'Error al guardar'))
    }
  }

  // activar/desactivar
  const toggleStatus = async (id) => {
    if (!confirm('¿Seguro?')) return
    try {
      const res = await fetch(`${API_URL}/tenants/webconstructor/accounts/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders()
      })
      await handle(res)
      setSnack('Estado actualizado')
      await load()
    } catch (e) {
      setError(String(e.message || 'Error al actualizar estado'))
    }
  }

  // reset password (rápido)
  const resetPass = async (id) => {
    const next = prompt('Nueva contraseña para este usuario:')
    if (!next) return
    try {
      const res = await fetch(`${API_URL}/tenants/webconstructor/accounts/${id}/reset-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ password: next })
      })
      await handle(res)
      setSnack('Contraseña actualizada')
    } catch (e) {
      setError(String(e.message || 'Error al actualizar contraseña'))
    }
  }

  // helpers de UI simples
  const RoleChips = ({ list }) => {
    let arr = []
    if (Array.isArray(list)) arr = list
    else if (typeof list === 'string' && list) {
      try { const j = JSON.parse(list); if (Array.isArray(j)) arr = j; else arr = list.split(',').map(s => s.trim()).filter(Boolean) }
      catch { arr = list.split(',').map(s => s.trim()).filter(Boolean) }
    }
    if (!arr.length) arr = ['—']
    return (
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
        {arr.map((r, i) => <Chip key={i} size="small" label={r} />)}
      </Stack>
    )
  }

  // listado
  if (loading) {
    return (
      <Stack sx={{ py: 6, alignItems: 'center', color: 'text.secondary' }} spacing={2}>
        <CircularProgress size={24} />
        <Typography variant="body2">Cargando usuarios…</Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6">Usuarios del panel</Typography>
          <Typography variant="body2" color="text.secondary">Gestioná cuentas y roles</Typography>
        </Box>
        <Button startIcon={<AddIcon />} onClick={openCreate}>Nuevo usuario</Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {error === 'No tenés permiso para ver esta sección' && (
        <Typography variant="caption" color="text.secondary">
          Pedile al admin el permiso <b>MANAGE_ACCOUNTS</b>.
        </Typography>
      )}
      <Paper sx={{ p: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary' }}>
                  Sin usuarios
                </TableCell>
              </TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.displayName || '—'}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell><RoleChips list={r.roles} /></TableCell>
                <TableCell>
                  {r.isActive ? <Chip size="small" color="success" label="Activo" /> : <Chip size="small" label="Inactivo" />}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => openEdit(r)}><EditIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title={r.isActive ? 'Desactivar' : 'Activar'}>
                    <IconButton onClick={() => toggleStatus(r.id)}>
                      {r.isActive ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Resetear contraseña">
                    <IconButton onClick={() => resetPass(r.id)}><RestartAltIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog Create / Edit */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
            <TextField label="Nombre a mostrar" value={displayName} onChange={e => setDisplayName(e.target.value)} fullWidth />
            <TextField
              label={editing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
            />
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
                label="Activo"
              />
            </FormGroup>

            {/* Roles/Permisos simples como CSV para no complicar el UI por ahora */}
            <Divider />
            <TextField
              label="Roles (separados por coma)"
              value={roles.join(',')}
              onChange={e => setRoles(
                e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              )}
              fullWidth
            />
            <TextField
              label="Permisos (separados por coma)"
              value={permissions.join(',')}
              onChange={e => setPermissions(
                e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              )}
              helperText="Ej: SITE_CONFIG, MANAGE_ACCOUNTS"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={onSave} disabled={!email || (!editing && !password)}>{editing ? 'Guardar cambios' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={1500}
        onClose={() => setSnack('')}
        message={snack}
      />
    </Stack>
  )
}
