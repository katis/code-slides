import Toml from '@iarna/toml'
import { Case, Dict, List } from '@katis/common'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import type * as MdAst from 'mdast'
import type { Slide } from './model/Slide'
import type { Deck } from './model/Deck'

const mdParser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, { type: 'toml', marker: '+', anywhere: true } as any)

const deckModules: Dict<string> = import.meta.glob('../decks/*.md', {
  as: 'raw',
}) as any

export const decks: Dict<Deck> = Object.fromEntries(
  Object.entries(deckModules)
    .map(([path, md]) => {
      const name = path.slice('../decks/'.length, path.length - '.md'.length)
      return [name, parseSlides(name, md!)] as const
    })
    .sort((a, b) => a[1].title.localeCompare(b[1].title)),
)

function parseSlides(name: string, source: string): Deck {
  const md = parseMd(source)
  const slides = toSlides(md.children)
  return {
    name,
    title: findTitle(slides[0]),
    slides,
  }
}

function findTitle(slide: Slide | undefined) {
  const metaTitle = slide?.metadata?.title as string | undefined
  return (
    metaTitle ??
    textContent(slide?.content.find(Case.check('heading'))) ??
    'MISSING TITLE'
  )
}

function textContent(node?: { children: MdAst.PhrasingContent[] }) {
  const children = node?.children as { value?: string }[]
  return children?.flatMap(node => (node.value ? node.value : [])).join('')
}

function parseMd(source: string) {
  const doc = mdParser.parse(source)
  doc.children.forEach(node => {
    if (node.type === 'toml') {
      node.value = Toml.parse(node.value as unknown as string)
    }
  })
  return doc
}

function toSlides(content: List<MdAst.Content>): List<Slide> {
  const chunks = List.chunkBySeparator(content, Case.check('toml'))
  return chunks.map(([meta, ...content]) => ({ metadata: meta.value, content }))
}
