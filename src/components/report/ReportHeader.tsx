import { Verdict } from '@/lib/types'
import { getScoreColour, VerdictBadge } from './VerdictBadge'

interface ReportHeaderProps {
  ideaTitle: string
  hypeScore: number
  verdict: Verdict
  oneLinerSummary: string
}

function ScoreRing({ score }: { score: number }) {
  const size = 160
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const colour = getScoreColour(score)

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2A2A2A"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colour}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-bold leading-none"
          style={{ fontSize: '42px', color: colour }}
        >
          {score}
        </span>
        <span className="mt-1 text-[11px] uppercase tracking-widest text-[#555555]">
          hype score
        </span>
      </div>
    </div>
  )
}

export default function ReportHeader({
  ideaTitle,
  hypeScore,
  verdict,
  oneLinerSummary,
}: ReportHeaderProps) {
  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-8 py-10">
      {/* Score ring — centred hero element */}
      <div className="flex flex-col items-center gap-6">
        <ScoreRing score={hypeScore} />

        {/* Text content — centred below the ring */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#555555]">
            HypeCheck Report
          </p>
          <h1 className="text-2xl font-semibold leading-tight text-[#F5F5F5] max-w-[500px]">
            {ideaTitle}
          </h1>
          <VerdictBadge verdict={verdict} />
          <p className="text-[15px] leading-relaxed text-[#888888] max-w-[480px]">
            {oneLinerSummary}
          </p>
        </div>
      </div>
    </div>
  )
}
