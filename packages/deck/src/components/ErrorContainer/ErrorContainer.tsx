import { Component, Show } from 'solid-js'
import { Center } from '../layout/Center'
import { Cover } from '../layout/Cover'
import css from './ErrorContainer.module.css'

interface Props {
  error: { toString(): string }
}

export const ErrorContainer: Component<Props> = ({ error }) => (
  <Center text>
    <Cover>
      <h1 class={css.error}>
        <Show when={asError(error)} fallback={error.toString()}>
          {error => `Exception: ${error.message}`}
        </Show>
      </h1>
    </Cover>
  </Center>
)

const asError = (error: unknown): Error | undefined =>
  error instanceof Error ? error : undefined
