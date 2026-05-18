import { Music, Users, Heart } from 'lucide-react'

export default function About() {
  return (
    <section className="py-20 px-4 bg-dark-charcoal">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-heading text-5xl tracking-wider text-center mb-4">
          SOBRE <span className="text-fire-gradient">FUEGO DANCE</span>
        </h2>
        <p className="text-silver text-center max-w-2xl mx-auto mb-12 leading-relaxed">
          Más que una academia, somos una familia unida por la salsa.
          Nuestro espacio es donde el ritmo se siente en cada paso.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-dark-ash/50 rounded-xl p-8 text-center border border-dark-ash
                          hover:border-fire-red/30 transition-all hover:-translate-y-1 fire-glow-hover">
            <Music className="w-12 h-12 text-fire-orange mx-auto mb-4" />
            <h3 className="font-heading text-2xl tracking-wider mb-2">Salsa & Ritmo</h3>
            <p className="text-silver text-sm leading-relaxed">
              Aprende los fundamentos de la salsa con instructors apasionados
              que te guiarán paso a paso.
            </p>
          </div>

          <div className="bg-dark-ash/50 rounded-xl p-8 text-center border border-dark-ash
                          hover:border-fire-red/30 transition-all hover:-translate-y-1 fire-glow-hover">
            <Users className="w-12 h-12 text-fire-gold mx-auto mb-4" />
            <h3 className="font-heading text-2xl tracking-wider mb-2">Comunidad</h3>
            <p className="text-silver text-sm leading-relaxed">
              Únete a sociales, eventos y practicas donde conocerás a otros
              bailarines y crecerás juntos.
            </p>
          </div>

          <div className="bg-dark-ash/50 rounded-xl p-8 text-center border border-dark-ash
                          hover:border-fire-red/30 transition-all hover:-translate-y-1 fire-glow-hover">
            <Heart className="w-12 h-12 text-fire-red mx-auto mb-4" />
            <h3 className="font-heading text-2xl tracking-wider mb-2">Pasión</h3>
            <p className="text-silver text-sm leading-relaxed">
              No solo enseñamos pasos, transmitimos la pasión que hace
              que la salsa sea más que un baile.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
