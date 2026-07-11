import { useMemo } from 'react'
import { useEntries } from './useEntries'
import { todayKey } from '../utils/date'

export function useTodayEntry() {
  const { entries } = useEntries()
  return useMemo(() => entries.find((e) => e.date === todayKey()) ?? null, [entries])
}
