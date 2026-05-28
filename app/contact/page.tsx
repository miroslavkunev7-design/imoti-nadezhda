import type { Metadata } from 'next'
import TerraceHero from '@/components/layout/TerraceHero'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Контакти',
  description: 'Свържете се с Имоти ИЛДЖ.ИА — телефон, имейл и форма за запитване.',
}

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '0877 123 456'
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@ildjia.bg'
  const address = 'ул. Славянска 12, Шумен'

  return (
    <div className="min-h-screen">
      <div className="-mt-[96px]" style={{ marginTop: -96 }}>
        <TerraceHero height={300} overlay="medium">
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <h1
              className="font-display page-enter"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: '#6B001C' }}
            >
              Контакти
            </h1>
            <p className="text-sm mt-2 page-enter" style={{ color: '#7A0D28' }}>
              На ваше разположение сме всеки ден
            </p>
          </div>
        </TerraceHero>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            {[
              { icon: <PhoneIcon />, label: 'Телефон', value: phone, href: `tel:${phone.replace(/\s/g, '')}` },
              { icon: <MailIcon />, label: 'Имейл', value: email, href: `mailto:${email}` },
              { icon: <PinIcon />, label: 'Адрес', value: address, href: undefined },
            ].map(item => (
              <div key={item.label} className="marble-property-card p-5 flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(145deg, rgba(207,165,74,0.2) 0%, rgba(169,122,31,0.1) 100%)',
                    border: '1.5px solid rgba(207,165,74,0.45)',
                    color: '#A97A1F',
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#9A7080' }}>
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} className="font-semibold" style={{ color: '#6B001C' }}>
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-semibold" style={{ color: '#6B001C' }}>{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div
              className="agent-glass-panel p-6"
              style={{ color: '#FAF7F2' }}
            >
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#CFA54A' }}>
                Работно време
              </h3>
              <p className="text-sm" style={{ color: 'rgba(250,247,242,0.9)' }}>Понеделник – Петък: 09:00 – 18:00</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(250,247,242,0.9)' }}>Събота: 10:00 – 14:00</p>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  )
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .89h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  )
}
