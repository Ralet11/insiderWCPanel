import { configureStore } from '@reduxjs/toolkit'
import tenantReducer from './tenant'
import authReducer from './auth'
import usersReducer from './users'

export const store = configureStore({
  reducer: {
    tenant: tenantReducer,
    auth: authReducer,
    users: usersReducer
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false })
})
