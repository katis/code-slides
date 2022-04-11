import Css from './Center.module.scss'
import { Component } from 'solid-js'

export interface CenterProps {
  text?: boolean
  /** Center child elements based on their content width */
  intrinsic?: boolean
}

export const Center: Component<CenterProps> = ({
  intrinsic,
  text,
  children,
}) => (
  <div
    class={Css.center}
    classList={{ [Css.intrinsic]: intrinsic, [Css.text]: text }}
  >
    {children}
  </div>
)
