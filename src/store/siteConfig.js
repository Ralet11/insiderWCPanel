import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiFetch } from '../api/client'

export const fetchSiteConfig = createAsyncThunk('siteConfig/get', async () => apiFetch('/panel/site-config'))
export const updateSiteConfig = createAsyncThunk('siteConfig/update', async (cfg) => apiFetch('/panel/site-config', { method:'PUT', body: JSON.stringify(cfg) }))

const slice = createSlice({
  name:'siteConfig',
  initialState:{ data:null, loading:false, error:null, saved:false },
  reducers:{ clearSaved(s){ s.saved=false } },
  extraReducers:(b)=>{
    b.addCase(fetchSiteConfig.pending,(s)=>{ s.loading=true; s.error=null })
     .addCase(fetchSiteConfig.fulfilled,(s,a)=>{ s.loading=false; s.data=a.payload })
     .addCase(fetchSiteConfig.rejected,(s,a)=>{ s.loading=false; s.error=a.error.message })
     .addCase(updateSiteConfig.fulfilled,(s,a)=>{ s.data=a.payload; s.saved=true })
  }
})

export const { clearSaved } = slice.actions
export default slice.reducer
