import { MapPin, Clock, Flame } from 'lucide-react'
import { CONTACT, LOCATIONS } from '../../data/fuegoContent'

export default function Locations() {
  return (
    <section className="relative py-24 px-4 bg-dark-obsidian overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(252,191,73,.12),transparent_28%),radial-gradient(circle_at_90%_15%,rgba(230,57,70,.14),transparent_32%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-heading text-5xl sm:text-7xl tracking-wider">SEDES <span className="text-fire-gradient">ENCENDIDAS</span></h2>
          <p className="text-silver/90 max-w-2xl mx-auto mt-4">Curicó, Talca y Rancagua: horarios, direcciones y niveles actualizados desde el perfil oficial.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-16">
          {LOCATIONS.map((loc, i) => (
            <article key={loc.city} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl fire-glow-hover animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
              <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${loc.accent} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[.32em] text-muted">Sede</p>
                    <h3 className="font-heading text-4xl tracking-wider text-white">{loc.city}</h3>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-fire-red/15 border border-fire-red/30 flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Flame className="w-7 h-7 text-fire-red" />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex gap-3 text-sm text-silver"><Clock className="w-5 h-5 text-fire-orange shrink-0" /><span>{loc.days}</span></div>
                  <div className="flex gap-3 text-sm text-silver">
                    <a
                      href={loc.mapaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 text-sm text-silver hover:text-fire-gold transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-fire-gold shrink-0" />
                      <span>{loc.address}</span>
                    </a>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {loc.levels.map((level) => (
                    <div key={level.label} className="rounded-2xl bg-dark-obsidian/60 border border-white/10 p-4">
                      <p className="font-heading text-xl tracking-wider text-fire-gradient">{level.label}</p>
                      <p className="text-sm text-silver">{level.time}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted leading-relaxed">{loc.vibe}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
