import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AddBibModal({ triathlons, onClose, onAdded }) {
  const [form, setForm] = useState({
    triathlon_id: '', format: '', seller_name: '', contact: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedTriathlon = triathlons.find(t => t.id === form.triathlon_id)

  function handleTriathlonChange(id) {
    const t = triathlons.find(x => x.id === id)
    setForm(f => ({ ...f, triathlon_id: id, format: t?.formats?.[0] || '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.triathlon_id || !form.format || !form.seller_name.trim() || !form.contact.trim()) {
      setError('Remplis tous les champs.')
      return
    }
    setSaving(true)
    setError('')

    const { error } = await supabase.from('bib_transfers').insert({
      triathlon_id: form.triathlon_id,
      format: form.format,
      seller_name: form.seller_name.trim(),
      contact: form.contact.trim(),
    })

    if (error) { setError("Erreur lors de l'ajout."); setSaving(false); return }
    setSaving(false)
    onAdded()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full h-full sm:h-auto max-w-lg sm:max-h-[90vh] overflow-y-auto sm:rounded-xl rounded-none" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <h2 className="font-display font-bold text-xl text-white">Céder un dossard</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="label">Triathlon *</label>
            <select className="input" value={form.triathlon_id}
              onChange={e => handleTriathlonChange(e.target.value)} required>
              <option value="">Sélectionner un triathlon…</option>
              {triathlons.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.city}</option>
              ))}
            </select>
          </div>

          {selectedTriathlon && (
            <div>
              <label className="label">Format *</label>
              <select className="input" value={form.format}
                onChange={e => setForm(f => ({ ...f, format: e.target.value }))} required>
                {selectedTriathlon.formats?.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Ton prénom *</label>
            <input className="input" placeholder="ex: Julie" value={form.seller_name}
              onChange={e => setForm(f => ({ ...f, seller_name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Contact *</label>
            <input className="input" placeholder="Téléphone, email ou @profil" value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} required />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Annuler</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Publier le dossard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
