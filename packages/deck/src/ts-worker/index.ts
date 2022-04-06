import * as edworker from 'monaco-editor/esm/vs/editor/editor.worker.js'
import { create } from 'monaco-editor/esm/vs/language/typescript/ts.worker.js'
import type { TsWorker } from 'monaco-editor/esm/vs/language/typescript/ts.worker.js'

function createEnhancedTsWorker(ctx: any, createData: any) {
  const ts = create(ctx, createData)

  return Object.assign(ts, {
    foobar(this: TsWorker) {
      return 'qwer'
    },
  })
}

self.onmessage = () => {
  edworker.initialize((ctx, createData) => {
    return createEnhancedTsWorker(ctx, createData)
  })
}
