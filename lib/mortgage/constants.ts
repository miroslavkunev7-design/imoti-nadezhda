export type MortgageBank = 'obb' | 'ibank'

export type MortgageFileField =
  | 'statements_12m'
  | 'payslips_12m'
  | 'contract'
  | 'id_front'
  | 'id_back'

export type MortgageFiles = Partial<Record<MortgageFileField, string[]>>

export const FIELD_LABELS: Record<MortgageFileField, string> = {
  statements_12m: '12 месеца извлечения',
  payslips_12m: '12 месеца фишове',
  contract: 'Договор',
  id_front: 'Лична карта (предна)',
  id_back: 'Лична карта (задна)',
}

export const BANK_LABELS: Record<MortgageBank, string> = {
  obb: 'Пламен — ОББ',
  ibank: 'Калина — ИБанк',
}
