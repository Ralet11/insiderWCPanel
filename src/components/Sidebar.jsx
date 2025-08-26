import { Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography } from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupIcon from '@mui/icons-material/Group'
import SettingsIcon from '@mui/icons-material/Settings'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { NavLink, useLocation } from 'react-router-dom'

const items = [
  { to: '/', icon: <DashboardIcon />, label: 'Dashboard' },
  { to: '/site-config', icon: <SettingsIcon />, label: 'Configuración del sitio' },
  { to: '/card', icon: <CreditCardIcon />, label: 'Operator' },
  { to: '/users', icon: <GroupIcon />, label: 'Usuarios' },
]

export default function Sidebar({ open, onClose, width = 272 }) {
  const loc = useLocation()
  const content = (
    <Box sx={{ width }}>
      <Toolbar />
      <Box sx={{ px: 1.5, py: 1 }}>
        <List sx={{ gap: .5, display: 'grid' }}>
          {items.map(it => {
            const active = loc.pathname === it.to
            return (
              <ListItemButton
                key={it.to}
                component={NavLink}
                to={it.to}
                onClick={onClose}
                sx={{
                  borderRadius: 10,
                  ...(active && { bgcolor: '#eef2ff', '& .MuiListItemIcon-root': { color: '#2563eb' } })
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="caption" color="text.secondary">© {new Date().getFullYear()} WebConstructor</Typography>
      </Box>
    </Box>
  )

  return (
    <>
      <Drawer open={open} onClose={onClose} sx={{ display: { xs: 'block', md: 'none' } }}>
        {content}
      </Drawer>
      <Drawer variant="permanent" sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': { position: 'fixed', width }
      }}>
        {content}
      </Drawer>
    </>
  )
}
