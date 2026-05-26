'use client'

import {
  calculateMonthlyPayment,
  formatPrice,
  getMortgageTermYears,
  MORTGAGE_DEFAULTS,
} from '@/lib/utils'

interface MortgageCalculatorProps {
  priceEur: number
  compact?: boolean
}

export default function MortgageCalculator({ priceEur, compact = false }: MortgageCalculatorProps) {
  const termYears = getMortgageTermYears(priceEur)
  const loanAmount =
    priceEur * (1 - MORTGAGE_DEFAULTS.downPaymentPercent / 100)
  const monthly = calculateMonthlyPayment(
    loanAmount,
    MORTGAGE_DEFAULTS.annualRatePercent,
    termYears
  )

  const contactPhone =
    process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+359899620262'
  const telHref = `tel:${contactPhone.replace(/\s/g, '')}`
  const inquiryMessage = encodeURIComponent(
    `Здравейте, интересувам се от ипотечен кредит за имот на стойност ${formatPrice(priceEur)}. ` +
      `Ориентировъчна вноска: ${formatPrice(Math.round(monthly))}/мес. при ${termYears} г. ` +
      `(${MORTGAGE_DEFAULTS.downPaymentPercent}% самоучастие, ${MORTGAGE_DEFAULTS.annualRatePercent}% лихва).`
  )
  const mailto =
    `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'agenciq_nadejdi@abv.bg'}` +
    `?subject=${encodeURIComponent('Ипотечен кредит')}&body=${inquiryMessage}`

  return (
    <div
      className={`rounded-xl ${compact ? 'p-2.5' : 'p-4'}`}
      style={{
        background: 'rgba(196,30,58,0.06)',
        border: '1px solid rgba(196,30,58,0.22)',
      }}
    >
      <div className={`flex items-start justify-between gap-2 ${compact ? 'mb-1.5' : 'mb-3'}`}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-themed-muted mb-0.5">
            Ипотечен кредит
          </p>
          <p className={`font-bold text-crimson-700 leading-tight ${compact ? 'text-base' : 'text-xl'}`}>
            ~{formatPrice(Math.round(monthly))}
            <span className={`font-medium text-themed-secondary ${compact ? 'text-xs' : 'text-sm'}`}> / мес.</span>
          </p>
        </div>
        <div
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-crimson-700 flex-shrink-0"
          style={{ background: 'rgba(196,30,58,0.12)' }}
        >
          {termYears} г.
        </div>
      </div>

      {!compact && (
      <p className="text-xs text-themed-secondary leading-relaxed mb-4">
        При самоучастие {MORTGAGE_DEFAULTS.downPaymentPercent}% и лихва{' '}
        {MORTGAGE_DEFAULTS.annualRatePercent}% годишно. Срокът ({termYears} г.) се
        определя според цената на имота (20–30 г.).
      </p>
      )}

      <div className={`flex ${compact ? 'flex-row gap-1.5' : 'flex-col sm:flex-row gap-2'}`}>
        <a href={mailto} className={`btn-crimson text-center flex-1 ${compact ? 'text-[11px] px-2 py-1.5' : 'text-sm px-4 py-2.5'}`}>
          {compact ? 'Ипотека' : 'Вземи с ипотечен кредит'}
        </a>
        <a
          href={telHref}
          className={`btn-ghost text-center flex-1 ${compact ? 'text-[11px] px-2 py-1.5' : 'text-sm px-4 py-2.5'}`}
          style={{ border: '1px solid var(--border-subtle)' }}
        >
          Обади се
        </a>
      </div>
    </div>
  )
}
