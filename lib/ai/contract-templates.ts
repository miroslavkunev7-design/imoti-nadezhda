export type ContractType = 'preliminary' | 'sale' | 'rent' | 'reservation'

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  preliminary: 'Предварителен договор',
  sale: 'Договор за покупко-продажба',
  rent: 'Договор за наем',
  reservation: 'Резервация',
}

export interface ContractClientData {
  name: string
  email: string
  phone: string
  egn?: string
  id_card?: string
  address?: string
  property_title?: string
  property_address?: string
  price_eur?: number
  notes?: string
}

function todayBg(): string {
  return new Date().toLocaleDateString('bg-BG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function buildContract(
  type: ContractType,
  client: ContractClientData,
  agency = '„Недвижими имоти Надежда" ЕООД'
): { title: string; content: string; filename: string } {
  const date = todayBg()
  const price = client.price_eur
    ? `${client.price_eur.toLocaleString('bg-BG')} €`
    : '………………… €'

  const party = [
    `Име: ${client.name}`,
    client.egn ? `ЕГН: ${client.egn}` : null,
    client.id_card ? `Лична карта №: ${client.id_card}` : null,
    client.address ? `Адрес: ${client.address}` : null,
    client.phone ? `Телефон: ${client.phone}` : null,
    client.email ? `Имейл: ${client.email}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const propertyBlock = [
    client.property_title ? `Обект: ${client.property_title}` : null,
    client.property_address ? `Адрес на имота: ${client.property_address}` : null,
    `Договорена цена: ${price}`,
  ]
    .filter(Boolean)
    .join('\n')

  const templates: Record<ContractType, string> = {
    preliminary: `ПРЕДВАРИТЕЛЕН ДОГОВОР ЗА ПОКУПКО-ПРОДАЖБА НА НЕДВИЖИМ ИМОТ

Дата: ${date}
Място: гр. Шумен

I. СТРАНИ

1. ПРОДАВАЧ: ${agency}, представлявано от упълномощен брокер.
2. КУПУВАЧ:
${party}

II. ПРЕДМЕТ

${propertyBlock}

III. УСЛОВИЯ
1. Страните се задължават в срок от 30 /тридесет/ календарни дни да подпишат окончателен договор за покупко-продажба при същите съществени условия.
2. При отказ на купувача без вина на продавача, авансът (ако е платен) не се възстановява.
3. При отказ на продавача, авансът се възстановява двойно.

IV. ДРУГИ УСЛОВИЯ
${client.notes ? client.notes : 'Допълнителни уговорки: ……………………………………………………'}

Подписи:
Продавач: ____________________
Купувач: ____________________`,

    sale: `ДОГОВОР ЗА ПОКУПКО-ПРОДАЖБА НА НЕДВИЖИМ ИМОТ

Дата: ${date}

ПРОДАВАЧ: ………………………………………
КУПУВАЧ:
${party}

ПРЕДМЕТ НА ДОГОВОРА:
${propertyBlock}

ЦЕНА И ПЛАЩАНЕ: Общата продажна цена е ${price}, платима по уговорен график.

Подписи на страните:`,

    rent: `ДОГОВОР ЗА НАЕМ НА НЕДВИЖИМ ИМОТ

Дата: ${date}

НАЕМОДАТЕЛ: ………………………………………
НАЕМАТЕЛ:
${party}

ПРЕДМЕТ:
${propertyBlock}

НАЕМ: …………… € / месец. Срок: 12 месеца.

Подписи:`,

    reservation: `РЕЗЕРВАЦИОННА СПОРАЗУМЕНИЕ

Дата: ${date}

Брокер: ${agency}
Клиент:
${party}

Резервиран имот:
${propertyBlock}

Резервационна такса: …………… €. Срок на резервация: 7 дни.

Подпис: ____________________`,
  }

  const title = CONTRACT_TYPE_LABELS[type]
  const safeName = client.name.replace(/[^\wа-яА-Я\s-]/gi, '').trim().replace(/\s+/g, '_')
  return {
    title,
    content: templates[type],
    filename: `${type}_${safeName || 'klient'}_${new Date().toISOString().slice(0, 10)}.txt`,
  }
}
