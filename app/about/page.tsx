import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'За нас — Имоти Надежда',
  description: 'Имоти Надежда — луксозна агенция за недвижими имоти в Североизточна България.',
}

const STATS = [
  { value: '15+', label: 'Години опит' },
  { value: '2 500+', label: 'Успешни сделки' },
  { value: '85 000+', label: 'Имота под наем' },
  { value: '4', label: 'Града' },
]

const TEAM = [
  {
    name: 'Надежда Илджева',
    role: 'Управител',
    phone: '+359 899 620 262',
    email: 'agenciq_nadejdi@abv.bg',
  },
  {
    name: 'Мирослав Кънев',
    role: 'Старши консултант',
    phone: '+359 899 620 262',
    email: 'office@nadezhda.bg',
  },
  {
    name: 'Мария Иванова',
    role: 'Консултант',
    phone: '+359 88 123 4567',
    email: 'm.ivanova@nadezhda.bg',
  },
  {
    name: 'Георги Николаев',
    role: 'Консултант',
    phone: '+359 89 456 7890',
    email: 'g.nikolaev@nadezhda.bg',
  },
]

export default function AboutPage() {
  return (
    <div className="rd-about">
      {/* Hero */}
      <section className="rd-about__hero">
        <div className="rd-about__hero-text">
          <p className="rd-about__eyebrow">Имоти Надежда</p>
          <h1 className="rd-about__h1">За нас</h1>
          <p className="rd-about__desc">
            Имоти Надежда е водеща агенция за недвижими имоти в Шумен, Варна, Бургас и Нови пазар.
            Предлагаме пълно съдействие при покупка, продажба и наем на имоти с индивидуален
            подход и грижа за всеки клиент.
          </p>
          <ul className="rd-about__features">
            {[
              'Персонален консултант за всеки клиент',
              '360° виртуални турове на имоти',
              'Пълна правна и финансова подкрепа',
              'Гарантирана безопасност на сделката',
            ].map(f => (
              <li key={f} className="rd-about__feature">{f}</li>
            ))}
          </ul>
        </div>

        <div className="rd-about__hero-image" aria-hidden>
          <div className="rd-about__hero-image-bg" />
        </div>
      </section>

      {/* Stats */}
      <div className="rd-stats-bar">
        {STATS.map(s => (
          <div key={s.label} className="rd-stat">
            <span className="rd-stat__value">{s.value}</span>
            <span className="rd-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Team */}
      <section className="rd-team">
        <h2 className="rd-team__title">Нашите консултанти</h2>
        <div className="rd-team__grid">
          {TEAM.map(person => (
            <div key={person.name} className="rd-team-card">
              <div className="rd-team-card__avatar">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(207,165,74,0.8)" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <h3 className="rd-team-card__name">{person.name}</h3>
              <p className="rd-team-card__role">{person.role}</p>
              <div className="rd-team-card__contact">
                <a href={`tel:${person.phone.replace(/\s/g, '')}`} className="rd-team-card__phone">
                  {person.phone}
                </a>
                <a href={`mailto:${person.email}`} className="rd-team-card__email">
                  {person.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
