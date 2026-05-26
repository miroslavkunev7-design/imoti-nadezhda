import nodemailer from 'nodemailer'
import {
  BANK_LABELS,
  FIELD_LABELS,
  type MortgageBank,
  type MortgageFileField,
  type MortgageFiles,
} from '@/lib/mortgage/constants'

export type { MortgageBank, MortgageFileField, MortgageFiles }

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim()
  )
}

function recipientForBank(bank: MortgageBank): string {
  if (bank === 'obb') {
    return (
      process.env.MORTGAGE_EMAIL_OBB?.trim() ||
      process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
      'agenciq_nadejdi@abv.bg'
    )
  }
  return (
    process.env.MORTGAGE_EMAIL_IBANK?.trim() ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    'agenciq_nadejdi@abv.bg'
  )
}

async function fetchAttachment(url: string, index: number, field: MortgageFileField) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Не може да се изтегли файл: ${FIELD_LABELS[field]}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const ext = url.split('.').pop()?.split('?')[0] ?? 'bin'
  return {
    filename: `${field}-${index + 1}.${ext}`,
    content: buffer,
  }
}

export async function sendMortgageApplicationEmail(opts: {
  bank: MortgageBank
  clientName: string
  clientEmail: string
  clientPhone?: string | null
  files: MortgageFiles
  notes?: string
}): Promise<{ sent: boolean; recipient: string; error?: string }> {
  const recipient = recipientForBank(opts.bank)

  if (!smtpConfigured()) {
    return {
      sent: false,
      recipient,
      error: 'SMTP не е настроен (SMTP_HOST, SMTP_USER, SMTP_PASS в Vercel)',
    }
  }

  const attachments: { filename: string; content: Buffer }[] = []
  for (const [field, urls] of Object.entries(opts.files) as [MortgageFileField, string[]][]) {
    if (!urls?.length) continue
    for (let i = 0; i < urls.length; i++) {
      attachments.push(await fetchAttachment(urls[i], i, field))
    }
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const fileSummary = (Object.entries(opts.files) as [MortgageFileField, string[]][])
    .filter(([, urls]) => urls?.length)
    .map(([field, urls]) => `- ${FIELD_LABELS[field]}: ${urls.length} файл(а)`)
    .join('\n')

  const html = `
    <h2>Ипотечна кандидатура — ${BANK_LABELS[opts.bank]}</h2>
    <p><strong>Клиент:</strong> ${opts.clientName}</p>
    <p><strong>Имейл:</strong> ${opts.clientEmail}</p>
    <p><strong>Телефон:</strong> ${opts.clientPhone || '—'}</p>
    ${opts.notes ? `<p><strong>Бележки:</strong> ${opts.notes}</p>` : ''}
    <p><strong>Прикачени документи:</strong></p>
    <pre>${fileSummary || '—'}</pre>
    <p>Изпратено от CRM — Имоти Надежда</p>
  `

  await transporter.sendMail({
    from: `"Имоти Надежда CRM" <${process.env.SMTP_USER}>`,
    to: recipient,
    cc: process.env.MORTGAGE_EMAIL_CC?.trim() || process.env.SMTP_USER,
    subject: `Ипотечна кандидатура: ${opts.clientName} → ${BANK_LABELS[opts.bank]}`,
    html,
    attachments,
  })

  return { sent: true, recipient }
}
