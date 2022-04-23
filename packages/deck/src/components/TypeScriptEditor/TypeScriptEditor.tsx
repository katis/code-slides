import { debounce } from 'lodash-es'
import * as monaco from 'monaco-editor'
// See https://github.com/vitejs/vite/discussions/1791#discussioncomment-321046
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { nanoid } from 'nanoid'
import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import TsWorker from '../../ts-worker?worker'
import { Editor } from '../Editor/Editor'
import css from './TypeScriptEditor.module.scss'

declare global {
  interface Window {
    MonacoEnvironment: {
      getWorker(id: string, label: string): any
      getWorkerUrl?(url: string): string
    }
  }
}

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    switch (label) {
      case 'json':
        return new JsonWorker()
      case 'typescript':
      case 'javascript':
        return new TsWorker()
      default:
        return new EditorWorker()
    }
  },
}

monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  allowNonTsExtensions: true,
  target: monaco.languages.typescript.ScriptTarget.ES2020,
  jsx: monaco.languages.typescript.JsxEmit.React,
  jsxFactory: 'React.createElement',
})

const reactTypes: string = Object.values(
  import.meta.globEager('../../../node_modules/@types/react/index.d.ts', {
    as: 'raw',
  }),
)[0] as any

const reactDomTypes: string = Object.values(
  import.meta.globEager('../../../node_modules/@types/react-dom/client.d.ts', {
    as: 'raw',
  }),
)[0] as any

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  reactTypes,
  '@types/react/index.d.ts',
)

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  reactDomTypes,
  '@types/react-dom/client.d.ts',
)

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  "declare const ReactDOM: typeof import('@types/react-dom/client')",
  'react-dom.d.ts',
)

monaco.languages.typescript.typescriptDefaults.addExtraLib(
  `declare let Preview: any`,
  'global-preview.d.ts',
)

export interface Props {
  src: string
}

export const TypeScriptEditor: Component<Props> = ({ src }) => {
  const [js, setJs] = createSignal<string>()
  const [getEditor, setEditor] =
    createSignal<monaco.editor.IStandaloneCodeEditor>()
  const [decorations, setDecorations] = createSignal<
    monaco.editor.IModelDeltaDecoration[]
  >([])

  const [semantics, setSemantics] = createSignal<
    monaco.languages.typescript.Diagnostic[]
  >([])

  const model = createMemo(() => {
    const modelUri = monaco.Uri.file(`${nanoid()}-editor.tsx`)
    return monaco.editor.createModel(src, 'typescriptreact', modelUri)
  })

  async function getTs() {
    const getModelTsWorker =
      await monaco.languages.typescript.getTypeScriptWorker()
    return await getModelTsWorker(model().uri)
  }

  createEffect<string[]>(
    oldDecorations =>
      getEditor()?.deltaDecorations(oldDecorations, decorations()) ?? [],
    [],
  )

  createEffect<string[]>(oldZoneIds => {
    const editor = getEditor()
    if (!editor) return oldZoneIds

    const zones: monaco.editor.IViewZone[] = semantics().map(sem => {
      const position = model().getPositionAt(sem.start!)
      return {
        afterLineNumber: position.lineNumber,
        domNode: (
          <div class={css.zone}>
            <span class={css.errorIcon}>ⓧ </span>
            {diagnosticMessage(sem.messageText)}
          </div>
        ) as HTMLElement,
      }
    })

    let zoneIds: string[] = []
    editor.changeViewZones(zoneAccessor => {
      oldZoneIds.forEach(id => zoneAccessor.removeZone(id))
      zoneIds = zones.map(zone => zoneAccessor.addZone(zone))
    })
    return zoneIds
  }, [])

  createEffect<monaco.IDisposable | undefined>(disposePrev => {
    disposePrev?.dispose()

    const dispose = getEditor()?.onDidChangeModelContent(
      debounce(async (_ev: monaco.editor.IModelContentChangedEvent) => {
        const ts = await getTs()
        const uriStr = model().uri.toString()
        const allSemantics = await ts.getSemanticDiagnostics(uriStr)
        const fileSemantics = allSemantics.filter(
          sem => sem.file?.fileName === uriStr,
        )
        setSemantics(fileSemantics)
      }, 150),
    )
    return dispose
  })

  async function transpile() {
    const editor = getEditor()
    if (!editor) return

    const uriStr = model().uri.toString()
    const jsFilename = uriStr.replace(/\.tsx$/, '.js')
    const ts = await getTs()
    const output = await ts.getEmitOutput(uriStr)
    const js = output.outputFiles.find(file => file.name === jsFilename)
    setJs(js?.text)
  }

  const srcdoc = createMemo(() => {
    let src = js()
    if (!src) return ''

    // Disable dynamic imports with CSP
    src = `
      const meta = document.createElement("meta");
      meta.httpEquiv = "Content-Security-Policy";
      meta.content = "script-src 'none'";
      document.head.appendChild(meta);

      let Preview = undefined

      ${src}
      
      if (Preview) {
        const root = ReactDOM.createRoot(document.getElementById('preview'))
        root.render(React.createElement(Preview))
      }
      `

    const inlineStyleNonce = nanoid()
    const scriptNonce = nanoid()
    const base64Src = btoa(src)

    const allowedLibs = [
      'https://unpkg.com/react@18.0.0/umd/react.production.min.js',
      'https://unpkg.com/react-dom@18.0.0/umd/react-dom.production.min.js',
    ]
    const scriptSourceScp = [`'nonce-${scriptNonce}'`, ...allowedLibs].join(' ')
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; base-uri 'none'; script-src ${scriptSourceScp}; style-src 'nonce-${inlineStyleNonce}';"
          />
          <style nonce="${inlineStyleNonce}">
            :root { color: white; background-color: rgba(255, 255, 255, 0.05); font-family: sans-serif; }
          </style>
          ${allowedLibs
            .map(lib => `<script crossorigin src="${lib}"></script>`)
            .join('')}
        </head>
        <body>
          <div id="preview"></div>
          <script src="data:text/javascript;base64,${base64Src}" nonce="${scriptNonce}"></script>
          <script nonce="${scriptNonce}">
        </body>
      </html>`
  })

  return (
    <div>
      <div>
        <div>
          <button
            type="button"
            onClick={ev => (ev.preventDefault(), transpile())}
          >
            Js
          </button>
          <Editor language="typescript" model={model()} editorRef={setEditor} />
        </div>
        <iframe
          width="300px"
          height="300px"
          sandbox="allow-scripts"
          srcdoc={srcdoc()}
        />
      </div>
    </div>
  )
}

function diagnosticMessage(
  msg: string | monaco.languages.typescript.DiagnosticMessageChain,
): string {
  if (typeof msg === 'string') {
    return msg
  } else {
    return msg.messageText
  }
}
