import { Instagram, Heart, MessageCircle } from 'lucide-react'

// Placeholder data — will be replaced with API calls to Instagram
const placeholderPosts = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  image: `https://placehold.co/400x400/1A1A2E/E63946?text=Post+${i + 1}`,
  caption: `Post de Instagram #${i + 1} — ¡Sigue nuestra cuenta para más!`,
  likes: Math.floor(Math.random() * 200) + 50,
  comments: Math.floor(Math.random() * 30) + 5,
}))

export default function InstagramFeed() {
  return (
    <section id="instagram" className="py-20 px-4 bg-dark-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Instagram className="w-8 h-8 text-fire-red" />
          <h2 className="font-heading text-5xl tracking-wider">
            EN <span className="text-fire-gradient">INSTAGRAM</span>
          </h2>
        </div>
        <p className="text-silver text-center mb-12">
          Sigue nuestro día a día, sociales y más en{' '}
          <a
            href="https://www.instagram.com/fuegodance/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fire-orange hover:text-fire-gold transition-colors"
          >
            @fuegodance
          </a>
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {placeholderPosts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/fuegodance/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden border border-dark-ash
                         hover:border-fire-red/30 transition-all"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-dark-obsidian/70 opacity-0 group-hover:opacity-100
                              transition-opacity flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-fire-red" />
                  <span className="text-white font-semibold">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-silver" />
                  <span className="text-white font-semibold">{post.comments}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
