import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Undo2, Trash2, Trash } from 'lucide-react'
import { useTrash } from '../hooks/useTrash'
import { supabase } from '../lib/supabase'

export default function TrashView({ onRestored }) {
  const { trashed, loading, refetch } = useTrash()

  async function handleRestore(id) {
    await supabase.from('triathlons').update({ deleted_at: null, deleted_by: null }).eq('id', id)
    await refetch()
    onRestored?.()
  }

  async function handlePurge(id) {
    await supabase.from('triathlons').delete().eq('id', id)
    await refetch()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-white flex items-center gap-2"><Trash size={18} /> Corbeille</h2>
        <p className="text-slate-500 text-xs">Les épreuves supprimées restent ici, restaurables à tout moment</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">Chargement…</div>
      ) : trashed.length > 0 ? (
        <div className="space-y-2">
          {trashed.map(t => (
            <div key={t.id} className="card p-4 flex items-center justify-between gap-3 opacity-80">
              <div className="min-w-0">
                <div className="font-display font-bold text-white truncate">{t.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">
                  {t.city} · {t.date ? format(new Date(t.date), 'd MMM yyyy', { locale: fr }) : 'Date inconnue'}
                </div>
                <div className="text-slate-600 text-xs mt-1">
                  Supprimé {t.deleted_by ? `par ${t.deleted_by} ` : ''}
                  {t.deleted_at ? format(new Date(t.deleted_at), "d MMM yyyy 'à' HH:mm", { locale: fr }) : ''}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleRestore(t.id)} title="Restaurer"
                  className="text-slate-400 hover:text-water-400 p-1.5 transition-colors"><Undo2 size={16} /></button>
                <button onClick={() => handlePurge(t.id)} title="Supprimer définitivement"
                  className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-20 text-sm">La corbeille est vide.</div>
      )}
    </div>
  )
}
