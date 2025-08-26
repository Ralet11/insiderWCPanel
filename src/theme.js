import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f7f7fb',
      paper: '#ffffff'
    },
    primary: { main: '#2563eb' },
    secondary: { main: '#111827' },
    text: { primary: '#111827', secondary: '#5f6b7a' }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    h5: { fontWeight: 600, letterSpacing: '-.02em' },
    subtitle1: { fontWeight: 500 }
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,.06)',
    '0 4px 10px rgba(0,0,0,.06)',
    '0 8px 24px rgba(0,0,0,.07)',
    ...Array(21).fill('0 8px 24px rgba(0,0,0,.07)')
  ],
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 16, border: '1px solid #eee' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: '1px solid #eee' } } },
    MuiButton: { defaultProps: { variant: 'contained' }, styleOverrides: { root: { textTransform: 'none', borderRadius: 12 } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiAppBar: { styleOverrides: { root: { background: '#fff' } } },
    MuiToolbar: { styleOverrides: { root: { minHeight: 64 } } }
  }
})

export default theme
