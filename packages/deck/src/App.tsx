import { Component } from 'solid-js'
import { Editor } from './components/Editor/Editor'
import { Slideshow } from './components/Slideshow/Slideshow'

const src = `
function greet(): string {
  console.log("Hello, world!")
}
greet()
`.trim()

const asciidoc = `
+++
title = "New Website"
+++

# Code slideshow

## Development

Codebase uses [pnpm](https://pnpm.io) as a package manager.

Run the dev tools in watch mode with:


+++
title = "New Website"
+++

# Second slide

`.trim()

export const App: Component = () => (
  <div>
    {/* <Editor src={src} /> */}
    <Slideshow src={asciidoc} />
  </div>
)
