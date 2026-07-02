'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => router.push('/dashboard'), 500)
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      {/* Full-bleed background */}
      <Image
        src="/login-bg.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#0c2c4a]/55" />

      {/* Centered content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="mb-8 flex items-center justify-center rounded-2xl bg-white px-6 py-4 shadow-lg">
          <Image
            src="/infoset-logo.png"
            alt="INFOSET Group"
            width={220}
            height={86}
            className="h-14 w-auto"
            priority
          />
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold tracking-wide text-white"
            >
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              defaultValue="dana.whitfield@infoset.com"
              required
              className="h-12 w-full rounded-md border border-white/30 bg-white px-4 text-base text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base font-semibold tracking-wide"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'NEXT'}
          </Button>
        </form>
      </div>
    </main>
  )
}
