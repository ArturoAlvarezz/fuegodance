import { Link } from 'react-router-dom'
import { ChevronDown, Instagram, MessageCircle, Sparkles } from 'lucide-react'
import logo from '../../assets/logo.jpg'
import { CONTACT } from '../../data/fuegoContent'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-obsidian">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(230,57,70,.25),transparent_30%),radial-gradient(circle_at_80%_35%,rgba(247,127,0,.18),transparent_35%),linear-gradient(180deg,#070707,#17070a_45%,#0D0D0D)]" />
      <div className="absolute inset-0 fuego-grid opacity-40" />
      <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-fire-red/25 blur-[90px] animate-orbit" />
      <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-fire-orange/20 blur-[110px] animate-magma" />
      <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fire-gold/10 animate-spin-slow" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12 grid lg:grid-cols-[1fr_.85fr] gap-12 items-center">
        <div className="text-center lg:text-left animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire-gold/30 bg-white/5 px-4 py-2 mb-6 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-fire-gold" />
            <span className="text-xs uppercase tracking-[0.35em] text-fire-gold">Salsa Casino · Curicó · Talca · Rancagua</span>
          </div>

          <h1 className="font-heading text-7xl sm:text-8xl md:text-[9.5rem] leading-[.82] tracking-wider mb-6">
            <span className="block text-white drop-shadow-[0_0_20px_rgba(230,57,70,.45)]">FUEGO</span>
            <span className="block text-fire-gradient animate-gradient-x">DANCE</span>
          </h1>

          <p className="font-accent text-3xl sm:text-4xl text-fire-gold mb-5 animate-floaty">
            {CONTACT.slogan} 💃🕺
          </p>

          <p className="text-silver/90 text-lg sm:text-xl max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Clases para todos: empiezas desde cero, aprendes figuras reales de Salsa Casino y entras a una comunidad con sociales, workshops y pura energía.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="magnetic-btn w-full sm:w-auto px-8 py-4 bg-fire-red text-white font-heading text-xl tracking-wider rounded-2xl fire-glow animate-glow">
              RESERVA TU CLASE
            </a>
            <Link to="/figuras" className="w-full sm:w-auto px-8 py-4 border border-fire-gold/50 text-fire-gold font-heading text-xl tracking-wider rounded-2xl hover:bg-fire-gold/10 transition-all">
              FIGURAS EN VIDEO
            </Link>
            <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-5 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:border-fire-red/60 transition-all flex items-center justify-center gap-2">
              <Instagram className="w-5 h-5 text-fire-red" /> {CONTACT.instagram}
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none min-h-[420px] flex items-center justify-center">
          <div className="absolute h-80 w-80 rounded-[40%_60%_50%_50%] bg-gradient-to-br from-fire-red via-fire-orange to-fire-gold opacity-30 blur-2xl animate-blob" />
          <div className="absolute h-[25rem] w-[25rem] rounded-full border border-fire-red/25 animate-spin-slow" />
          <div className="relative p-4 rounded-[2rem] bg-white/[0.06] border border-white/10 backdrop-blur-2xl shadow-[0_0_80px_rgba(230,57,70,.22)] animate-hover-card">
            <img src={logo} alt="Fuego Dance Logo" className="h-72 w-72 sm:h-96 sm:w-96 rounded-[1.5rem] object-cover ring-2 ring-fire-red/50" />
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-fire-orange/30 bg-dark-charcoal/90 backdrop-blur-xl p-4 shadow-2xl animate-floaty">
              <p className="text-xs uppercase tracking-[.25em] text-muted">Primera clase</p>
              <p className="font-heading text-3xl text-fire-gradient">GRATIS</p>
            </div>
            <div className="absolute -top-5 -right-5 rounded-2xl border border-fire-gold/30 bg-dark-charcoal/90 backdrop-blur-xl p-4 shadow-2xl animate-floaty-delay">
              <p className="text-xs uppercase tracking-[.25em] text-muted">WhatsApp</p>
              <p className="font-heading text-xl text-fire-gold flex items-center gap-2"><MessageCircle className="w-4 h-4" /> {CONTACT.whatsapp}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-fire-gold" />
      </div>
    </section>
  )
}
