import { MapPin, Mail, Instagram, Clock, Send } from 'lucide-react'

export default function Contact() {
  return (
    <section className="pt-24 pb-20 px-4 bg-dark-obsidian min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-5xl tracking-wider text-center mb-4">
          <span className="text-fire-gradient">CONTACTO</span>
        </h2>
        <p className="text-silver text-center mb-12">
          ¿Tienes preguntas? ¡Escríbenos y te respondemos!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-dark-ash rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-fire-red" />
              </div>
              <div>
                <h3 className="font-heading text-xl tracking-wider mb-1">Ubicación</h3>
                <p className="text-silver text-sm">Por confirmar</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-dark-ash rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-fire-orange" />
              </div>
              <div>
                <h3 className="font-heading text-xl tracking-wider mb-1">Horarios</h3>
                <p className="text-silver text-sm">Clases y sociales — por confirmar</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-dark-ash rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-fire-gold" />
              </div>
              <div>
                <h3 className="font-heading text-xl tracking-wider mb-1">Email</h3>
                <p className="text-silver text-sm">info@fuegodance.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-dark-ash rounded-xl flex items-center justify-center flex-shrink-0">
                <Instagram className="w-6 h-6 text-fire-red" />
              </div>
              <div>
                <h3 className="font-heading text-xl tracking-wider mb-1">Instagram</h3>
                <a
                  href="https://www.instagram.com/fuegodance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fire-orange hover:text-fire-gold transition-colors text-sm"
                >
                  @fuegodance
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form className="bg-dark-charcoal rounded-xl p-8 border border-dark-ash space-y-6">
            <div>
              <label className="block text-sm text-silver mb-2">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full bg-dark-ash border border-dark-ash rounded-lg px-4 py-3 text-white
                           placeholder-muted focus:outline-none focus:border-fire-red transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-silver mb-2">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full bg-dark-ash border border-dark-ash rounded-lg px-4 py-3 text-white
                           placeholder-muted focus:outline-none focus:border-fire-red transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-silver mb-2">Mensaje</label>
              <textarea
                rows={4}
                placeholder="¿En qué podemos ayudarte?"
                className="w-full bg-dark-ash border border-dark-ash rounded-lg px-4 py-3 text-white
                           placeholder-muted focus:outline-none focus:border-fire-red transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-fire-red text-white
                         font-heading text-lg tracking-wider rounded-lg hover:bg-fire-orange
                         transition-all fire-glow-hover"
            >
              <Send className="w-5 h-5" />
              ENVIAR
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
