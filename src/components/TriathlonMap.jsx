import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMemo } from 'react'
import FormatBadge from './FormatBadge'
import { FORMATS } from '../lib/formats'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createColorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  })
}

const FORMAT_COLORS = {
  XS: '#10b981', S: '#14b8a6', M: '#0ca6f4', L: '#3b82f6', XL: '#8b5cf6', XXL: '#f97316',
}

function groupByLocation(triathlons) {
  const map = {}
  triathlons.forEach(t => {
    const key = `${t.lat?.toFixed(4)},${t.lng?.toFixed(4)}`
    if (!map[key]) map[key] = { lat: t.lat, lng: t.lng, events: [] }
    map[key].events.push(t)
  })
  return Object.values(map)
}

export default function TriathlonMap({ triathlons, onSelect }) {
  const groups = useMemo(() => groupByLocation(triathlons.filter(t => t.lat && t.lng)), [triathlons])

  return (
    <MapContainer
      center={[46.8, 2.3]}
      zoom={6}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {groups.map((group, i) => {
        const mainFormat = group.events[0]?.formats?.[0] || 'M'
        const color = FORMAT_COLORS[mainFormat] || '#0ca6f4'
        return (
          <Marker key={i} position={[group.lat, group.lng]} icon={createColorIcon(color)}>
            <Popup>
              <div className="min-w-[220px]">
                {group.events.map((t, j) => (
                  <div key={j} className={j > 0 ? 'border-t border-slate-700 pt-2 mt-2' : ''}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="font-display font-bold text-base text-white">{t.name}</div>
                      {t.is_club_event && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-water-300 bg-water-900/60 rounded px-1 py-0.5">Club</span>
                      )}
                    </div>
                    <div className="text-slate-400 text-xs mb-2">
                      {t.date
                        ? t.end_date && t.end_date !== t.date
                          ? `Du ${format(new Date(t.date), 'd MMMM', { locale: fr })} au ${format(new Date(t.end_date), 'd MMMM yyyy', { locale: fr })}`
                          : format(new Date(t.date), 'd MMMM yyyy', { locale: fr })
                        : ''}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {t.formats?.map(f => <FormatBadge key={f} format={f} />)}
                    </div>
                    {t.participants?.length > 0 && (
                      <div className="text-xs text-slate-400">
                        👤 {t.participants.map(p => p.name).join(', ')}
                      </div>
                    )}
                    <button
                      onClick={() => onSelect(t)}
                      className="mt-2 text-xs text-water-400 hover:text-water-300 font-semibold"
                    >
                      Voir le détail →
                    </button>
                  </div>
                ))}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
