import { useParams } from 'solid-app-router'
import { createMemo } from 'solid-js'
import { Slideshow } from '../../../components/Slideshow/Slideshow'
import { decks } from '../../../decks'

export default function SlideShowPage() {
  const params = useParams<{ deck: string; slide: string }>()
  const currentSlide = createMemo(() => Number.parseInt(params.slide, 10))
  const deck = createMemo(() => decks[params.deck]!)

  return <Slideshow deck={deck} currentSlide={currentSlide} />
}
