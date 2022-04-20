import { Navigate, useNavigate } from 'solid-app-router'
import { Accessor, Component, createEffect, For, Show } from 'solid-js'
import { Deck } from '../../model/Deck'
import { Slide } from './Slide'
import css from './Slideshow.module.scss'

interface Props {
  currentSlide: Accessor<number>
  deck: Deck
}

export const Slideshow: Component<Props> = ({ currentSlide, deck }) => {
  const navigate = useNavigate()

  let el!: HTMLDivElement

  createEffect<'smooth' | 'auto'>(behavior => {
    el.scrollTo({ left: el.clientWidth * (currentSlide() - 1), behavior })
    return 'smooth'
  }, 'auto')

  const previousSlide = (slideNum: number = currentSlide()) =>
    deck.slides.length > 1 && slideNum > 1
      ? `/slides/${deck.name}/${slideNum - 1}`
      : undefined

  const nextSlide = (slideNum: number = currentSlide()) =>
    slideNum < deck.slides.length
      ? `/slides/${deck.name}/${slideNum + 1}`
      : undefined

  createEffect(() => {
    window.addEventListener('keydown', ev => {
      if (ev.key === 'ArrowLeft') {
        const previous = previousSlide()
        previous && navigate(previous)
      } else if (ev.key === 'ArrowRight') {
        const next = nextSlide()
        next && navigate(next)
      }
    })
  })

  return (
    <Show
      when={currentSlide() > 0 && currentSlide() <= deck.slides.length}
      fallback={<Navigate href={`/slides/${deck.slides}/1`} />}
    >
      <div ref={el} class={css.slideshow}>
        <div class={css.slideshowContent}>
          <For each={deck.slides}>
            {(slide, i) => (
              <Slide
                slide={slide}
                previous={previousSlide(i() + 1)}
                next={nextSlide(i() + 1)}
              />
            )}
          </For>
        </div>
      </div>
    </Show>
  )
}
