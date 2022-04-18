import type Toml from '@iarna/toml'
import { List } from '@katis/common'
import type * as MdAst from 'mdast'

export interface Slide {
  metadata: Toml.JsonMap
  content: List<MdAst.Content>
}
