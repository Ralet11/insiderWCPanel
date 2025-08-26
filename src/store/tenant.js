import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiFetch } from '../api/client'

export const resolveTenant = createAsyncThunk('tenant/resolve', async () => {
  const host = window.location.host
  return apiFetch(`/tenants/resolve?host=${encodeURIComponent(host)}`)
})

const slice = createSlice({
  name: 'tenant',
  initialState: { loading: true, info: null, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(resolveTenant.pending, (s)=>{ s.loading = true; s.error = null })
     .addCase(resolveTenant.fulfilled, (s,a)=>{ s.loading = false; s.info = a.payload })
     .addCase(resolveTenant.rejected, (s,a)=>{ s.loading = false; s.error = a.error.message })
  }
})

export default slice.reducer
