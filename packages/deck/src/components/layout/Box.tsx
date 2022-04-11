import { Component } from 'solid-js'
import { Scale, scale } from './utils'
import Css from './Box.module.css'

export interface BoxProps {
  border?: boolean
  padding?: Scale
}

export const Box: Component<BoxProps> = ({ border, padding, children }) => (
  <div
    classList={{ [Css.border]: border }}
    style={{ '--padding': scale(padding) }}
  >
    {children}
  </div>
)
