'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface MatchedClient {
  id: number
  name: string
  email: string
  phone: string
  preferred_type: string
  budget_min: number
  budget_max: number
  city_name: string
  preferred_bedrooms: number
  assigned_agent_name: string
  status: string
}

interface MatchNotificationProps {
  matches: MatchedClient[]
  propertyTitle: string
  onClose: () => void
  onNotify: (clientId: number) => void
}

export default function MatchNotification({
  matches,
  propertyTitle,
  onClose,
  onNotify,
}: MatchNotificationProps) {
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-[200]"
        style={{ background: 'rgba(4,2,12,0.80)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[560px] rounded-2xl overflow-hidden"
          style={{
            background: 'var(--bg-surface)',
            border: '1.5px solid rgba(196,30,58,0.55)',
            boxShadow: '0 0 0 1px rgba(196,30,58,0.20), 0 32px 80px rgba(0,0,0,0.7), 0 0 120px rgba(196,30,58,0.12)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Crimson top glow bar */}
          <div style={{
            height: 3,
            background: 'linear-gradient(to right, #500B1A, #A86B3D, #C4895A, #A86B3D, #500B1A)',
          }} />

          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(196,30,58,0.15)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Animated target icon */}
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(196,30,58,0.15)', border: '1.5px solid rgba(196,30,58,0.4)' }}
                >
                  <TargetIcon />
                </motion.div>
                <div>
                  <p className="text-xs text-crimson-700 uppercase tracking-widest font-semibold mb-0.5">
                    Съвпадение намерено!
                  </p>
                  <h2 className="font-display text-themed-primary font-bold text-lg leading-tight">
                    {matches.length} {matches.length === 1 ? 'клиент търси' : 'клиента търсят'} точно това
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-themed-muted hover:text-themed-primary transition-colors mt-1 flex-shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <p className="text-sm text-themed-secondary mt-3">
              Новият имот <span className="text-themed-primary font-medium">„{propertyTitle}"</span> съвпада с критериите на следните клиенти:
            </p>
          </div>

          {/* Client matches list */}
          <div className="px-6 py-4 flex flex-col gap-3 max-h-[380px] overflow-y-auto">
            {matches.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                className="rounded-xl p-4"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(196,30,58,0.18)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Client info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {/* Avatar initials */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: '#A86B3D' }}
                      >
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-themed-primary font-semibold">{client.name}</p>
                        {client.assigned_agent_name && (
                          <p className="text-[10px] text-themed-muted">Брокер: {client.assigned_agent_name}</p>
                        )}
                      </div>
                    </div>

                    {/* Search criteria */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {client.preferred_type && (
                        <Chip icon="🏠" label={client.preferred_type} />
                      )}
                      {client.city_name && (
                        <Chip icon="📍" label={client.city_name} />
                      )}
                      {(client.budget_min || client.budget_max) && (
                        <Chip icon="💶" label={`€${(client.budget_min/1000).toFixed(0)}к – €${(client.budget_max/1000).toFixed(0)}к`} />
                      )}
                    </div>

                    {/* Contact */}
                    <div className="flex gap-3 mt-2">
                      {client.phone && (
                        <a href={`tel:${client.phone}`} className="text-xs text-crimson-700 hover:text-crimson-400 transition-colors">
                          {client.phone}
                        </a>
                      )}
                      <a href={`mailto:${client.email}`} className="text-xs text-themed-secondary hover:text-themed-primary transition-colors">
                        {client.email}
                      </a>
                    </div>
                  </div>

                  {/* Notify button */}
                  <button
                    onClick={() => onNotify(client.id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 hover:scale-105"
                    style={{
                      background: '#A86B3D',
                      border: '1px solid rgba(232,84,114,0.3)',
                      boxShadow: '0 2px 8px rgba(196,30,58,0.35)',
                    }}
                  >
                    Свържи →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(196,30,58,0.12)' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-themed-muted">
                Клиентите бяха уведомени автоматично в CRM системата
              </p>
              <button
                onClick={onClose}
                className="text-sm text-themed-secondary hover:text-themed-primary transition-colors font-medium"
              >
                Затвори
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-themed-primary font-medium"
      style={{ background: 'rgba(196,30,58,0.12)', border: '1px solid rgba(196,30,58,0.22)' }}
    >
      <span>{icon}</span>{label}
    </span>
  )
}

function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A86B3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  )
}
