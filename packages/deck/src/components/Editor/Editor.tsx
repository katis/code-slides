import * as monaco from 'monaco-editor'
// See https://github.com/vitejs/vite/discussions/1791#discussioncomment-321046
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from '../../ts-worker?worker'
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import { nanoid } from 'nanoid'

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

export interface Props {
  src: string
}

export const Editor: Component<Props> = ({ src }) => {
  const [width, setWidth] = createSignal<number>()
  const [height, setHeight] = createSignal(10)
  const [js, setJs] = createSignal<string>()

  let el: HTMLDivElement

  let editor: monaco.editor.IStandaloneCodeEditor
  onMount(() => {
    editor = monaco.editor.create(el, {
      value: src,
      language: 'typescript',
      minimap: {
        enabled: false,
      },
      fontSize: 16,
      lineNumbersMinChars: 2,
      scrollBeyondLastLine: false,
      theme: 'vs-dark',
    })

    function updateHeight() {
      const contentHeight = Math.min(1000, editor.getContentHeight())
      setHeight(contentHeight)
    }

    editor.onDidContentSizeChange(updateHeight)

    const resize = new ResizeObserver(entries => {
      const width = entries[0].borderBoxSize[0].inlineSize
      setWidth(width)
    })
    resize.observe(el, { box: 'border-box' })
    updateHeight()
  })

  createEffect(() => {
    editor.layout({ width: width() ?? el.clientWidth, height: height() })
  })

  onCleanup(() => editor.dispose())

  async function transpile() {
    setJs(editor.getValue())
    const uri = editor.getModel()?.uri!
    const uriStr = uri.toString()
    const jsFilename = `${uriStr}.js`
    // console.log('URI', uri, uri.toString())
    const getTs = await monaco.languages.typescript.getTypeScriptWorker()
    const ts = await getTs(uri)
    const output = await ts.getEmitOutput(uriStr)
    // console.log('output', output)
    const js = output.outputFiles.find(file => file.name === jsFilename)
    // console.log('JS', js)

    const allSemantics = await ts.getSemanticDiagnostics(uriStr)
    // console.log('ALL_SEMANTICS', allSemantics)
    const text = editor.getValue()
    const fileSemantics = allSemantics
      .filter(f => f.file?.fileName === uriStr)
      .map(s => ({ ...s, line: lineNumber(text, s.start ?? 0) }))
    // console.log('FILE_SEMANTICS', fileSemantics)

    setJs(js?.text)
  }

  const srcdoc = createMemo(() => {
    const src = js()
    if (!src) return ''
    const nonce = nanoid()
    const base64Src = btoa(src)
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; script-src 'nonce-${nonce}'"
          />
          <title>Js</title>
          <script src="data:text/javascript;base64,${base64Src}" nonce="${nonce}"></script>
        </head>
        <body>
          <div id="app"></div>
        </body>
      </html>
    `
  })

  return (
    <div>
      <div class="flex place-content-center">
        <div class="flex-auto overflow-x-hidden max-w-3xl">
          <button onClick={ev => (ev.preventDefault(), transpile())}>Js</button>
          <div ref={el!} style={{ height: height() }}></div>
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
