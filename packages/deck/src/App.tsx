import { useRoutes } from 'solid-app-router'
import { Component, Suspense } from 'solid-js'
import { routes } from './routes'

export const App: Component = () => {
  const Routes = useRoutes(routes)
  console.log(routes)
  return (
    <Suspense fallback={<div class="text-neutral-100">Loading...</div>}>
      <Routes />
    </Suspense>
  )
}
