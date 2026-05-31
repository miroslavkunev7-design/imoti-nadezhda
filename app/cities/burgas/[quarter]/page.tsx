import type { Metadata } from 'next'
import QuarterBurgasPage, { generateMetadata as quarterMeta } from '@/burgas-complete/quarter/QuarterBurgasPage'

export const revalidate = 60

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
