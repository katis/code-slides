import { Component } from 'solid-js'
import { Editor } from './components/Editor/Editor'

const src = `
function greet(): string {
  console.log("Hello, world!")
}
greet()
`.trim()

export const App: Component = () => (
  <div>
    <Editor src={src} />
  </div>
)
