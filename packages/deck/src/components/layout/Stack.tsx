import { Component } from 'solid-js'
import Css from './Stack.module.scss'
import { Scale, scale } from './utils'

export interface StackProps {
  gap?: Scale
}

export const Stack: Component<StackProps> = ({ gap, children }) => (
  <div class={Css.stack} style={{ '--gap': scale(gap) }}>
    {children}
  </div>
)
