import { Play, Filter } from 'lucide-react'
import { useState } from 'react'

const levels = [
  { id: 'all', label: 'Todos' },
  { id: 'basico', label: 'Básico' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'avanzado', label: 'Avanzado' },
]

// Placeholder — will be replaced with API
const placeholderFigures = [
  { id: 1, name: 'Dile que no', level: 'basico', duration: '2:30', thumbnail: 'https://placehold.co/400x225/1A1A2E/E63946?text=Dile+que+no' },
  { id: 2, name: 'Enchufla', level: 'basico', duration: '3:10', thumbnail: 'https://placehold.co/400x225/1A1A2E/F77F00?text=Enchufla' },
  { id: 3, name: 'Vacilala', level: 'intermedio', duration: '4:20', thumbnail: 'https://placehold.co/400x225/1A1A2E/FCBF49?text=Vacilala' },
  { id: 4, name: 'Sombrero', level: 'intermedio', duration: '3:45', thumbnail: 'https://placehold.co/400x225/1A1A2E/E63946?text=Sombrero' },
  { id: 5, name: 'Setenta', level: 'avanzado', duration: '5:00', thumbnail: 'https://placehold.co/400x225/1A1A2E/F77F00?text=Setenta' },
  { id: 6, name: 'Coca-Cola', level: 'avanzado', duration: '4:15', thumbnail: 'https://placehold.co/400x225/1A1A2E/FCBF49?text=Coca-Cola' },
]

const levelColors = {
  basico: 'bg-fire-red',
  intermedio: 'bg-fire-orange',
  avanzado: 'bg-fire-gold text-dark-obsidian',
}

export default function Figures() {
  const [activeLevel, setActiveLevel] = useState('all')

  const filtered = activeLevel === 'all'
    ? placeholderFigures
    : placeholderFigures.filter((f) => f.level === activeLevel)

  return (
    <section className="pt-24 pb-20 px-4 bg-dark-obsidian min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Play className="w-8 h-8 text-fire-red" />
          <h2 className="font-heading text-5xl tracking-wider">
            <span className="text-fire-gradient">FIGURAS</span>
          </h2>
        </div>
        <p className="text-silver text-center mb-12">
          Practica en casa con nuestros videos de figuras clasificados por nivel
        </p>

        {/* Level filters */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Filter className="w-5 h-5 text-muted" />
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level.id)}
              className={`px-4 py-2 rounded-lg font-heading text-sm tracking-wider transition-all
                ${activeLevel === level.id
                  ? 'bg-fire-red text-white fire-glow'
                  : 'bg-dark-ash text-silver hover:text-white hover:bg-dark-slate'}`}
            >
              {level.label}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((figure) => (
            <div
              key={figure.id}
              className="group bg-dark-charcoal rounded-xl overflow-hidden border border-dark-ash
                         hover:border-fire-red/30 transition-all hover:-translate-y-1 fire-glow-hover cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={figure.thumbnail}
                  alt={figure.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-fire-red/80 rounded-full flex items-center justify-center
                                  group-hover:scale-110 group-hover:bg-fire-red transition-all animate-pulse-slow">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-dark-obsidian/80 px-2 py-1 rounded text-xs text-silver">
                  {figure.duration}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex items-center justify-between">
                <h3 className="font-heading text-lg tracking-wider">{figure.name}</h3>
                <span className={`${levelColors[figure.level]} px-2 py-0.5 rounded text-xs font-semibold`}>
                  {figure.level.charAt(0).toUpperCase() + figure.level.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
