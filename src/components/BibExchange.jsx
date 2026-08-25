import { useState, useMemo } from 'react'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import BibCard from './BibCard'
import AddBibModal from './AddBibModal'
import { useBibTransfers } from '../hooks/useBibTransfers'
import { FORMAT_ORDER } from '../lib/formats'

const SORT_OPTIONS = [
  { value: 'date', label: 'Par date' },
  { value: 'format', label: 'Par format' },
  { value: 'triathlon', label: 'Par triathlon' },
]

export default function BibExchange({ triathlons }) {
  const { bibTransfers, loading, refetch } = useBibTransfers()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('date')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = bibTransfers.filter(b => {
      if (!q) return true
      return (
        b.triathlon?.name?.toLowerCase().includes(q) ||
        b.triathlon?.city?.toLowerCase().includes(q) ||
        b.format?.toLowerCase().includes(q)
      )
    })

    list.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'taken' ? 1 : -1
      if (sort === 'format') return FORMAT_ORDER.indexOf(a.format) - FORMAT_ORDER.indexOf(b.format)
      if (sort === 'triathlon') return (a.triathlon?.name || '').localeCompare(b.triathlon?.name || '')
      return new Date(a.triathlon?.date || 0) - new Date(b.triathlon?.date || 0)
    })
    return list
  }, [bibTransfers, query, sort])

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-xl text-white">Bourse aux dossards</h2>
          <p className="text-slate-500 text-xs">Cède ou récupère un dossard pour un triathlon</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-1.5 text-sm shrink-0">
          <Plus size={16} /> Céder un dossard
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9"
            placeholder="Chercher un triathlon ou un format…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal size={12} className="text-slate-500 hidden sm:block" />
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setSort(o.value)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${sort === o.value ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">Chargement…</div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(b => <BibCard key={b.id} bib={b} onUpdated={refetch} />)}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-20 text-sm">
          Aucun dossard {query ? 'pour cette recherche' : 'disponible pour le moment'}.
        </div>
      )}

      {addOpen && (
        <AddBibModal
          triathlons={triathlons}
          onClose={() => setAddOpen(false)}
          onAdded={() => { setAddOpen(false); refetch() }}
        />
      )}
    </div>
  )
}
