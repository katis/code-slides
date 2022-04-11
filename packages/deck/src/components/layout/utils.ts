export type Scale = -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4

export const scale = (s: Scale | undefined): string | undefined =>
  s !== undefined ? `var(--s${s})` : undefined
