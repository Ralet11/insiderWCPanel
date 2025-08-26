import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'

export default function RequireAuth({ children }) {
  const { token, loading } = useSelector(s => s.auth)

  if (loading) {
    return <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  }
  if (!token) {
    const loc = useLocation()
    return <Navigate to="/login" state={{ from: loc }} replace />
  }
  return children
}