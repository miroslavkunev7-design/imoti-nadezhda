'use client'

import { useState } from 'react'
import { uploadMortgageDocument } from '@/lib/upload-mortgage'
import { FIELD_LABELS, type MortgageBank, type MortgageFileField, type MortgageFiles } from '@/lib/mortgage/constants'

interface Client {
  id: number
  name: string
  email: string
  phone?: string
}

const FILE_FIELDS: { key: MortgageFileField; label: string; multiple: boolean; accept: string }[] = [
  { key: 'statements_12m', label: FIELD_LABELS.statements_12m, multiple: true, accept: 'image/*,.pdf' },
  { key: 'payslips_12m', label: FIELD_LABELS.payslips_12m, multiple: true, accept: 'image/*,.pdf' },
  { key: 'contract', label: FIELD_LABELS.contract, multiple: true, accept: 'image/*,.pdf' },
  { key: 'id_front', label: FIELD_LABELS.id_front, multiple: false, accept: 'image/*,.pdf' },
  { key: 'id_back', label: FIELD_LABELS.id_back, multiple: false, accept: 'image/*,.pdf' },
]

export default function MortgageApplicationModal({
  client,
  onClose,
  onSent,
}: {
  client: Client
  onClose: () => void
  onSent: () => void
}) {
  const [files, setFiles] = useState<MortgageFiles>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [sending, setSending] = useState<MortgageBank | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleFiles(field: MortgageFileField, fileList: FileList | null) {
    if (!fileList?.length) return
    setError('')
    setUploading(field)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(fileList)) {
        const url = await uploadMortgageDocument(file, file.name)
        uploaded.push(url)
      }
      setFiles(prev => ({
        ...prev,
        [field]: [...(prev[field] ?? []), ...uploaded],
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при качване')
    } finally {
      setUploading(null)
    }
  }

  function removeFile(field: MortgageFileField, index: number) {
    setFiles(prev => ({
      ...prev,
      [field]: (prev[field] ?? []).filter((_, i) => i !== index),
    }))
  }

  async function submit(bank: MortgageBank) {
    setError('')
    setSuccess('')
    const hasFiles = Object.values(files).some(arr => arr?.length)
    if (!hasFiles) {
      setError('Прикачи поне един документ преди изпращане')
      return
    }

    setSending(bank)
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/mortgage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bank, files, notes }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Грешка')

      const bankLabel = bank === 'obb' ? 'Пламен ОББ' : 'Калина ИБанк'
      if (json.emailSent) {
        setSuccess(`Изпратено към ${bankLabel} (${json.recipient})`)
      } else {
        setSuccess(`Записано в CRM. ${json.warning ?? ''}`)
      }
      onSent()
      setTimeout(onClose, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изпращане')
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,2,12,0.82)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-[640px] max-h-[92vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: 'rgba(8,6,18,0.98)', border: '1.5px solid rgba(196,30,58,0.45)' }}
        onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-white font-bold text-lg mb-1">Ипотечна кандидатура</h3>
        <p className="text-sm text-[rgba(255,255,255,0.5)] mb-5">
          Клиент: <span className="text-white">{client.name}</span>
          {client.email && <> · {client.email}</>}
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm text-red-300"
            style={{ background: 'rgba(196,30,58,0.15)', border: '1px solid rgba(196,30,58,0.3)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2 rounded-lg text-sm text-green-300"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
            {success}
          </div>
        )}

        <div className="flex flex-col gap-4 mb-5">
          {FILE_FIELDS.map(({ key, label, multiple, accept }) => (
            <div key={key} className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(196,30,58,0.15)' }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm text-white font-medium">{label}</p>
                <label className="btn-ghost text-xs px-3 py-1.5 cursor-pointer">
                  {uploading === key ? 'Качване...' : '+ Прикачи'}
                  <input
                    type="file"
                    className="hidden"
                    accept={accept}
                    multiple={multiple}
                    disabled={!!uploading || !!sending}
                    onChange={e => {
                      handleFiles(key, e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
              {(files[key]?.length ?? 0) > 0 && (
                <ul className="space-y-1">
                  {files[key]!.map((url, i) => (
                    <li key={`${key}-${i}`} className="flex items-center justify-between gap-2 text-xs text-[rgba(255,255,255,0.6)]">
                      <a href={url} target="_blank" rel="noreferrer" className="truncate hover:text-crimson-400">
                        Файл {i + 1}
                      </a>
                      <button type="button" onClick={() => removeFile(key, i)}
                        className="text-red-400 hover:text-red-300 shrink-0">×</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <textarea
          className="input-dark text-sm w-full min-h-[70px] mb-5 resize-y"
          placeholder="Допълнителни бележки (по избор)..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={!!sending || !!uploading}
            onClick={() => submit('obb')}
            className="btn-crimson flex-1 py-2.5 text-sm disabled:opacity-60"
          >
            {sending === 'obb' ? 'Изпращане...' : 'Изпращане към Пламен ОББ'}
          </button>
          <button
            type="button"
            disabled={!!sending || !!uploading}
            onClick={() => submit('ibank')}
            className="flex-1 py-2.5 text-sm rounded-lg font-medium text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', border: '1px solid rgba(96,165,250,0.4)' }}
          >
            {sending === 'ibank' ? 'Изпращане...' : 'Изпращане към Калина ИБанк'}
          </button>
        </div>

        <button type="button" onClick={onClose} className="btn-ghost w-full mt-3 py-2 text-sm">
          Затвори
        </button>
      </div>
    </div>
  )
}
