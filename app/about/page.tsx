import type { Metadata } from 'next'
import TerraceHero from '@/components/layout/TerraceHero'
import { BRAND } from '@/lib/design/brand'

export const metadata: Metadata = {
  title: 'За нас',
  description: `${BRAND.fullName} — луксозна агенция за недвижими имоти.`,
}

export default function AboutPage() {
  return (
    <>
      <TerraceHero height={220} />
      <div className="lux-content-page">
        <article className="lux-content-panel">
          <h1>За нас</h1>
          <p>
            {BRAND.fullName} е водеща агенция за луксозни недвижими имоти в Североизточна
            България. Работим с подбрани имоти в Шумен, Варна, Бургас и Нови пазар —
            апартаменти, къщи, мезонети и парцели с индивидуално съпровождане.
          </p>
          <p>
            Екипът ни комбинира дискретност, точност и премиум обслужване — от първия
            оглед до подписване на договора. Всяка обява е представена с внимание към
            детайла и маркетинг на световно ниво.
          </p>
          <p>
            Доверете се на брокер, който познава местния пазар и ще ви насочи към
            имота, който отговаря на вашите изисквания.
          </p>
        </article>
      </div>
    </>
  )
}
