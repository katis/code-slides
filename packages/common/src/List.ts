import type { List } from './index.js'

declare module './index.js' {
  export type List<T = unknown> = readonly T[]
}

/**
 * Chunks items in a list based on a separator value.
 *
 * Ignores items before the first separator.
 */
export function chunkBySeparator<T, S extends T>(
  list: List<T>,
  isSeparator: (value: T) => value is S,
): List<readonly [S, ...T[]]> {
  const result: [S, ...T[]][] = []
  let current: [S, ...T[]] | undefined
  list.forEach(value => {
    if (isSeparator(value)) {
      current = [value]
      result.push(current)
    } else if (current) {
      current.push(value)
    }
  })
  return result
}
