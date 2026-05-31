import '@/app/cities/[slug]/[quarter]/property/[id]/property-detail.css'

export default function BurgasPropertyDetailLayout({ children }: { children: React.ReactNode }) {
  return <div className="property-detail-layout">{children}</div>
}
