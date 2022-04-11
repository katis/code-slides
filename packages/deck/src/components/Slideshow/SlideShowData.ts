import Toml from '@iarna/toml'
import { Case, Dict, List } from '@katis/common'
import type * as MdAst from 'mdast'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { RouteDataFunc } from 'solid-app-router'
import { createResource, Resource } from 'solid-js'
import { unified } from 'unified'
import type { Slide } from './Slide'

const modules: Dict<string> = import.meta.glob('../../../decks/*.md', {
  as: 'raw',
}) as any

const mdParser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, { type: 'toml', marker: '+', anywhere: true } as any)

const wait = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms))

async function loadDeck(deck: string): Promise<List<Slide>> {
  // TODO: async loading, vite glob is sync
  const src = modules[`../../../decks/${deck}.md`]
  if (!src) {
    throw Error(`deck ${deck} not found`)
  }
  const md = parseMd(src)
  const slides = toSlides(md.children)
  if (md.children.length > 0 && slides.length === 0) {
    throw Error(
      `No slides created for deck ${deck}. Maybe you're missing the beginning frontmatter?`,
    )
  }
  return slides
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

const toSlides = (content: List<MdAst.Content>): List<Slide> =>
  List.chunkBySeparator(content, Case.check('toml')).map(
    ([meta, ...content]) => ({ metadata: meta.value, content }),
  )

export const SlideShowData: RouteDataFunc<
  Resource<List<Slide> | undefined>
> = ({ params }) => {
  const [deck] = createResource(params.deck, loadDeck)
  return deck
}
