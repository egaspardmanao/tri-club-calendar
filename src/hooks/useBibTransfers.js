import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBibTransfers() {
  const [bibTransfers, setBibTransfers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bib_transfers')
      .select('*, triathlon:triathlons(*)')
      .order('created_at', { ascending: false })
    if (!error) setBibTransfers(data || [])
    setLoading(false)
    return data || []
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { bibTransfers, loading, refetch: fetch }
}
