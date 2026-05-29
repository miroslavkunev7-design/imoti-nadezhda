/** Векторна икона — три къщи с прозорци (HQ, #6B001C) */
export default function BrandLogoHouses({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 280 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g fill="#6B001C">
        {/* Лява къща */}
        <path d="M34 92V72L62 46L90 72V92H34Z" />
        <rect x="52" y="74" width="20" height="14" fill="#FAF7F2" opacity="0.95" />
        <path d="M62 74V88M52 81H72" stroke="#6B001C" strokeWidth="1.2" />

        {/* Централна къща */}
        <path d="M96 92V66L140 18L184 66V92H96Z" />
        <path d="M166 24H180V38H166V28H174V24H166Z" />
        <rect x="122" y="74" width="36" height="16" fill="#FAF7F2" opacity="0.95" />
        <path d="M140 74V90M122 82H158" stroke="#6B001C" strokeWidth="1.35" />

        {/* Дясна къща */}
        <path d="M190 90V72L216 48L242 72V90H190Z" />
        <rect x="206" y="74" width="20" height="14" fill="#FAF7F2" opacity="0.95" />
        <path d="M216 74V88M206 81H226" stroke="#6B001C" strokeWidth="1.2" />
      </g>
    </svg>
  )
}
