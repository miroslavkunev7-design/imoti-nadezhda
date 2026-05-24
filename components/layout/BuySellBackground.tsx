export default function BuySellBackground() {
  return (
    <>
      <div
        className="fixed inset-0 -z-20 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/images/buy-sell-bg.jpg')",
          backgroundColor: '#0f0a1a',
        }}
      />
      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'rgba(6,4,14,0.58)' }}
      />
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(4,2,12,0.35) 0%, rgba(4,2,12,0.82) 55%, rgba(4,2,12,0.94) 100%)',
        }}
      />
    </>
  )
}
