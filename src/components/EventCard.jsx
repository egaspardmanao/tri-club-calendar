import { format, addYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Globe, ClipboardList, MessageCircle, Users, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react'
import FormatBadge from './FormatBadge'

function isPast(triathlon) {
  const ref = triathlon.end_date || triathlon.date
  return ref ? new Date(ref) < new Date().setHours(0, 0, 0, 0) : false
}

export default function EventCard({ triathlon, onClick }) {
  const dateLabel = triathlon.date
    ? triathlon.end_date && triathlon.end_date !== triathlon.date
      ? `${format(new Date(triathlon.date), 'd', { locale: fr })}-${format(new Date(triathlon.end_date), 'd MMM yyyy', { locale: fr })}`
      : format(new Date(triathlon.date), 'd MMM yyyy', { locale: fr })
    : 'Date inconnue'

  const showPrediction = isPast(triathlon) && triathlon.date
  const predictedDate = showPrediction
    ? format(addYears(new Date(triathlon.date), 1), 'd MMM yyyy', { locale: fr })
    : null

  return (
    <button
      onClick={() => onClick(triathlon)}
      className="card p-4 w-full text-left hover:border-water-700 hover:bg-slate-800/50 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="font-display font-bold text-lg text-white leading-tight truncate group-hover:text-water-300 transition-colors">
              {triathlon.name}
            </div>
            {triathlon.is_club_event && (
              <ShieldCheck size={14} className="text-water-400 shrink-0" title="Événement club" />
            )}
          </div>
          <div className="text-slate-400 text-sm mt-0.5">{triathlon.city} · {dateLabel}</div>
        </div>
        <ChevronRight size={16} className="text-slate-600 group-hover:text-water-400 mt-1 shrink-0 transition-colors" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {triathlon.formats?.map(f => <FormatBadge key={f} format={f} />)}
      </div>
      {triathlon.participants?.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
          <Users size={12} />
          <span>{triathlon.participants.map(p => p.name).join(', ')}</span>
        </div>
      )}
      {showPrediction && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-water-400">
          <Sparkles size={12} />
          <span>Prochaine édition probable : {predictedDate}</span>
        </div>
      )}
    </button>
  )
}
