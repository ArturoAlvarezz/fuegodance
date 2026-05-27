import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi, useAuth } from '../../hooks/useAuth'
import { Users, Plus, Edit2, Trash2, X, Save, UserPlus } from 'lucide-react'

export default function UsersAdmin() {
  const { apiFetch } = useApi()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleAuthError = () => {
    logout()
    navigate('/admin/login')
  }

  const loadUsers = async () => {
    try {
      const res = await apiFetch('/api/admin/users/')
      if (res.status === 401) { handleAuthError(); return }
      if (!res.ok) throw new Error('Error al cargar usuarios')
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const openCreate = () => {
    setEditingUser(null)
    setForm({ full_name: '', phone: '', password: '' })
    setError('')
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setForm({ full_name: user.full_name, phone: user.phone, password: '' })
    setError('')
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length !== 9) {
        setError('El teléfono debe tener 9 dígitos')
        setSaving(false)
        return
      }

      if (editingUser) {
        const body = {
          full_name: form.full_name,
          phone: digits,
        }
        if (form.password) body.password = form.password

        const res = await apiFetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.status === 401) { handleAuthError(); return }
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.detail || 'Error al actualizar')
        }
      } else {
        const res = await apiFetch('/api/admin/users/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: form.full_name,
            phone: digits,
            password: form.password,
          }),
        })
        if (res.status === 401) { handleAuthError(); return }
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.detail || 'Error al crear')
        }
      }

      setShowModal(false)
      loadUsers()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`¿Eliminar al usuario "${user.full_name}"?`)) return
    try {
      const res = await apiFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      if (res.status === 401) { handleAuthError(); return }
      if (!res.ok) throw new Error('Error al eliminar')
      loadUsers()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl tracking-wider mb-2">
            <span className="text-fire-gradient">USUARIOS</span>
          </h1>
          <p className="text-muted">Gestiona los usuarios que pueden acceder al contenido exclusivo</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 bg-fire-red text-white rounded-xl font-heading tracking-wider hover:bg-fire-orange transition-all fire-glow-hover"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo usuario
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 rounded-full border-4 border-fire-red/30 border-t-fire-red animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-dark-charcoal rounded-xl border border-white/10">
          <Users className="w-16 h-16 text-muted mx-auto mb-4" />
          <p className="text-silver text-lg mb-2">No hay usuarios registrados</p>
          <p className="text-muted text-sm">Crea el primer usuario desde el botón "Nuevo usuario"</p>
        </div>
      ) : (
        <div className="bg-dark-charcoal rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-muted text-xs uppercase tracking-widest font-semibold">Nombre</th>
                  <th className="text-left px-6 py-4 text-muted text-xs uppercase tracking-widest font-semibold">Teléfono</th>
                  <th className="text-left px-6 py-4 text-muted text-xs uppercase tracking-widest font-semibold">Creado</th>
                  <th className="text-right px-6 py-4 text-muted text-xs uppercase tracking-widest font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">{user.full_name}</span>
                    </td>
                    <td className="px-6 py-4 text-silver">+56 {user.phone}</td>
                    <td className="px-6 py-4 text-muted text-sm">
                      {new Date(user.created_at).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg bg-white/5 text-silver hover:text-fire-orange hover:bg-fire-orange/10 transition-all"
                          title="Editar usuario"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="p-2 rounded-lg bg-white/5 text-silver hover:text-fire-red hover:bg-fire-red/10 transition-all"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-dark-obsidian/80 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-dark-charcoal rounded-xl border border-white/10 shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-silver hover:text-white transition-colors"
              onClick={() => setShowModal(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 border-b border-white/10">
              <h2 className="font-heading text-2xl tracking-wider text-fire-gradient">
                {editingUser ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {error && (
                <div className="bg-fire-red/10 border border-fire-red/30 text-fire-red px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-silver text-sm font-medium mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white
                    focus:border-fire-red focus:ring-1 focus:ring-fire-red outline-none transition-all"
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-silver text-sm font-medium mb-2">
                  Teléfono <span className="text-muted">(9 dígitos)</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white
                    focus:border-fire-red focus:ring-1 focus:ring-fire-red outline-none transition-all"
                  placeholder="912345678"
                  required
                />
              </div>

              <div>
                <label className="block text-silver text-sm font-medium mb-2">
                  Contraseña {editingUser && <span className="text-muted font-normal">(dejar vacío para mantener)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-ash border border-dark-ash rounded-lg text-white
                    focus:border-fire-red focus:ring-1 focus:ring-fire-red outline-none transition-all"
                  placeholder={editingUser ? 'Nueva contraseña (opcional)' : '••••••••'}
                  required={!editingUser}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-fire-red text-white font-heading text-lg tracking-wider rounded-lg
                  hover:bg-fire-orange transition-all fire-glow disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : editingUser ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
