import { Link } from 'react-router-dom'
import { Flame, ChevronDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-obsidian via-dark-charcoal to-dark-obsidian" />

      {/* Subtle fire glow at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fire-red/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[200px] bg-fire-orange/8 rounded-full blur-[100px]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Flame className="w-12 h-12 text-fire-red animate-pulse-slow" />
        </div>

        <h1 className="font-heading text-7xl sm:text-8xl md:text-9xl tracking-wider text-fire-gradient mb-4">
          FUEGO DANCE
        </h1>

        <p className="font-accent text-2xl sm:text-3xl text-fire-gold mb-6">
          Donde la pasión se convierte en movimiento
        </p>

        <p className="text-silver text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Academia de salsa para todos los niveles. Aprende desde las figuras básicas
          hasta las combinaciones más avanzadas en un ambiente lleno de energía y ritmo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/figuras"
            className="px-8 py-3 bg-fire-red text-white font-heading text-xl tracking-wider rounded-lg
                       hover:bg-fire-orange transition-all fire-glow animate-glow"
          >
            EMPIEZA A PRACTICAR
          </a>
          <a
            href="/galeria"
            className="px-8 py-3 border-2 border-fire-red text-fire-red font-heading text-xl tracking-wider rounded-lg
                       hover:bg-fire-red/10 transition-all"
          >
            VER GALERÍA
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-muted" />
      </div>
    </section>
  )
}
