export default function MarbleBackground() {
  return (
    <div
      className="fixed inset-0 -z-30 pointer-events-none"
      aria-hidden
      style={{
        backgroundColor: '#FAF7F2',
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 20% 30%, rgba(207,165,74,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 75% 65%, rgba(207,165,74,0.06) 0%, transparent 50%),
          radial-gradient(ellipse 40% 35% at 50% 80%, rgba(107,0,28,0.03) 0%, transparent 45%),
          linear-gradient(125deg, transparent 40%, rgba(207,165,74,0.04) 48%, rgba(250,247,242,0.9) 52%, transparent 60%),
          linear-gradient(35deg, transparent 30%, rgba(169,122,31,0.05) 45%, transparent 55%)
        `,
      }}
    />
  )
}
