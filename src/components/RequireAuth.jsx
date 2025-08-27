// RequireAuth.jsx
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

export default function RequireAuth({ children }) {
  const { token, loading } = useSelector(s => s.auth)

  if (!token) {
    const loc = useLocation()
    return <Navigate to="/login" state={{ from: loc }} replace />
  }

  // No desmontar children: mostramos overlay si loading
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
