import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Flame, Home, Music2, MessageCircle } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Ir al inicio' },
  { to: '/playlist', icon: Music2, label: 'Escuchar la playlist' },
  { to: '/contacto', icon: MessageCircle, label: 'Contacto' },
]

export default function NotFound() {
  return (
    <>
    <Helmet>
      <title>Página no encontrada | Fuego Dance</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <section className="relative pt-28 pb-24 px-4 bg-dark-obsidian min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(230,57,70,.2),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(247,127,0,.1),transparent_35%)]" />
      <div className="absolute inset-0 fuego-grid opacity-20" />

      <div className="relative max-w-2xl mx-auto text-center">
        <Flame className="w-16 h-16 text-fire-red mx-auto mb-6 animate-floaty" />
        <p className="font-heading text-[8rem] sm:text-[11rem] leading-none tracking-wider text-fire-gradient">404</p>
        <h1 className="font-heading text-4xl sm:text-5xl tracking-wider mt-2">ESTE PASO NO EXISTE</h1>
        <p className="text-silver/85 mt-4 leading-relaxed">
          Nos perdimos en la rueda: la página que buscas no está o cambió de lugar.
          Vuelve a la pista desde aquí.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={i === 0
                ? 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-fire-red text-white font-heading text-lg tracking-wider hover:bg-fire-orange transition-all fire-glow-hover'
                : 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-silver font-heading text-lg tracking-wider hover:text-fire-orange hover:border-fire-orange/40 transition-all'}
            >
              <link.icon className="w-5 h-5" /> {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
