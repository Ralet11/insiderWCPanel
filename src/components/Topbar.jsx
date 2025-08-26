import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Chip } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useSelector } from 'react-redux'

export default function Topbar({ onToggleSidebar }) {
  const { info } = useSelector(s => s.tenant)
  const me = useSelector(s => s.auth.me)

  return (
    <AppBar elevation={0} position="fixed" sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ gap: 2 }}>
        <IconButton onClick={onToggleSidebar} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Chip
          size="small"
          label={info?.name || info?.publicDomain || 'Tenant'}
          sx={{ bgcolor: '#f1f5ff', color: '#2551e6', fontWeight: 600 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
          {me?.displayName || 'Admin'}
        </Typography>
        <Avatar sx={{ width: 34, height: 34 }}>
          {(me?.displayName?.[0] || 'A').toUpperCase()}
        </Avatar>
      </Toolbar>
    </AppBar>
  )
}
