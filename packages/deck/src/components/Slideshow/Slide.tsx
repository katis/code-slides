import type Toml from '@iarna/toml'
import { List } from '@katis/common'
import type * as MdAst from 'mdast'
import { Component, Index } from 'solid-js'

export interface Slide {
  metadata: Toml.JsonMap
  content: List<MdAst.Content>
}

export const Slide: Component<{ slide: Slide }> = ({ slide }) => (
  <Index each={slide.content}>
    {getNode => {
      const node = getNode()
      switch (node.type) {
        case 'heading': {
          switch (node.depth) {
            case 1:
              return (
                <h1 class="text-5xl">
                  <PhrasingContent content={node.children} />
                </h1>
              )
            case 2:
              return (
                <h2 class="text-4xl">
                  <PhrasingContent content={node.children} />
                </h2>
              )
            case 3:
              return (
                <h3>
                  <PhrasingContent content={node.children} />
                </h3>
              )
            case 4:
              return (
                <h4>
                  <PhrasingContent content={node.children} />
                </h4>
              )
            case 5:
              return (
                <h5>
                  <PhrasingContent content={node.children} />
                </h5>
              )
            case 6:
              return (
                <h6>
                  <PhrasingContent content={node.children} />
                </h6>
              )
          }
        }
        case 'paragraph':
          return (
            <p>
              <PhrasingContent content={node.children} />
            </p>
          )
        default:
          throw Error(`Unhandled top-level node '${node.type}'`)
      }
    }}
  </Index>
)

const PhrasingContent: Component<{ content: List<MdAst.PhrasingContent> }> = ({
  content,
}) => (
  <Index each={content}>
    {getNode => {
      const node = getNode()
      switch (node.type) {
        case 'text':
          return node.value
        case 'link':
          return (
            <a class="text-indigo-300" href={node.url}>
              {<PhrasingContent content={node.children} />}
            </a>
          )
        default:
          throw Error(`Unhandled p node '${node.type}'`)
      }
    }}
  </Index>
)
