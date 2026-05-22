import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Flame } from 'lucide-react'
import logo from '../../assets/logo.jpg'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/admin')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Fuego Dance" className="h-20 w-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-fire-red/40 shadow-[0_0_20px_#E6394666]" />
          <h1 className="font-heading text-4xl tracking-wider text-fire-gradient">ADMIN PANEL</h1>
          <p className="text-muted text-sm mt-2">Fuego Dance — Acceso restringido</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-charcoal rounded-xl p-8 border border-dark-ash space-y-6">
          {error && (
            <div className="bg-fire-red/10 border border-fire-red/30 text-fire-red px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-silver text-sm font-medium mb-2">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white
                focus:border-fire-red focus:ring-1 focus:ring-fire-red outline-none transition-all"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-silver text-sm font-medium mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white
                focus:border-fire-red focus:ring-1 focus:ring-fire-red outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-fire-red text-white font-heading text-lg tracking-wider rounded-lg
              hover:bg-fire-orange transition-all fire-glow disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <p className="text-center text-muted text-xs mt-6">
          <a href="/" className="hover:text-fire-orange transition-colors">← Volver al sitio</a>
        </p>
      </div>
    </div>
  )
}
