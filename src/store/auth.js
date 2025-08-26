import { createSlice } from '@reduxjs/toolkit'

const TOKEN_KEY = 'panel_jwt'

const initialState = {
  token: sessionStorage.getItem(TOKEN_KEY) || null,
  me: null,
  loading: false,
  error: null,
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading(s) { s.loading = true; s.error = null },
    setError(s, a) { s.loading = false; s.error = a.payload || 'Error' },
    setToken(s, a) { s.loading = false; s.token = a.payload; sessionStorage.setItem(TOKEN_KEY, a.payload) },
    setMe(s, a) { s.me = a.payload },
    logout(s) { s.token = null; s.me = null; sessionStorage.removeItem(TOKEN_KEY) },
    hydrateToken(s) { const t = sessionStorage.getItem(TOKEN_KEY); if (t) s.token = t },
  }
})

export const { startLoading, setError, setToken, setMe, logout, hydrateToken } = slice.actions
export default slice.reducer
