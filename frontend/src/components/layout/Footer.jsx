import { Instagram, MapPin, MessageCircle, Flame } from 'lucide-react'
import logo from '../../assets/logo.jpg'
import { CONTACT, LOCATIONS } from '../../data/fuegoContent'

export default function Footer() {
  return (
    <footer className="relative bg-dark-slate border-t border-white/10 py-14 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(230,57,70,.12),transparent_36%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Fuego Dance" className="h-12 w-12 rounded-2xl object-cover ring-2 ring-fire-red/50" />
              <div>
                <span className="block font-heading text-2xl tracking-wider text-fire-gradient leading-none">FUEGO DANCE</span>
                <span className="text-xs text-muted">Baila, conecta y disfruta</span>
              </div>
            </div>
            <p className="text-muted text-sm leading-relaxed">Salsa Casino para todos en Curicó, Talca y Rancagua. Primera clase gratis, comunidad real y pista encendida.</p>
          </div>

          <div>
            <h4 className="font-heading text-xl tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-silver">
              <li><a href="/" className="hover:text-fire-orange transition-colors">Inicio</a></li>
              <li><a href="/galeria" className="hover:text-fire-orange transition-colors">Galería</a></li>
              <li><a href="/figuras" className="hover:text-fire-orange transition-colors">Figuras</a></li>
              <li><a href="/contacto" className="hover:text-fire-orange transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xl tracking-wider mb-4">Sedes</h4>
            <ul className="space-y-3 text-sm text-silver">
              {LOCATIONS.map((loc) => (
                <li key={loc.city} className="flex items-start gap-2"><MapPin className="w-4 h-4 text-fire-red mt-0.5" /><span>{loc.city} — {loc.days}</span></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xl tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-silver">
              <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-fire-gold" /><a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-fire-orange transition-colors">{CONTACT.whatsapp}</a></li>
              <li className="flex items-center gap-2"><Instagram className="w-4 h-4 text-fire-red" /><a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-fire-orange transition-colors">{CONTACT.instagram}</a></li>
              <li className="flex items-center gap-2"><Flame className="w-4 h-4 text-fire-orange" /><span>Primera clase gratis</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-xs">© 2026 Fuego Dance. Todos los derechos reservados.</p>
          <p className="text-muted text-xs">Hecho con 🔥 para la comunidad salsera</p>
        </div>
      </div>
    </footer>
  )
}
