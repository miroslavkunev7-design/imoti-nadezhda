/**
 * Филтър: само частни обяви / от собственик (без агенции и брокери).
 * Правило: пропускаме само ако ЯВНО е агенция И НЕ е частно лице.
 */
const AGENCY_RE =
  /\bагенци[яи]\b|\bброкерск[аи]\b|\bпосредни[кц]\b|\boffi[ck]e\b|real\s*estate\s*agency|имотна\s*агенци/i

const PRIVATE_RE =
  /собственик|от\s+собственик|частно\s*лице|частна\s*обява|частен\s*продавач|private\s*seller|private-business|продавач[:\s]+частно|обява\s+от\s+частно/i

export interface PrivateCheckInput {
  source: string
  title: string
  description: string
  html?: string
  url?: string
}

export function isPrivateOwnerListing(input: PrivateCheckInput): boolean {
  const blob = `${input.title} ${input.description} ${input.html?.slice(0, 15000) ?? ''} ${input.url ?? ''}`

  // OLX: URL already filtered for private, only reject if explicitly agency
  if (input.source === 'olx') {
    if (/\bагенци[яи]\b/i.test(blob) && !PRIVATE_RE.test(blob)) return false
    return true
  }

  // If search URL contains private-business=private parameter, trust the filter
  if (input.url?.includes('private_business=private') || input.url?.includes('from_private=1')) {
    return !AGENCY_RE.test(blob)
  }

  // Explicit agency with no private markers → reject
  if (AGENCY_RE.test(blob) && !PRIVATE_RE.test(blob)) {
    return false
  }

  // All other sources: accept unless clearly an agency
  return true
}
