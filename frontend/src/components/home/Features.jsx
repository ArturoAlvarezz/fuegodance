import { Camera, Play, Instagram, MapPin, CalendarDays, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  { icon: MapPin, title: '3 Sedes activas', desc: 'Curicó, Talca y Rancagua con horarios y direcciones claras.', link: '/contacto', color: 'text-fire-red' },
  { icon: CalendarDays, title: 'Eventos & Sociales', desc: 'Social Latino, workshops, clases especiales y comunidad en movimiento.', link: '#instagram', color: 'text-fire-gold' },
  { icon: Play, title: 'Figuras en Video', desc: 'Espacio listo para agregar figuras de Salsa Casino con su video respectivo.', link: '/figuras', color: 'text-fire-orange' },
  { icon: Camera, title: 'Galería viva', desc: 'Fotos de clases, sociales y momentos memorables de la comunidad.', link: '/galeria', color: 'text-fire-gold' },
  { icon: Instagram, title: '@fuegodance.cl', desc: 'Contenido visual inspirado en el perfil oficial de Instagram.', link: '#instagram', color: 'text-fire-red' },
  { icon: Flame, title: 'Primera clase gratis', desc: 'CTA directo a WhatsApp para reservar sin fricción.', link: '/contacto', color: 'text-fire-orange' },
]

export default function Features() {
  return (
    <section className="py-24 px-4 bg-dark-obsidian">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-5xl sm:text-7xl tracking-wider text-center mb-4">QUÉ <span className="text-fire-gradient">ENCONTRARÁS</span></h2>
        <p className="text-center text-silver/80 max-w-2xl mx-auto mb-12">Una web pensada para convertir visitas en alumnos: sedes, clases, eventos, figuras, galería y contacto directo.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link key={f.title} to={f.link} className="group relative overflow-hidden bg-dark-charcoal/80 rounded-[1.75rem] p-7 border border-white/10 hover:border-fire-red/35 transition-all hover:-translate-y-2 fire-glow-hover animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-fire-red/10 blur-2xl group-hover:bg-fire-orange/20 transition-colors" />
              <f.icon className={`relative w-11 h-11 ${f.color} mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform`} />
              <h3 className="relative font-heading text-3xl tracking-wider mb-2">{f.title}</h3>
              <p className="relative text-silver/80 text-sm leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
