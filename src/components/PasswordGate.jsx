import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import pscLogo from '../assets/psc-logo.jpeg'

const SITE_PASSWORD = 'PSC2026'
const STORAGE_KEY = 'psc-tri-club-unlocked'

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false)
  const [checked, setChecked] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') setUnlocked(true)
    setChecked(true)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (input === SITE_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true')
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  if (!checked) return null
  if (unlocked) return children

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-6 space-y-4">
        <div className="flex flex-col items-center text-center gap-3 mb-2">
          <img src={pscLogo} alt="Paris Sport Club" className="w-14 h-14 rounded-full object-cover border border-slate-700" />
          <div>
            <h1 className="font-display font-bold text-xl text-white">TRI CLUB PSC</h1>
            <p className="text-slate-500 text-xs">Accès réservé aux membres du club</p>
          </div>
        </div>
        <div>
          <label className="label flex items-center gap-1.5"><Lock size={12} /> Mot de passe</label>
          <input
            type="password"
            className="input"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false) }}
            autoFocus
            required
          />
          {error && <p className="text-red-400 text-xs mt-1.5">Mot de passe incorrect.</p>}
        </div>
        <button type="submit" className="btn-primary w-full text-sm">Entrer</button>
      </form>
    </div>
  )
}
