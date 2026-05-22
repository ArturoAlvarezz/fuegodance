import { Music, Users, Heart, Sparkles } from 'lucide-react'

const cards = [
  { icon: Music, title: 'Salsa Casino', text: 'Figuras, vueltas, musicalidad y conexión real de pareja. Desde cero, sin miedo y con método.' },
  { icon: Users, title: 'Comunidad', text: 'Clases, sociales y workshops para conocer gente, soltar la rutina y crecer bailando.' },
  { icon: Heart, title: 'Energía Fuego', text: 'Aquí no solo aprendes pasos: vienes a disfrutar, reírte, conectar y prender la pista.' },
]

export default function About() {
  return (
    <section className="relative py-24 px-4 bg-dark-charcoal overflow-hidden">
      <div className="absolute inset-0 fuego-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-fire-gold uppercase tracking-[.32em] text-xs mb-4"><Sparkles className="w-4 h-4" /> Escuela de baile</div>
            <h2 className="font-heading text-5xl sm:text-7xl tracking-wider mb-6">NO ES SOLO BAILAR. ES <span className="text-fire-gradient">PERTENECER</span></h2>
            <p className="text-silver/90 text-lg leading-relaxed mb-6">Fuego Dance nace como una comunidad salsera donde cada clase mezcla técnica, alegría y conexión. No importa si nunca has bailado: aquí comienzas desde cero y avanzas a tu ritmo.</p>
            <p className="text-muted leading-relaxed">La identidad del Instagram lo deja claro: clases para todos, energía social, ciudades activas y una familia que no para de crecer en Curicó, Talca y Rancagua.</p>
          </div>

          <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-5">
            {cards.map((card, i) => (
              <div key={card.title} className="group rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl hover:border-fire-orange/40 hover:-translate-y-1 transition-all animate-fade-up" style={{ animationDelay: `${i * 120}ms` }}>
                <card.icon className="w-10 h-10 text-fire-orange mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
                <h3 className="font-heading text-3xl tracking-wider mb-2">{card.title}</h3>
                <p className="text-silver/80 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
