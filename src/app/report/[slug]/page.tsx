import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { HypeCheckReport } from '@/lib/types'
import ReportView from '@/components/report/ReportView'

// Wrapped in cache() so generateMetadata + the page component share one query per request.
const getReportBySlug = cache(async (slug: string): Promise<HypeCheckReport | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reports')
    .select('report_data')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data.report_data as HypeCheckReport
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const report = await getReportBySlug(slug)

  if (!report) {
    return { title: 'Report not found · HypeCheck' }
  }

  return {
    title: `${report.ideaTitle} — Hype Score ${report.hypeScore}/100 · HypeCheck`,
    description: report.oneLinerSummary,
    openGraph: {
      title: `${report.ideaTitle} — Hype Score ${report.hypeScore}/100`,
      description: report.oneLinerSummary,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${report.ideaTitle} — Hype Score ${report.hypeScore}/100`,
      description: report.oneLinerSummary,
    },
  }
}

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const report = await getReportBySlug(slug)

  if (!report) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="mx-auto flex max-w-[720px] flex-col gap-4">
        <Link
          href="/check"
          className="self-start text-[13px] text-[#7C3AED] hover:text-[#A78BFA] transition-colors mb-2"
        >
          ✨ Validate your own idea with HypeCheck →
        </Link>

        <ReportView report={report} />
      </div>
    </main>
  )
}