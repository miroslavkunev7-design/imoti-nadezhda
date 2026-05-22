'use client'
import { useState, useRef } from 'react'
import { cardStyle, PageHeader, tableCellStyle, tableHeaderStyle } from '@/components/admin/AdminCard'

interface Doc { id: number; original_name: string; file_path: string; mime_type: string; size_bytes: number; created_at: string; uploader_name: string }

function formatSize(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024*1024) return `${(bytes/1024).toFixed(1)} KB`
  return `${(bytes/1024/1024).toFixed(1)} MB`
}

function getIcon(mime: string) {
  if (mime?.includes('pdf')) return '📄'
  if (mime?.includes('image')) return '🖼️'
  if (mime?.includes('word') || mime?.includes('doc')) return '📝'
  return '📎'
}

export default function DocumentsTable({ documents: initial }: { documents: Doc[] }) {
  const [docs, setDocs] = useState(initial)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) {
        setDocs(prev => [{
          id: json.id, original_name: file.name, file_path: json.path,
          mime_type: file.type, size_bytes: file.size,
          created_at: new Date().toISOString(), uploader_name: 'Аз'
        }, ...prev])
      }
    } finally { setUploading(false) }
  }

  return (
    <div>
      <PageHeader title={`Документи (${docs.length})`}
        action={
          <>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="btn-crimson text-sm px-4 py-2">
              {uploading ? 'Качване...' : '+ Качи документ'}
            </button>
          </>
        }
      />

      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        {docs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[rgba(255,255,255,0.4)] mb-4">Няма качени документи</p>
            <button onClick={() => fileRef.current?.click()} className="btn-crimson text-sm px-5 py-2">Качи първия документ</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={tableHeaderStyle}>
                {['Документ','Тип','Размер','Качен от','Дата','Действия'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-[rgba(255,255,255,0.4)] uppercase tracking-wider font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} className="hover:bg-[rgba(196,30,58,0.05)] transition-colors">
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getIcon(d.mime_type)}</span>
                      <span className="text-sm text-white font-medium truncate max-w-[200px]">{d.original_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.5)] text-xs" style={tableCellStyle}>{d.mime_type || '—'}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.5)] text-sm" style={tableCellStyle}>{formatSize(d.size_bytes)}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.5)] text-sm" style={tableCellStyle}>{d.uploader_name || '—'}</td>
                  <td className="px-4 py-3 text-[rgba(255,255,255,0.4)] text-xs" style={tableCellStyle}>
                    {new Date(d.created_at).toLocaleDateString('bg-BG')}
                  </td>
                  <td className="px-4 py-3" style={tableCellStyle}>
                    <div className="flex gap-3">
                      {d.file_path && (
                        <a href={d.file_path} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-crimson-700 hover:text-crimson-400 transition-colors">Изтегли</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
