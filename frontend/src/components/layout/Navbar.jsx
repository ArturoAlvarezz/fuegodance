import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Instagram, LogIn, User, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import logo from '../../assets/logo.jpg'
import { CONTACT } from '../../data/fuegoContent'

const navLinks = [
  { path: '/', label: 'Inicio' },
  { path: '/galeria', label: 'Galería' },
  { path: '/figuras', label: 'Figuras' },
  { path: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const { isLoggedIn, user, logoutUser } = useAuth()

  const handleLogout = () => {
    logoutUser()
    setShowUserMenu(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-obsidian/70 backdrop-blur-2xl border-b border-white/10">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-fire-red/70 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Fuego Dance" className="h-11 w-11 rounded-2xl object-cover ring-2 ring-fire-red/50 group-hover:ring-fire-gold transition-all group-hover:rotate-6" />
            <div>
              <span className="block font-heading text-2xl tracking-wider text-fire-gradient leading-none">FUEGO DANCE</span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[.28em] text-muted leading-none mt-1">Salsa Casino</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`relative font-body text-sm font-semibold tracking-wide transition-colors hover:text-fire-orange ${location.pathname === link.path ? 'text-fire-gold' : 'text-silver'}`}>
                {link.label}
                {location.pathname === link.path && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-fire-red rounded-full" />}
              </Link>
            ))}
            <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white font-semibold text-sm rounded-xl hover:border-fire-red/60 hover:bg-fire-red/10 transition-all">
              <Instagram className="w-4 h-4 text-fire-red" /> {CONTACT.instagram}
            </a>

            {/* User area: login button or user info */}
            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-silver hover:text-fire-gold hover:border-fire-gold/40 transition-all"
                >
                  <User className="w-4 h-4 text-fire-gold" />
                  <span className="max-w-[120px] truncate font-semibold">{user.full_name}</span>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-dark-charcoal border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden animate-fade-up">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                        <p className="text-xs text-muted">+56 {user.phone}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-silver hover:text-fire-red hover:bg-white/5 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-silver font-semibold text-sm rounded-xl hover:text-fire-orange hover:border-fire-orange/40 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </Link>
            )}

            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2 bg-fire-red text-white font-heading tracking-wider rounded-xl hover:bg-fire-orange transition-all fire-glow-hover">
              ¡Únete!
            </a>
          </div>

          <button type="button" className="md:hidden text-silver hover:text-fire-red transition-colors" onClick={() => setIsOpen(!isOpen)} aria-label="Abrir menú">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-5 animate-fade-up border-t border-white/10 pt-4">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className={`block py-3 font-body text-sm font-semibold tracking-wide transition-colors ${location.pathname === link.path ? 'text-fire-gold' : 'text-silver hover:text-fire-orange'}`}>
                {link.label}
              </Link>
            ))}

            {/* User area in mobile menu */}
            {isLoggedIn && user ? (
              <div className="py-3 border-t border-white/10 mt-3 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-fire-red/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-fire-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.full_name}</p>
                    <p className="text-xs text-muted">+56 {user.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setIsOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-white/5 rounded-xl text-sm text-silver hover:text-fire-red transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                state={{ from: location.pathname }}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 py-3 mt-3 font-body text-sm font-semibold tracking-wide text-silver hover:text-fire-orange transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </Link>
            )}

            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="block mt-3 px-5 py-3 bg-fire-red text-white font-heading tracking-wider rounded-xl text-center hover:bg-fire-orange transition-all">
              Reservar clase
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
