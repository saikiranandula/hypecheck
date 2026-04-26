import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { HypeCheckReport, Verdict } from '@/lib/types'
import { getScoreColour, VerdictBadge } from '@/components/report/VerdictBadge'

interface ReportRow {
  slug: string
  created_at: string
  report_data: HypeCheckReport
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rows, error } = await supabase
    .from('reports')
    .select('slug, created_at, report_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const reports: ReportRow[] = error ? [] : (rows ?? [])

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555555]">
              NullHype AI
            </p>
            <h1 className="text-2xl font-semibold text-[#F5F5F5]">My Reports</h1>
          </div>
          <Link
            href="/check"
            className="shrink-0 mt-1 rounded-lg bg-[#7C3AED] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6D28D9] transition-colors"
          >
            + New HypeCheck
          </Link>
        </div>

        {/* Empty state */}
        {reports.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-[#2A2A2A] bg-[#111111] px-8 py-16 text-center">
            <p className="text-[32px]">🔮</p>
            <div className="flex flex-col gap-2">
              <p className="text-[17px] font-semibold text-[#F5F5F5]">No reports yet</p>
              <p className="text-[14px] leading-relaxed text-[#888888]">
                Run your first HypeCheck to get a brutally honest validation report.
              </p>
            </div>
            <Link
              href="/check"
              className="rounded-xl bg-[#7C3AED] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#6D28D9] transition-colors"
            >
              Run HypeCheck →
            </Link>
          </div>
        )}

        {/* Report list */}
        {reports.length > 0 && (
          <div className="flex flex-col divide-y divide-[#1A1A1A] rounded-xl border border-[#2A2A2A] bg-[#111111] overflow-hidden">
            {reports.map((row) => {
              const { ideaTitle, hypeScore, verdict } = row.report_data
              const colour = getScoreColour(hypeScore)
              return (
                <Link
                  key={row.slug}
                  href={`/report/${row.slug}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#161616] transition-colors"
                >
                  {/* Score */}
                  <span
                    className="shrink-0 text-[20px] font-bold leading-none tabular-nums"
                    style={{ color: colour }}
                  >
                    {hypeScore}
                  </span>

                  {/* Title + verdict */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-[14px] font-medium text-[#F5F5F5]">
                      {truncate(ideaTitle, 80)}
                    </p>
                    <VerdictBadge verdict={verdict as Verdict} />
                  </div>

                  {/* Date */}
                  <span className="shrink-0 text-[12px] text-[#555555]">
                    {formatRelativeDate(row.created_at)}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
