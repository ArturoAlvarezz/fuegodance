import { Flame, Instagram, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-slate border-t border-dark-ash py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6 text-fire-red" />
              <span className="font-heading text-xl tracking-wider text-fire-gradient">
                FUEGO DANCE
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Academia de salsa donde la pasión se convierte en movimiento.
              Aprende, baila y siente el fuego.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-silver">
              <li><a href="/" className="hover:text-fire-orange transition-colors">Inicio</a></li>
              <li><a href="/galeria" className="hover:text-fire-orange transition-colors">Galería</a></li>
              <li><a href="/figuras" className="hover:text-fire-orange transition-colors">Figuras</a></li>
              <li><a href="/contacto" className="hover:text-fire-orange transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-silver">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-fire-red" />
                <span>Ubicación por confirmar</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-fire-red" />
                <span>info@fuegodance.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-fire-red" />
                <a
                  href="https://www.instagram.com/fuegodance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-fire-orange transition-colors"
                >
                  @fuegodance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-ash text-center">
          <p className="text-muted text-xs">
            © {new Date().getFullYear()} Fuego Dance. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
