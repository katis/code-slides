import * as monaco from 'monaco-editor'
// See https://github.com/vitejs/vite/discussions/1791#discussioncomment-321046
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from '../../ts-worker?worker'
import { Component, createMemo, createSignal } from 'solid-js'
import { nanoid } from 'nanoid'
import { Editor } from './Editor'

declare global {
  interface Window {
    MonacoEnvironment: {
      getWorker(id: string, label: string): any
      getWorkerUrl?(url: string): string
    }
  }
}

self.MonacoEnvironment = {
  getWorker(workerId, label) {
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
  `declare var Preview: any`,
  'global-preview.d.ts',
)

export interface Props {
  src: string
}

export const TypeScriptEditor: Component<Props> = ({ src }) => {
  const [js, setJs] = createSignal<string>()
  const [getEditor, setEditor] =
    createSignal<monaco.editor.IStandaloneCodeEditor>()

  const model = createMemo(() => {
    const modelUri = monaco.Uri.file(`${nanoid()}-editor.tsx`)
    return monaco.editor.createModel(src, 'typescriptreact', modelUri)
  })

  async function transpile() {
    const editor = getEditor()
    if (!editor) return

    const uri = editor.getModel()?.uri!
    const uriStr = uri.toString()
    const jsFilename = uriStr.replace(/\.tsx$/, '.js')
    // console.log('URI', uri, uri.toString(), jsFilename)
    const getTs = await monaco.languages.typescript.getTypeScriptWorker()
    const ts = await getTs(uri)
    const output = await ts.getEmitOutput(uriStr)
    // console.log('output', output)
    const js = output.outputFiles.find(file => file.name === jsFilename)

    const allSemantics = await ts.getSemanticDiagnostics(uriStr)
    // console.log('ALL_SEMANTICS', allSemantics)
    const text = editor.getValue()
    const fileSemantics = allSemantics
      .filter(f => f.file?.fileName === uriStr)
      .map(s => ({ ...s, line: lineNumber(text, s.start ?? 0) }))
    // console.log('FILE_SEMANTICS', fileSemantics)

    console.log('JS', js?.text)
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
        {/* <code>
          <pre
            class="text-base"
            style={{
              'font-family': 'Menlo, Monaco, "Courier New", monospace',
            }}
          >
            {js()}
          </pre>
        </code> */}
      </div>
    </div>
  )
}

function lineNumber(text: string, pos: number) {
  let line = 1
  for (let i = 0; i < pos; i++) {
    if (text[i] === '\n') {
      line++
    }
  }
  return line
}
