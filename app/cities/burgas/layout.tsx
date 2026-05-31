import '../../city-burgas-exact.css'

export default function BurgasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/cities/burgas-hero-pier.webp"
        type="image/webp"
      />
      <div className="cb-layout-root">{children}</div>
    </>
  )
}
