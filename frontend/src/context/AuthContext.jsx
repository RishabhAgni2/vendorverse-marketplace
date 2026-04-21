import { createContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setVendor(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/api/auth/me')
      setUser(data.user)
      setVendor(data.vendor || null)
    } catch {
      localStorage.removeItem('token')
      setUser(null)
      setVendor(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    setVendor(data.vendor || null)
  }

  async function register(payload) {
    const { data } = await api.post('/api/auth/register', payload)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    setVendor(data.vendor || null)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
    setVendor(null)
  }

  const value = useMemo(
    () => ({ user, vendor, loading, login, register, logout, refresh }),
    [user, vendor, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  throw new Error('useAuth must be imported from context/useAuth')
}

export { AuthContext }

