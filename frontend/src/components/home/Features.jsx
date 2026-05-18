import { Camera, Play, Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: Camera,
    title: 'Galería de Sociales',
    desc: 'Revive los mejores momentos de nuestras noches de salsa con fotos y videos.',
    link: '/galeria',
    color: 'text-fire-gold',
  },
  {
    icon: Play,
    title: 'Figuras en Video',
    desc: 'Practica en casa con nuestros videos de figuras divididos por nivel.',
    link: '/figuras',
    color: 'text-fire-orange',
  },
  {
    icon: Instagram,
    title: 'Instagram Feed',
    desc: 'Mantente al día con nuestros posts, stories y reels directamente desde la web.',
    link: '#instagram',
    color: 'text-fire-red',
  },
]

export default function Features() {
  return (
    <section className="py-20 px-4 bg-dark-obsidian">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-5xl tracking-wider text-center mb-12">
          QUÉ <span className="text-fire-gradient">ENCONTRARÁS</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Link
              key={i}
              to={f.link}
              className="group bg-dark-charcoal rounded-xl p-8 border border-dark-ash
                         hover:border-fire-red/30 transition-all hover:-translate-y-2 fire-glow-hover"
            >
              <f.icon className={`w-10 h-10 ${f.color} mb-4 group-hover:scale-110 transition-transform`} />
              <h3 className="font-heading text-2xl tracking-wider mb-2">{f.title}</h3>
              <p className="text-silver text-sm leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
