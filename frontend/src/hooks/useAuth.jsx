import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fuego_token'))
  const [admin, setAdmin] = useState(() => localStorage.getItem('fuego_admin'))

  const login = async (username, password) => {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error('Credenciales inválidas')
    const data = await res.json()
    setToken(data.access_token)
    setAdmin(username)
    localStorage.setItem('fuego_token', data.access_token)
    localStorage.setItem('fuego_admin', username)
  }

  const logout = () => {
    setToken(null)
    setAdmin(null)
    localStorage.removeItem('fuego_token')
    localStorage.removeItem('fuego_admin')
  }

  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {}

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

export function useApi() {
  const { authHeaders } = useAuth()
  const apiFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: { ...authHeaders, ...options.headers },
    })
  }
  return { apiFetch, authHeaders }
}
