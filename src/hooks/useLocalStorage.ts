import { useState, useCallback } from 'react'

/**
 * Hook générique qui synchronise un état React avec le localStorage.
 * La lecture/écriture passe par la couche storage/ — ce hook ne touche
 * jamais localStorage directement.
 */
export function useLocalStorage<T>(
  reader: () => T,
  writer: (value: T) => void,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(reader)

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
        writer(next)
        return next
      })
    },
    [writer],
  )

  return [state, setValue]
}
