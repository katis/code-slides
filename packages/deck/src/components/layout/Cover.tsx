import { Component } from 'solid-js'
import css from './Cover.module.scss'
import { scale, Scale } from './utils'

interface Props {
  space?: Scale
  minHeight?: string | Scale
}

export const Cover: Component<Props> = ({ space, minHeight, children }) => (
  <div
    class={css.cover}
    style={{
      '--space': scale(space),
      '--min-block-size':
        typeof minHeight === 'string' ? minHeight : scale(minHeight),
    }}
  >
    {children}
  </div>
)
