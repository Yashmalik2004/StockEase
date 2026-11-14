import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('admin')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (newToken, adminData) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('admin', JSON.stringify(adminData))
    setToken(newToken)
    setAdmin(adminData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setToken(null)
    setAdmin(null)
  }

  const isAuthenticated = !!token && !!admin

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext

