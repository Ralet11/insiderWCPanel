import { useState } from 'react'
import { Box, Container, Toolbar } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const SIDEBAR_W = 272

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Topbar onToggleSidebar={() => setOpen(v => !v)} />
      <Sidebar width={SIDEBAR_W} open={open} onClose={() => setOpen(false)} />
      <Box component="main"
        sx={{
          ml: { md: `${SIDEBAR_W}px` },
          px: { xs: 2, md: 3 },
          pb: 4
        }}>
        <Toolbar /> {/* empuja debajo del AppBar */}
        <Container maxWidth="xl" disableGutters sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
