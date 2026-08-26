import { useState, useMemo } from 'react'
import { User, X } from 'lucide-react'

export default function IdentityPicker({ knownNames, onPick, onClose }) {
  const [customName, setCustomName] = useState('')
  const names = useMemo(() => [...new Set(knownNames)].sort((a, b) => a.localeCompare(b)), [knownNames])

  function handleCustomSubmit(e) {
    e.preventDefault()
    if (customName.trim()) onPick(customName.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="card w-full max-w-sm p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-1.5"><User size={16} /> Qui es-tu ?</h2>
          {onClose && <button onClick={onClose} className="text-slate-500 hover:text-white p-1"><X size={18} /></button>}
        </div>
        <p className="text-slate-500 text-xs -mt-2">Choisis ton prénom pour ne plus avoir à le retaper à chaque fois.</p>

        {names.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {names.map(n => (
              <button key={n} onClick={() => onPick(n)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-full px-3 py-1.5 transition-colors">
                {n}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleCustomSubmit} className="flex gap-2 pt-1 border-t border-slate-800">
          <input
            className="input mt-3"
            placeholder="Ou saisis ton prénom"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            autoFocus={names.length === 0}
          />
        </form>
        <button onClick={handleCustomSubmit} className="btn-primary w-full text-sm">Valider</button>
      </div>
    </div>
  )
}
