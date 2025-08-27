import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SiteConfig from './pages/SiteConfig'
import CardPage from './pages/Card'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><Layout><Dashboard/></Layout></RequireAuth>} />
        <Route path="/site-config" element={<RequireAuth><Layout><SiteConfig/></Layout></RequireAuth>} />
        <Route path="/card" element={<RequireAuth><Layout><CardPage/></Layout></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
