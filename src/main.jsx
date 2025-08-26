import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { store } from './store'
import AppRouter from './router'
import theme from './theme'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { hydrateToken, setMe } from './store/auth'
import { meApi } from './api/wcAuth'

store.dispatch(hydrateToken())

function Bootstrapper({ children }) {
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)

  React.useEffect(() => {
    let alive = true
    async function run() {
      if (!token) return
      try {
        const me = await meApi()
        if (alive) dispatch(setMe(me))
      } catch (e) {
        console.warn('me error', e)
      }
    }
    run()
    return () => { alive = false }
  }, [token, dispatch])

  return children
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Bootstrapper>
          <AppRouter />
        </Bootstrapper>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
)
