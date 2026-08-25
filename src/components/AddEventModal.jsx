import { useState } from 'react'
import { X, MapPin } from 'lucide-react'
import { FORMAT_ORDER } from '../lib/formats'
import { supabase } from '../lib/supabase'
import FormatBadge from './FormatBadge'

const GEOCODE_URL = (q) =>
  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)},France&format=json&limit=1`

export default function AddEventModal({ onClose, onAdded, editing = null }) {
  const [form, setForm] = useState(editing ? {
    name: editing.name || '', city: editing.city || '', date: editing.date || '',
    website: editing.website || '', register_url: editing.register_url || '',
    whatsapp_url: editing.whatsapp_url || '', comment: editing.comment || '',
    formats: editing.formats || [],
  } : {
    name: '', city: '', date: '', website: '', register_url: '',
    whatsapp_url: '', comment: '', formats: [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggle(format) {
    setForm(f => ({
      ...f,
      formats: f.formats.includes(format)
        ? f.formats.filter(x => x !== format)
        : [...f.formats, format],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.city || !form.date || form.formats.length === 0) {
      setError('Remplis au moins le nom, la ville, la date et un format.')
      return
    }
    setSaving(true)
    setError('')

    // Géocoder la ville si elle a changé (ou si nouvel événement)
    let lat = editing?.lat ?? null, lng = editing?.lng ?? null
    if (!editing || editing.city !== form.city.trim()) {
      try {
        const res = await fetch(GEOCODE_URL(form.city))
        const data = await res.json()
        if (data.length > 0) { lat = parseFloat(data[0].lat); lng = parseFloat(data[0].lon) }
      } catch (_) {}
    }

    const payload = {
      name: form.name.trim(),
      city: form.city.trim(),
      date: form.date,
      website: form.website || null,
      register_url: form.register_url || null,
      whatsapp_url: form.whatsapp_url || null,
      comment: form.comment || null,
      formats: form.formats,
      lat, lng,
    }

    const { error } = editing
      ? await supabase.from('triathlons').update(payload).eq('id', editing.id)
      : await supabase.from('triathlons').insert(payload)

    if (error) { setError("Erreur lors de l'enregistrement."); setSaving(false); return }
    setSaving(false)
    onAdded()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="font-display font-bold text-xl text-white">{editing ? 'Modifier le triathlon' : 'Ajouter un triathlon'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Nom de l'événement *</label>
              <input className="input" placeholder="ex: Triathlon de Nice" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Ville *</label>
              <input className="input" placeholder="ex: Nice" value={form.city}
                onChange={e => setForm(f => ({...f, city: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" value={form.date}
                onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
            </div>
          </div>

          <div>
            <label className="label">Formats proposés *</label>
            <div className="flex flex-wrap gap-2">
              {FORMAT_ORDER.map(f => (
                <button key={f} type="button"
                  onClick={() => toggle(f)}
                  className={`format-badge text-sm px-3 py-1 cursor-pointer border transition-all ${
                    form.formats.includes(f)
                      ? 'border-water-500 ring-1 ring-water-500'
                      : 'border-slate-700 opacity-50 hover:opacity-80'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Site officiel</label>
            <input className="input" placeholder="https://..." value={form.website}
              onChange={e => setForm(f => ({...f, website: e.target.value}))} />
          </div>
          <div>
            <label className="label">Lien d'inscription</label>
            <input className="input" placeholder="https://..." value={form.register_url}
              onChange={e => setForm(f => ({...f, register_url: e.target.value}))} />
          </div>
          <div>
            <label className="label">Lien WhatsApp groupe orga</label>
            <input className="input" placeholder="https://chat.whatsapp.com/..." value={form.whatsapp_url}
              onChange={e => setForm(f => ({...f, whatsapp_url: e.target.value}))} />
          </div>
          <div>
            <label className="label">Commentaires (covoit, hébergement, date d'inscription…)</label>
            <textarea className="input resize-none" rows={3} placeholder="Infos pratiques pour le groupe…"
              value={form.comment} onChange={e => setForm(f => ({...f, comment: e.target.value}))} />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter le triathlon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
