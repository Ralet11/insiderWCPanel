// src/components/RequireAuth.jsx
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { logout } from '../store/auth'

function isJwtExpired(token) {
  try {
    const [, payload] = token.split('.')
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' && (Date.now() / 1000) >= (exp - 30)
  } catch {
    return false
  }
}

export default function RequireAuth({ children }) {
  const dispatch = useDispatch()
  const location = useLocation() // ← hook SIEMPRE arriba
  const { token, loading } = useSelector(s => s.auth)

  if (!token || isJwtExpired(token)) {
    if (token && isJwtExpired(token)) dispatch(logout())
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // No desmontamos children: sólo overlay si loading
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {loading && (
        <Box
          sx={{
            position: 'absolute', inset: 0,
            display: 'grid', placeItems: 'center',
            bgcolor: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(1px)'
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  )
}
