import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Instagram } from 'lucide-react'
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
  const location = useLocation()

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
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="block mt-3 px-5 py-3 bg-fire-red text-white font-heading tracking-wider rounded-xl text-center hover:bg-fire-orange transition-all">
              Reservar clase
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
