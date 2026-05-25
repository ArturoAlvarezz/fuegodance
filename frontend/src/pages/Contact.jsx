import { MapPin, Instagram, Clock, MessageCircle } from 'lucide-react'
import { CONTACT, LOCATIONS } from '../data/fuegoContent'
import { Helmet } from 'react-helmet-async'

export default function Contact() {
  return (
    <>
    <Helmet>
      <title>Contacto — Reserva tu Clase Gratis | Fuego Dance</title>
      <meta name="description" content="Contacta Fuego Dance: WhatsApp, Instagram y sedes en Curicó, Talca y Rancagua. Reserva tu primera clase de Salsa Casino gratis." />
      <link rel="canonical" href="https://fuegodance.cl/contacto" />
      <meta property="og:title" content="Contacto — Fuego Dance" />
      <meta property="og:description" content="Reserva tu primera clase de Salsa Casino gratis en Curicó, Talca o Rancagua." />
      <meta property="og:url" content="https://fuegodance.cl/contacto" />
    </Helmet>
    <section className="relative pt-28 pb-20 px-4 bg-dark-obsidian min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(230,57,70,.18),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(252,191,73,.12),transparent_30%)]" />
      <div className="relative max-w-7xl mx-auto">
        <h2 className="font-heading text-6xl sm:text-8xl tracking-wider text-center mb-4"><span className="text-fire-gradient">CONTACTO</span></h2>
        <p className="text-silver/90 text-center mb-12 max-w-2xl mx-auto">Reserva tu primera clase gratis, elige sede y prende la pista con Fuego Dance.</p>

        <div className="space-y-5">
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 rounded-[1.75rem] border border-fire-red/30 bg-fire-red/10 p-6 hover:bg-fire-red/15 transition-all fire-glow-hover">
            <div className="w-14 h-14 bg-fire-red rounded-2xl flex items-center justify-center"><MessageCircle className="w-7 h-7 text-white" /></div>
            <div><h3 className="font-heading text-3xl tracking-wider">WhatsApp directo</h3><p className="text-silver">{CONTACT.whatsapp} — reserva tu clase</p></div>
          </a>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-5 rounded-[1.75rem] border border-fire-gold/25 bg-white/[0.04] p-6 hover:bg-fire-gold/10 transition-all">
            <div className="w-14 h-14 bg-fire-gold/15 border border-fire-gold/30 rounded-2xl flex items-center justify-center"><Instagram className="w-7 h-7 text-fire-gold" /></div>
            <div><h3 className="font-heading text-3xl tracking-wider">Instagram</h3><p className="text-silver">{CONTACT.instagram}</p></div>
          </a>

          <div className="grid sm:grid-cols-3 gap-4 pt-3">
            {LOCATIONS.map((loc) => (
              <div key={loc.city} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                <MapPin className="w-6 h-6 text-fire-red mb-3" />
                <h3 className="font-heading text-2xl tracking-wider mb-1">{loc.city}</h3>
                <a href={loc.mapaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-silver mb-3 hover:text-fire-orange transition-colors block">{loc.address}</a>
                <div className="flex items-center gap-2 text-xs text-muted"><Clock className="w-3 h-3" /> {loc.days}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
