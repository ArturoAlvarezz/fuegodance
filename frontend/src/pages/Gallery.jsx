import { Camera } from 'lucide-react'

// Placeholder — will be replaced with API + lightbox
const placeholderPhotos = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  src: `https://placehold.co/600x${
    [400, 800, 500, 700][i % 4]
  }/1A1A2E/F77F00?text=Social+${i + 1}`,
  alt: `Foto del social ${i + 1}`,
  event: ['Salsa Night', 'Social Viernes', 'Práctica Libre', 'Festival Fuego'][i % 4],
}))

export default function Gallery() {
  return (
    <section className="pt-24 pb-20 px-4 bg-dark-obsidian min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Camera className="w-8 h-8 text-fire-orange" />
          <h2 className="font-heading text-5xl tracking-wider">
            <span className="text-fire-gradient">GALERÍA</span>
          </h2>
        </div>
        <p className="text-silver text-center mb-12">
          Los mejores momentos de nuestros sociales y eventos
        </p>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {placeholderPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-xl overflow-hidden border border-dark-ash
                         hover:border-fire-orange/30 transition-all break-inside-avoid cursor-pointer"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-obsidian/80 via-transparent to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="font-heading text-lg tracking-wider text-fire-gold">
                  {photo.event}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
