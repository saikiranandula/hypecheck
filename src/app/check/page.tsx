'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UpgradePrompt } from '@/components/UpgradePrompt'

const PLACEHOLDER = `Example: A web app where developers paste their GitHub repo URL and get an instant AI-generated README, contributing guide, and documentation site. Targeting solo developers and small teams who hate writing docs.`

export default function CheckPage() {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const characterCount = idea.length
  const isValid = idea.trim().length >= 10
  const isNearLimit = characterCount > 1800

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/hypecheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      })

      const data = await response.json()

      // Free tier exhausted — show upgrade modal instead of error message
      if (response.status === 403 && data.error === 'FREE_TIER_EXHAUSTED') {
        setShowUpgradePrompt(true)
        setLoading(false)
        return
      }

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      // Route to the canonical public URL for this report
      router.push(`/report/${data.slug}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-12">

      {/* Upgrade modal — renders on top of everything when free tier is exhausted */}
      {showUpgradePrompt && (
        <UpgradePrompt onClose={() => setShowUpgradePrompt(false)} />
      )}

      <div className="mx-auto flex max-w-[720px] flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555555]">
              NullHype AI
            </p>
            <h1 className="text-3xl font-semibold text-[#F5F5F5]">
              HypeCheck
            </h1>
            <p className="text-[15px] leading-relaxed text-[#888888]">
              Describe your startup or side project idea. Get a brutally honest
              AI-generated validation report in seconds.
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 mt-1 text-[13px] text-[#555555] hover:text-[#F5F5F5] transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="idea"
              className="text-[12px] font-semibold uppercase tracking-wider text-[#555555]"
            >
              Your Idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={PLACEHOLDER}
              rows={8}
              maxLength={2000}
              disabled={loading}
              className="
                w-full resize-none rounded-xl border border-[#2A2A2A] bg-[#111111]
                px-5 py-4 text-[15px] leading-relaxed text-[#F5F5F5]
                placeholder:text-[#333333]
                focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]/50
                disabled:opacity-50
                transition-colors duration-200
              "
            />
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-[#555555]">
                Be specific — the more detail you give, the better the report.
              </p>
              <p
                className={`text-[12px] ${
                  isNearLimit ? 'text-[#F59E0B]' : 'text-[#555555]'
                }`}
              >
                {characterCount}/2000
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/5 px-4 py-3">
              <p className="text-[13px] text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isValid || loading}
            className="
              flex items-center justify-center gap-3 rounded-xl
              bg-[#7C3AED] px-6 py-4 text-[15px] font-semibold text-white
              hover:bg-[#6D28D9] disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analysing your idea...
              </>
            ) : (
              'Run HypeCheck →'
            )}
          </button>
        </form>

        {/* Trust signals */}
        <div className="flex flex-wrap gap-6 border-t border-[#1A1A1A] pt-6">
          {[
            'Brutally honest scoring',
            'Real competitor analysis',
            'Actionable next steps',
          ].map((signal) => (
            <div key={signal} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
              <p className="text-[13px] text-[#555555]">{signal}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
