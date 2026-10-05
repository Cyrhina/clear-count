import { useCallback, useMemo, useState } from 'react'

/** Row selection for a table or list (checkbox per row + select-all in the header). Ids that are no longer listed drop out of the selection. */
export function useRowSelection(allIds: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const visibleSelected = useMemo(() => new Set(allIds.filter((id) => selected.has(id))), [allIds, selected])
  const toggle = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])
  const allChecked = allIds.length > 0 && visibleSelected.size === allIds.length
  const toggleAll = useCallback((checked: boolean) => setSelected(checked ? new Set(allIds) : new Set()), [allIds])
  const clear = useCallback(() => setSelected(new Set()), [])
  return {
    selected: visibleSelected,
    toggle,
    toggleAll,
    allChecked,
    headerState: (allChecked ? true : visibleSelected.size > 0 ? 'indeterminate' : false) as boolean | 'indeterminate',
    clear,
  }
}
