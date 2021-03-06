import type Toml from '@iarna/toml'
import { Case, List } from '@katis/common'
import type * as MdAst from 'mdast'
import { Link } from 'solid-app-router'
import { Component, For, Match, Show, Switch } from 'solid-js'
import { Editor } from '../Editor/Editor'
import { Stack } from '../layout/Stack'
import { TypeScriptEditor } from '../TypeScriptEditor/TypeScriptEditor'
import css from './Slide.module.scss'

export interface Slide {
  metadata: Toml.JsonMap
  content: List<MdAst.Content>
}

export interface SlideProps {
  slide: Slide
  previous?: string
  next?: string
}

export const Slide: Component<SlideProps> = ({ slide, previous, next }) => (
  <div class={css.slide}>
    <div class={css.link}>
      <Show when={previous}>
        <Link class={css.navLink} title="Previous slide" href={previous!} />
      </Show>
    </div>
    <div class={css.content}>
      <Stack>
        <Content content={slide.content} />
      </Stack>
    </div>
    <div class={css.link}>
      <Show when={next}>
        <Link class={css.navLink} title="Next slide" href={next!} />
      </Show>
    </div>
  </div>
)

const tsLanguages: List<string> = ['ts', 'tsx', 'typescript']

const Content: Component<{ content: List<MdAst.Content> }> = ({ content }) => (
  <For each={content}>
    {node => (
      <Switch fallback={<div>Unknown node type {node.type}</div>}>
        <Match when={Case.as(node, 'blockquote')}>
          {node => (
            <blockquote>
              <Content content={node.children} />
            </blockquote>
          )}
        </Match>
        <Match when={Case.as(node, 'break')}>
          <br />
        </Match>
        <Match when={Case.as(node, 'code')}>
          {node => (
            <Show
              when={tsLanguages.includes(node.lang ?? '')}
              fallback={
                <Editor
                  language={node.lang ?? 'text'}
                  model={node.value}
                ></Editor>
              }
            >
              <TypeScriptEditor src={node.value} />
            </Show>
          )}
        </Match>
        <Match when={Case.as(node, 'delete')}>
          {node => (
            <del>
              <Content content={node.children} />
            </del>
          )}
        </Match>
        <Match when={Case.as(node, 'emphasis')}>
          {node => (
            <em>
              <Content content={node.children} />
            </em>
          )}
        </Match>
        <Match when={Case.as(node, 'heading')}>
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
        <Match when={Case.as(node, 'html')}>
          {node => <pre>{node.value}</pre>}
        </Match>
        <Match when={Case.as(node, 'image')}>
          {node => <img src={node.url} alt={node.alt ?? undefined}></img>}
        </Match>
        <Match when={Case.as(node, 'inlineCode')}>
          {node => <pre>{node.value}</pre>}
        </Match>
        <Match when={Case.as(node, 'link')}>
          {node => (
            <a class="text-indigo-300" href={node.url}>
              <Content content={node.children} />
            </a>
          )}
        </Match>
        <Match when={Case.as(node, 'list')}>
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
        <Match when={Case.as(node, 'listItem')}>
          {node => (
            <li>
              <Content content={node.children} />
            </li>
          )}
        </Match>
        <Match when={Case.as(node, 'paragraph')}>
          {node => (
            <p>
              <Content content={node.children} />
            </p>
          )}
        </Match>
        <Match when={Case.as(node, 'strong')}>
          {node => (
            <strong>
              <Content content={node.children} />
            </strong>
          )}
        </Match>
        <Match when={Case.as(node, 'thematicBreak')}>
          <hr />
        </Match>
        <Match when={Case.as(node, 'text')}>{node => node.value}</Match>
      </Switch>
    )}
  </For>
)
