import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../context/useAuth'

export function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      nav('/')
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[var(--color-border)] bg-white/5 p-6">
      <div className="text-xl font-black">Login</div>
      <div className="mt-1 text-sm text-white/60">Use your buyer, vendor, or admin account.</div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <label className="space-y-1 block">
          <div className="text-xs font-bold text-white/70">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none"
            required
          />
        </label>
        <label className="space-y-1 block">
          <div className="text-xs font-bold text-white/70">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-2xl border border-[var(--color-border)] bg-black/20 px-4 py-2.5 text-sm outline-none"
            required
          />
        </label>
        <Button className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-white/60">
        Don’t have an account?{' '}
        <Link to="/register" className="font-bold text-white/80 hover:text-white">
          Register
        </Link>
      </div>
    </div>
  )
}

