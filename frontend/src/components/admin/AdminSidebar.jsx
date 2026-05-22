import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, Music, Camera, LogOut, ExternalLink } from 'lucide-react'
import logo from '../../assets/logo.jpg'

const links = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', short: 'Inicio' },
  { to: '/admin/figuras', icon: Music, label: 'Figuras', short: 'Figuras' },
  { to: '/admin/galeria', icon: Camera, label: 'Galería', short: 'Fotos' },
]

const NavLinks = ({ mobile = false, location }) => (
  <>
    {links.map((link) => {
      const active = location.pathname === link.to
      return (
        <Link
          key={link.to}
          to={link.to}
          className={mobile
            ? `shrink-0 min-w-[74px] flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl text-[11px] font-semibold transition-all ${active ? 'bg-fire-red/20 text-fire-gold ring-1 ring-fire-red/40' : 'text-silver hover:text-fire-orange hover:bg-white/5'}`
            : `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${active ? 'bg-fire-red/20 text-fire-gold fire-glow ring-1 ring-fire-red/30' : 'text-silver hover:text-fire-orange hover:bg-dark-ash/50'}`
          }
        >
          <link.icon className={mobile ? 'w-5 h-5' : 'w-5 h-5'} />
          <span>{mobile ? link.short : link.label}</span>
        </Link>
      )
    })}
  </>
)

export default function AdminSidebar() {
  const { logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <>
      {/* Mobile / tablet top navigation */}
      <header className="sticky top-0 z-40 lg:hidden bg-dark-slate/95 backdrop-blur-2xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/admin" className="min-w-0 flex items-center gap-3">
            <img src={logo} alt="Fuego Dance" className="h-10 w-10 rounded-2xl object-cover ring-2 ring-fire-red/50 shrink-0" />
            <div className="min-w-0">
              <span className="font-heading text-xl tracking-wider text-fire-gradient block leading-none truncate">FUEGO ADMIN</span>
              <span className="text-muted text-[11px] truncate block">Panel responsive</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/" aria-label="Volver al sitio" className="p-2 rounded-xl bg-white/5 text-silver hover:text-fire-orange transition-colors">
              <ExternalLink className="w-5 h-5" />
            </Link>
            <button type="button" onClick={handleLogout} aria-label="Cerrar sesión" className="p-2 rounded-xl bg-white/5 text-silver hover:text-fire-red transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="px-3 pb-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex gap-2 min-w-max">
            <NavLinks mobile location={location} />
          </div>
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen sticky top-0 bg-dark-slate border-r border-white/10 flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <img src={logo} alt="Fuego Dance" className="h-11 w-11 rounded-2xl object-cover ring-2 ring-fire-red/50" />
            <div>
              <span className="font-heading text-xl tracking-wider text-fire-gradient block leading-none">FUEGO DANCE</span>
              <span className="text-muted text-xs">Panel Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLinks location={location} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button type="button" onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium text-silver hover:text-fire-red hover:bg-dark-ash/50 transition-all">
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
          <Link to="/" className="flex items-center gap-2 mt-2 px-4 py-2 text-xs text-muted hover:text-fire-orange transition-colors">
            ← Volver al sitio
          </Link>
        </div>
      </aside>
    </>
  )
}
