import { List } from '@katis/common'
import {
  Navigate,
  useNavigate,
  useParams,
  useRouteData,
} from 'solid-app-router'
import {
  Component,
  createEffect,
  createMemo,
  For,
  Resource,
  Show,
} from 'solid-js'
import { Slide } from './Slide'
import Css from './Slideshow.module.scss'

export const Slideshow: Component = () => {
  const slides = useRouteData<Resource<List<Slide> | undefined>>()
  const slideCount = createMemo(() => slides()?.length ?? 0)

  const navigate = useNavigate()
  const params = useParams<{ slide: string; deck: string }>()
  const currentSlide = createMemo(() => Number.parseInt(params.slide, 10))

  let el!: HTMLDivElement

  createEffect<'smooth' | 'auto'>(behavior => {
    el.scrollTo({ left: el.clientWidth * (currentSlide() - 1), behavior })
    return 'smooth'
  }, 'auto')

  const previousSlide = (slideNum: number = currentSlide()) =>
    slideCount() > 1 && slideNum > 1
      ? `/slides/${params.deck}/${slideNum - 1}`
      : undefined

  const nextSlide = (slideNum: number = currentSlide()) =>
    slideNum < slideCount()
      ? `/slides/${params.deck}/${slideNum + 1}`
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
      when={currentSlide() > 0 && currentSlide() <= (slides()?.length ?? 999)}
      fallback={<Navigate href={`/slides/${params.deck}/1`} />}
    >
      <div ref={el} class={Css.slideshow}>
        <div
          class={Css.slideshowContent}
          style={{ '--slide-count': slideCount() }}
        >
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
