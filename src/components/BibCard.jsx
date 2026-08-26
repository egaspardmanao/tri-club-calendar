import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Phone, Check, Undo2, Trash2 } from 'lucide-react'
import FormatBadge from './FormatBadge'
import { supabase } from '../lib/supabase'

export default function BibCard({ bib, onUpdated }) {
  const t = bib.triathlon
  const dateLabel = t?.date ? format(new Date(t.date), 'd MMM yyyy', { locale: fr }) : 'Date inconnue'
  const taken = bib.status === 'taken'

  async function toggleStatus() {
    await supabase.from('bib_transfers').update({ status: taken ? 'available' : 'taken' }).eq('id', bib.id)
    onUpdated()
  }

  async function handleDelete() {
    await supabase.from('bib_transfers').delete().eq('id', bib.id)
    onUpdated()
  }

  return (
    <div className={`card p-4 transition-opacity ${taken ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-display font-bold text-lg text-white leading-tight truncate">
              {t?.name || 'Épreuve supprimée'}
            </div>
            {bib.format && <FormatBadge format={bib.format} />}
            {taken && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 rounded px-1.5 py-0.5">
                Pris
              </span>
            )}
          </div>
          <div className="text-slate-400 text-sm mt-0.5">{t?.city} · {dateLabel}</div>
          <div className="text-slate-300 text-sm mt-2">
            Cédé par <span className="text-white font-medium">{bib.seller_name}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-400">
            <Phone size={12} /> {bib.contact}
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button onClick={toggleStatus} title={taken ? 'Marquer disponible' : 'Marquer comme pris'}
            className={`p-1.5 rounded-md transition-colors ${taken ? 'text-slate-500 hover:text-water-400' : 'text-slate-500 hover:text-emerald-400'}`}>
            {taken ? <Undo2 size={16} /> : <Check size={16} />}
          </button>
          <button onClick={handleDelete} title="Supprimer"
            className="text-slate-500 hover:text-red-400 p-1.5 rounded-md transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>
    </div>
  )
}
