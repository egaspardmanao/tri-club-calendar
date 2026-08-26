import { format, addYears } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X, Globe, ClipboardList, MessageCircle, Users, Plus, Pencil, Trash2, CalendarClock, ShieldCheck, HelpCircle, CalendarPlus } from 'lucide-react'
import { useState } from 'react'
import FormatBadge from './FormatBadge'
import AddEventModal from './AddEventModal'
import FeedbackSection from './FeedbackSection'
import { FORMAT_ORDER } from '../lib/formats'
import { supabase } from '../lib/supabase'
import { downloadICS } from '../lib/icalendar'

export default function EventModal({ triathlon, onClose, onUpdated, identity }) {
  const [name, setName] = useState(identity || '')
  const [participantFormat, setParticipantFormat] = useState(triathlon.formats?.[0] || 'M')
  const [participantStatus, setParticipantStatus] = useState('confirmed')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const confirmed = triathlon.participants?.filter(p => p.status !== 'interested') || []
  const interested = triathlon.participants?.filter(p => p.status === 'interested') || []

  const referenceDate = triathlon.end_date || triathlon.date
  const isPast = referenceDate ? new Date(referenceDate) < new Date().setHours(0, 0, 0, 0) : false

  const dateLabel = triathlon.date
    ? triathlon.end_date && triathlon.end_date !== triathlon.date
      ? `Du ${format(new Date(triathlon.date), 'd MMMM', { locale: fr })} au ${format(new Date(triathlon.end_date), 'd MMMM yyyy', { locale: fr })}`
      : format(new Date(triathlon.date), 'EEEE d MMMM yyyy', { locale: fr })
    : 'Date inconnue'

  const alreadyIn = triathlon.participants?.find(
    p => p.name.toLowerCase() === name.toLowerCase()
  )

  async function handleJoin(e) {
    e.preventDefault()
    if (!name.trim()) return
    if (alreadyIn) { setError('Ce prénom est déjà inscrit.'); return }
    setSaving(true)
    setError('')
    const { error } = await supabase.from('participants').insert({
      triathlon_id: triathlon.id,
      name: name.trim(),
      format: participantFormat,
      status: participantStatus,
    })
    if (error) { setError('Erreur lors de l\'inscription.'); setSaving(false); return }
    setSaving(false)
    setName('')
    onUpdated()
  }

  async function handleRemoveParticipant(participantId) {
    await supabase.from('participants').delete().eq('id', participantId)
    onUpdated()
  }

  async function handleDelete() {
    await supabase.from('triathlons').update({
      deleted_at: new Date().toISOString(),
      deleted_by: identity || null,
    }).eq('id', triathlon.id)
    onUpdated()
    onClose()
  }

  async function handleReschedule() {
    const nextDate = format(addYears(new Date(triathlon.date), 1), 'yyyy-MM-dd')
    const nextEndDate = triathlon.end_date
      ? format(addYears(new Date(triathlon.end_date), 1), 'yyyy-MM-dd')
      : null
    await supabase.from('triathlons').update({ date: nextDate, end_date: nextEndDate }).eq('id', triathlon.id)
    onUpdated()
  }

  if (editing) {
    return (
      <AddEventModal
        editing={triathlon}
        onClose={() => setEditing(false)}
        onAdded={() => { setEditing(false); onUpdated() }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card w-full h-full sm:h-auto max-w-lg sm:max-h-[90vh] overflow-y-auto sm:rounded-xl rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {isPast && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 rounded px-1.5 py-0.5">
                  Ancien triathlon
                </span>
              )}
              {triathlon.is_club_event && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-water-300 bg-water-900/60 rounded px-1.5 py-0.5">
                  <ShieldCheck size={10} /> Événement club
                </span>
              )}
            </div>
            <h2 className="font-display font-bold text-2xl text-white">{triathlon.name}</h2>
            <p className="text-slate-400 text-sm mt-1 capitalize">{dateLabel}</p>
            <p className="text-slate-500 text-sm">{triathlon.city}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => downloadICS(`${triathlon.name}.ics`, [triathlon])} title="Ajouter à mon calendrier"
              className="text-slate-500 hover:text-white p-1.5 transition-colors"><CalendarPlus size={16} /></button>
            <button onClick={() => setEditing(true)} title="Modifier"
              className="text-slate-500 hover:text-white p-1.5 transition-colors"><Pencil size={16} /></button>
            <button onClick={() => setConfirmDelete(true)} title="Supprimer"
              className="text-slate-500 hover:text-red-400 p-1.5 transition-colors"><Trash2 size={16} /></button>
            <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 transition-colors"><X size={20} /></button>
          </div>
        </div>

        {confirmDelete && (
          <div className="mx-4 sm:mx-5 mt-4 bg-red-950/40 border border-red-900 rounded-lg p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-red-300">Supprimer définitivement ce triathlon ?</p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-xs px-2 py-1">Annuler</button>
              <button onClick={handleDelete} className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors">Supprimer</button>
            </div>
          </div>
        )}

        {isPast && !confirmDelete && (
          <div className="mx-4 sm:mx-5 mt-4 bg-slate-800/60 border border-slate-700 rounded-lg p-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-300">Reprogrammer l'édition de l'année prochaine ?</p>
            <button onClick={handleReschedule} className="btn-primary text-xs px-2.5 py-1.5 flex items-center gap-1.5 shrink-0">
              <CalendarClock size={12} /> Reprogrammer
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-5">
          {/* Formats */}
          <div>
            <div className="label">Formats proposés</div>
            <div className="flex flex-wrap gap-2">
              {triathlon.formats?.map(f => <FormatBadge key={f} format={f} size="lg" />)}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2">
            {triathlon.website && (
              <a href={triathlon.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-water-400 hover:text-water-300 card px-3 py-2 transition-colors">
                <Globe size={14} /> Site officiel
              </a>
            )}
            {triathlon.register_url && (
              <a href={triathlon.register_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-water-400 hover:text-water-300 card px-3 py-2 transition-colors">
                <ClipboardList size={14} /> S'inscrire
              </a>
            )}
            {triathlon.whatsapp_url && (
              <a href={triathlon.whatsapp_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 card px-3 py-2 transition-colors col-span-2">
                <MessageCircle size={14} /> Groupe WhatsApp orga
              </a>
            )}
          </div>

          {/* Comment */}
          {triathlon.comment && (
            <div className="bg-slate-800/60 rounded-lg p-3 text-sm text-slate-300 whitespace-pre-wrap">
              {triathlon.comment}
            </div>
          )}

          {/* Participants */}
          <div>
            <div className="label flex items-center gap-1.5"><Users size={12} /> Inscrits ({confirmed.length})</div>
            {confirmed.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {confirmed.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5 bg-slate-800 rounded-full pl-3 pr-1.5 py-1 text-sm">
                    <span className="text-white">{p.name}</span>
                    <FormatBadge format={p.format} />
                    <button onClick={() => handleRemoveParticipant(p.id)} title="Annuler la participation"
                      className="text-slate-500 hover:text-red-400 transition-colors p-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm mb-3">Personne encore inscrit. Soyez le premier !</p>
            )}

            {interested.length > 0 && (
              <>
                <div className="label flex items-center gap-1.5"><HelpCircle size={12} /> Intéressés ({interested.length})</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {interested.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5 bg-slate-800/50 border border-dashed border-slate-700 rounded-full pl-3 pr-1.5 py-1 text-sm">
                      <span className="text-slate-300">{p.name}</span>
                      <FormatBadge format={p.format} />
                      <button onClick={() => handleRemoveParticipant(p.id)} title="Retirer"
                        className="text-slate-500 hover:text-red-400 transition-colors p-0.5">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Join form */}
            <form onSubmit={handleJoin} className="bg-slate-800/40 rounded-lg p-3 space-y-3">
              <div className="label flex items-center gap-1"><Plus size={12} /> Ajouter ma participation</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    className="input"
                    placeholder="Ton prénom"
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                    required
                    readOnly={!!identity}
                  />
                </div>
                <div>
                  <select
                    className="input"
                    value={participantFormat}
                    onChange={e => setParticipantFormat(e.target.value)}
                  >
                    {FORMAT_ORDER.filter(f => triathlon.formats?.includes(f)).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button type="button" onClick={() => setParticipantStatus('confirmed')}
                  className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${participantStatus === 'confirmed' ? 'bg-water-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  Je suis inscrit·e
                </button>
                <button type="button" onClick={() => setParticipantStatus('interested')}
                  className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${participantStatus === 'interested' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  Je suis intéressé·e
                </button>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" className="btn-primary w-full text-sm" disabled={saving}>
                {saving ? 'Enregistrement…' : participantStatus === 'interested' ? 'Signaler mon intérêt' : 'Je participe !'}
              </button>
            </form>
          </div>

          {isPast && <FeedbackSection triathlon={triathlon} identity={identity} />}
        </div>
      </div>
    </div>
  )
}
