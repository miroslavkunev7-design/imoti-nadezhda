import type { Metadata } from 'next'
import { Suspense } from 'react'
import TerraceHero from '@/components/layout/TerraceHero'

export const metadata: Metadata = {
  title: 'За нас',
  description: 'Имоти ИЛДЖ.ИА — луксозна агенция за недвижими имоти в Североизточна България.',
}

export default function AboutPage() {
  return (
    <>
      <Suspense fallback={<div className="lux-terrace lux-terrace--band" />}>
        <TerraceHero variant="band" />
      </Suspense>

      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-12 pb-20">
        <div className="lux-content-card">
          <h1 className="lux-section-title">За нас</h1>
          <p style={{ color: 'var(--lux-text-muted)', lineHeight: 1.75, marginBottom: 16 }}>
            <strong style={{ color: 'var(--lux-burgundy)' }}>Имоти ИЛДЖ.ИА</strong> е премиум агенция
            за недвижими имоти, специализирана в луксозните жилища в Шумен, Варна, Бургас и Нови пазар.
            Предлагаме персонално съпровождане, дискретни огледи и експертна оценка на всеки имот.
          </p>
          <p style={{ color: 'var(--lux-text-muted)', lineHeight: 1.75, marginBottom: 16 }}>
            Нашият екип от сертифицирани брокери работи с внимание към детайла — от първата среща
            до подписването на договора. Вярваме, че домът е повече от квадратни метри: той е
            начин на живот.
          </p>
          <ul style={{ color: 'var(--lux-text)', lineHeight: 2, paddingLeft: 20 }}>
            <li>Ексклузивни имоти с морски и панорамни гледки</li>
            <li>Пълна правна и ипотечна подкрепа</li>
            <li>Професионални фотосесии и виртуални обиколки</li>
            <li>Дискретност и конфиденциалност</li>
          </ul>
        </div>
      </div>
    </>
  )
}
