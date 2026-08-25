import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTriathlons() {
  const [triathlons, setTriathlons] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('triathlons')
      .select('*, participants(*)')
      .order('date', { ascending: true })
    if (!error) setTriathlons(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { triathlons, loading, refetch: fetch }
}
