import type { Metadata } from 'next'
import TerraceHero from '@/components/layout/TerraceHero'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'За нас',
  description: 'Имоти ИЛДЖ.ИА — водеща агенция за луксозни недвижими имоти в Североизточна България.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="-mt-[96px]" style={{ marginTop: -96 }}>
        <TerraceHero height={340} overlay="medium">
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p
              className="text-label uppercase tracking-[0.25em] mb-3 page-enter"
              style={{ color: '#7A0D28' }}
            >
              Имоти ИЛДЖ.ИА
            </p>
            <h1
              className="font-display page-enter"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#6B001C' }}
            >
              Луксозни недвижими имоти
            </h1>
          </div>
        </TerraceHero>
      </div>

      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-12">
        <div
          className="marble-property-card p-8 md:p-10 marble-reveal"
          style={{ borderColor: 'rgba(207,165,74,0.55)' }}
        >
          <h2
            className="font-display mb-6"
            style={{ fontSize: '1.5rem', color: '#6B001C' }}
          >
            За нас
          </h2>

          <div className="space-y-4" style={{ color: '#7A0D28', lineHeight: 1.7 }}>
            <p>
              <strong style={{ color: '#6B001C' }}>Имоти ИЛДЖ.ИА</strong> е премиум агенция за
              недвижими имоти, специализирана в луксозни апартаменти, къщи и инвестиционни
              имоти в Шумен, Варна, Бургас и Нови Пазар.
            </p>
            <p>
              С над десетилетие опит на пазара, нашият екип от професионални брокери
              предлага персонализирано обслужване, прозрачни сделки и ексклузивен
              портфейл от имоти с висока инвестиционна стойност.
            </p>
            <p>
              Всяка обява е внимателно подбрана и представена с професионална
              фотография, детайлна характеристика и пълна правна подкрепа
              през целия процес на покупка или наем.
            </p>
          </div>

          <div
            className="grid grid-cols-3 gap-4 mt-10 pt-8"
            style={{ borderTop: '1px solid rgba(207,165,74,0.35)' }}
          >
            {[
              { value: '500+', label: 'Успешни сделки' },
              { value: '4', label: 'Града' },
              { value: '4.9', label: 'Рейтинг' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-display font-bold" style={{ fontSize: '1.75rem', color: '#CFA54A' }}>
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-wider mt-1" style={{ color: '#9A7080' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            <Link href="/buy" className="btn-gold">
              Имоти за продажба
            </Link>
            <Link href="/contact" className="btn-burgundy">
              Свържете се с нас
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
