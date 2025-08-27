// src/components/Topbar.jsx
import * as React from 'react'
import {
  AppBar, Toolbar, Typography, Box, IconButton, Avatar, Chip,
  Menu, MenuItem, ListItemIcon, Divider
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsIcon from '@mui/icons-material/Settings'
import PersonIcon from '@mui/icons-material/Person'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import { logout as logoutAction } from '../store/auth'

export default function Topbar({ onToggleSidebar }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const me = useSelector(s => s.auth.me)

  const [anchorEl, setAnchorEl] = React.useState(null)
  const menuOpen = Boolean(anchorEl)

  const openMenu = (e) => setAnchorEl(e.currentTarget)
  const closeMenu = () => setAnchorEl(null)

  const handleLogout = () => {
    closeMenu()
    dispatch(logoutAction())
    const next = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?next=${next}`, { replace: true })
  }

  return (
    <AppBar elevation={0} position="fixed" sx={{ borderBottom: '1px solid #eee', bgcolor: '#fff', color: 'inherit' }}>
      <Toolbar sx={{ gap: 2 }}>
        <IconButton onClick={onToggleSidebar} sx={{ display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Chip
          size="small"
          label='Tenant'
          sx={{ bgcolor: '#f1f5ff', color: '#2551e6', fontWeight: 600 }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
          {me?.displayName || me?.email || 'Admin'}
        </Typography>

        <IconButton onClick={openMenu} size="small" sx={{ p: 0 }}>
          <Avatar sx={{ width: 34, height: 34 }}>
            {(me?.displayName?.[0] || me?.email?.[0] || 'A').toUpperCase()}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={closeMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { mt: 1 } }}
        >
          {/* Opcionales: enlaces de cuenta / ajustes si los tenés */}
          <MenuItem component={RouterLink} to="/profile" onClick={closeMenu}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            Mi cuenta
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
