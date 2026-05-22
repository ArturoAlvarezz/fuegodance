import { Instagram, ExternalLink, Flame } from 'lucide-react'
import { CONTACT, INSTAGRAM_POSTS } from '../../data/fuegoContent'

const gradients = [
  'from-fire-red via-fire-orange to-fire-gold',
  'from-fire-orange via-fire-red to-fire-coral',
  'from-fire-gold via-fire-orange to-fire-red',
  'from-fire-red via-dark-ash to-fire-gold',
]

export default function InstagramFeed() {
  return (
    <section id="instagram" className="relative py-24 px-4 bg-dark-charcoal overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(247,127,0,.14),transparent_38%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Instagram className="w-8 h-8 text-fire-red" />
              <span className="text-fire-gold uppercase tracking-[.35em] text-xs">Instagram oficial</span>
            </div>
            <h2 className="font-heading text-5xl sm:text-7xl tracking-wider">PULSO <span className="text-fire-gradient">FUEGO</span></h2>
            <p className="text-silver/85 max-w-2xl mt-3">Últimas publicaciones relevantes: clases, intensivos, eventos y comunidad. Inspirado en el estilo visual de {CONTACT.instagram}.</p>
          </div>
          <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-fire-red/40 text-fire-gold hover:bg-fire-red/10 transition-all font-heading text-lg tracking-wider">
            VER PERFIL <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {INSTAGRAM_POSTS.map((post, i) => (
            <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-dark-obsidian fire-glow-hover animate-fade-up min-h-[430px]" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`relative h-72 bg-gradient-to-br ${gradients[i % gradients.length]} overflow-hidden`}>
                <div className="absolute inset-0 fuego-grid opacity-50" />
                <div className="absolute -left-12 -bottom-16 h-48 w-48 rounded-full bg-white/20 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                <div className="absolute right-5 top-5 h-14 w-14 rounded-2xl bg-dark-obsidian/30 border border-white/20 backdrop-blur flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs uppercase tracking-[.28em] text-white/80 mb-2">{post.tag}</p>
                  <h3 className="font-heading text-4xl tracking-wider leading-none text-white drop-shadow-[0_0_18px_rgba(0,0,0,.35)]">{post.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs uppercase tracking-[.22em] text-fire-gold mb-2">{post.meta}</p>
                <p className="text-sm text-silver/85 leading-relaxed line-clamp-3">{post.caption}</p>
                <span className="inline-flex items-center gap-2 mt-5 font-heading text-lg tracking-wider text-fire-orange group-hover:text-fire-gold transition-colors">VER EN INSTAGRAM <ExternalLink className="w-4 h-4" /></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
