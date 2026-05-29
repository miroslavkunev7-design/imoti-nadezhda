import type { Metadata } from 'next'
import ContactForm from '@/components/contacts/ContactForm'

export const metadata: Metadata = {
  title: 'Контакти — Имоти Надежда',
  description: 'Свържете се с Имоти Надежда',
}

const PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+359899620262'
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'agenciq_nadejdi@abv.bg'
const ADDRESS = process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? 'гр. Бургас, ул. Примерна 123'

export default function ContactsPage() {
  return (
    <div className="rd-contacts">
      <div className="rd-contacts__inner">
        {/* Info */}
        <div>
          <h1 className="rd-contacts__info-title">Контакти</h1>

          <div className="rd-contacts__info-item">
            <span className="rd-contacts__info-icon"><LocationIcon /></span>
            <div>
              <p className="rd-contacts__info-label">Адрес</p>
              <span className="rd-contacts__info-val">{ADDRESS}</span>
            </div>
          </div>

          <div className="rd-contacts__info-item">
            <span className="rd-contacts__info-icon"><PhoneIcon /></span>
            <div>
              <p className="rd-contacts__info-label">Телефон</p>
              <a href={`tel:${PHONE.replace(/\s/g,'')}`} className="rd-contacts__info-val">{PHONE}</a>
            </div>
          </div>

          <div className="rd-contacts__info-item">
            <span className="rd-contacts__info-icon"><MailIcon /></span>
            <div>
              <p className="rd-contacts__info-label">Имейл</p>
              <a href={`mailto:${EMAIL}`} className="rd-contacts__info-val">{EMAIL}</a>
            </div>
          </div>

          <div className="rd-contacts__info-item">
            <span className="rd-contacts__info-icon"><ClockIcon /></span>
            <div>
              <p className="rd-contacts__info-label">Работно време</p>
              <span className="rd-contacts__info-val">
                Пн–Пт: 9:00 – 18:00<br />Съб: 10:00 – 14:00
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <ContactForm />
        </div>

        {/* Map */}
        <div className="rd-contacts__map">
          <iframe
            title="Офис Имоти Надежда"
            src="https://www.openstreetmap.org/export/embed.html?bbox=27.43%2C42.48%2C27.50%2C42.52&layer=mapnik&marker=42.50%2C27.46"
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}

function LocationIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> }
function PhoneIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> }
function MailIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> }
function ClockIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
