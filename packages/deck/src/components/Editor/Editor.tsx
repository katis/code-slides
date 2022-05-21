import * as monaco from 'monaco-editor'
// See https://github.com/vitejs/vite/discussions/1791#discussioncomment-321046
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from '../../ts-worker?worker'
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'

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
  language: string
  model: string | monaco.editor.ITextModel
  editorRef?(editor: monaco.editor.IStandaloneCodeEditor): void
}

const lineHeight = 24

export const Editor: Component<Props> = ({ language, model, editorRef }) => {
  const [width, setWidth] = createSignal<number>()
  const [height, setHeight] = createSignal(10)

  let el: HTMLDivElement

  let editor: monaco.editor.IStandaloneCodeEditor
  onMount(() => {
    const editorModel =
      typeof model === 'string'
        ? monaco.editor.createModel(model, language)
        : model
    editor = monaco.editor.create(el, {
      model: editorModel,
      language,
      minimap: {
        enabled: false,
      },
      fontSize: 16,
      lineHeight,
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

    editorRef?.(editor)
  })

  createEffect(() => {
    if (typeof model === 'string') {
      editor.getModel()?.setValue(model)
    } else {
      editor.setModel(model)
    }
  })

  createEffect(() => {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, language)
    }
  })

  createEffect(() => {
    editor.layout({ width: width() ?? el.clientWidth, height: height() })
  })

  onCleanup(() => editor.dispose())

  return <div ref={el!} style={{ height: height() }}></div>
}
