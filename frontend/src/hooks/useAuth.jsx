import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Admin auth
  const [token, setToken] = useState(() => localStorage.getItem('fuego_token'))
  const [admin, setAdmin] = useState(() => localStorage.getItem('fuego_admin'))

  // User auth (for the public site)
  const [userToken, setUserToken] = useState(() => localStorage.getItem('fuego_user_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fuego_user')
    return stored ? JSON.parse(stored) : null
  })

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

  // User auth methods
  const loginUser = async (phone, password) => {
    const res = await fetch('/api/users/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error al iniciar sesión' }))
      throw new Error(err.detail || 'Error al iniciar sesión')
    }
    const data = await res.json()
    setUserToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('fuego_user_token', data.access_token)
    localStorage.setItem('fuego_user', JSON.stringify(data.user))
  }

  const logoutUser = () => {
    setUserToken(null)
    setUser(null)
    localStorage.removeItem('fuego_user_token')
    localStorage.removeItem('fuego_user')
  }

  const isLoggedIn = !!userToken

  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {}
  const userAuthHeaders = userToken ? { 'Authorization': `Bearer ${userToken}` } : {}

  return (
    <AuthContext.Provider value={{
      token, admin, login, logout, authHeaders,
      userToken, user, loginUser, logoutUser, isLoggedIn, userAuthHeaders,
    }}>
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
  const apiFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: { ...authHeaders, ...options.headers },
    })
  }, [authHeaders])
  return { apiFetch, authHeaders }
}

export function useUserApi() {
  const { userAuthHeaders } = useAuth()
  const userApiFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: { ...userAuthHeaders, ...options.headers },
    })
  }, [userAuthHeaders])
  return { userApiFetch, userAuthHeaders }
}
