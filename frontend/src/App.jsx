import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Figures from './pages/Figures'
import Contact from './pages/Contact'
import AdminLayout from './components/admin/AdminLayout'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import FiguresAdmin from './pages/admin/FiguresAdmin'
import GalleryAdmin from './pages/admin/GalleryAdmin'
import VideosAdmin from './pages/admin/VideosAdmin'
import MessagesAdmin from './pages/admin/MessagesAdmin'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="galeria" element={<Gallery />} />
        <Route path="figuras" element={<Figures />} />
        <Route path="contacto" element={<Contact />} />
      </Route>

      {/* Admin login (no layout) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin panel */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="figuras" element={<FiguresAdmin />} />
        <Route path="galeria" element={<GalleryAdmin />} />
        <Route path="videos" element={<VideosAdmin />} />
        <Route path="mensajes" element={<MessagesAdmin />} />
      </Route>
    </Routes>
  )
}

export default App
