'use client'

import { PUBLISH_CHANNELS, type PublishChannel } from '@/lib/publish/channels'

interface Props {
  results: Array<PublishChannel & { openUrl: string }>
  onClose: () => void
}

export default function PublishResultsModal({ results, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,2,12,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6"
        style={{
          background: 'rgba(8,6,18,0.95)',
          border: '1.5px solid rgba(196,30,58,0.35)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-white text-xl font-bold">Публикуване във всички сайтове</h2>
            <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">
              Имотът е запазен. Отвори всяка платформа и постави текста от клипборда.
            </p>
          </div>
          <button onClick={onClose} className="text-[rgba(255,255,255,0.4)] hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {results.map(ch => (
            <a
              key={ch.id}
              href={ch.openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(196,30,58,0.08)', border: '1px solid rgba(196,30,58,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                <span className="text-white font-medium text-sm">{ch.name}</span>
              </div>
              <span className="text-crimson-700 text-xs font-semibold">Отвори →</span>
            </a>
          ))}
        </div>

        <p className="text-[11px] text-[rgba(255,255,255,0.35)] mb-4">
          Автоматичното качване изисква API ключове от всяка платформа. Засега отваряме страниците за публикуване и копираме текста на обявата.
        </p>

        <button onClick={onClose} className="btn-crimson w-full justify-center py-3">
          Готово
        </button>
      </div>
    </div>
  )
}
