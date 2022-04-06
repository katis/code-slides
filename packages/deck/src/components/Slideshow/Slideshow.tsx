import Toml from '@iarna/toml'
import { Case, List } from '@katis/common'
import type * as MdAst from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { Component, createEffect, createMemo, Index } from 'solid-js'
import { unified } from 'unified'
import { Slide } from './Slide'

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, { type: 'toml', marker: '+', anywhere: true } as any)

function parseMd(source: string) {
  const doc = parser.parse(source)
  doc.children.forEach(node => {
    if (node.type === 'toml') {
      node.value = Toml.parse(node.value as unknown as string)
    }
  })
  return doc
}

const toSlides = (content: List<MdAst.Content>): List<Slide> =>
  List.chunkBySeparator(content, Case.check('toml')).map(
    ([meta, ...content]): Slide => ({ metadata: meta.value, content }),
  )

export const Slideshow: Component<{ src: string }> = props => {
  const slides = createMemo(() => toSlides(parseMd(props.src).children))
  createEffect(() => console.log('SLIDES', slides()))
  return (
    <div>
      <Index each={slides()}>{slide => <Slide slide={slide()} />}</Index>
    </div>
  )
}
