import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Star, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'

function StarRow({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star size={18} className={n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} />
        </button>
      ))}
    </div>
  )
}

export default function FeedbackSection({ triathlon, identity }) {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(identity || '')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('triathlon_id', triathlon.id)
      .order('created_at', { ascending: false })
    if (!error) setFeedbacks(data || [])
    setLoading(false)
  }, [triathlon.id])

  useEffect(() => { fetchFeedbacks() }, [fetchFeedbacks])

  const average = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || rating === 0) { setError('Indique ton prénom et une note.'); return }
    setSaving(true)
    setError('')
    const { error } = await supabase.from('feedbacks').insert({
      triathlon_id: triathlon.id,
      author_name: name.trim(),
      rating,
      comment: comment.trim() || null,
    })
    if (error) { setError("Erreur lors de l'envoi."); setSaving(false); return }
    setSaving(false)
    setRating(0)
    setComment('')
    fetchFeedbacks()
  }

  return (
    <div>
      <div className="label flex items-center gap-1.5 justify-between">
        <span className="flex items-center gap-1.5"><MessageSquare size={12} /> Avis des participants ({feedbacks.length})</span>
        {average && (
          <span className="flex items-center gap-1 text-amber-400 normal-case font-semibold text-xs">
            <Star size={12} className="fill-amber-400" /> {average}/5
          </span>
        )}
      </div>

      {!loading && feedbacks.length > 0 && (
        <div className="space-y-2 mb-3">
          {feedbacks.map(f => (
            <div key={f.id} className="bg-slate-800/60 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-white text-sm font-medium">{f.author_name}</span>
                <StarRow value={f.rating} readOnly />
              </div>
              {f.comment && <p className="text-slate-400 text-sm">{f.comment}</p>}
              <p className="text-slate-600 text-[11px] mt-1">{format(new Date(f.created_at), 'd MMM yyyy', { locale: fr })}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800/40 rounded-lg p-3 space-y-3">
        <div className="label">Laisser un avis</div>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="input"
            placeholder="Ton prénom"
            value={name}
            onChange={e => setName(e.target.value)}
            readOnly={!!identity}
            required
          />
          <div className="flex items-center">
            <StarRow value={rating} onChange={setRating} />
          </div>
        </div>
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Organisation, parcours, ambiance… (optionnel)"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button type="submit" className="btn-primary w-full text-sm" disabled={saving}>
          {saving ? 'Envoi…' : 'Publier mon avis'}
        </button>
      </form>
    </div>
  )
}
