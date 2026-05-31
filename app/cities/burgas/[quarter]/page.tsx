import type { Metadata } from 'next'
import { getQuartersForCity } from '@/lib/data/fallback'
import QuarterBurgasPage, { generateMetadata as quarterMeta } from '@/burgas-complete/quarter/QuarterBurgasPage'

export const revalidate = 60

export function generateStaticParams() {
  return getQuartersForCity('burgas').map(q => ({ quarter: q.slug }))
}

interface PageProps {
  params: { quarter: string }
  searchParams: { sort?: string; page?: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return quarterMeta({
    params: { slug: 'burgas', quarter: params.quarter },
    searchParams: {},
  })
}

export default async function BurgasQuarterRoute({ params, searchParams }: PageProps) {
  return QuarterBurgasPage({
    params: { slug: 'burgas', quarter: params.quarter },
    searchParams,
  })
}
