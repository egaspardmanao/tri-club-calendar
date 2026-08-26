import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'psc-tri-club-identity'

export function useIdentity() {
  const [identity, setIdentityState] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setIdentityState(stored)
    setChecked(true)
  }, [])

  const setIdentity = useCallback((name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    setIdentityState(trimmed)
  }, [])

  const clearIdentity = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setIdentityState(null)
  }, [])

  return { identity, setIdentity, clearIdentity, checked }
}
