import { List } from '@katis/common'
import { Slide } from './Slide'

export interface Deck {
  name: string
  title: string
  slides: List<Slide>
}
