import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch {
      setError('Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      {/* Full-bleed background */}
      <img src="/login-bg.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[#0c2c4a]/55" />

      {/* Centered content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-8 flex items-center justify-center rounded-2xl bg-white px-6 py-4 shadow-lg">
          <img
            src="/infoset-logo.png"
            alt="INFOSET Group"
            className="h-14 w-auto"
          />
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold tracking-wide text-white">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 w-full rounded-md border border-white/30 bg-white px-4 text-base text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold tracking-wide text-white">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 w-full rounded-md border border-white/30 bg-white px-4 text-base text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/20 px-3 py-2 text-sm text-white">{error}</p>
          )}

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base font-semibold tracking-wide"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'LOGIN'}
          </Button>
        </form>
      </div>
    </main>
  )
}
