import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', paddingTop: 76, paddingBottom: 68 }}
    >
      <p className="text-crimson-700 font-display text-6xl font-bold mb-4">404</p>
      <h1 className="font-display text-2xl font-semibold mb-2">Страницата не е намерена</h1>
      <p className="text-themed-secondary max-w-md mb-8">
        Имотът може да не съществува в базата или все още не е добавен.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/" className="btn-crimson px-6 py-2.5">
          Към началото
        </Link>
        <Link href="/buy" className="btn-ghost px-6 py-2.5">
          Всички имоти
        </Link>
      </div>
    </div>
  )
}
