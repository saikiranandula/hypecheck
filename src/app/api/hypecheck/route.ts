import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Slug alphabet drops 0/O/1/l/i to avoid mis-reads from screenshots and spoken URLs.
// 10 chars from a 32-char alphabet = ~10^15 combinations. Collisions effectively impossible at indie scale.
const generateSlug = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10)

const SYSTEM_PROMPT = `You are HypeCheck — a brutally honest, data-driven startup idea validator.
Your job is to analyse a startup or side project idea and return a structured validation report.

You must respond with ONLY a valid JSON object. No markdown, no code blocks, no explanation —
just the raw JSON object. The JSON must exactly match this TypeScript interface:

{
  ideaTitle: string,        // A clean, punchy title you derive from the idea (max 10 words)
  hypeScore: number,        // 0-100 viability score. Be honest. Most ideas score 40-70.
  verdict: "Build" | "Don't Build" | "Validate First",
  oneLinerSummary: string,  // One sentence verdict. Max 30 words. Brutally honest.
  marketOpportunity: {
    metrics: [
      { label: "Market Size", insight: string, strength: "strong" | "moderate" | "weak" },
      { label: "Growth Signal", insight: string, strength: "strong" | "moderate" | "weak" },
      { label: "Timing", insight: string, strength: "strong" | "moderate" | "weak" }
    ]
  },
  competitiveLandscape: {
    competitors: [           // 3-5 real competitors
      { name: string, description: string, threatLevel: "Low" | "Medium" | "High" }
    ],
    competitiveAdvantage: string  // One sentence. What gap could this idea exploit?
  },
  demandSignals: {
    signals: [               // 3 signals — quote-style observations from Reddit, X, or general web
      { quote: string, source: string, platform: "Reddit" | "X" | "General" }
    ],
    overallDemandStrength: "strong" | "moderate" | "weak"
  },
  monetisationViability: {
    score: number,           // 1-5
    recommendedModel: string,
    pricingSuggestion: string,
    keyRisk: string
  },
  executionRisk: {
    factors: [               // exactly 3 risk factors
      { factor: string, severity: "Low" | "Medium" | "High", mitigation: string }
    ],
    overallRiskLevel: "Low" | "Medium" | "High"
  },
  nextStep: {
    action: string,          // One specific, concrete action. Not vague advice.
    rationale: string        // Why this action, why now. Max 2 sentences.
  }
}

Rules:
- Be specific, not generic. Name real competitors, real subreddits, real market data.
- The hypeScore must reflect genuine viability. Do not inflate scores to be encouraging.
- The nextStep action must be specific and immediately actionable, not "do more research".
- Demand signal quotes should sound like real things people say online, grounded in real patterns.
- Return ONLY the JSON. Any text outside the JSON will break the parser.`

export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ── Usage gate ──────────────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro') {
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count ?? 0) >= 3) {
        return NextResponse.json(
          { error: 'FREE_TIER_EXHAUSTED' },
          { status: 403 }
        )
      }
    }

    // ── Input validation ────────────────────────────────────────────────────
    const { idea } = await request.json()

    if (!idea || typeof idea !== 'string' || idea.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please describe your idea in at least a few sentences.' },
        { status: 400 }
      )
    }

    if (idea.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Please keep your idea description under 2000 characters.' },
        { status: 400 }
      )
    }

    // ── Claude API call ─────────────────────────────────────────────────────
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Please analyse this startup idea and return the HypeCheck report as JSON:\n\n${idea.trim()}`,
        },
      ],
      system: SYSTEM_PROMPT,
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    let report
    try {
      report = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse Claude response:', rawText)
      return NextResponse.json(
        { error: 'Failed to parse report. Please try again.' },
        { status: 500 }
      )
    }

    // ── Save report to Supabase ─────────────────────────────────────────────
    const slug = generateSlug()

    const { error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        idea_text: idea.trim(),
        report_data: report,
        slug,
      })

    if (insertError) {
      console.error('Failed to save report to Supabase:', insertError)
      // Still return the report so the user sees their analysis,
      // but skip the slug since it's not actually persisted.
      return NextResponse.json({ report })
    }

    return NextResponse.json({ report, slug })

  } catch (error) {
    console.error('HypeCheck API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}