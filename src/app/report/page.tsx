'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HypeCheckReport } from '@/lib/types'
import ReportView from '@/components/report/ReportView'

export default function ReportPage() {
  const [report, setReport] = useState<HypeCheckReport | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = sessionStorage.getItem('hypecheckReport')
    if (!stored) {
      router.push('/check')
      return
    }
    try {
      setReport(JSON.parse(stored))
    } catch {
      router.push('/check')
    }
  }, [router])

  if (!report) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2A2A2A] border-t-[#7C3AED]" />
          <p className="text-[13px] text-[#555555]">Loading your report...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-4">
        <button
          onClick={() => router.push('/check')}
          className="self-start text-[13px] text-[#555555] hover:text-[#F5F5F5] transition-colors mb-2"
        >
          ← Check another idea
        </button>

        <ReportView report={report} />
      </div>
    </main>
  )
}