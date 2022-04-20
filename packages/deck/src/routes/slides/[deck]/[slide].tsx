import { useRouteData } from 'solid-app-router'
import { Accessor, Match, Show, Switch } from 'solid-js'
import { ErrorContainer } from '../../../components/ErrorContainer/ErrorContainer'
import { Slideshow } from '../../../components/Slideshow/Slideshow'
import { Deck } from '../../../model/Deck'

export default function SlideShowPage() {
  const data = useRouteData<{
    deck: Accessor<Deck | undefined>
    currentSlide: Accessor<number>
  }>()

  return (
    <Show when={data.deck()} fallback={<div>No deck found</div>}>
      {deck => {
        const count = deck.slides.length
        return (
          <Switch
            fallback={
              <Slideshow deck={deck} currentSlide={data.currentSlide} />
            }
          >
            <Match when={count === 0}>
              <ErrorContainer error={`Deck ${deck.name} has no slides`} />
            </Match>
            <Match when={Number.isNaN(data.currentSlide())}>
              <ErrorContainer error="Slide must be a number" />
            </Match>
            <Match
              when={data.currentSlide() < 1 || data.currentSlide() > count}
            >
              <ErrorContainer
                error={`Invalid slide ${data.currentSlide()}, must be between 1-${count}`}
              />
            </Match>
          </Switch>
        )
      }}
    </Show>
  )
}
