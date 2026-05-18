import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Flame } from 'lucide-react'

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-slate/80 backdrop-blur-md border-b border-dark-ash">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Flame className="w-8 h-8 text-fire-red group-hover:text-fire-orange transition-colors" />
            <span className="font-heading text-2xl tracking-wider text-fire-gradient">
              FUEGO DANCE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-sm font-semibold tracking-wide transition-colors hover:text-fire-orange
                  ${location.pathname === link.path ? 'text-fire-red' : 'text-silver'}`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/fuegodance/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 bg-fire-red text-white font-semibold text-sm rounded-lg
                         hover:bg-fire-orange transition-all fire-glow-hover"
            >
              ¡Únete!
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-silver hover:text-fire-red transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-up">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 px-4 rounded-lg transition-colors
                  ${location.pathname === link.path
                    ? 'text-fire-red bg-dark-ash'
                    : 'text-silver hover:text-fire-orange hover:bg-dark-ash/50'}`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://www.instagram.com/fuegodance/"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-center px-5 py-2 bg-fire-red text-white font-semibold rounded-lg"
            >
              ¡Únete!
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
