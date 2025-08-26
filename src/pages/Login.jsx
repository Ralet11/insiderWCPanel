import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { startLoading, setError, setToken, setMe } from '../store/auth'
import { loginApi, meApi } from '../api/wcAuth'
import {
  Box, Card, CardContent, CardHeader,
  TextField, Button, Stack, Typography, Divider, InputAdornment, Alert
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token, me } = useSelector(s => s.auth)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  React.useEffect(() => {
    if (token && me) navigate('/', { replace: true })
  }, [token, me, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      dispatch(setError('Completá email y contraseña'))
      return
    }
    try {
      dispatch(startLoading())
      const out = await loginApi(email, password)   // { token }
      dispatch(setToken(out.token))                 // guarda en redux + sessionStorage
      const meResp = await meApi()                  // ahora lee el token desde sessionStorage
      dispatch(setMe(meResp))
      navigate('/', { replace: true })
    } catch (err) {
      // Limpiamos mensajes HTML feos y mostramos corto
      const msg = (err.message || '').startsWith('<') ? 'Error de autenticación' : String(err.message)
      dispatch(setError(msg))
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: t => t.palette.background.default, p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 440, boxShadow: 4 }}>
        <CardHeader title="Ingresá a tu cuenta" subheader="Constructor de sitios — multi-tenant" sx={{ textAlign: 'center', pb: 0, pt: 3 }} />
        <CardContent sx={{ pt: 2 }}>
          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }}
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> }}
            />
            <Button type="submit" disabled={loading} size="large">{loading ? 'Ingresando…' : 'Entrar'}</Button>
            <Divider flexItem />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              ¿Problemas para ingresar? Recuperar acceso
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
