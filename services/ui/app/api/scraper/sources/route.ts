import { query } from '@/lib/railway-database'
import { NextResponse } from 'next/server'

interface SourceRow {
  id: string;
  name: string;
  domain: string;
  rss_url: string;
  icon_url: string | null;
  respect_robots_txt: boolean;
  delay_between_requests: number;
  user_agent: string;
  timeout_ms: number;
  created_at: string;
}

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        id, name, domain, rss_url, icon_url,
        respect_robots_txt, delay_between_requests,
        user_agent, timeout_ms, created_at
      FROM sources
      ORDER BY name
    `)
    
    const sources = result.rows.map((row: SourceRow) => ({
      id: row.id,
      name: row.name,
      domain: row.domain,
      rssUrl: row.rss_url,
      iconUrl: row.icon_url,
      respectRobotsTxt: row.respect_robots_txt,
      delayBetweenRequests: row.delay_between_requests,
      userAgent: row.user_agent,
      timeoutMs: row.timeout_ms,
      createdAt: row.created_at
    }))
    
    return NextResponse.json({ sources })
  } catch (error) {
    console.error('Failed to fetch sources:', error)
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 })
  }
} 