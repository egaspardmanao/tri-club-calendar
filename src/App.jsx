import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Map, List, SlidersHorizontal, Plus, Archive, Ticket, BarChart3, Download, User, Trash2 } from 'lucide-react'
import TriathlonMap from './components/TriathlonMap'
import EventCard from './components/EventCard'
import EventModal from './components/EventModal'
import AddEventModal from './components/AddEventModal'
import BibExchange from './components/BibExchange'
import StatsView from './components/StatsView'
import IdentityPicker from './components/IdentityPicker'
import TrashView from './components/TrashView'
import { useTriathlons } from './hooks/useTriathlons'
import { useIdentity } from './hooks/useIdentity'
import { FORMAT_ORDER } from './lib/formats'
import { downloadICS } from './lib/icalendar'
import pscLogo from './assets/psc-logo.jpeg'

function isPastDate(triathlon) {
  const ref = triathlon.end_date || triathlon.date
  return ref ? new Date(ref) < new Date().setHours(0, 0, 0, 0) : false
}

const SORT_OPTIONS = [
  { value: 'date', label: 'Par date' },
  { value: 'format', label: 'Par format' },
  { value: 'city', label: 'Par ville' },
]

function groupByMonth(triathlons) {
  const groups = {}
  triathlons.forEach(t => {
    const key = t.date ? format(new Date(t.date), 'MMMM yyyy', { locale: fr }) : 'Date inconnue'
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })
  return groups
}

function groupByFormat(triathlons) {
  const groups = {}
  FORMAT_ORDER.forEach(f => { groups[f] = [] })
  triathlons.forEach(t => {
    const f = t.formats?.[0] || 'M'
    if (!groups[f]) groups[f] = []
    groups[f].push(t)
  })
  return groups
}

export default function App() {
  const { triathlons, loading, refetch } = useTriathlons()
  const { identity, setIdentity } = useIdentity()
  const [view, setView] = useState('map') // 'map' | 'list' | 'bibs' | 'stats' | 'trash'
  const [sort, setSort] = useState('date')
  const [filterFormat, setFilterFormat] = useState(null)
  const [selected, setSelected] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [identityPickerOpen, setIdentityPickerOpen] = useState(false)

  const knownNames = useMemo(() => {
    const names = new Set()
    triathlons.forEach(t => t.participants?.forEach(p => names.add(p.name)))
    return [...names]
  }, [triathlons])

  const upcoming = useMemo(() => triathlons.filter(t => !isPastDate(t)), [triathlons])
  const past = useMemo(() => triathlons.filter(t => isPastDate(t)), [triathlons])

  const filtered = useMemo(() => {
    let list = [...(showPast ? past : upcoming)]
    if (filterFormat) list = list.filter(t => t.formats?.includes(filterFormat))
    if (sort === 'format') list.sort((a, b) => FORMAT_ORDER.indexOf(a.formats?.[0]) - FORMAT_ORDER.indexOf(b.formats?.[0]))
    return list
  }, [upcoming, past, showPast, filterFormat, sort])

  const grouped = useMemo(() => {
    if (sort === 'date') return groupByMonth(filtered)
    if (sort === 'format') return groupByFormat(filtered)
    return { 'Tous': filtered }
  }, [filtered, sort])

  const handleUpdated = async () => {
    const fresh = await refetch()
    setSelected(prev => {
      if (!prev) return prev
      const updated = fresh?.find(t => t.id === prev.id)
      return updated || null
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src={pscLogo} alt="Paris Sport Club" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-700 shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-xl text-white leading-none truncate">TRI CLUB PSC</h1>
              <p className="text-slate-500 text-xs hidden sm:block">Calendrier de saison</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIdentityPickerOpen(true)} title={identity ? 'Changer de profil' : 'Qui es-tu ?'}
              className="btn-ghost p-2 sm:px-3 sm:py-2 flex items-center gap-1.5 text-xs sm:text-sm">
              <User size={16} /> <span className="hidden sm:inline">{identity || 'Qui es-tu ?'}</span>
            </button>
            {(view === 'map' || view === 'list') && (
              <button onClick={() => downloadICS('tri-club-psc-calendrier.ics', upcoming)} title="Exporter le calendrier (.ics)"
                className="btn-ghost p-2 sm:px-3 sm:py-2">
                <Download size={16} />
              </button>
            )}
            {view !== 'bibs' && view !== 'stats' && view !== 'trash' && (
              <button onClick={() => setAddOpen(true)} className="btn-primary flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
                <Plus size={16} /> <span className="hidden sm:inline">Ajouter un triathlon</span><span className="sm:hidden">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 overflow-x-auto sm:flex-wrap [-webkit-overflow-scrolling:touch]">
          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 shrink-0">
            <button onClick={() => setView('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'map' ? 'bg-water-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Map size={12} /> Carte
            </button>
            <button onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'list' ? 'bg-water-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <List size={12} /> Liste
            </button>
            <button onClick={() => setView('bibs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'bibs' ? 'bg-water-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Ticket size={12} /> Bourse
            </button>
            <button onClick={() => setView('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'stats' ? 'bg-water-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <BarChart3 size={12} /> Stats
            </button>
            <button onClick={() => setView('trash')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${view === 'trash' ? 'bg-water-600 text-white' : 'text-slate-400 hover:text-white'}`}>
              <Trash2 size={12} /> Corbeille
            </button>
          </div>

          {view !== 'bibs' && view !== 'stats' && view !== 'trash' && (
            <>
              {/* Sort */}
              <div className="flex items-center gap-1.5 shrink-0">
                <SlidersHorizontal size={12} className="text-slate-500 hidden sm:block" />
                {SORT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setSort(o.value)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${sort === o.value ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                    {o.label}
                  </button>
                ))}
              </div>

              {/* Past/upcoming toggle */}
              <button onClick={() => setShowPast(p => !p)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors shrink-0 whitespace-nowrap ${
                  showPast ? 'bg-slate-700 text-white border-slate-600' : 'text-slate-500 border-slate-700 hover:text-white'
                }`}>
                <Archive size={12} /> {showPast ? `Anciens (${past.length})` : `Anciens (${past.length})`}
              </button>

              {/* Format filter */}
              <div className="flex items-center gap-1 sm:ml-auto shrink-0">
                <button onClick={() => setFilterFormat(null)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${!filterFormat ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}>
                  Tous
                </button>
                {FORMAT_ORDER.map(f => (
                  <button key={f} onClick={() => setFilterFormat(filterFormat === f ? null : f)}
                    className={`format-badge cursor-pointer transition-opacity ${filterFormat && filterFormat !== f ? 'opacity-30' : 'opacity-100'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4">
        {view === 'bibs' ? (
          <BibExchange triathlons={triathlons} />
        ) : view === 'stats' ? (
          <StatsView triathlons={triathlons} />
        ) : view === 'trash' ? (
          <TrashView onRestored={refetch} />
        ) : loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500">Chargement…</div>
        ) : view === 'map' ? (
          <div className="flex flex-col sm:flex-row gap-4 sm:h-[calc(100vh-160px)]">
            {/* Map */}
            <div className="flex-1 min-w-0 h-[50vh] sm:h-auto">
              <TriathlonMap triathlons={filtered} onSelect={setSelected} />
            </div>
            {/* Sidebar list on map view */}
            <div className="w-full sm:w-72 shrink-0 sm:overflow-y-auto space-y-2 sm:pr-1">
              {Object.entries(grouped).map(([group, items]) => (
                items.length > 0 && (
                  <div key={group}>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 py-2 capitalize">{group}</div>
                    {items.map(t => <EventCard key={t.id} triathlon={t} onClick={setSelected} />)}
                  </div>
                )
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-slate-500 py-12 text-sm">Aucun triathlon pour ces filtres.<br />Commence par en ajouter un !</div>
              )}
            </div>
          </div>
        ) : (
          // List view
          <div className="max-w-3xl mx-auto space-y-6">
            {Object.entries(grouped).map(([group, items]) => (
              items.length > 0 && (
                <div key={group}>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 capitalize border-b border-slate-800 pb-2">{group}</div>
                  <div className="space-y-2">
                    {items.map(t => <EventCard key={t.id} triathlon={t} onClick={setSelected} />)}
                  </div>
                </div>
              )
            ))}
            {filtered.length === 0 && (
              <div className="text-center text-slate-500 py-20 text-sm">Aucun triathlon pour ces filtres.<br />Commence par en ajouter un !</div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {selected && (
        <EventModal
          triathlon={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
          identity={identity}
        />
      )}
      {addOpen && (
        <AddEventModal
          onClose={() => setAddOpen(false)}
          onAdded={() => { setAddOpen(false); refetch() }}
        />
      )}
      {identityPickerOpen && (
        <IdentityPicker
          knownNames={knownNames}
          onPick={(n) => { setIdentity(n); setIdentityPickerOpen(false) }}
          onClose={() => setIdentityPickerOpen(false)}
        />
      )}
    </div>
  )
}
