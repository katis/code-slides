import { useRouteData } from 'solid-app-router'
import { Accessor, Match, Show, Switch } from 'solid-js'
import { Slideshow } from '../../../components/Slideshow/Slideshow'
import { Deck } from '../../../model/Deck'

export default function SlideShowPage() {
  const data = useRouteData<{
    deck: Accessor<Deck | undefined>
    currentSlide: Accessor<number>
  }>()

  return (
    <Show when={data.deck()} fallback={<div>No deck found</div>}>
      {deck => (
        <Switch
          fallback={<Slideshow deck={deck} currentSlide={data.currentSlide} />}
        >
          <Match when={deck.slides.length === 0}>
            <div>Empty deck</div>
          </Match>
          <Match
            when={
              Number.isNaN(data.currentSlide()) ||
              data.currentSlide() <= 0 ||
              data.currentSlide() > deck.slides.length
            }
          >
            <div>Invalid slide</div>
          </Match>
        </Switch>
      )}
    </Show>
  )
}
