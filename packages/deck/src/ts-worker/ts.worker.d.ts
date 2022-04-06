declare module 'monaco-editor/esm/vs/language/typescript/ts.worker.js' {
  import ts from 'typescript'

  type Sync<T> = {
    [P in keyof T]: T[P] extends (...args: infer Args) => infer R
      ? (...args: Args) => Awaited<R>
      : T[P]
  }
  export interface TsWorker
    extends Sync<import('./EnhancedTsWorker').EnhancedTsWorker> {
    _languageService: ts.LanguageService
  }
  export const create: (a: any, b: any) => TsWorker
}

declare module 'monaco-editor/esm/vs/editor/editor.worker.js' {
  export const initialize: (fn: (ctx: any, createData: any) => any) => void
}

declare const ts: typeof import('typescript')
