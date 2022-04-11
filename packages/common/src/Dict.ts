import type { Dict, List } from './index.js'

declare module './index.js' {
  export type Dict<T = unknown> = { readonly [key: string]: T | undefined }
}

export const keys = <D extends Dict>(dict: D): List<keyof D> =>
  Object.keys(dict)
