import { FORMATS } from '../lib/formats'

export default function FormatBadge({ format, size = 'sm' }) {
  const f = FORMATS[format]
  if (!f) return null
  return (
    <span className={`format-badge ${f.color} ${size === 'lg' ? 'text-sm px-3 py-1' : ''}`}>
      {f.label}
    </span>
  )
}
