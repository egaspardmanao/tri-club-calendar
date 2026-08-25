import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X, Globe, ClipboardList, MessageCircle, Users, Plus } from 'lucide-react'
import { useState } from 'react'
import FormatBadge from './FormatBadge'
import { FORMAT_ORDER } from '../lib/formats'
import { supabase } from '../lib/supabase'

export default function EventModal({ triathlon, onClose, onUpdated }) {
  const [name, setName] = useState('')
  const [participantFormat, setParticipantFormat] = useState(triathlon.formats?.[0] || 'M')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const dateLabel = triathlon.date
    ? format(new Date(triathlon.date), 'EEEE d MMMM yyyy', { locale: fr })
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
    })
    if (error) { setError('Erreur lors de l\'inscription.'); setSaving(false); return }
    setSaving(false)
    setName('')
    onUpdated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="card w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">{triathlon.name}</h2>
            <p className="text-slate-400 text-sm mt-1 capitalize">{dateLabel}</p>
            <p className="text-slate-500 text-sm">{triathlon.city}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
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
            <div className="label flex items-center gap-1.5"><Users size={12} /> Participants ({triathlon.participants?.length || 0})</div>
            {triathlon.participants?.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {triathlon.participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-slate-800 rounded-full px-3 py-1 text-sm">
                    <span className="text-white">{p.name}</span>
                    <FormatBadge format={p.format} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm mb-3">Personne encore inscrit. Soyez le premier !</p>
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
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" className="btn-primary w-full text-sm" disabled={saving}>
                {saving ? 'Enregistrement…' : 'Je participe !'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
