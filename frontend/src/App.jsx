import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Figures from './pages/Figures'
import Contact from './pages/Contact'
import UserLogin from './pages/UserLogin'
import Playlist from './pages/Playlist'
import NotFound from './pages/NotFound'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import FiguresAdmin from './pages/admin/FiguresAdmin'
import GalleryAdmin from './pages/admin/GalleryAdmin'
import UsersAdmin from './pages/admin/UsersAdmin'
import PlaylistAdmin from './pages/admin/PlaylistAdmin'
import { useAuth } from './hooks/useAuth'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="galeria" element={<Gallery />} />
        <Route path="figuras" element={
          <ProtectedRoute>
            <Figures />
          </ProtectedRoute>
        } />
        <Route path="playlist" element={<Playlist />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* User login (no layout) */}
      <Route path="/login" element={<UserLogin />} />

      {/* Admin login (no layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin panel */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="figuras" element={<FiguresAdmin />} />
        <Route path="galeria" element={<GalleryAdmin />} />
        <Route path="usuarios" element={<UsersAdmin />} />
        <Route path="playlist" element={<PlaylistAdmin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}

export default App
