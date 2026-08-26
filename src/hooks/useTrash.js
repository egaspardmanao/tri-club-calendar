import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTrash() {
  const [trashed, setTrashed] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('triathlons')
      .select('*, participants(*)')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    if (!error) setTrashed(data || [])
    setLoading(false)
    return data || []
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { trashed, loading, refetch: fetch }
}
