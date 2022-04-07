import type Toml from '@iarna/toml'
import { Case, List } from '@katis/common'
import type * as MdAst from 'mdast'
import { Component, Index, Match, Show, Switch } from 'solid-js'
import { Editor } from '../Editor/Editor'

export interface Slide {
  metadata: Toml.JsonMap
  content: List<MdAst.Content>
}

export const Slide: Component<{ slide: Slide }> = ({ slide }) => (
  <Content content={slide.content} />
)

const tsLanguages: List<string> = ['ts', 'typescript']

const Content: Component<{ content: List<MdAst.Content> }> = ({ content }) => (
  <Index each={content}>
    {node => (
      // TODO: table, tableRow, tableCell, definition, footnoteDefinition,
      //   linkReference, imageReference, footnot, footnoteReference
      <Switch fallback={<div>Unknown node type {node().type}</div>}>
        <Match when={Case.as(node(), 'blockquote')}>
          {node => (
            <blockquote>
              <Content content={node.children} />
            </blockquote>
          )}
        </Match>
        <Match when={Case.as(node(), 'break')}>
          <br />
        </Match>
        <Match when={Case.as(node(), 'code')}>
          {node => (
            <Show
              when={tsLanguages.includes(node.lang ?? '')}
              fallback={
                <code>
                  <pre>{node.value}</pre>
                </code>
              }
            >
              <Editor src={node.value} />
            </Show>
          )}
        </Match>
        <Match when={Case.as(node(), 'delete')}>
          {node => (
            <del>
              <Content content={node.children} />
            </del>
          )}
        </Match>
        <Match when={Case.as(node(), 'emphasis')}>
          {node => (
            <em>
              <Content content={node.children} />
            </em>
          )}
        </Match>
        <Match when={Case.as(node(), 'heading')}>
          {node => (
            <Switch>
              <Match when={node.depth === 1}>
                <h1 class="text-6xl">
                  <Content content={node.children} />
                </h1>
              </Match>
              <Match when={node.depth === 2}>
                <h2 class="text-5xl">
                  <Content content={node.children} />
                </h2>
              </Match>
              <Match when={node.depth === 3}>
                <h3 class="text-4xl">
                  <Content content={node.children} />
                </h3>
              </Match>
              <Match when={node.depth === 4}>
                <h4 class="text-3xl">
                  <Content content={node.children} />
                </h4>
              </Match>
              <Match when={node.depth === 5}>
                <h5 class="text-2xl">
                  <Content content={node.children} />
                </h5>
              </Match>
              <Match when={node.depth === 6}>
                <h6 class="text-xl">
                  <Content content={node.children} />
                </h6>
              </Match>
            </Switch>
          )}
        </Match>
        <Match when={Case.as(node(), 'html')}>
          {node => <pre>{node.value}</pre>}
        </Match>
        <Match when={Case.as(node(), 'image')}>
          {node => <img src={node.url} alt={node.alt ?? undefined}></img>}
        </Match>
        <Match when={Case.as(node(), 'inlineCode')}>
          {node => <pre>{node.value}</pre>}
        </Match>
        <Match when={Case.as(node(), 'link')}>
          {node => (
            <a class="text-indigo-300" href={node.url}>
              <Content content={node.children} />
            </a>
          )}
        </Match>
        <Match when={Case.as(node(), 'list')}>
          {node => (
            // TODO: node.spread prop
            <Switch>
              <Match when={node.ordered}>
                <ol start={node.start ?? undefined}>
                  <Content content={node.children} />
                </ol>
              </Match>
              <Match when={!node.ordered}>
                <ul>
                  <Content content={node.children} />
                </ul>
              </Match>
            </Switch>
          )}
        </Match>
        <Match when={Case.as(node(), 'listItem')}>
          {node => (
            <li>
              <Content content={node.children} />
            </li>
          )}
        </Match>
        <Match when={Case.as(node(), 'paragraph')}>
          {node => (
            <p>
              <Content content={node.children} />
            </p>
          )}
        </Match>
        <Match when={Case.as(node(), 'strong')}>
          {node => (
            <strong>
              <Content content={node.children} />
            </strong>
          )}
        </Match>
        <Match when={Case.as(node(), 'thematicBreak')}>
          <hr />
        </Match>
        <Match when={Case.as(node(), 'text')}>{node => node.value}</Match>
      </Switch>
    )}
  </Index>
)
