import type { Metadata } from 'next'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

export const metadata: Metadata = { title: 'Вход | Admin' }

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { from?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background — same as homepage hero */}
      <div
        className="fixed inset-0 bg-center bg-cover -z-20"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      />
      <div className="fixed inset-0 -z-10" style={{ background: 'rgba(6,4,14,0.78)' }} />
      {/* Crimson glow center */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(196,30,58,0.12) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'rgba(196,30,58,0.12)',
              border: '1.5px solid rgba(196,30,58,0.35)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A86B3D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Admin панел</h1>
          <p className="text-[rgba(255,255,255,0.55)] text-sm mt-1">Имоти Надежда — само за брокери</p>
        </div>

        {/* Login card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: 'rgba(8,6,18,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(196,30,58,0.38)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,30,58,0.12)',
          }}
        >
          <AdminLoginForm redirectTo={searchParams.from ?? '/admin'} />
        </div>

        <p className="text-center text-xs text-[rgba(255,255,255,0.35)] mt-5">
          Клиентите нямат достъп до тази страница
        </p>
      </div>
    </div>
  )
}
