import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogIn, ArrowLeft } from 'lucide-react'
import logo from '../assets/logo.jpg'

export default function UserLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || '/figuras'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate 9 digits
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 9) {
      setError('El teléfono debe tener exactamente 9 dígitos')
      return
    }

    setLoading(true)
    try {
      await loginUser(digits, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 9)
    if (digits.length > 0) return `+56 ${digits}`
    return digits
  }

  return (
    <div className="min-h-screen bg-dark-obsidian flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Fuego Dance"
            className="h-20 w-20 rounded-full object-cover mx-auto mb-4 ring-4 ring-fire-red/40 shadow-[0_0_20px_#E6394666]"
          />
          <h1 className="font-heading text-4xl tracking-wider text-fire-gradient">INICIAR SESIÓN</h1>
          <p className="text-muted text-sm mt-2">Accede para ver las figuras exclusivas</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-dark-charcoal rounded-xl p-8 border border-dark-ash space-y-6">
          {error && (
            <div className="bg-fire-red/10 border border-fire-red/30 text-fire-red px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-silver text-sm font-medium mb-2">
              Teléfono <span className="text-muted">(9 dígitos)</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={formatPhone(phone)}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '')
                setPhone(raw)
              }}
              className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white
                focus:border-fire-red focus:ring-1 focus:ring-fire-red outline-none transition-all"
              placeholder="+56 912345678"
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
              hover:bg-fire-orange transition-all fire-glow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        <p className="text-center text-muted text-xs mt-6">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-fire-orange transition-colors">
            <ArrowLeft className="w-3 h-3" /> Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  )
}
