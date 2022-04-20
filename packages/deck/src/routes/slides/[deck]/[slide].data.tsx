import { RouteDataFuncArgs } from 'solid-app-router'
import { createMemo } from 'solid-js'
import { decks } from '../../../decks'

export default function SlideshowPageData({ params }: RouteDataFuncArgs) {
  const deck = createMemo(() => decks[params.deck])
  const currentSlide = createMemo(() => Number.parseInt(params.slide, 10))
  return { deck, currentSlide }
}
