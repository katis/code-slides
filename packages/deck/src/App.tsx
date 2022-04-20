import { useRoutes } from 'solid-app-router'
import { Component, ErrorBoundary, Suspense } from 'solid-js'
import { routes } from './routes'

export const App: Component = () => {
  const Routes = useRoutes(routes)
  return (
    <ErrorBoundary
      fallback={error => {
        console.error('Top level error', error)
        return <div>Error: {error.message ?? error.toString()}</div>
      }}
    >
      <Suspense fallback={<div class="text-neutral-100">Loading...</div>}>
        <Routes />
      </Suspense>
    </ErrorBoundary>
  )
}
