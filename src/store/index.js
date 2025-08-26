import { configureStore } from '@reduxjs/toolkit'
import tenantReducer from './tenant'
import authReducer from './auth'
import usersReducer from './users'
import siteConfigReducer from './siteConfig'

export const store = configureStore({
  reducer: {
    tenant: tenantReducer,
    auth: authReducer,
    users: usersReducer,
    siteConfig: siteConfigReducer
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false })
})
