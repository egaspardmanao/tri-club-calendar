import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FORMAT_ORDER } from '../lib/formats'

function monthKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function StatsView({ triathlons }) {
  const stats = useMemo(() => {
    const withDate = triathlons.filter(t => t.date)
    const totalParticipations = withDate.reduce((sum, t) => sum + (t.participants?.filter(p => p.status !== 'interested').length || 0), 0)
    const totalInterested = withDate.reduce((sum, t) => sum + (t.participants?.filter(p => p.status === 'interested').length || 0), 0)
    const clubEvents = withDate.filter(t => t.is_club_event).length

    const byFormat = {}
    FORMAT_ORDER.forEach(f => { byFormat[f] = 0 })
    withDate.forEach(t => {
      t.participants?.filter(p => p.status !== 'interested').forEach(p => {
        if (byFormat[p.format] !== undefined) byFormat[p.format]++
      })
    })

    const monthMap = {}
    withDate.forEach(t => {
      const key = monthKey(t.date)
      if (!monthMap[key]) monthMap[key] = { key, date: new Date(t.date), events: 0, participations: 0 }
      monthMap[key].events++
      monthMap[key].participations += t.participants?.filter(p => p.status !== 'interested').length || 0
    })
    const byMonth = Object.values(monthMap).sort((a, b) => a.date - b.date)
    const maxMonthValue = Math.max(1, ...byMonth.map(m => Math.max(m.events, m.participations)))
    const maxFormatValue = Math.max(1, ...Object.values(byFormat))

    return { total: withDate.length, totalParticipations, totalInterested, clubEvents, byFormat, byMonth, maxMonthValue, maxFormatValue }
  }, [triathlons])

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="font-display font-bold text-xl text-white">Statistiques</h2>
        <p className="text-slate-500 text-xs">Activité du club sur l'ensemble du calendrier</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-2xl font-display font-bold text-white">{stats.total}</div>
          <div className="text-slate-500 text-xs mt-0.5">Triathlons au calendrier</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-display font-bold text-white">{stats.totalParticipations}</div>
          <div className="text-slate-500 text-xs mt-0.5">Inscriptions confirmées</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-display font-bold text-white">{stats.totalInterested}</div>
          <div className="text-slate-500 text-xs mt-0.5">Membres intéressés</div>
        </div>
        <div className="card p-4">
          <div className="text-2xl font-display font-bold text-water-400">{stats.clubEvents}</div>
          <div className="text-slate-500 text-xs mt-0.5">Événements club</div>
        </div>
      </div>

      {/* Participations by month */}
      <div className="card p-5">
        <div className="label mb-4">Inscriptions par mois</div>
        {stats.byMonth.length > 0 ? (
          <div className="flex items-end gap-3 h-40">
            {stats.byMonth.map(m => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="w-full flex-1 flex items-end justify-center">
                  <div
                    className="w-full max-w-[28px] bg-water-600 rounded-t transition-all"
                    style={{ height: `${Math.max(4, (m.participations / stats.maxMonthValue) * 100)}%` }}
                    title={`${m.participations} inscriptions`}
                  />
                </div>
                <div className="text-[10px] text-slate-500 text-center leading-tight capitalize">
                  {format(m.date, 'MMM', { locale: fr })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Pas encore de données.</p>
        )}
      </div>

      {/* By format */}
      <div className="card p-5">
        <div className="label mb-4">Inscriptions par format</div>
        <div className="space-y-2.5">
          {FORMAT_ORDER.map(f => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-8 text-xs font-display font-bold text-slate-400">{f}</div>
              <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-water-500 rounded-full transition-all"
                  style={{ width: `${(stats.byFormat[f] / stats.maxFormatValue) * 100}%` }}
                />
              </div>
              <div className="w-6 text-xs text-slate-500 text-right tabular-nums">{stats.byFormat[f]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
