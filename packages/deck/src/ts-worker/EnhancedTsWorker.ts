import type * as monaco from 'monaco-editor'

export interface EnhancedTsWorker
  extends monaco.languages.typescript.TypeScriptWorker {
  getLoggingCode(uri: string): Promise<string>
}
