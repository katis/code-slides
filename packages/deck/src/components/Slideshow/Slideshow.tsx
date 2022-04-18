import { List } from '@katis/common'
import { Navigate, useNavigate } from 'solid-app-router'
import { Accessor, Component, createEffect, For, Show } from 'solid-js'
import { Slide } from './Slide'
import Css from './Slideshow.module.scss'

interface Props {
  currentSlide: Accessor<number>
  deck: Accessor<string>
  slides: Accessor<List<Slide>>
}

export const Slideshow: Component<Props> = ({ currentSlide, deck, slides }) => {
  const navigate = useNavigate()

  let el!: HTMLDivElement

  createEffect<'smooth' | 'auto'>(behavior => {
    el.scrollTo({ left: el.clientWidth * (currentSlide() - 1), behavior })
    return 'smooth'
  }, 'auto')

  const previousSlide = (slideNum: number = currentSlide()) =>
    slides().length > 1 && slideNum > 1
      ? `/slides/${deck()}/${slideNum - 1}`
      : undefined

  const nextSlide = (slideNum: number = currentSlide()) =>
    slideNum < slides().length ? `/slides/${deck()}/${slideNum + 1}` : undefined

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
      when={currentSlide() > 0 && currentSlide() <= slides().length}
      fallback={<Navigate href={`/slides/${deck()}/1`} />}
    >
      <div ref={el} class={Css.slideshow}>
        <div class={Css.slideshowContent}>
          <For each={slides()}>
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
