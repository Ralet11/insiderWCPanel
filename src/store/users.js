import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiFetch } from '../api/client'

export const fetchUsers = createAsyncThunk('users/fetch', async () => apiFetch('/panel/accounts'))
export const createUser = createAsyncThunk('users/create', async (p) => apiFetch('/panel/accounts', { method: 'POST', body: JSON.stringify(p) }))
export const updateUser = createAsyncThunk('users/update', async ({id,data}) => apiFetch(`/panel/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }))
export const deleteUser = createAsyncThunk('users/delete', async (id) => { await apiFetch(`/panel/accounts/${id}`, { method: 'DELETE' }); return id })

const slice = createSlice({
  name:'users',
  initialState:{ rows:[], loading:false, error:null },
  reducers:{},
  extraReducers:(b)=>{
    b.addCase(fetchUsers.pending,(s)=>{ s.loading=true; s.error=null })
     .addCase(fetchUsers.fulfilled,(s,a)=>{ s.loading=false; s.rows=a.payload })
     .addCase(fetchUsers.rejected,(s,a)=>{ s.loading=false; s.error=a.error.message })
     .addCase(createUser.fulfilled,(s,a)=>{ s.rows.push(a.payload) })
     .addCase(updateUser.fulfilled,(s,a)=>{ const i=s.rows.findIndex(r=>r.id===a.payload.id); if(i>=0) s.rows[i]=a.payload })
     .addCase(deleteUser.fulfilled,(s,a)=>{ s.rows=s.rows.filter(r=>r.id!==a.payload) })
  }
})
export default slice.reducer
