import { Calendar, Clock, MapPin, Ticket, Sparkles, MessageCircle, Shirt } from 'lucide-react'
import { CONTACT } from '../../data/fuegoContent'

export default function UpcomingEvent() {
  // Datos del evento 1° Aniversario Fuego Dance + Social Latino Talca
  const event = {
    title: '1° Aniversario',
    subtitle: 'Social Latino Talca × Fuego Dance',
    date: 'Sábado 11 de julio',
    time: '20:00 hrs',
    place: 'Talca · 45 Oriente 1022',
    ticketPresale: '$10.000',
    ticketDoor: '$15.000',
    whatsappMessage: 'Hola! Quiero reservar mi entrada para el 1° Aniversario de Fuego Dance 🎉',
    dressCode: 'Elegante',
    image: '/api/instagram/media/DaEE0i_P9Kd',
    instagramUrl: 'https://www.instagram.com/p/DaEE0i_P9Kd/',
  }

  const whatsappUrl = `${CONTACT.whatsappUrl}?text=${encodeURIComponent(event.whatsappMessage)}`

  return (
    <section className="relative py-24 px-4 bg-dark-charcoal overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(252,191,73,.10),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(230,57,70,.12),transparent_40%)]" />
      <div className="absolute inset-0 fuego-grid opacity-10" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fire-red/10 border border-fire-red/30 mb-5">
            <Sparkles className="w-4 h-4 text-fire-gold" />
            <span className="text-xs uppercase tracking-[.32em] text-fire-gold">Próximo evento</span>
          </div>
          <h2 className="font-heading text-5xl sm:text-7xl tracking-wider">
            {event.title} <span className="text-fire-gradient">FUEGO DANCE</span>
          </h2>
          <p className="text-silver/85 max-w-2xl mx-auto mt-4 text-lg">
            {event.subtitle} · Una noche para celebrar 1 año bailando contigo 🔥
          </p>
        </div>

        {/* Card */}
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Flyer */}
          <div className="lg:col-span-2 group relative animate-fade-up">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-fire-red/20 via-fire-orange/15 to-fire-gold/20 blur-3xl group-hover:opacity-100 opacity-70 transition-opacity" />
            <div className="relative rounded-2xl overflow-hidden border border-fire-gold/30 shadow-[0_0_60px_rgba(230,57,70,.25)]">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-3 space-y-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
            {/* Cuándo + Dónde */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-dark-obsidian/60 border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-fire-orange" />
                  <span className="text-xs uppercase tracking-[.28em] text-muted">Cuándo</span>
                </div>
                <p className="font-heading text-2xl tracking-wider text-white">{event.date}</p>
                <div className="flex items-center gap-2 mt-2 text-silver text-sm">
                  <Clock className="w-4 h-4 text-fire-gold" />
                  <span>Inicia a las {event.time}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-dark-obsidian/60 border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-fire-gold" />
                  <span className="text-xs uppercase tracking-[.28em] text-muted">Dónde</span>
                </div>
                <p className="font-heading text-2xl tracking-wider text-white">Talca</p>
                <p className="text-silver text-sm mt-2">45 Oriente 1022, Las Rastras</p>
              </div>
            </div>

            {/* Qué incluye */}
            <div className="rounded-2xl bg-dark-obsidian/60 border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[.28em] text-muted mb-3">Qué incluye</p>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-silver text-sm">
                <li className="flex items-center gap-2">🎧 DJ invitado Felipe Gómez</li>
                <li className="flex items-center gap-2">🎤 Música en vivo</li>
                <li className="flex items-center gap-2">💃 Presentaciones especiales</li>
                <li className="flex items-center gap-2">🎁 Sorteos y sorpresas</li>
                <li className="flex items-center gap-2">🔥 Ambiente 100% latino</li>
                <li className="flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-fire-orange" /> Dress code: {event.dressCode}
                </li>
              </ul>
            </div>

            {/* Entradas */}
            <div className="rounded-2xl bg-gradient-to-br from-fire-red/15 via-fire-orange/10 to-fire-gold/15 border border-fire-gold/30 p-5">
              <div className="flex items-center gap-3 mb-3">
                <Ticket className="w-5 h-5 text-fire-gold" />
                <span className="text-xs uppercase tracking-[.28em] text-fire-gold">Entradas limitadas</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Preventa</p>
                  <p className="font-heading text-4xl text-fire-gradient tracking-wider">
                    {event.ticketPresale}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Puerta</p>
                  <p className="font-heading text-4xl text-white tracking-wider">
                    {event.ticketDoor}
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-fire-red to-fire-orange text-white font-heading text-lg tracking-wider hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(230,57,70,.4)] transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Reservar por WhatsApp
              </a>
              <a
                href={event.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-white/15 text-silver hover:text-white hover:border-fire-gold/40 transition-all font-heading text-lg tracking-wider"
              >
                Ver en Instagram
              </a>
            </div>

            <p className="text-center text-muted text-xs pt-2">
              Cupos limitados · No te lo pierdas
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
